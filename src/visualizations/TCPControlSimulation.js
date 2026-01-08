import React, { useEffect, useRef, useState } from 'react';
import { Line } from '@antv/g2plot';
import { Button, Col, InputNumber, Row, Slider } from 'antd';
import {
    CaretRightOutlined,
    DeleteRowOutlined,
    FieldTimeOutlined,
    PauseOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import { useColorMode } from '@docusaurus/theme-common';
import '../css/components.css';

class TCPSimulator {
    constructor(ssthresh, fastRecovery) {
        this.time = 1;
        this.cwnd = 1; // 初始拥塞窗口大小
        this.ssthresh = ssthresh; // 慢启动阈值
        this.data = [{ time: 0, cwnd: 1 }]; // 存储数据点
        this.fastRecovery = fastRecovery; // 是否启用快速恢复
    }

    simulate() {
        let expIncStop = false;
        if (this.cwnd < this.ssthresh) { // Slow Start
            if (this.cwnd * 2 < this.ssthresh) this.cwnd *= 2;
            else {
                this.cwnd = this.ssthresh;
                expIncStop = true;
            }
        } else this.cwnd += 1; // Additive Increase

        // 检查前一个记录是否有重复 ACK
        const lastEvent = this.data[this.data.length - 1];
        const isLastEventRedundantAck = lastEvent && lastEvent.event && lastEvent.event === '重复ACK';
        this.data.push((expIncStop && !isLastEventRedundantAck) ?
            { time: this.time++, cwnd: this.cwnd, event: '慢开始→\n拥塞避免' } :
            { time: this.time++, cwnd: this.cwnd });
    }

    handlePacketLoss() {
        this.ssthresh = Math.max(Math.floor(this.cwnd / 2), 1); // 减半ssthresh
        this.cwnd = 0.5; // 重置cwnd
        if (this.data.length > 0 && this.fastRecovery) this.data[this.data.length - 1].event = '超时';
    }
    handleRedundantAck() {
        if (this.fastRecovery) {
            this.ssthresh = Math.max(Math.floor(this.cwnd / 2), 1); // 减半ssthresh
            this.cwnd = this.ssthresh - 1; // 从减半后的cwnd开始
        } else this.handlePacketLoss(); // 如果没有快速恢复，按超时处理
        if (this.data.length > 0 && this.fastRecovery) this.data[this.data.length - 1].event = '重复ACK';
    }

    getData() { return this.data; }
}

const TCPControlSimulation = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const [data, setData] = useState([
        { name: 'TCP Reno', data: [{ time: 0, cwnd: 1 }] },
        { name: 'TCP Tahoe', data: [{ time: 0, cwnd: 1 }] }
    ]);
    const [isRunning, setIsRunning] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [ssthresh, setSsthresh] = useState(32); // 初始阈值
    const renoSimulator = useRef(new TCPSimulator(ssthresh, true));
    const tahoeSimulator = useRef(new TCPSimulator(ssthresh, false));
    const intervalRef = useRef(null);
    const chartRef = useRef(null);

    const startSimulation = () => {
        setIsRunning(true);
        setHasRun(true);
        intervalRef.current = setInterval(() => {
            renoSimulator.current.simulate();
            tahoeSimulator.current.simulate();
            setData([
                { name: 'TCP Reno', data: renoSimulator.current.getData() },
                { name: 'TCP Tahoe', data: tahoeSimulator.current.getData() }
            ]);
        }, 650);
    };
    const pauseSimulation = () => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
    const resetSimulation = (neoSsthresh) => {
        setHasRun(false);
        const prevRunning = isRunning;
        pauseSimulation();
        renoSimulator.current = new TCPSimulator(neoSsthresh, true);
        tahoeSimulator.current = new TCPSimulator(neoSsthresh, false);
        setData([
            { name: 'TCP Reno', data: renoSimulator.current.getData() },
            { name: 'TCP Tahoe', data: tahoeSimulator.current.getData() }
        ]);
        if (prevRunning) startSimulation();
    };

    const handlePacketLoss = () => {
        renoSimulator.current.handlePacketLoss();
        tahoeSimulator.current.handlePacketLoss();
    };
    const handleRedundantAck = () => {
        renoSimulator.current.handleRedundantAck();
        tahoeSimulator.current.handleRedundantAck();
    };
    const handleSsthreshChange = (value) => {
        setSsthresh(value);
        resetSimulation(value); // 重置模拟器以应用新的ssthresh值
    };

    useEffect(() => {
        const formattedData = data.flatMap(series => series.data.map(point => ({ ...point, type: series.name })));
        // console.log(formattedData);
        if (!hasRun) return;

        // Dark mode colors
        const textColor = isDark ? '#e0e0e0' : '#333';
        const chartTheme = isDark ? 'dark' : 'light';

        if (chartRef.current) chartRef.current.update({ data: formattedData });
        else {
            chartRef.current = new Line('chart-container', {
                data: formattedData, xField: 'time', yField: 'cwnd', seriesField: 'type',
                theme: chartTheme,
                xAxis: {
                    label: { style: { fontSize: 15, fill: textColor }, },
                    title: { style: { fill: textColor } },
                    line: { style: { stroke: isDark ? 'rgba(19, 194, 194, 0.3)' : '#aaa' } },
                },
                yAxis: {
                    label: { style: { fontSize: 15, fill: textColor }, },
                    title: { style: { fill: textColor } },
                    grid: { line: { style: { stroke: isDark ? 'rgba(19, 194, 194, 0.15)' : '#eee' } } },
                },
                legend: {
                    itemName: { style: { fontSize: 15, fill: textColor }, },
                },
                animation: false, // 关闭动画
                annotations: formattedData
                    .filter(point => point.event)
                    .map(point => ({
                        type: 'text', position: [point.time, point.cwnd], content: point.event, offsetY: -20,
                        style: { fill: isDark ? '#ff7875' : 'red', fontSize: 15 }, offsetX: -16,
                        transform: [{ type: 'overlapDodgeY', step: 10, maxStep: 50 }],
                    })),
            });
            chartRef.current.render();
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [data, hasRun, isDark]);

    return (<div>
        <Row justify="center" align="middle" style={{ width: '100%', marginBottom: '10px' }}>
            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Button type="primary" onClick={isRunning ? pauseSimulation : startSimulation}
                    icon={isRunning ? <PauseOutlined /> : <CaretRightOutlined />}
                >
                    {isRunning ? '暂停' : '开始'}
                </Button>
                <Button type="primary" onClick={() => resetSimulation(ssthresh)}
                    disabled={!hasRun} icon={<ReloadOutlined />}
                >
                    重置
                </Button>
                <Button type="primary" onClick={handlePacketLoss} icon={<FieldTimeOutlined />}>
                    模拟网络超时
                </Button>
                <Button type="primary" onClick={handleRedundantAck} icon={<DeleteRowOutlined />}>
                    模拟重复ACK
                </Button>
            </Col>
        </Row>

        <Row justify="center" align="middle" style={{ width: '100%' }}>
            <Col span={24}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ marginRight: '8px', fontSize: '15px', color: isDark ? '#e0e0e0' : 'inherit' }}>慢开始阈值</span>
                <Slider
                    min={1} max={100} value={ssthresh} onChange={handleSsthreshChange}
                    tooltip={{ formatter: (value) => `初始阈值: ${value}` }}
                    style={{ flex: 1, marginRight: '10px' }}
                />
                <InputNumber
                    min={1} max={100} value={ssthresh}
                    onChange={handleSsthreshChange} style={{ width: '100px' }}
                />
            </Col>
        </Row>
        <Row justify="center" align="middle">
            {hasRun && (<div id="chart-container" style={{ width: '100%', height: '600px' }}></div>)}
        </Row>
    </div>

    );
};

export default TCPControlSimulation;
