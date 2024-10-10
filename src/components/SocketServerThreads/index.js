import React, {useState} from 'react';
import {Button, Col, Flex, Input, InputNumber, List, message, Progress, Row} from 'antd';
import axios from 'axios';
import {CheckCircleTwoTone, ClockCircleTwoTone, CloseCircleTwoTone, DotChartOutlined} from "@ant-design/icons";

function SocketServerThreads() {
    const [hasTested, setHasTested] = useState(false);
    const [testServerUrl, setTestServerUrl] = useState('');
    const [socketServerUrl, setSocketServerUrl] = useState('');
    const [threadCount, setThreadCount] = useState(20);
    const [progress, setProgress] = useState(0);
    const [responses, setResponses] = useState([]);

    const handleSendRequest = async () => {
        try {
            const response = await axios.post('http://' + `${testServerUrl}/test/lab7_server`, {
                host: socketServerUrl,
                num_threads: threadCount,
            });

            if (response.data.error === 'param') {
                message.error('请求失败，请检查Socket服务器地址是否正确');
            } else {
                setResponses(response.data.response);
                const percentFull = (response.data.cnt / response.data.response.length) * 100;
                const percentFixed = parseFloat(percentFull.toFixed(1));
                setProgress(percentFixed);
                setHasTested(true);
            }

        } catch (error) {
            message.error('测试发起失败，请检查测试服务地址是否正确');
            console.error(error);
        }
    };

    const renderResponseItem = (response, index) => {
        let icon;
        let statusText;
        const [idx, status] = response;

        if (status === 'TLE') {
            icon = <ClockCircleTwoTone twoToneColor='#ff9900' style={{marginRight: '4px'}}/>;
            statusText = '请求超时';
        } else if (status === 'RE') {
            icon = <CloseCircleTwoTone twoToneColor='#ff0000' style={{marginRight: '4px'}}/>;
            statusText = '请求失败';
        } else {
            icon = <CheckCircleTwoTone twoToneColor='#52c41a' style={{marginRight: '4px'}}/>;
            statusText = '请求成功，服务端返回消息：' + status;
        }

        return (
            <List.Item key={index}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {icon}
                    <h5 style={{margin: 0, display: 'flex', alignItems: 'center'}}>
                        {"线程 " + (idx + 1) + ": " + statusText}
                    </h5>
                </div>
            </List.Item>
        );
    };

    return (
        <div>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px'}}>
                {<DotChartOutlined style={{color: '#006d75', fontSize: 26, marginRight: '4px'}}/>}
                <h3 style={{margin: 0, display: 'flex', alignItems: 'center', color: '#006d75'}}>
                    {"测试2 服务端多线程测试"}
                </h3>
            </div>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
                <Input
                    addonBefore="http://"
                    placeholder="测试服务地址"
                    value={testServerUrl}
                    onChange={(e) => setTestServerUrl(e.target.value)}
                    style={{flex: 1.1, marginRight: '10px'}}
                />
                <Input
                    placeholder="Socket服务器地址"
                    value={socketServerUrl}
                    onChange={(e) => setSocketServerUrl(e.target.value)}
                    style={{flex: 0.90, marginRight: '10px'}}
                />
                <InputNumber
                    min={2} defaultValue={20}
                    suffix="个测试线程"
                    value={threadCount}
                    onChange={(e) => {
                        console.log(e);
                        setThreadCount(e)
                    }}
                    style={{flex: 0.6, marginRight: '10px'}}
                />
                <Button type="primary" onClick={handleSendRequest}>
                    发送请求
                </Button>
            </div>

            {hasTested && <div style={{marginTop: '20px'}}>
                <Row>
                    <Col span={5}>
                        <Flex align="center" justify={'center'}>
                            <Progress
                                type="circle"
                                percent={progress}
                                status={progress === 100 ? 'success' : 'exception'}
                                style={{paddingTop: '6px'}}
                            />
                        </Flex>
                        <br/>
                        <Flex align="center" justify={'center'}>
                            <h3>{
                                progress === 100 ? '测试通过' : '通过率：' + progress + '%'
                            }</h3>
                        </Flex>
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
                            style={{flex: 3,}}
                            dataSource={responses}
                            renderItem={(response, index) => renderResponseItem(response, index)}
                        />
                    </Col>
                </Row>
            </div>}
        </div>
    );
}

export default SocketServerThreads;
