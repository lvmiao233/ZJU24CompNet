import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useColorMode } from '@docusaurus/theme-common';

const { Text } = Typography;

const IPMatchingComponent = () => {
    const [form] = Form.useForm();
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const [routingTable, setRoutingTable] = useState([]);
    const [binaryRoutingTable, setBinaryRoutingTable] = useState([]);
    const [targetIP, setTargetIP] = useState('');
    const [binaryTargetIP, setBinaryTargetIP] = useState([]);
    const [currentEntryIndex, setCurrentEntryIndex] = useState(-1);
    const [comparisonComplete, setComparisonComplete] = useState(false);
    const [matchedEntry, setMatchedEntry] = useState(null);

    // 将 IP 地址转换为二进制数组
    const ipToBinary = (ip) => {
        const ipParts = ip.split('.').map(Number);
        const binaryParts = ipParts.map((part) =>
            part.toString(2).padStart(8, '0')
        );
        return binaryParts
            .join('')
            .split('')
            .map((bit) => parseInt(bit, 10));
    };

    // 验证 CIDR 格式
    const isValidCIDR = (cidr) => {
        const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
        if (!cidrRegex.test(cidr)) return false;

        const [ip, maskLength] = cidr.split('/');
        const ipParts = ip.split('.').map(Number);
        if (ipParts.some((part) => part < 0 || part > 255)) return false;

        const mask = parseInt(maskLength, 10);
        if (mask < 0 || mask > 32) return false;

        const ipBinary = ipToBinary(ip);
        const hostPart = ipBinary.slice(mask);
        return !hostPart.includes(1);
    };

    // 验证 IP 地址格式
    const isValidIP = (ip) => {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) return false;
        const ipParts = ip.split('.').map(Number);
        return !ipParts.some((part) => part < 0 || part > 255);
    };

    // 提交路由表表单
    const onFinish = (values) => {
        const { routes } = values;
        const nextHops = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const newRoutingTable = routes.map((route, index) => ({
            subnet: route.subnet,
            nextHop: nextHops[index % nextHops.length],
        }));
        setRoutingTable(newRoutingTable);
        // 转换路由表项为二进制
        const binaryRoutes = newRoutingTable.map((route) => {
            const { subnet } = route;
            const [ip, maskLength] = subnet.split('/');
            const binarySubnet = ipToBinary(ip);
            return {
                binarySubnet,
                maskLength: parseInt(maskLength, 10),
                nextHop: route.nextHop,
                compared: false,
                matchedBits: 0,
                mismatchPosition: null,
                isMatch: false,
            };
        });
        // 按照前缀长度从长到短排序
        binaryRoutes.sort((a, b) => b.maskLength - a.maskLength);
        setBinaryRoutingTable(binaryRoutes);
        setCurrentEntryIndex(-1);
        setComparisonComplete(false);
        setMatchedEntry(null);
    };

    // 处理目标 IP 的输入
    const handleTargetIPChange = (e) => {
        const value = e.target.value;
        setTargetIP(value);
        if (isValidIP(value)) {
            const binaryIP = ipToBinary(value);
            setBinaryTargetIP(binaryIP);
            setCurrentEntryIndex(-1);
            setComparisonComplete(false);
            setMatchedEntry(null);
            // Reset compared status
            const resetRoutes = binaryRoutingTable.map((entry) => ({
                ...entry,
                compared: false,
                matchedBits: 0,
                mismatchPosition: null,
                isMatch: false,
            }));
            setBinaryRoutingTable(resetRoutes);
        } else setBinaryTargetIP([]);
    };

    // 前进到下一个路由表项
    const handleNextEntry = () => {
        if (comparisonComplete || binaryTargetIP.length === 0) return;
        const newIndex = currentEntryIndex + 1;
        if (newIndex < binaryRoutingTable.length) {
            const entry = binaryRoutingTable[newIndex];
            const { binarySubnet, maskLength } = entry;
            const bitsToCompare = maskLength;
            let matchedBits = 0;
            let mismatchFound = false;

            for (let i = 0; i < bitsToCompare; i++) {
                if (binarySubnet[i] === binaryTargetIP[i]) {
                    matchedBits++;
                } else {
                    mismatchFound = true;
                    break;
                }
            }

            const updatedEntry = {
                ...entry,
                compared: true,
                matchedBits,
                mismatchPosition: mismatchFound ? matchedBits : null,
                isMatch: !mismatchFound,
            };

            const updatedRoutingTable = [...binaryRoutingTable];
            updatedRoutingTable[newIndex] = updatedEntry;
            setBinaryRoutingTable(updatedRoutingTable);

            setCurrentEntryIndex(newIndex);
            console.log(newIndex);
            console.log(binaryRoutingTable);
            if (!mismatchFound) {
                // 找到匹配的表项
                setMatchedEntry(updatedEntry);
                setComparisonComplete(true);
            } else if (newIndex >= binaryRoutingTable.length - 1) {
                // 已经到达最后一个表项
                setComparisonComplete(true);
            }
        } else {
            setComparisonComplete(true);
        }
    };

    // 后退到上一个路由表项
    const handlePrevEntry = () => {
        if (currentEntryIndex >= 0) {
            const newIndex = currentEntryIndex - 1;
            if (newIndex >= -1) {
                // Reset the compared status of the current entry
                const updatedRoutingTable = [...binaryRoutingTable];
                if (currentEntryIndex >= 0) {
                    updatedRoutingTable[currentEntryIndex] = {
                        ...updatedRoutingTable[currentEntryIndex],
                        compared: false,
                        matchedBits: 0,
                        mismatchPosition: null,
                        isMatch: false,
                    };
                }
                setBinaryRoutingTable(updatedRoutingTable);
                setCurrentEntryIndex(newIndex);
                setComparisonComplete(false);
                setMatchedEntry(null);
            }
        }
    };

    // 渲染二进制比特位
    const renderBinaryBits = (
        binaryArray,
        comparisonArray = [],
        maskLength,
        compared,
        mismatchPosition
    ) => {
        // 定义颜色
        const colors = {
            border: isDark ? 'rgba(19, 194, 194, 0.3)' : '#d9d9d9',
            hostBg: isDark ? 'rgba(60, 70, 70, 0.8)' : '#d9d9d9',
            hostText: isDark ? '#a8b5b8' : 'inherit',
            matchBg: isDark ? '#13c2c2' : '#006d75',
            mismatchBg: isDark ? '#d48806' : '#faad14',
            text: isDark ? '#e0e0e0' : 'inherit',
        };

        return binaryArray.map((bit, index) => {
            let style = {
                display: 'inline-block',
                textAlign: 'center',
                width: '20px',
                height: '30px',
                lineHeight: '30px',
                borderRadius: '4px',
                border: `1px solid ${colors.border}`,
                margin: '2px',
                color: colors.text,
            };

            if (index % 8 === 7) style.marginRight = '12px';
            if (index >= maskLength) {
                style.backgroundColor = colors.hostBg;
                style.color = colors.hostText;
            } else if (compared) {
                if (comparisonArray.length > 0) {
                    if (mismatchPosition === null || index < mismatchPosition) {
                        if (bit === comparisonArray[index]) {
                            style.backgroundColor = colors.matchBg;
                            style.color = 'white';
                        } else {
                            style.backgroundColor = colors.mismatchBg;
                        }
                    } else {
                        style.backgroundColor = colors.mismatchBg;
                    }
                }
            }

            return (
                <span key={index} style={style}>
                    {bit}
                </span>
            );
        });
    };

    return (
        <div>
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.List name="routes">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field, index) => (
                                <div
                                    key={field.key}
                                    style={{ display: 'flex', alignItems: 'center' }}
                                >
                                    <Form.Item
                                        name={[field.name, 'subnet']}
                                        rules={[
                                            { required: true, message: '请输入目标子网（CIDR 格式）' },
                                            {
                                                validator: (_, value) => {
                                                    if (isValidCIDR(value)) return Promise.resolve();
                                                    return Promise.reject('CIDR 格式不正确');
                                                },
                                            },
                                        ]}
                                        style={{ flex: 1, marginRight: 8, marginBottom: 12 }}
                                    >
                                        <Input placeholder="目标子网，例如：192.168.1.0/24" />
                                    </Form.Item>
                                    <Form.Item
                                        name={[field.name, 'nextHop']}
                                        initialValue={String.fromCharCode(65 + index)}
                                        style={{ width: '80px', marginRight: 8, marginBottom: 12 }}
                                    >
                                        <Input placeholder="下一跳" disabled />
                                    </Form.Item>
                                    {fields.length > 1 ? (
                                        <MinusCircleOutlined
                                            onClick={() => remove(field.name)}
                                            style={{ fontSize: '15px', color: 'red', marginBottom: 12 }}
                                        />
                                    ) : null}
                                </div>
                            ))}
                            <Form.Item>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        style={{ flex: 3, marginRight: 12 }}
                                        icon={<PlusOutlined />}
                                    >
                                        添加路由表项
                                    </Button>
                                    <Button type="primary" htmlType="submit" style={{ flex: 1 }}>
                                        提交路由表
                                    </Button>
                                </div>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>

            <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Input
                        placeholder="输入目标 IP 地址"
                        value={targetIP}
                        onChange={handleTargetIPChange}
                        style={{ flex: 7, marginRight: 10 }}
                    />
                    <Button onClick={handlePrevEntry} disabled={currentEntryIndex < 0}>
                        上一项
                    </Button>
                    <Button
                        onClick={handleNextEntry}
                        style={{ marginLeft: 10 }}
                        disabled={
                            comparisonComplete ||
                            binaryTargetIP.length === 0 ||
                            currentEntryIndex >= binaryRoutingTable.length - 1
                        }
                    >
                        下一项
                    </Button>
                </div>
            </div>
            <div style={{ marginTop: '20px' }}>
                <h3 style={{ marginTop: '20px', fontSize: 18 }}>目标 IP 二进制表示</h3>
                {binaryTargetIP.length > 0 ? (
                    <div>{renderBinaryBits(binaryTargetIP, [],
                        (binaryRoutingTable.length > 0 && currentEntryIndex >= 0) ? binaryRoutingTable[currentEntryIndex].maskLength : 32,
                        true, null)}</div>
                ) : (
                    <Alert type="warning" showIcon title="无效的 IP 地址" />
                )}
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: 18 }}>路由表项</h3>
                <p>从掩码长度最长的表项开始，逐个比较，找到匹配项则停止比较，选择该表项用于转发</p>
                {binaryRoutingTable.map((entry, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                        <Text strong>
                            下一跳: {entry.nextHop}, 子网:{' '}
                            {routingTable.find((r) => r.nextHop === entry.nextHop).subnet}
                        </Text>
                        <div>
                            {renderBinaryBits(
                                entry.binarySubnet,
                                binaryTargetIP,
                                entry.maskLength,
                                entry.compared,
                                entry.mismatchPosition
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {comparisonComplete && (
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: 18 }}>匹配结果</h3>
                    {matchedEntry ? (
                        <Alert
                            type="success"
                            showIcon
                            title={`匹配的下一跳: ${matchedEntry.nextHop} (子网: ${routingTable.find((r) => r.nextHop === matchedEntry.nextHop)?.subnet
                                })`}
                        />
                    ) : (
                        <Alert type="error" showIcon title="未找到匹配的路由" />
                    )}
                </div>
            )}
        </div>
    );
};

export default IPMatchingComponent;
