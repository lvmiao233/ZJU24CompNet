import axios from 'axios';
import React from 'react';
import { Button, notification, Table, Tag } from 'antd';
import LinkCard from "@site/src/components/LinkCard";
import Admonition from '@theme/Admonition';

const HTTPVersions = {
    "HTTP/0.9": ["最早的HTTP协议版本，发布于1991年，只支持GET方法，没有请求头和状态码，也不支持持久连接，只能传输纯文本内容",],
    "HTTP/1.0": ["为了满足多媒体等日渐丰富的需求，增加了对多种请求方法的支持，如GET、POST和HEAD\n引入了请求头和响应头，使客户端和服务器间通信更灵活\n引入状态码，允许更复杂的错误处理和报告",],
    "HTTP/1.1": ["目前使用最广泛的版本之一。默认开启持久连接，允许在1个TCP连接上发送多个请求和响应，减少连接建立和关闭开销\n引入管道化机制，允许客户端在同一连接上并发发送多个请求（但必须按请求顺序响应，可能导致“队头阻塞”问题）\n支持响应分块、额外的缓存控制机制以及内容协商机制",],
    "HTTP/2": ["旨在解决HTTP/1.1中存在的性能瓶颈。使用二进制格式代替文本格式，提高数据传输效率\n实现多路复用，允许多个请求和响应在同一连接上并发进行，消除“队头阻塞”问题\n引入头部压缩技术，减少传输数据量\n支持服务器推送，服务器可以主动向客户端推送资源/提前加载页面内容",],
    "HTTP/3": ["HTTP的最新版本，从TCP协议转向QUIC协议（一种基于UDP的多路复用传输协议），旨在解决TCP协议固有的连接建立延迟和拥塞控制等问题\n进一步提高了网络传输性能，特别是在高延迟和不稳定网络环境下","实际上，我们浏览网页时使用的HTTP版本与客户端-中间网络设备-服务端中每个环节的支持情况都息息相关，尽管HTTP/3带来了各方面的显著优化，但架构的调整也使得互联网尚需时日才能更好地兼容与适配，目前最主流使用的版本仍然是HTTP/2",
    <div style={{position: "relative", width:'100%', height: '400px'}}>
        <iframe style={{position: 'absolute', width: '100%', height: '100%'}} src="https://radar.cloudflare.com/embed/HttpVersionXY?botClass=&chartState=%7B%22showAnnotations%22%3Atrue%2C%22xy.hiddenSeries%22%3A%5B%5D%2C%22xy.highlightedSeries%22%3Anull%2C%22xy.previousVisible%22%3Atrue%7D" title="Cloudflare Radar - HTTP/1.x vs. HTTP/2 vs. HTTP/3" loading="lazy"></iframe>
    </div>
    ],
};

const BASE_URL= 'https://demo.zjucomp.net';

const notifyResult = (response) => {
    const prettyResponse = JSON.stringify(response, null, 1);
    notification.success({
        message: '请求成功，服务器返回:',
        description: <pre style={{marginLeft: -36}}>{prettyResponse}</pre>,
        style: {width: '450px'},
        duration: 1.5,
        pauseOnHover: true
    });
}

// GET方法
const getMethod = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/httpMethodsDemo.md`);
        notifyResult(response);
    } catch (error) { }
};

// POST方法
const postMethod = async () => {
    try {
        const data = { key: 'value' };
        const response = await axios.post(`${BASE_URL}`, data);
        notifyResult(response);
    } catch (error) { }
};

// PUT方法
const putMethod = async () => {
    try {
        const data = { key: 'new_value' };
        const response = await axios.put(`${BASE_URL}/httpMethodsDemo.md`, data);
        notifyResult(response);
    } catch (error) { }
};

// DELETE方法
const deleteMethod = async () => {
    try {
        const response = await axios.delete(`${BASE_URL}/httpMethodsDemo.md`);
        notifyResult(response);
    } catch (error) { }
};

// HEAD方法
const headMethod = async () => {
    try {
        const response = await axios.head(`${BASE_URL}/httpMethodsDemo.md`);
        notifyResult(response);
    } catch (error) { }
};

// OPTIONS方法
const optionsMethod = async () => {
    try {
        const response = await axios.options(`${BASE_URL}/options`);
        notifyResult(response);
    } catch (error) { }
};

// PATCH方法
const patchMethod = async () => {
    try {
        const data = { key: 'patched_value' };
        const response = await axios.patch(`${BASE_URL}/httpMethodsDemo.md`, data);
        notifyResult(response);
    } catch (error) { }
};

export const HTTPMethods = {
    'GET方法': ["用于从服务器请求获取资源，GET方法的请求参数通常作为查询字符串附加在URL之后", "需要注意的是，GET请求不适合传输大量数据（URL通常只能承载2048个字符），也不应用于传输敏感信息（可能被记录在服务器日志或浏览器的历史记录中，造成敏感数据泄露）"],
    'POST方法': ["用于向服务器提交数据，通常用于需要改变服务器状态的操作，如提交表单数据或上传文件", "POST方法的请求数据放置在请求体中，这意味着它可以携带更多、更丰富的数据（如表单、文件等），并且比GET方法更安全"],
    'PUT方法': ["用于完全更新或替换服务器上的资源", "客户端通过PUT请求向服务器发送目标资源新的内容，服务器使用其替换现有目标资源（例：请求替换课程网站上特定URL对应的实验报告模板文件为新的版本，替换后URL不变）"],
    'DELETE方法': ["用于请求服务器删除指定的资源", "通常用于管理数据，如删除数据库记录或文件"],
    'HEAD方法': ["类似GET方法，但只请求资源元信息而非资源本身，常用于检查资源是否存在/最后修改日期等信息", "响应只包含状态行和头字段，没有实体主体部分，不需要下载整个资源，在资源预检或元数据获取场景中很有用"],
    'OPTIONS方法': ["用于获取目标资源支持的通信选项，帮助客户端确定与服务器交互的最佳方式", "对于跨域资源共享（CORS）非常重要，因为预检请求会使用OPTIONS方法来验证跨域请求的安全性，我们的实验测试框架就通过响应OPTION实现与测试页面的连接"],
    'PATCH方法': ["用于对资源进行局部更新，仅指定服务器修改资源的部分内容，不需要替换整个资源", "特别适合于需要精细控制更新过程的场景，可以减少不必要的数据传输，提高效率"],
};


export const HTTPMethodsExtras = {
    'GET方法': <Button type="primary" size="small" onClick={getMethod}>测试该方法</Button>,
    'POST方法': <Button type="primary" size="small" onClick={postMethod}>测试该方法</Button>,
    'PUT方法': <Button type="primary" size="small" onClick={putMethod}>测试该方法</Button>,
    'DELETE方法': <Button type="primary" size="small" onClick={deleteMethod}>测试该方法</Button>,
    'HEAD方法': <Button type="primary" size="small" onClick={headMethod}>测试该方法</Button>,
    'OPTIONS方法': <Button type="primary" size="small" onClick={optionsMethod}>测试该方法</Button>,
    'PATCH方法': <Button type="primary" size="small" onClick={patchMethod}>测试该方法</Button>,
}

const contentTypeInfo = [
    {type: '文本', field: 'text/plain', desc: '纯文本文件'},
    {type: '文本', field: 'text/html', desc: 'HTML文档'},
    {type: '文本', field: 'text/css', desc: 'CSS样式表'},
    {type: '文本', field: 'text/xml', desc: 'XML文档'},
    {type: '文本', field: 'text/csv', desc: 'CSV（逗号分隔值）文件'},
    {type: '图像', field: 'image/jpeg', desc: 'JPEG图像'},
    {type: '图像', field: 'image/png', desc: 'PNG图像'},
    {type: '图像', field: 'image/gif', desc: 'GIF图像'},
    {type: '图像', field: 'image/svg+xml', desc: 'SVG（可缩放矢量图形）文件'},
    {type: '图像', field: 'image/webp', desc: 'WebP图像格式'},
    {type: '视频', field: 'video/mp4', desc: 'MP4视频文件'},
    {type: '视频', field: 'video/mpeg', desc: 'MPEG视频文件'},
    {type: '音频', field: 'audio/mpeg', desc: 'MP3音频文件'},
    {type: '音频', field: 'audio/wav', desc: 'WAV音频文件'},
    {type: '音频', field: 'audio/aac', desc: 'AAC音频文件'},
    {type: '音频', field: 'audio/ogg', desc: 'Ogg音频文件'},
    {type: '应用程序', field: 'application/json', desc: 'JSON数据'},
    {type: '应用程序', field: 'application/pdf', desc: 'PDF文件'},
    {type: '应用程序', field: 'application/xml', desc: 'XML文档'},
    {type: '应用程序', field: 'application/javascript', desc: 'JavaScript文件'},
    {type: '应用程序', field: 'application/octet-stream', desc: '二进制数据流，通常用于下载文件'},
    {type: '应用程序', field: 'application/x-www-form-urlencoded', desc: 'URL编码的表单数据，常用于POST请求'},
    {type: '应用程序', field: 'application/x-zip-compressed', desc: 'ZIP压缩文件'},
    {type: '字体', field: 'font/ttf', desc: 'TrueType字体文件'},
    {type: '字体', field: 'font/otf', desc: 'OpenType字体文件'},
    {type: '字体', field: 'font/woff', desc: 'WOFF（Web Open Font Format）字体文件'},
    {type: '字体', field: 'font/woff2', desc: 'WOFF2字体文件'},
]
const contentType = [
    { title: '类型', dataIndex: 'type', key: 'type', sorter: (a, b) => a.type.localeCompare(b.type) },
    { title: '字段', dataIndex: 'field', key: 'field', sorter: (a, b) => a.field.localeCompare(b.field) },
    { title: '描述', dataIndex: 'desc', key: 'desc', },
];

export const resourceAttrInfo = {
    "Content-Length": "有正文时必须添加该字段，指明资源主体的大小，以字节为单位，对于接收方预估下载时间和分配缓冲区大小非常有用",
    "Content-Type": ["有正文时必须添加该字段，用于指定资源的MIME类型，帮助接收方使用正确的方式解析资源，以下是常见的一些类型：", <Table dataSource={contentTypeInfo} columns={contentType} size={'small'} pagination={false}/>],
    "Content-Encoding": "为了节约网络带宽，提高弱网环境下的浏览体验，发送方可以对资源进行压缩，并通过该字段指示资源被编码的方式，常见的值包括 gzip 和 deflate，这有助于接收方知道如何解码资源",
    "Last-Modified": "提供资源最后一次被修改的时间，这在条件请求中特别有用，通过HEAD请求发现上次请求内容此时仍未被修改，则不需要重新再加载一次，可以避免不必要的完整资源传输",
}
export const cacheAttrInfo = {
    "Cache-Control": "允许设定资源的缓存策略，如最大年龄 (max-age)、是否只允许私有缓存 (private)、不允许缓存 (no-cache) 或禁止存储 (no-store)",
    "Expires": "指定了资源过期的具体日期和时间，帮助缓存服务器决定何时重新验证缓存的资源是否是最新版本",
    "Pragma": "主要用于兼容HTTP/1.0的缓存控制，常见的值是 no-cache，用于指示缓存不应使用已有的缓存副本",
    "Vary": "指示缓存服务器在决定是否使用缓存副本时需要考虑的请求头字段，如，如果设置了 Vary: Accept-Encoding，那么对于相同的URL，但具有不同压缩设置的请求，缓存服务器应返回不同的响应"
}
export const securityAttrInfo = {
    "Authorization": "用于向服务器发送身份验证凭证，通常在响应包含 WWW-Authenticate 头字段的401状态码后使用",
    "Access-Control-Allow-Origin": "控制来自哪些域名的请求可以访问资源，是实现跨源资源共享(CORS)的关键，它允许服务器指定一个或多个源，或者使用通配符 * 表示所有源都可以访问",
    "Strict-Transport-Security (HSTS)": "强制浏览器通过HTTPS连接到网站，增加安全性，一旦设置了此头字段，浏览器会在一段时间内自动将所有对该站点的HTTP请求转换为HTTPS请求",
    "Cookie": "用于在客户端存储少量数据，通常用于会话管理和个性化设置，客户端被指定设置Cookie后，每次请求时都会自动将之前设置的Cookie发送回服务器，服务器即可根据Cookie进行跟踪",
    "Referer": [<Admonition type="important" title={"早期HTTP规范不慎将该字段拼错，为了保证兼容性，后续版本的规范仍使用该错误拼写"} children={""}/>, "指示发起请求的页面地址，有助于服务器进行日志记录、链接分析或安全检查"],
}
export const negotiationAttrInfo = {
    "Accept": "列出客户端可以接受的内容类型，服务端会根据这个列表选择最合适的内容类型进行响应，如，Accept: text/html,application/xhtml+xml 表示客户端优先接受HTML和XHTML内容",
    "Accept-Language": "表示客户端首选的语言，服务端可以据此返回适当语言的内容，如，Accept-Language: en-US,en;q=0.5 表示美国英语是首选语言，但也可以接受其他英语变体",
    "Accept-Encoding": "告知服务端客户端支持的压缩算法，帮助减少传输的数据量，如，Accept-Encoding: gzip, deflate 表示客户端支持gzip和deflate压缩",
    "Accept-Charset": "指示客户端支持的字符集，虽然现代Web开发中较少使用，但在特定情况下仍然有用，如，Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7 表示首选ISO-8859-1字符集，其次是UTF-8",
    "Connection": "控制当前连接的状态，常见的值有 keep-alive（保持连接）和 close（关闭连接）",
    "User-Agent": ["提供发起请求的客户端的信息，包括浏览器类型、版本、操作系统等，用于服务器进行内容适配或统计分析，如：Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0，你可能会注意到这个字段的内容非常复杂难懂，这同样来自兼容性与商业竞争考虑，关于这座屎山的传奇历史，请参考：", <LinkCard url={"https://www.bilibili.com/video/BV1E7421Z7Zb"} title={"为啥所有浏览器都假扮成Mozilla？"} icon={"https://b.bilibili.com/favicon.ico"}>Isword先生</LinkCard>]
}

export const responseCode = [
    { code: 100, phrase: "Continue", desc: "请求正在进行中" },
    { code: 200, phrase: "OK", desc: "请求成功" },
    { code: 202, phrase: "Accepted", desc: "请求已被接受且正在处理中，但尚未完成" },
    { code: 301, phrase: "Moving Permanently", desc: "资源有个新地址" },
    { code: 302, phrase: "Moving Temporarily", desc: "资源有个新的临时地址" },
    { code: 400, phrase: "Bad Request", desc: "服务器不认可这个请求" },
    { code: 401, phrase: "Unauthorized", desc: "授权失败" },
    { code: 404, phrase: "Not Found", desc: "所请求的资源不存在" },
    { code: 406, phrase: "Not Acceptable", desc: "内容将不被浏览器所接受" },
    { code: 500, phrase: "Internal Server Error", desc: "服务器遭遇错误" },
    { code: 503, phrase: "Service Unavailable", desc: "服务器过载或不工作" },
];
export const responseCodeColumn = [
    { title: '响应码', dataIndex: 'code', key: 'code', sorter: (a, b) => (a.code - b.code) },
    { title: '原因短语 Reason-Phrase', dataIndex: 'phrase', key: 'phrase'},
    { title: '描述', dataIndex: 'desc', key: 'desc', },
];

export const uriMap = [
    { desc: "带有图片的首页HTML文件", internal_uri: "/html/test.html", external_uri: "/index.html" },
    { desc: "去掉图片的首页HTML文件", internal_uri: "/html/noimg.html", external_uri: "/index_noimg.html" },
    { desc: "纯文本文件", internal_uri: "/txt/test.txt", external_uri: "/info/server" },
    { desc: "浙大校标图片文件", internal_uri: "/img/logo.jpg", external_uri: "/assets/logo.jpg" },
];
export const uriMapColumn = [
    { title: '文件描述', dataIndex: 'desc', key: 'desc', },
    { title: '文件路径', dataIndex: 'internal_uri', key: 'internal_uri'},
    { title: '映射后URL', dataIndex: 'external_uri', key: 'external_uri'},
];

const colorRender = (text) => (<Tag color={text === ' √ ' ? 'green' : (text === ' × ' ? 'red' : 'blue')} >{text}</Tag>)

export const HTTPMethodAttribute = [
    { method: '请求体', GET: '可选', POST: '通常', OPTIONS: '可选', HEAD: '可选', PUT: ' √ ', DELETE: '可选', PATCH: ' √ ' },
    { method: '响应体', GET: ' √ ', POST: ' √ ', OPTIONS: ' √ ', HEAD: ' × ', PUT: ' √ ', DELETE: ' √ ', PATCH: ' √ ' },
    { method: '安全性', GET: ' √ ', POST: ' × ', OPTIONS: ' √ ', HEAD: ' √ ', PUT: ' × ', DELETE: ' × ', PATCH: ' × ' },
    { method: '幂等性', GET: ' √ ', POST: ' × ', OPTIONS: ' √ ', HEAD: ' √ ', PUT: ' √ ', DELETE: ' √ ', PATCH: ' × ' },
    { method: '可缓存', GET: ' √ ', POST: '有时', OPTIONS: ' × ', HEAD: ' √ ', PUT: ' × ', DELETE: ' × ', PATCH: ' × ' },
];

export const HTTPMethodAttributeColumn = [
    { title: '属性', dataIndex: 'method', key: 'method', render: (text) => <span>{text}</span> },
    { title: 'GET', dataIndex: 'GET', key: 'GET', render: colorRender },
    { title: 'POST', dataIndex: 'POST', key: 'POST', render: colorRender },
    { title: 'OPTIONS', dataIndex: 'OPTIONS', key: 'OPTIONS', render: colorRender },
    { title: 'HEAD', dataIndex: 'HEAD', key: 'HEAD', render: colorRender },
    { title: 'PUT', dataIndex: 'PUT', key: 'PUT', render: colorRender },
    { title: 'DELETE', dataIndex: 'DELETE', key: 'DELETE', render: colorRender },
    { title: 'PATCH', dataIndex: 'PATCH', key: 'PATCH', render: colorRender },
];

export default HTTPVersions;
