const HTTPMethods = [
    {
        key: 'GET',
        label: 'GET方法',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"用于从服务器请求获取资源，请求参数通常作为查询字符串附加在URL之后。需要注意的是，GET请求不适合传输大量数据（URL通常只能承载2048个字符），也不应用于传输敏感信息（可能被记录在服务器日志或浏览器的历史记录中，造成敏感数据泄露）"}</p>,
    },
    {
        key: 'POST',
        label: 'POST方法',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"用于向服务器提交数据，通常用于需要改变服务器状态的操作，如提交表单数据或上传文件。请求数据放置在请求体中，这意味着它可以携带更多、更丰富的数据（如表单、文件等），并且比GET方法更安全"}</p>,
    },
    {
        key: 'PUT',
        label: 'PUT方法',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"用于完全更新或替换服务器上的资源。客户端通过PUT请求向服务器发送目标资源新的内容，服务器使用其替换现有目标资源（例：请求替换课程网站上特定URL对应的实验报告模板文件为新的版本，替换后URL不变）"}</p>,
    },
    {
        key: 'DELETE',
        label: 'DELETE方法',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"用于请求服务器删除指定的资源。通常用于管理数据，如删除数据库记录或文件"}</p>,
    },
    {
        key: 'HEAD',
        label: 'HEAD方法',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"类似GET方法，但只请求资源元信息而非资源本身，常用于检查资源是否存在/最后修改日期等信息。响应只包含状态行和头字段，没有实体主体部分，不需要下载整个资源，在资源预检或元数据获取场景中很有用"}</p>,
    },
    {
        key: 'OPTIONS',
        label: 'OPTIONS方法',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"用于获取目标资源支持的通信选项，帮助客户端确定与服务器交互的最佳方式。对于跨域资源共享（CORS）非常重要，因为预检请求会使用OPTIONS方法来验证跨域请求的安全性，我们的实验测试框架就通过响应OPTION实现与测试页面的连接"}</p>,
    },
    {
        key: 'PATCH',
        label: 'PATCH方法',
        children: <p
            style={{fontSize: 15, marginBottom: 0}}>{"用于对资源进行局部更新，仅指定服务器修改资源的部分内容，不需要替换整个资源。特别适合于需要精细控制更新过程的场景，可以减少不必要的数据传输，提高效率"}</p>,
    }
];

export default HTTPMethods;