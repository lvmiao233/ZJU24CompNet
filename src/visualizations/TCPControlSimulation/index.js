import React, {useEffect, useRef, useState} from 'react';
import {Line} from '@antv/g2plot';
import {Button, Col, Row} from 'antd';

class TCPSimulator {
    constructor() {
        this.time = 0;
        this.cwnd = 0.5; // 初始拥塞窗口大小
        this.ssthresh = 32; // 慢启动阈值
        this.data = []; // 存储数据点
    }

    simulate(steps) {
        for (let i = 0; i < steps; i++) {
            if (this.cwnd < this.ssthresh) {
                // Slow Start
                if (this.cwnd * 2 < this.ssthresh) this.cwnd *= 2; else this.cwnd = this.ssthresh;
            } else {
                // Additive Increase
                this.cwnd += 1;
            }
            this.data.push({time: this.time, cwnd: this.cwnd});
            this.time += 1;
        }
        console.log(this.data);
    }

    handlePacketLoss() {
        this.ssthresh = Math.max(this.cwnd / 2, 1); // 减半ssthresh
        this.cwnd = 1; // 重置cwnd
    }

    handleRedundantAck() {
        this.ssthresh = Math.max(this.cwnd / 2, 1); // 减半ssthresh
        this.cwnd = this.ssthresh; // 从减半后的cwnd开始
    }

    getData() {
        return this.data;
    }

    reset() {
        this.time = 0;
        this.cwnd = 0.5;
        this.ssthresh = 32;
        this.data = [];
    }
}


const TCPControlSimulation = () => {
    const [data, setData] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const simulator = useRef(new TCPSimulator());
    const intervalRef = useRef(null);
    const chartRef = useRef(null);

    const startSimulation = () => {
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            simulator.current.simulate(1);
            setData([...simulator.current.getData()]);
        }, 1000);
    };

    const pauseSimulation = () => {
        setIsRunning(false);
        clearInterval(intervalRef.current);
    };

    const resetSimulation = () => {
        chartRef.current.destroy();
        simulator.current.reset();
        setData(simulator.current.getData());
        pauseSimulation();
    };

    const handlePacketLoss = () => {
        simulator.current.handlePacketLoss();
        setData(simulator.current.getData());
    };

    const handleRedundantAck = () => {
        simulator.current.handleRedundantAck();
        setData(simulator.current.getData());
    };

    useEffect(() => {
        if (data.length === 0) return;
        if (chartRef.current) {
            chartRef.current.update({data,});
        } else {
            chartRef.current = new Line('chart-container', {
                data, xField: 'time', yField: 'cwnd', title: {
                    title: 'TCP Congestion Control Simulation',
                }, interactions: [{
                    type: 'active-region', enable: false,
                },], animation: false, // 关闭动画
            });
        }
        chartRef.current.render();
    }, [data]);

    return (<Row justify="center" align="middle">
        <Col span={20}>
            {(isRunning || data.length > 0) &&
                <div id="chart-container" style={{width: '100%', height: '600px'}}></div>}
            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between'}}>
                {isRunning ? (<Button type="primary" onClick={pauseSimulation} disabled={!isRunning}>
                    暂停
                </Button>) : (<Button type="primary" onClick={startSimulation} disabled={isRunning}>
                    开始
                </Button>)}
                {(isRunning || data.length > 0) && <Button type="primary" onClick={resetSimulation}>
                    重置
                </Button>}
                <Button type="primary" onClick={handlePacketLoss}>
                    丢包
                </Button>
                <Button type="primary" onClick={handleRedundantAck}>
                    重复Ack
                </Button>
            </div>
        </Col>
    </Row>);
};

export default TCPControlSimulation;
