import React, {useState} from 'react';
import {Button, Col, Flex, Input, InputNumber, List, message, Progress, Row, Watermark} from 'antd';
import axios from 'axios';
import IconHeader from "@site/src/components/IconHeader";
import {CheckCircleTwoTone, ClockCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons";

function SocketServerThreads() {
    const [testServerUrl, setTestServerUrl] = useState('');
    const [socketServerUrl, setSocketServerUrl] = useState('');
    const [threadCount, setThreadCount] = useState(20);
    const [progress, setProgress] = useState(0);
    const [responses, setResponses] = useState([]);
    const [testInfo, setTestInfo] = useState([]);

    const handleSendRequest = async () => {
        try {
            const response = await axios.post('http://' + `${testServerUrl}/test/lab7/server`, {
                host: socketServerUrl,
                num_threads: threadCount,
            });

            if (response.data.error === 'param') {
                setTestInfo([]);
                message.error('请求失败，请检查Socket服务器地址是否正确');
            } else {
                setResponses(response.data.response);
                const percentFull = (response.data.cnt / response.data.response.length) * 100;
                const percentFixed = parseFloat(percentFull.toFixed(1));
                setProgress(percentFixed);
                setTestInfo([
                    new Date().toLocaleDateString(),
                    `${new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })} ${socketServerUrl.split(':')[1]}`]);
            }

        } catch (error) {
            setTestInfo([]);
            message.error('测试发起失败，请检查测试服务地址是否正确');
        }
    };

    const flexCenterStyle = {
        display: 'flex',
        alignItems: 'center'
    };

    const h5Style = {
        margin: 0,
        display: 'flex',
        alignItems: 'center'
    };

    const inputStyle = {
        flex: 1.1,
        marginRight: '10px'
    };

    const buttonStyle = {
        flex: 0.90,
        marginRight: '10px'
    };

    const inputNumberStyle = {
        flex: 0.6,
        marginRight: '10px'
    };

    const renderResponseItem = (response, index) => {
        const [idx, status] = response;
        const iconMap = {
            TLE: <ClockCircleTwoTone twoToneColor='#ff9900' style={{ marginRight: '4px' }} />,
            RE: <CloseCircleTwoTone twoToneColor='#ff0000' style={{ marginRight: '4px' }} />,
            default: <CheckCircleTwoTone twoToneColor='#52c41a' style={{ marginRight: '4px' }} />
        };
        const messageMap = {
            TLE: '请求超时',
            RE: '请求失败',
            default: `请求成功，服务端返回消息：${status}`
        };

        return (
            <List.Item key={index}>
                <div style={flexCenterStyle}>
                    {iconMap[status] || iconMap.default}
                    <h5 style={h5Style}>
                        {"线程 " + (idx + 1) + ": " + (messageMap[status] || messageMap.default)}
                    </h5>
                </div>
            </List.Item>
        );
    };

    return (
        <div>
            <IconHeader type="lab" title="测试3 服务端多线程测试"/>
            <Watermark content={testInfo} gap={[75, 75]} font={{ fontSize: 14 }}>
                <div style={{ ...flexCenterStyle, marginBottom: '20px' }}>
                    <Input
                        addonBefore="http://"
                        placeholder="测试服务地址"
                        value={testServerUrl}
                        onChange={(e) => setTestServerUrl(e.target.value)}
                        style={inputStyle}
                    />
                    <Input
                        placeholder="Socket服务器地址"
                        value={socketServerUrl}
                        onChange={(e) => setSocketServerUrl(e.target.value)}
                        style={buttonStyle}
                    />
                    <InputNumber
                        min={2} defaultValue={20}
                        suffix="个线程"
                        value={threadCount}
                        onChange={(e) => {
                            // console.log(e);
                            setThreadCount(e);
                        }}
                        style={inputNumberStyle}
                    />
                    <Button type="primary" onClick={handleSendRequest}>
                        发起测试
                    </Button>
                </div>

                {testInfo.length > 0 && ( <div style={{ marginTop: '20px' }}>
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
                            <br/>
                            <div style={{ ...flexCenterStyle, justifyContent: 'center' }}>
                                <h3> {progress === 100 ? '测试通过' : '通过率：' + progress + '%'} </h3>
                            </div>
                        </Col>
                        <Col span={19}>
                            <List
                                size="small"
                                pagination={{
                                    position: 'bottom',
                                    align: 'end',
                                    size: 'small',
                                    pageSize: 6
                                }}
                                style={{ flex: 3 }}
                                dataSource={responses}
                                renderItem={(response, index) => renderResponseItem(response, index)}
                            />
                        </Col>
                    </Row>
                </div>)}
            </Watermark>
        </div>
    );
}

export default SocketServerThreads;
