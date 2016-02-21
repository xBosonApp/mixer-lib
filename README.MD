# 系统集成库
> 使用案例在 demo 目录
> ! 不重启应用脚本修改
> 便捷方法/类


* 安装

`npm install mixer-lib`


* 使用

```js
//
// 引入库
//
var mixer = require('mixer-lib');

//
// 创建应用
//
mixer.create_http_mix_server({ 
    whenLoad : whenLoad, 
    port     : port,
    /* 使用 https 创建服务器需要的选项, 
    ssl : {
        key: 'privatekey.pem'',
        cert: 'certificate.pem',
    }
    */
}, exdata -- SomeObject {});

//
// 创建应用时, 该函数会被回调
// exdata 即是调用 create_http_mix_server 时传入的参数
//
function whenLoad(app_pool, exdata) {
    //
    // 创建应用, 如果应用返回一个 express 对象
    // 使用 mixer.express() 把应用插入混合器
    // 最后用 route.add() 告知混合器, 应用使用了那些路径
    //
    var sinopia_app = sinopia(config);
    var sinopia_route = app_pool.addApp(mixer.express(sinopia_app));
    sinopia_route.add('/');

    //
    // mixer.native() 把 http/https 原生应用插入混合器
    //
    var manager_app = xxxx();
    var mana_route = app_pool.addApp( mixer.native( manager_app ) );
    mana_route.add('/-/mana');

    //
    // 删除路径对应的应用
    //
    app_pool.removeApp('/');

    //
    // 重新加载 whenLoad 方法, 之前的应用都被删除
    // 并且会从文件系统重新读取程序代码
    //
    app_pool.reload();
}

```

# HTTPS 认证密钥的生成

生成私钥key文件：
openssl genrsa -out privatekey.pem 1024

通过私钥生成CSR证书签名
openssl req -new -key privatekey.pem -out certrequest.csr

通过私钥和证书签名生成证书文件
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem


***
# UTIL 工具

## NET package

`var net = mixer.util.net();`


* 使用 utf8 编码发送 HTTP.GET 请求
* _url -- 请求url
* parm -- 参数对象 JSON
* cb   -- 完成后的回调: function(err, dataObj)
* dataObj 使用参考 DATA 包

`net.get(_url, parm, cb)`


* 使用 utf8 编码发送 HTTP.POST 请求
* _url -- 请求url
* parm -- 参数对象 JSON
* cb   -- 完成后的回调: function(err, dataObj)
* dataObj 使用参考 DATA 包

`net.post(_url, parm, cb)`


***

## DATA package

`var data = mixer.util.data();`


* 创建一个数据包装器
* 不要修改包装器 *返回的对象*, 如果需要自行缓存这些对象

构造: 参数必须为字符串:
`var d = data.fromTxt('some')`

构造: 参数必须是对象
`var d = data.fromObj({b:1234})`
 
构造: 参数必须是 xml 字符串
`var d = data.fromXml("<xml .../>")`


* 返回原始字符串
`var r = d.txt()`

* 返回解析后的 OBJECT, 失败返回 null
`var r = d.obj()`

* 返回 XML 字符串, 失败返回 null
`var r = d.xml()`


***


## MID package

```javascript
var mid = mix.util.mid();
var app = require('express')();
```


### ex_static 静态文件服务 
> 并不推荐使用, 用 masquerade 替代

`app.use(mid.ex_static('./test', '/a'));`

* 映射一个 url 前缀到本地目录, 该 url 后的所有请求返回该本地目录中的文件
* localpath - 本地路径
* url_prefix - url 的前缀
`ex_static(localpath, url_prefix)`


### ex_log 日志查看服务 (该服务的实现在 logger-lib 中)

`app.use('/cron/log', mid.ex_log('log'));`

* 通过 log 接口查看日志
* servicename - 接口服务名
`ex_static(servicename)`
