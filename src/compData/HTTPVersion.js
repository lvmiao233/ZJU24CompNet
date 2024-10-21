const HTTPVersion = [
    {
        key: 'HTTP/0.9',
        label: 'HTTP/0.9',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"最早的HTTP版本，只支持GET方法，没有请求头和状态码，不支持持久连接，只能传输纯文本内容"}</p>,
    },
    {
        key: 'HTTP/1.0',
        label: 'HTTP/1.0',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"为了满足多媒体等日渐丰富的需求，增加了对多种请求方法的支持，如GET、POST和HEAD，引入了请求头和响应头，使客户端和服务器间通信更灵活；引入状态码，允许更复杂的错误处理和报告"}</p>,
    },
    {
        key: 'HTTP/1.1',
        label: 'HTTP/1.0',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"目前使用最广泛的版本之一。默认开启持久连接，允许在1个TCP连接上发送多个请求和响应，减少连接建立和关闭开销；引入管道化机制，允许客户端在同一连接上并发发送多个请求（但必须按请求顺序响应，可能导致“队头阻塞”问题）；支持响应分块、额外的缓存控制机制以及内容协商机制"}</p>,
    },
    {
        key: 'HTTP/2',
        label: 'HTTP/2',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"旨在解决HTTP/1.1中存在的性能瓶颈。使用二进制格式代替文本格式，提高数据传输效率；实现多路复用，允许多个请求和响应在同一连接上并发进行，消除“队头阻塞”问题；引入头部压缩技术，减少传输数据量；支持服务器推送，服务器可以主动向客户端推送资源/提前加载页面内容"}</p>,
    },
    {
        key: 'HTTP/3',
        label: 'HTTP/2',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"HTTP的最新版本，从TCP协议转向QUIC协议（一种基于UDP的多路复用传输协议），旨在解决TCP协议固有的连接建立延迟和拥塞控制等问题；进一步提高了网络传输性能，特别是在高延迟和不稳定网络环境下"}</p>,
    },
];

export default HTTPVersion;
