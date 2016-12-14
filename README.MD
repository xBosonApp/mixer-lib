# 系统集成库

使用本库可以把多个分散的项目集成到一个 http 服务器中, 而不需要修改项目代码.


# 安装

`npm install mixer-lib --save`


# 配置对象

配置文件在 ./config/config.js 中定义相同, 但配置文件无法设置 whenLoad,
编程配置优先于文件配置, 空余项可以被文件配置补充;
不推荐使用 nodejs 的 ssl, nginx 做代理加入 ssl 模块效率更高;

```js
var conf = {
  // HTTP 服务端口号
  port      : 81,  

  // 集群配置:
  //  5     设置为5个进程;
  //  0.5   使用一半数量的处理器,
  //  -2    留出 2 个空闲处理器
  //  true  使用全部处理器, 或设置 0
  //  false 单进程
  cluster   : false,

  // 这个参数必须设置
  whenLoad  : Function   

  // 使用 https 创建服务器需要的选项,
  ssl : {     
    // 完整的文件路径             
    key  : 'privatekey.pem',
    cert : 'certificate.pem',
  }
};
```


# 使用1 (<=0.1 版本支持)

```js
var mixer = require('mixer-lib');
mixer.create_http_mix_server({ whenLoad : whenLoad });

function whenLoad(app_pool, exdata) {
    var sinopia_app = sinopia(config);
    var sinopia_route = app_pool.addApp(mixer.express(sinopia_app));
    sinopia_route.add('/');

    var mana_route = app_pool.addApp([some_function], '/some');
}
```


# 使用2 (>=0.2 版本支持)

相比[使用1]是更方便的 api.

```js
var mixer = require('mixer-lib');
mixer.auto_init(whenLoad, ext_data);

function whenLoad(app_pool, exdata, config) {
    app_pool.addApp(Function, route_path);
}
```


# HTTPS 认证密钥的生成

生成私钥key文件  
`openssl genrsa -out privatekey.pem 1024`

通过私钥生成CSR证书签名  
`openssl req -new -key privatekey.pem -out certrequest.csr`

通过私钥和证书签名生成证书文件  
`openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem`


# Events

## app_pool 可能发出的消息

#### beforeFirstLoad

    服务器第一次启动之前发出的消息

#### afterFirstLoad

    服务器第一次启动之后发出的消息

#### beforeEnd

    在服务器准备停止之前发出

#### afterReload

    在服务器重新加载之后发出

#### err_no_start

    服务器启动失败

#### error

    进入服务状态后发生的错误


# API

`./test/demo.js` 中有可立即运行的代码

#### function whenLoad(app_pool, exdata, config)

    服务器启动/重启时的回调函数, 在函数中使用 app_pool 添加应用.
    * app_pool -- 用来注册服务/应用
    * exdata   -- 调用 auto_init()/create_http_mix_server() 时传入的参数
    * config   -- 全局配置文件

#### Function serviceApp(request, response, next)

    应用/服务函数前面, 可用 app_pool 插入混合器, 当与之关联的路由被请求时回调.
    request/response 与 http 库中的相同;
    request.base 增加的属性, 用于指明调用当前服务时匹配的根路径
    next:Function(err, msg) 被调用后会执行默认应当给客户端, 设置 err 返回 500,
    只设置 msg 返回字符串, 否则返回 404.

#### mixer.create_http_mix_server(config [, ex_data])

    创建并启动服务器; config.whenLoad 函数必须设置.

#### mixer.write_pid(config)

    内部函数

#### mixer.auto_init(whenLoad [, ext_data]);

    如果调用该方法的模块是全局根模块, 则会启动 http 服务
    并读取全局配置文件 (参考 configuration-lib 的 lib.auto_init(...))
    否则不会启动服务, 但会尝试导出 whenLoad 函数. 日志中会有记录.

#### app_pool.addApp(serviceApp [, path_string])

    将应用插入混合器, 并返回 route 对象用来设置路由;
    或设置 path_string 参数来设置路由路径, 这样可以更方便, 切不需要 route 对象.

#### app_pool.reload()

    重新启动服务器并从磁盘重新加载代码
    (条件: 重新加载的代码必须在 whenLoad 函数中被 require)

#### app_pool.removeApp(route_path)

    删除路径对应的应用/服务; 如果应用注册了多个路由, 哪些路由仍然有效

#### app_pool.on(eventName, callback)

    接收服务器发来的事件

#### route.add(path_string | array | route_saver)

    route 是与应用关联的路由设置器, 允许设置多个路由.

#### mixer.create_route_saver()

    创建路由保存器 reoute_saver 可以通过 route.add 插入路由表中.
    reoute_saver(path) 可以添加新路由.

#### mixer.native(Function app())
#### mixer.express(Function app())
#### mixer.thinkjs(config)
#### mixer.dish(Function app())

    这些方法用来把为针对特定中间件api写的app转换为 mixer api 的中间件.
    返回的对象可以直接调用 app_pool.addApp(...)
    (你确定要用 thinkjs ?!)


## UTIL 工具

    工具库在不使用时并不加载, 不会占用资源

### var net = mixer.util.net()

    创建网络工具, http 库不支持传递 header.

#### net.get(_url, parm, cb)

    * 使用 utf8 编码发送 HTTP.GET 请求
    * _url -- 请求url
    * parm -- 参数对象 JSON
    * cb   -- 完成后的回调: function(err, dataObj)
    * dataObj 使用参考 DATA 包

#### net.post(_url, parm, cb)

    * 使用 utf8 编码发送 HTTP.POST 请求
    * _url -- 请求url
    * parm -- 参数对象 JSON
    * cb   -- 完成后的回调: function(err, dataObj)
    * dataObj 使用参考 DATA 包

### var data = mixer.util.data();

    创建一个数据包装器  
    不要修改包装器 *返回的对象*, 如果需要自行缓存这些对象

    构造: 参数必须为字符串:  
    `var d = data.fromTxt('some')`

    构造: 参数必须是对象  
    `var d = data.fromObj({b:1234})`

    构造: 参数必须是 xml 字符串  
    `var d = data.fromXml("<xml .../>")`

#### var r = d.txt()

    返回原始字符串

#### var r = d.obj()

    返回解析后的 OBJECT, 失败返回 null

#### var r = d.xml()

    返回 XML 字符串, 失败返回 null

### var mid = mixer.util.mid()

    返回中间件库 MID package

#### mid.ex_static(localpath, url_prefix)

    localpath  - 本地路径  
    url_prefix - url 的前缀  
    映射一个 url 前缀到本地目录, 该 url 后的所有请求返回
    该本地目录中的文件; 并不推荐, 用 masquerade 替代.

#### mid.ex_log(bootstrap)

    ex_log 日志查看服务 (该服务的实现在 logger-lib 中),
    bootstrap 的说明见 logger-lib 库.

#### mid.ex_reload(app_pool)

    重启服务, 密码在控制台生成

### var lifecycle = mixer.util.lifecycle()

    加载可中断定时器库, 与 setInterval 定时器不同, 该定时器通过外部中断可以
    让回调延迟到下一个周期中.

#### lcobj = lifecycle(interval_seconds, task_func)

    创建一个定时器实例, 每间隔 interval_seconds 秒调用一次 task_func.

#### lcobj.update(); lcobj.interrupt(); lcobj.skip();

    这些函数都是中断定时器, 使回调函数从调用时间点延迟一个周期.

#### lcobj.stop(); lcobj.kill(); lcobj.end();

    这些函数都是终止定时器, 释放资源.
