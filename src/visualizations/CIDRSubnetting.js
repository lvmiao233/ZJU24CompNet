import React, { useState } from 'react';
import { Button, Card, Col, Form, Input, message, Row, Steps } from 'antd';
import {
    ColumnWidthOutlined,
    DesktopOutlined,
    LinkOutlined,
    MinusCircleOutlined,
    NotificationOutlined,
    PlusOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useColorMode } from '@docusaurus/theme-common';
import '../css/components.css';

function ipToInt(ip) {
    const octets = ip.split('.').map(Number);
    return (((octets[0] << 24) >>> 0) | (octets[1] << 16) | (octets[2] << 8) | octets[3]);
}

function intToIp(int) {
    return [(int >>> 24) & 0xff, (int >>> 16) & 0xff, (int >>> 8) & 0xff, int & 0xff,].join('.');
}

function maskLengthToMask(maskLength) { return (0xffffffff << (32 - maskLength)) >>> 0; }

function intToMask(int) { return intToIp(int); }

function calculateRequiredMaskLength(hostCount) {
    const requiredAddresses = hostCount + 2; // 包括网络地址和广播地址
    const hostBits = Math.ceil(Math.log2(requiredAddresses));
    return 32 - hostBits;
}

function subnetting(networkStr, hostRequirements) {
    const [networkIpStr, maskLengthStr] = networkStr.split('/');
    const networkIpInt = ipToInt(networkIpStr);
    const maskLength = parseInt(maskLengthStr, 10);
    const networkMask = maskLengthToMask(maskLength);

    // 验证网络地址
    const networkAddress = networkIpInt & networkMask;
    if (networkAddress !== networkIpInt) {
        throw new Error('无效的网络地址,请检查网络地址与子网掩码是否匹配');
    }

    const totalAddresses = 1 << (32 - maskLength);

    // 按需容纳的主机数量从大到小排序，并记录原始顺序
    const hostRequirementsWithIndex = hostRequirements.map((host, index) => ({
        hostCount: host, index,
    }));
    hostRequirementsWithIndex.sort((a, b) => b.hostCount - a.hostCount);

    const subnets = [];
    let currentIpInt = networkIpInt;

    for (const item of hostRequirementsWithIndex) {
        const { hostCount, index } = item;
        const requiredMaskLength = calculateRequiredMaskLength(hostCount);
        const subnetMaskInt = maskLengthToMask(requiredMaskLength);
        const blockSize = 1 << (32 - requiredMaskLength);

        // 检查当前子网是否超出初始网络范围
        if (currentIpInt + blockSize > networkIpInt + totalAddresses) {
            throw new Error('被划分网络无法容纳要求的主机数');
        }

        const subnetNetworkAddress = currentIpInt;
        const subnetBroadcastAddress = currentIpInt + blockSize - 1;
        const usableHosts = blockSize - 2;

        subnets.push({
            index,
            '子网': `${intToIp(subnetNetworkAddress)}/${requiredMaskLength}`,
            '网络地址': intToIp(subnetNetworkAddress),
            '广播地址': intToIp(subnetBroadcastAddress),
            '子网掩码': intToMask(subnetMaskInt),
            '实际容纳数量': usableHosts,
            '需求主机数量': hostCount,
        });

        currentIpInt += blockSize;
    }

    // 按原始顺序排序
    subnets.sort((a, b) => a.index - b.index);

    return subnets;
}

const SubnetCalculator = () => {
    const [form] = Form.useForm();
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const [result, setResult] = useState(null);
    const [step, setStep] = useState(0);

    const [calculatedHosts, setCalculatedHosts] = useState([]);

    const steps = [
        { title: '指定划分后子网主机数', },
        { title: '确定实际容纳主机数', },
        { title: '划分子网', },
    ];

    const next = async () => {
        try {
            if (step === 0) {
                try { await form.validateFields(['network', 'hosts']); }
                catch (e) { throw new Error('请输入正确的网络地址和掩码长度（如：192.168.0.0/24）'); }

                const values = form.getFieldsValue(['network', 'hosts']);
                console.log(values);
                const networkStr = values.network.trim();
                const hostRequirements = values.hosts.map((item) => parseInt(item.host, 10));

                if (!Array.isArray(hostRequirements) || !hostRequirements.every((n) => Number.isInteger(n) && n > 0)) {
                    throw new Error('主机数量要求必须是正整数');
                }

                // 计算每个子网实际可容纳的主机数量
                const actualHosts = hostRequirements.map((hostCount) => {
                    const maskLength = calculateRequiredMaskLength(hostCount);
                    const blockSize = 1 << (32 - maskLength);
                    return blockSize - 2;
                });

                setCalculatedHosts(actualHosts);
            }
            if (step === 1) {
                // 在第二步，执行子网划分计算
                const values = form.getFieldsValue(['network', 'hosts']);
                const networkStr = values.network.trim();
                const hostRequirements = values.hosts.map((item) => parseInt(item.host, 10));

                const subnets = subnetting(networkStr, hostRequirements);
                setResult(subnets);
            }
            setStep(step + 1);
        } catch (err) {
            message.error(err.message);
        }
    };
    const prev = () => { setStep(step - 1); };

    const reset = () => {
        form.resetFields();
        setResult(null);
        setStep(0);
        setCalculatedHosts([]);
    };

    return (<div>
        <Form form={form} name="subnet_calculator" autoComplete="off" layout="vertical" >
            <h3 style={{ fontSize: 18 }}>被划分子网（如：192.168.0.0/24)</h3>
            <Form.Item
                name="network"
                rules={[{ required: true, message: '请输入被划分子网' },
                {
                    pattern: /^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/,
                    message: '请输入正确的网络地址和掩码长度（如：192.168.0.0/24）'
                },
                ]}
            >
                <Input placeholder="如：192.168.0.0/24" />
            </Form.Item>
            <Steps size="small" current={step} items={steps} style={{ marginBottom: 16 }} />
            {step === 0 && (<>
                <Form.List
                    name="hosts"
                    rules={[{
                        validator: async (_, hosts) => {
                            if (!hosts || hosts.length < 1)
                                return Promise.reject(new Error('请添加至少一个主机数量要求'));
                        },
                    },]}
                >
                    {(fields, { add, remove }, { errors }) => (<>
                        <Row gutter={16}>
                            {fields.map((field, index) => (
                                <Col xs={24} sm={12} md={8} lg={12} xl={8} xxl={6} key={field.key}>
                                    <Form.Item required={false} style={{ marginBottom: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ marginRight: 8, minWidth: 50 }}> 子网{index + 1}：</span>
                                            <Form.Item
                                                key={field.key}
                                                validateTrigger={['onChange', 'onBlur']}
                                                name={[field.name, 'host']}
                                                rules={[{ required: true, message: '请输入主机数量' }, { pattern: /^\d+$/, message: '主机数量必须是正整数', },]}
                                                noStyle
                                            >
                                                <Input placeholder="容纳主机数量" />
                                            </Form.Item>
                                            {fields.length > 1 ?
                                                (<MinusCircleOutlined onClick={() => remove(field.name)} style={{ margin: '0 8px' }} />) : null
                                            }
                                        </div>
                                    </Form.Item>
                                </Col>))}
                            <Col span={24}>
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ width: '100%' }} >
                                        添加子网需求
                                    </Button>
                                    <Form.ErrorList errors={errors} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>)}
                </Form.List>
            </>)}
            {step === 1 && (<>
                <p style={{ marginBottom: 8, color: isDark ? '#e0e0e0' : 'inherit' }}>对于各个子网，我们并非简单地提供其所需数量的可用IP，而是选择最小的一个幂次，使（2的整数次幂
                    - 2） ≥ 所需的主机数量，其中被占用的两个地址分别是主机地址和该网络的广播地址</p>
                <div className="subnet-list" style={{ marginBottom: 12 }}>
                    {calculatedHosts.map((hostCount, index) => (
                        <Card
                            key={index}
                            size="small"
                            className="subnet-card"
                            style={{ marginBottom: 8 }}
                        >
                            <span style={{ color: isDark ? '#e0e0e0' : 'inherit' }}>
                                子网 {index + 1}：
                                需求主机数量：{form.getFieldValue(['hosts', index, 'host'])}，
                                实际可容纳的主机数量：{hostCount}
                            </span>
                        </Card>
                    ))}
                </div>
            </>)}
            {step === 2 && result && (<>
                <p style={{ marginBottom: 8, color: isDark ? '#e0e0e0' : 'inherit' }}>实际分配中，我们通常从主机数最多的子网开始分配</p>
                <div className="subnet-list" style={{ marginBottom: 12 }}>
                    {result.map((subnet, index) => (
                        <Card
                            key={index}
                            size="small"
                            className="subnet-card"
                            style={{ marginBottom: 8 }}
                        >
                            <Row gutter={16}>
                                <Col span={24} style={{ marginBottom: 8 }}>
                                    <span style={{ fontSize: 16, fontWeight: 'bold', color: isDark ? '#e8e8e8' : 'inherit' }}>
                                        子网 {index + 1}: {subnet['子网']}
                                    </span>
                                </Col>
                                <Col xs={24} sm={8} style={{ marginBottom: 8 }}>
                                    <UserOutlined style={{ fontSize: 15, color: isDark ? 'var(--ifm-color-primary-light)' : 'inherit' }} />
                                    <span style={{ fontSize: 15, marginLeft: 4, color: isDark ? '#e0e0e0' : 'inherit' }}>
                                        需求主机数量: {subnet['需求主机数量']}
                                    </span>
                                </Col>
                                <Col xs={24} sm={8} style={{ marginBottom: 8 }}>
                                    <DesktopOutlined style={{ fontSize: 15, color: isDark ? 'var(--ifm-color-primary-light)' : 'inherit' }} />
                                    <span style={{ fontSize: 15, marginLeft: 4, color: isDark ? '#e0e0e0' : 'inherit' }}>
                                        实际容纳数量: {subnet['实际容纳数量']}
                                    </span>
                                </Col>
                                <Col xs={24} sm={8} style={{ marginBottom: 8 }}>
                                    <ColumnWidthOutlined style={{ fontSize: 15, color: isDark ? 'var(--ifm-color-primary-light)' : 'inherit' }} />
                                    <span style={{ fontSize: 15, marginLeft: 4, color: isDark ? '#e0e0e0' : 'inherit' }}>
                                        子网掩码: {subnet['子网掩码']}
                                    </span>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <LinkOutlined style={{ fontSize: 15, color: isDark ? 'var(--ifm-color-primary-light)' : 'inherit' }} />
                                    <span style={{ fontSize: 15, marginLeft: 4, color: isDark ? '#e0e0e0' : 'inherit' }}>
                                        网络地址: {subnet['网络地址']}
                                    </span>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <NotificationOutlined style={{ fontSize: 15, color: isDark ? 'var(--ifm-color-primary-light)' : 'inherit' }} />
                                    <span style={{ fontSize: 15, marginLeft: 4, color: isDark ? '#e0e0e0' : 'inherit' }}>
                                        广播地址: {subnet['广播地址']}
                                    </span>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </div>
            </>)}
            <Form.Item>
                {step < steps.length - 1 && (<Button type="primary" onClick={next}> 下一步 </Button>)}
                {step === steps.length - 1 && (<Button type="primary" onClick={reset}> 重置 </Button>)}
                {step > 0 && (<Button style={{ margin: '0 8px' }} onClick={prev}> 上一步 </Button>)}
            </Form.Item>
        </Form>
    </div>);
};

export default SubnetCalculator;
