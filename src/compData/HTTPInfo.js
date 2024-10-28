import axios from 'axios';
import React from 'react';
import { Button, notification } from 'antd';

const HTTPVersions = {
    "HTTP/0.9": "最早的HTTP协议版本，发布于1991年，只支持GET方法，没有请求头和状态码，也不支持持久连接，只能传输纯文本内容",
    "HTTP/1.0": "为了满足多媒体等日渐丰富的需求，增加了对多种请求方法的支持，如GET、POST和HEAD\n引入了请求头和响应头，使客户端和服务器间通信更灵活\n引入状态码，允许更复杂的错误处理和报告",
    "HTTP/1.1": "目前使用最广泛的版本之一。默认开启持久连接，允许在1个TCP连接上发送多个请求和响应，减少连接建立和关闭开销\n引入管道化机制，允许客户端在同一连接上并发发送多个请求（但必须按请求顺序响应，可能导致“队头阻塞”问题）\n支持响应分块、额外的缓存控制机制以及内容协商机制",
    "HTTP/2": "旨在解决HTTP/1.1中存在的性能瓶颈。使用二进制格式代替文本格式，提高数据传输效率\n实现多路复用，允许多个请求和响应在同一连接上并发进行，消除“队头阻塞”问题\n引入头部压缩技术，减少传输数据量\n支持服务器推送，服务器可以主动向客户端推送资源/提前加载页面内容",
    "HTTP/3": "HTTP的最新版本，从TCP协议转向QUIC协议（一种基于UDP的多路复用传输协议），旨在解决TCP协议固有的连接建立延迟和拥塞控制等问题\n进一步提高了网络传输性能，特别是在高延迟和不稳定网络环境下",
};

export const HTTPMethods = {
    'GET方法': "用于从服务器请求获取资源，GET方法的请求参数通常作为查询字符串附加在URL之后\n需要注意的是，GET请求不适合传输大量数据（URL通常只能承载2048个字符），也不应用于传输敏感信息（可能被记录在服务器日志或浏览器的历史记录中，造成敏感数据泄露）",
    'POST方法': "用于向服务器提交数据，通常用于需要改变服务器状态的操作，如提交表单数据或上传文件\nPOST方法的请求数据放置在请求体中，这意味着它可以携带更多、更丰富的数据（如表单、文件等），并且比GET方法更安全",
    'PUT方法': "用于完全更新或替换服务器上的资源\n客户端通过PUT请求向服务器发送目标资源新的内容，服务器使用其替换现有目标资源（例：请求替换课程网站上特定URL对应的实验报告模板文件为新的版本，替换后URL不变）",
    'DELETE方法': "用于请求服务器删除指定的资源\n通常用于管理数据，如删除数据库记录或文件",
    'HEAD方法': "类似GET方法，但只请求资源元信息而非资源本身，常用于检查资源是否存在/最后修改日期等信息\n响应只包含状态行和头字段，没有实体主体部分，不需要下载整个资源，在资源预检或元数据获取场景中很有用",
    'OPTIONS方法': "用于获取目标资源支持的通信选项，帮助客户端确定与服务器交互的最佳方式\n对于跨域资源共享（CORS）非常重要，因为预检请求会使用OPTIONS方法来验证跨域请求的安全性，我们的实验测试框架就通过响应OPTION实现与测试页面的连接",
    'PATCH方法': "用于对资源进行局部更新，仅指定服务器修改资源的部分内容，不需要替换整个资源\n特别适合于需要精细控制更新过程的场景，可以减少不必要的数据传输，提高效率",
};

const BASE_URL= 'https://demo.zjucomp.net';

const notifyResult = (response) => {
    const prettyResponse = JSON.stringify(response, null, 2);
    notification.success({
        message: '请求成功，服务器返回:',
        description: <pre>{prettyResponse}</pre>,
        style: {width: '600px'},
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

export const HTTPMethodsExtras = {
    'GET方法': <Button type="primary" size="small" onClick={getMethod}>测试该方法</Button>,
    'POST方法': <Button type="primary" size="small" onClick={postMethod}>测试该方法</Button>,
    'PUT方法': <Button type="primary" size="small" onClick={putMethod}>测试该方法</Button>,
    'DELETE方法': <Button type="primary" size="small" onClick={deleteMethod}>测试该方法</Button>,
    'HEAD方法': <Button type="primary" size="small" onClick={headMethod}>测试该方法</Button>,
    'OPTIONS方法': <Button type="primary" size="small" onClick={optionsMethod}>测试该方法</Button>,
    'PATCH方法': <Button type="primary" size="small" onClick={patchMethod}>测试该方法</Button>,
}

export default HTTPVersions;
