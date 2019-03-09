const sha1 = require("sha1")
const {getUserDataAsync,parseXMLAsync,formatMessage} = require("../utils/index")
const template = require('../template/template')

module.exports = (config)=>{
    return (replay)=>{
        return async(req,res,next)=>{
            //验证服务器是否有效
            //获取需要的参数
            let {signature,echostr,timestamp,nonce} = req.query
            let {Token} =  config
            //进行解密
            let str = sha1([nonce,timestamp,Token].sort().join(""))
            if(signature === str){
                //该信息来自微信服务器
                if(req.method === 'GET'){ //用来验证开发者服务器
                    res.send(echostr)
                }else if(req.method === 'POST'){ //接收来自微信服务器的消息
                    //把buff转换成字符串
                    let str = await getUserDataAsync(req)
                    //把字符串转换成对象
                    let userData = await parseXMLAsync(str)
                    userData = await formatMessage(userData)
                    let options = await replay(userData)
                    let result = template(options)
                    res.send(result)
                }else {
                    res.send('error')
                }
            }else{
                //该消息不来自微信服务器
                res.send('error')
            }
        }
    }

}

