const resourceData = [
    {
        "file_type": "pdf",
        "name": "Computer Networks - 5th edition",
        "size": "8454231",
        "category": "textbook",
        "link": "http://10.214.0.253/network/exercise/courseware/upload/110/luxq_Computer%20Networks%20-%20A%20Tanenbaum%20-%205th%20edition.pdf"
    }, {
        "file_type": "pdf",
        "name": "1 Introduction",
        "size": "3822490",
        "category": "theory",
        "link": require('@site/assets/slides/luxq_1_Introduction.pdf').default
    }, {
        "file_type": "pdf",
        "name": "2 Physical Layer",
        "size": "4723689",
        "category": "theory",
        "link": require('@site/assets/slides/luxq_2_The Physical Layer.pdf').default
    }, {
        "file_type": "pdf",
        "name": "3 Data Link Layer",
        "size": "5465726",
        "category": "theory",
        "link": require('@site/assets/slides/luxq_3_Data Link Layer.pdf').default
    }, {
        "file_type": "pdf",
        "name": "4 Medium Access Control Sublayer",
        "size": "3309134",
        "category": "theory",
        "link": require('@site/assets/slides/4_MACLayer.pdf').default
    }, {
        "file_type": "pdf",
        "name": "5 Network Layer",
        "size": "5945355",
        "category": "theory",
        "link": require('@site/assets/slides/5_Network Layer.pdf').default
    }, {
        "file_type": "pdf",
        "name": "6 Transport Layer",
        "size": "5051668",
        "category": "theory",
        "link": require('@site/assets/slides/6_TransportLayer.pdf').default
    }, {
        "file_type": "pdf",
        "name": "BBR拥塞控制算法",
        "size": "2132938",
        "category": "theory",
        "link": require('@site/assets/slides/BBR congestion-based congestion control_2016.pdf').default
    }, {
        "file_type": "pdf",
        "name": "7 Application Layer",
        "size": "14776102",
        "category": "theory",
        "link": require('@site/assets/slides/7_ApplicationLayer.pdf').default
    }, {
        "file_type": "pdf",
        "name": "8 Network Security",
        "size": "6362492",
        "category": "theory",
        "link": require('@site/assets/slides/8_NetworkSecurity.pdf').default
    }, {
        "file_type": "pdf",
        "name": "9 课程总览与复习",
        "size": "3627732",
        "category": "theory",
        "link": require('@site/assets/slides/ComputerNetworks_overview&summary.pdf').default
    }, {
        "file_type": "pdf",
        "name": "Lab1 Wireshark",
        "size": "3971903",
        "category": "lab",
        "link": require('@site/assets/slides/luxq_Wireshark.pdf').default
    }, {
        "file_type": "pdf",
        "name": "Lab2 使用二层交换机组网",
        "size": "1223654",
        "category": "lab",
        "link": require('@site/assets/slides/luxq_Lab2.pdf').default
    }, {
        "file_type": "pdf",
        "name": "Lab3 使用三层交换机组网",
        "size": "632105",
        "category": "lab",
        "link": require('@site/assets/slides/luxq_Lab3-使用三层交换机组网.pdf').default
    }, {
        "file_type": "pdf",
        "name": "Lab4 静态路由配置（修改）",
        "size": "2101192",
        "category": "lab",
        "link": require('@site/assets/slides/Lab4 静态路由配置.pdf').default
    }, {
        "file_type": "pdf",
        "name": "Lab4 静态路由配置",
        "size": "4490633",
        "category": "lab",
        "link": require('@site/assets/slides/Lab4-静态路由配置.pdf').default
    }, {
        "file_type": "pdf",
        "name": "Lab5 在Cisco路由器上的路由协议",
        "size": "1484720",
        "category": "lab",
        "link": require('@site/assets/slides/在Cisco路由器上的路由协议.pdf').default
    }, {
        "file_type": 'pdf',
        "name": 'GNS3下WireShark抓STP协议报文',
        "size": '1204626',
        "category": "lab",
        "link": require('@site/assets/slides/GNS3模拟环境中使用WireShark抓STP协议报文.pdf').default
    }, {
        "file_type": "pdf",
        "name": "Lab6 BGP路由协议(命令)",
        "size": "1721069",
        "category": "lab",
        "link": require('@site/assets/slides/Lab6_BGP路由协议.pdf').default
    }, {
        "file_type": "pdf",
        "name": "Lab6 BGP路由协议(原理)",
        "size": "2263394",
        "category": "lab",
        "link": require('@site/assets/slides/Lab6 动态路由BGP协议.pdf').default
    }, {
        "file_type": "pdf",
        "name": "Lab7 基于Socket自定义协议通信",
        "size": "1967383",
        "category": "lab",
        "link": require('@site/assets/slides/luxq_Socket编程.pdf').default
    }, {
        "file_type": "pdf",
        "name": "Lab8 轻量级的Web服务器",
        "size": "2584436",
        "category": "lab",
        "link": require('@site/assets/slides/Lab8-WebServer.pdf').default
    },
];

// Helper functions for filtering by category
export const getTheoryMaterials = () => resourceData.filter(item =>
    item.category === 'theory' || item.category === 'textbook'
);

export const getLabMaterials = () => resourceData.filter(item =>
    item.category === 'lab'
);

export default resourceData;
