import React, { useState } from 'react';
import { Button, Col, Flex, Input, InputNumber, List, message, Progress, Row, Watermark } from 'antd';
import axios from 'axios';
import IconHeader from "@site/src/components/IconHeader";
import { CheckCircleTwoTone, ClockCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

function MultiTestCard(props) {
    const {header, testUri, multiThread} = props;

    const [testerServerUrl, setTesterServerUrl] = useState('');
    const [testedServerUrl, setTestedServerUrl] = useState('');
    const [threadCount, setThreadCount] = useState(20);
    const [progress, setProgress] = useState(0);
    const [cases, setCases] = useState([]); // 用于保存测试用例数据
    const [testInfo, setTestInfo] = useState([]);

    const handleSendRequest = async () => {
        try {
            // 发起测试请求并处理返回
            const response = await axios.post(`http://${testerServerUrl}${testUri}`, {
                host: testedServerUrl,
                num_threads: threadCount,
            });

            const { cases: caseList, success_cnt, timeout_cnt, error_cnt, total_cnt } = response.data;
            setCases(caseList); // 更新测试用例列表
            const percentFull = (success_cnt / total_cnt) * 100;
            setProgress(parseFloat(percentFull.toFixed(1))); // 更新进度
            setTestInfo([
                new Date().toLocaleDateString(),
                `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${testedServerUrl.split(':')[1]}`
            ]);
        } catch (error) {
            setCases([]);
            setTestInfo([]);
            if(error.status === 400) message.error('请求失败，请检查被测试服务端地址填写是否正确');
            else message.error('测试发起失败，请检查测试服务地址是否正确');
        }
    };

    const timeFormat = (seconds) => {
        const ms = seconds * 1000;
        let formattedMs = parseFloat(ms.toFixed(4));
        if (formattedMs.toString().length > 4)
            formattedMs = parseFloat(formattedMs.toPrecision(4));
        return formattedMs;
    }

    const renderResponseItem = (response) => {
        const { name, status, index, time } = response; // 获取用例名称和状态
        const iconMap = {
            AC: <CheckCircleTwoTone twoToneColor='#52c41a' style={{ marginRight: '4px' }} />,
            WA: <CloseCircleTwoTone twoToneColor='#ff9900' style={{ marginRight: '4px' }} />,
            RE: <CloseCircleTwoTone twoToneColor='#ff0000' style={{ marginRight: '4px' }} />,
            TLE: <ClockCircleTwoTone twoToneColor='#ff9900' style={{ marginRight: '4px' }} />,
        };
        const messageMap = {
            AC: '请求成功',
            WA: '响应错误',
            RE: '运行错误',
            TLE: '请求超时',
        };

        return (
            <List.Item key={index}>
                <div style={{ display: 'flex', alignItems: 'center' , width: '100%'}}>
                    {iconMap[status] || iconMap.AC} {/* 默认为AC状态图标 */}
                        <h5 style={{ margin: 0, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{fontWeight: 'bold', minWidth: '24px'}}>{`${index}`}</span>
                            <span style={{fontWeight: 'normal'}}>{name || '无标题'}</span>
                            <span style={{fontWeight: 'normal'}}>{messageMap[status] || '未知状态'}</span>
                            <span style={{fontWeight: 'normal'}}>{timeFormat(time) || '无耗时信息'} ms</span>
                        </h5>
                </div>
            </List.Item>
        );
    };

    return (
        <div>
            <IconHeader type="lab" title={header} />
            <Watermark content={testInfo} gap={[75, 75]} font={{ fontSize: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <Input
                        addonBefore="http://"
                        placeholder="测试服务地址"
                        value={testerServerUrl}
                        onChange={(e) => setTesterServerUrl(e.target.value)}
                        style={{ flex: 1.1, marginRight: '10px' }}
                    />
                    <Input
                        placeholder="被测服务器地址"
                        value={testedServerUrl}
                        onChange={(e) => setTestedServerUrl(e.target.value)}
                        style={{ flex: 0.9, marginRight: '10px' }}
                    />
                    {multiThread === true && <InputNumber
                        min={2}
                        defaultValue={20}
                        suffix="个线程"
                        value={threadCount}
                        onChange={(e) => setThreadCount(e)}
                        style={{flex: 0.6, marginRight: '10px'}}
                    />}
                    <Button type="primary" onClick={handleSendRequest}>
                        发起测试
                    </Button>
                </div>

                {cases.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <Row>
                            <Col span={5}>
                                <Flex align="center" justify={'center'}>
                                    <Progress
                                        type="circle"
                                        percent={progress}
                                        status={progress === 100 ? 'success' : 'exception'}
                                        style={{ paddingTop: '6px' }}
                                    />
                                </Flex>
                                <br />
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <h3>{progress === 100 ? '测试通过' : `通过率：${progress}%`}</h3>
                                </div>
                            </Col>
                            <Col span={19}>
                                <List
                                    size="small"
                                    pagination={{
                                        position: 'bottom',
                                        align: 'end',
                                        size: 'small',
                                        pageSize: 6,
                                    }}
                                    style={{ flex: 3 }}
                                    dataSource={cases}
                                    renderItem={renderResponseItem}
                                />
                            </Col>
                        </Row>
                    </div>
                )}
            </Watermark>
        </div>
    );
}

export default MultiTestCard;
