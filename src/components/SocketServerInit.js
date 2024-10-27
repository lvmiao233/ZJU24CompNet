import React, {useState} from 'react';
import {Button, Input, message, Watermark} from 'antd';
import axios from 'axios';
import IconHeader from "@site/src/components/IconHeader";
import {CheckCircleTwoTone, ClockCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons";

function SocketServerInit() {
    const [testServerUrl, setTestServerUrl] = useState('');
    const [socketServerUrl, setSocketServerUrl] = useState('');
    const [responses, setResponses] = useState([]);
    const [testInfo, setTestInfo] = useState([]);
    const handleSendRequest = async () => {
        try {
            const response = await axios.post('http://' + `${testServerUrl}/test/lab7/server`, {
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

    const renderResponseItem = (response) => {
        const status = response[1];
        const iconMap = {
            TLE: <ClockCircleTwoTone twoToneColor='#ff9900' />,
            RE: <CloseCircleTwoTone twoToneColor='#ff0000' />,
            default: <CheckCircleTwoTone twoToneColor='#52c41a' />
        };
        const messageMap = {
            TLE: "请求超时",
            RE: "请求失败",
            default: `请求成功，服务端返回消息：${status}`
        };

        return (
            <div style={flexCenterStyle}>
                {iconMap[status] || iconMap.default}
                <h5 style={h5Style}>
                    {messageMap[status] || messageMap.default}
                </h5>
            </div>
        );
    };

    return (
        <div>
            <IconHeader type="lab" title="测试1 服务端连接与发送测试"/>
            <Watermark content={testInfo} gap={[60, 30]} font={{ fontSize: 14 }}>
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
                    <Button type="primary" onClick={handleSendRequest}>
                        发送请求
                    </Button>
                </div>
                {testInfo.length > 0 && (
                    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                        {renderResponseItem(responses[0])}
                    </div>
                )}
            </Watermark>
        </div>
    );
}

export default SocketServerInit;
