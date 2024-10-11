import React, {useState} from 'react';
import {Button, Input, message, Watermark} from 'antd';
import axios from 'axios';
import {CheckCircleTwoTone, ClockCircleTwoTone, CloseCircleTwoTone, DotChartOutlined} from "@ant-design/icons";

function SocketServerInit() {
    const [testServerUrl, setTestServerUrl] = useState('');
    const [socketServerUrl, setSocketServerUrl] = useState('');
    const [responses, setResponses] = useState([]);
    const [testInfo, setTestInfo] = useState([]);
    const handleSendRequest = async () => {
        try {
            const response = await axios.post('http://' + `${testServerUrl}/test/lab7_server`, {
                host: socketServerUrl,
                num_threads: 1,
            });

            if (response.data.error === 'param') {
                setTestInfo([]);
                message.error('请求失败，请检查Socket服务器地址是否正确');
            } else {
                setResponses(response.data.response);
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

    const renderResponseItem = (response) => {
        const status = response[1];
        if (status === 'TLE') {
            return (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {<ClockCircleTwoTone twoToneColor='#ff9900' style={{marginRight: '4px'}}/>}
                    <h5 style={{margin: 0, display: 'flex', alignItems: 'center'}}>
                        {"请求超时"}
                    </h5>
                </div>
            );
        } else if (status === 'RE') {
            return (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {<CloseCircleTwoTone twoToneColor='#ff0000' style={{marginRight: '4px'}}/>}
                    <h5 style={{margin: 0, display: 'flex', alignItems: 'center'}}>
                        {"请求失败"}
                    </h5>
                </div>
            );
        } else {
            return (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {<CheckCircleTwoTone twoToneColor='#52c41a' style={{marginRight: '4px'}}/>}
                    <h5 style={{margin: 0, display: 'flex', alignItems: 'center'}}>
                        {'请求成功，服务端返回消息：' + status}
                    </h5>
                </div>
            );
        }
    };

    return (
        <div>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px'}}>
                {<DotChartOutlined style={{color: '#006d75', fontSize: 26, marginRight: '4px'}}/>}
                <h3 style={{margin: 0, display: 'flex', alignItems: 'center', color: '#006d75'}}>
                    {"测试1 服务端连接与发送测试"}
                </h3>
            </div>
            <Watermark content={testInfo} gap={[60, 30]} font={{fontSize: 14}}>
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
                    <Button type="primary" onClick={handleSendRequest}>
                        发送请求
                    </Button>
                </div>
                {testInfo.length > 0 &&
                    <div style={{marginTop: '20px', marginBottom: '20px'}}>
                        {renderResponseItem(responses[0])}
                    </div>
                }
            </Watermark>
        </div>
    );
}

export default SocketServerInit;
