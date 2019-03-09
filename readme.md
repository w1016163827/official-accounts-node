official-accounts-node
=
一款让你开发微信公众号更为方便的框架，为你提供了一个可以自动生成参数验证开发者服务器有效性，并且可以解析用户发送数据和生成回复模板的中间件。以及一个Wechat类，该类的实例 提供了能够实现公众号开发的大部分功能的方法。

安装
====
    npm i official-accounts-node
如何使用
===
* officialAccounts-node向外暴露一个函数，给该函数传入你的微信公众号配置对象，函数会返回一个对象，该对象包含一个返回回复中间件的工厂函数（replyMiddleware）和一个Wechat类。

  * 中间件使用方法：接下来，你需要定义你自己的回复函数(支持async函数,中间件将会调用await进行解析)，再调用replyMiddleware，传入你的回复函数，replyMiddleware会返回一个回复中间件，接着就可以使用express的实例调用该中间件。

    * 回复函数定义方法：你的回复函数会接收到一个userData作为参数，并且你的回复函数需要返回一个option对象。userData是经过解析后返回的用户数据对象，option对象则是用来生成回复模板的必要数据。不同的返回类型需要不同的option对象（六种自动回复类型全部支持），option对象的类型以及参数详见[这里](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140543)。

    * 特别注意：news类型的option对象不需要ArticleCount属性（由中间件自动生成），Articles属性则是一个数组，数组中应包含图文消息数据对象，每个对象的参数为Title，Description，PicUrl，Url。参数意义还是详见[这里](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140543)。

  * Wechat类使用方法: 新建一个Wechat实例，接着根据需要调用相关方法即可。

代码示例
=
```javascript
    const express = require('express')	//引入express模块
    let {replyMiddleware,Wechat} = require('official-accounts-node')({
      appID:"your appID",
      appsecret:"your appsecret",
      URL:"your url",
      Token:"your token"
    })	//取出中间件和Wechat类
    let reply = userData =>{
      let option = {}
      if(userData.MsgType === 'text'){
        option = {
            ToUserName:userData.FromUserName,
            FromUserName:userData.ToUserName,
            CreateTime:Date.now(),
            MsgType:'text',
            Content:'您好'
        }
      }
      return option
    }	//定义一个reply函数
    const app = express()	//创建app应用对象
    app.use(replyMiddleware(reply))	//使用中间件。(如果开发者服务器验证失败，不要慌，很有可能是微信那边自己的问题，多试几次，很正常，我每次都要验证两三次才成功.)
    app.listen(3000,()=>console.log('服务器启动成功'))
    let w = new Wechat() //新建Wechat实例，请在验证完开发者服务器以后再使用实例的方法，这里假设已经验证完毕。
    w.createMenu(menuData)  //创建公众号菜单
```

API(Wechat)
=
以下所有方法均为异步函数，调用时请加上await。
=

`w.fetchAccessToken()`
* returns: `Object` 包含access_token和expires_in的对象

  * access_token: `String` 公众号的全局唯一接口调用凭据

  * expires_in: `String`  access_token的过期时间

>>该方法首先会查看当前是否拥有access_token，如果拥有，则会对其进行有效性验证(如果还有五分钟就过期，则会提前重新获取)。如果没有，则会根据配置对象信息发送请求给微信服务器以获取access_token，获取成功后会将数据以文本文件的形式保存在officialAccounts-node模块的utils文件夹下(为了防止文件乱跑导致无法进行验证)。

`w.fetchTicket()`

* returns: `Object` 包含access_token和expires_in的对象

  * ticket: `String` 公众号用于调用微信JS接口的临时票据

  * ticket_expires_in: `String`  access_token的过期时间

>>该方法首先会查看当前是否拥有ticket，如果拥有，则会对其进行有效性验证(如果还有五分钟就过期，则会提前重新获取)。如果没有，则会根据配置对象信息发送请求给微信服务器以获取ticket，获取成功后会将数据以文本文件的形式保存在officialAccounts-node模块的utils文件夹下(为了防止文件乱跑导致无法进行验证)。

`w.createMenu(menuData)`

* menuData: `Object` 用来创建自定义菜单的数据，数据结构请参考[这里](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141013)

* returns: `Object` 微信服务器返回的消息

  这是一个异步函数，调用时请加上await。调用后根据参数创建自定义菜单。

`w.deleteMenu()`

* returns: `Object` 微信服务器返回的消息

这是一个异步函数，调用时请加上await。调用后删除该公众号的所有菜单

`w.uploadTemporaryFile({type,fileName,filePath})`

* type: `String` 文件类型

* fileName: `String` 文件名称

* filePath: `String` 文件所在路径（以当前路径作为起点）

* returns: `Object` 微信服务器返回的消息

>>该方法用来上传临时素材。文件类型和文件格式请参考[这里](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738726)
```javascript
    ;(async function() {
      let w = new Wechat()
      let res = await w.uploadTemporaryFile({
          type:'image',
          fileName:'test.png',
          filePath:'../media'
      });
      console.log(res);
    })()
```
`w.uploadPermanentFile({type,material,videoBody,filePath})`

* type: `String` 文件类型

* material: `String` `Arrary` 文件名称或图文素材信息数组，普通文件为时值为String(文件名称)，news类型时则为Arrary(图文素材信息数组)，详见[这里](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738729)

* videoBody: `Object` 上传视频类型时所需要的表单，详见[这里](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738729)

* filePath: `String` 文件所在路径（以当前路径作为起点）

* returns: `Object` 微信服务器返回的消息

>>该方法用来上传永久素材。素材格式规范和类型请参考[这里](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738726)

```javascript
    ;(async function() {
        let w = new Wechat()
        let res = await w.uploadPermanentFile({
            type:'video',
            material:'test.mp4',
            filePath:'../media',
            videoBody:{
                title:'my video',
                introduction:'this is a video'
            }
        });
        console.log(res);
    })()
```
`getTemporaryFile({type,mediaId,fileName,filePath})`

* type: `String` 文件类型

* mediaId: `String` 文件在微信服务器上的id

* fileName: `Object` 想要生成的文件名称

* filePath: `String` 文件保存的路径（以当前路径作为起点）

* returns: `Object` 微信服务器返回的消息

>>该方法用来获取临时素材。普通素材会直接保存到文件路径里，视频素材则返回一个包含视频地址的对象。

`getPermanentFile({type,mediaId,fileName,filePath})`

* type: `String` 文件类型

* mediaId: `String` 文件在微信服务器上的id

* fileName: `Object` 想要生成的文件名称

* filePath: `String` 文件保存的路径（以当前路径作为起点）

* returns: `Object` 微信服务器返回的消息

>>该方法用来获取永久素材。普通素材会直接保存到文件路径里，视频素材和图文消息素材则返回一个包含相关信息的对象。

`jssdkObject(url)`

* url `String` 使用jssdk的网址

* returns: `Object` 包含使用jssdk所需要的所有信息 noncestr  timestamp  signature  appID

  * noncestr `String` 生成签名的随机串

  * timestamp `String` 生成签名的时间戳

  * signature `String` 生成的签名

  * appID `String` 公众号的唯一标识

>>根据配置信息以及网址自动生成并验证相关信息，返回微信网页开发所使用的jssdk的验证时所需要的数据。
