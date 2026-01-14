const Protocols = [
    { protocol: "OSPF", number: "89", link: "开放式最短路径优先" },
    { protocol: "TCP", number: "6", link: "传输控制协议" },
    { protocol: "UDP", number: "17", link: "用户数据报协议" },
];

export const protocolColumns = [
    {
        title: '协议',
        dataIndex: 'protocol',
        key: 'protocol',
        render: (text, record) => (
            <a href={`https://zh.wikipedia.org/wiki/${record.link}`} target="_blank" rel="noopener noreferrer">
                {text}
            </a>
        ),
        sorter: (a, b) => a.application.localeCompare(b.application),
    }, {
        title: 'IP协议号',
        dataIndex: 'number',
        key: 'number',
        sorter: (a, b) => {
            // 尝试将端口号转为数字进行排序，处理非数字情况
            const portA = parseInt(a.number, 10);
            const portB = parseInt(b.number, 10);

            if (!isNaN(portA) && !isNaN(portB)) {
                return portA - portB;
            }
            // 如果包含非数字（如 "—" 或 "服务端..."), 则按字符串排序
            return a.number.localeCompare(b.number);
        },
        defaultSortOrder: 'ascend',
    },
];

export default Protocols;