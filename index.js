let WechatConstructor = require('./weChat/wechat')
let replyConstructor = require('./reply')

module.exports = function (config) {
    return {
        Wechat:WechatConstructor(config),
        replyMiddleware:replyConstructor(config)
    }
}