const Protocols = [
    { application: "FTP（控制连接）", protocol: "TCP", port: "21", link: "文件传输协议" },
    { application: "FTP（数据连接）", protocol: "TCP", port: "20", link: "文件传输协议" },
    { application: "TELNET", protocol: "TCP", port: "23", link: "Telnet" },
    { application: "SMTP", protocol: "TCP", port: "25", link: "简单邮件传输协议" },
    { application: "DNS", protocol: "UDP", port: "53", link: "域名系统" },
    { application: "TFTP", protocol: "UDP", port: "69", link: "简单文件传输协议" },
    { application: "HTTP", protocol: "TCP", port: "80", link: "超文本传输协议" },
    { application: "HTTPS", protocol: "TCP", port: "443", link: "超文本传输安全协议" },
    { application: "POP3", protocol: "TCP", port: "110", link: "郵局協定" },
    { application: "SNMP", protocol: "UDP", port: "161", link: "简单网络管理协议" },
    { application: "SSH", protocol: "TCP", port: "22", link: "Secure_Shell" },
    { application: "OSPF", protocol: "IP层运行 (IP协议号89)", port: "—", link: "开放式最短路径优先" },
    { application: "BGP", protocol: "TCP", port: "179", link: "边界网关协议" },
    { application: "DHCP（服务端）", protocol: "UDP", port: "67", link: "动态主机设置协议" },
    { application: "DHCP（客户端）", protocol: "UDP", port: "68", link: "动态主机设置协议" },
    { application: "RPC", protocol: "UDP", port: "111", link: "远程过程调用" },
    { application: "QUIC", protocol: "UDP", port: "443", link: "QUIC" }
];

export const protocolColumns = [
    {
        title: '应用程序',
        dataIndex: 'application',
        key: 'application',
        render: (text, record) => (
            <a href={`https://zh.wikipedia.org/wiki/${record.link}`} target="_blank" rel="noopener noreferrer">
                {text}
            </a>
        ),
        sorter: (a, b) => a.application.localeCompare(b.application),
    }, {
        title: '使用协议',
        dataIndex: 'protocol',
        key: 'protocol',
        sorter: (a, b) => a.protocol.localeCompare(b.protocol),
    }, {
        title: '熟知端口号',
        dataIndex: 'port',
        key: 'port',
        sorter: (a, b) => {
            // 尝试将端口号转为数字进行排序，处理非数字情况
            const portA = parseInt(a.port, 10);
            const portB = parseInt(b.port, 10);

            if (!isNaN(portA) && !isNaN(portB)) {
                return portA - portB;
            }
            // 如果包含非数字（如 "—" 或 "服务端..."), 则按字符串排序
            return a.port.localeCompare(b.port);
        },
        defaultSortOrder: 'ascend',
    },
];

export default Protocols;