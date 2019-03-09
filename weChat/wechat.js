//第三方模块
const sha1 = require('sha1')
const rp = require('request-promise-native');
const request = require('request');
const {resolve} = require('path')
const {createReadStream,createWriteStream} = require('fs')
//自己的模块
const api = require('../api/api')
const {writeFileAsync,readFileAsync} = require('../utils')

module.exports = function (config) {
    const {appID, appsecret} = config;
    class Wechat {
        constructor(){
        }
        //请求accessToken的方法
        getAccessToken(){
            const url = `${api.accessToken}&appid=${appID}&secret=${appsecret}`
            return new Promise((resolve,reject) =>{
                rp({
                    method:"GET",
                    url,
                    json:true
                })
                    .then(res =>{
                        res.expires_in = Date.now() + (res.expires_in - 300)*1000
                        resolve(res)
                    })
                    .catch(err =>{
                        reject(`获取getAccessToken失败${err}`)
                    })
            })
        }
        //保存accessToken的方法
        saveAccessToken(accessToken){
            return writeFileAsync('access_token.txt',accessToken)
        }
        //读取accessToken的方法
        readAccessToken(){
            return readFileAsync('access_token.txt')
        }
        //检测accessToken是否过期的方法
        isValidAccessToken(data){
            if (!data && !data.access_token && !data.expires_in) {
                //代表access_token无效的
                return false;
            }
            return data.expires_in > Date.now();
        }
        //获取accessToken的方法
        fetchAccessToken(){
            if(this.access_token && this.expires_in && this.isValidAccessToken(this)){
                return Promise.resolve({
                    access_token:this.access_token,
                    expires_in:this.expires_in
                })
            }else {
                return this.readAccessToken()
                    .then(async res=>{
                        if(this.isValidAccessToken(res)){
                            return res
                        }else {
                            const res = await this.getAccessToken()
                            this.saveAccessToken(res)
                            return res
                        }
                    })
                    .catch(async err=>{
                        const res = await this.getAccessToken()
                        this.saveAccessToken(res)
                        return res
                    })
                    .then((res)=>{
                        this.access_token = res.access_token
                        this.expires_in = res.expires_in
                        return Promise.resolve(res)
                    })
            }
        }
        createMenu(menuData){
            return new Promise(async(resolve, reject) => {
                try {
                    let data = await this.fetchAccessToken()
                    let url = `${api.menu.create}access_token=${data.access_token}`
                    let res = await rp({
                        method:"POST",
                        url,
                        body:menuData,
                        json:true
                    })
                    resolve(res)
                }catch (e) {
                    reject("createMenu方法出了文体:"+ e)
                }
            })
        }
        deleteMenu(){
            return new Promise(async(resolve, reject) => {
                try {
                    let data = await this.fetchAccessToken()
                    let url = `${api.menu.delete}access_token=${data.access_token}`
                    let res = await rp({
                        method:"GET",
                        url,
                        json:true
                    })
                    resolve(res)
                }catch (e) {
                    reject("deletMenu方法出了问题:" + e);
                }
            })
        }
        //请求ticket的方法
        getTicket(){
            return new Promise(async(resolve,reject) =>{
                let data = await this.fetchAccessToken()
                const url = `${api.ticket}&access_token=${data.access_token}`
                rp({
                    method:"GET",
                    url,
                    json:true
                })
                    .then(res =>{
                        let ticket_expires_in = Date.now() + (res.expires_in - 300)*1000
                        resolve({
                            ticket:res.ticket,
                            ticket_expires_in
                        })
                    })
                    .catch(err =>{
                        reject(`请求ticket的方法${err}`)
                    })
            })
        }
        //保存ticket的方法
        saveTicket(ticket){
            //判断数据有效性
            return writeFileAsync('ticket.txt',ticket)
        }
        //读取ticket的方法
        readTicket(){
            return readFileAsync('ticket.txt')
        }
        //检测ticket是否过期的方法
        isValidTicket(data){
            if (!data && !data.ticket && !data.ticket_expires_in) {
                //代表access_token无效的
                return false;
            }
            return data.ticket_expires_in > Date.now();
        }
        //获取ticket的方法
        fetchTicket(){
            if(this.ticket && this.ticket_expires_in && this.isValidTicket(this)){
                return Promise.resolve({
                    ticket:this.ticket,
                    ticket_expires_in:this.ticket_expires_in
                })
            }else {
                return this.readTicket()
                    .then(async res=>{
                        if(this.isValidTicket(res)){
                            return res
                        }else {
                            const res = await this.getTicket()
                            this.saveTicket(res)
                            return res
                        }
                    })
                    .catch(async err=>{
                        const res = await this.getTicket()
                        this.saveTicket(res)
                        return res
                    })
                    .then((res)=>{
                        this.ticket = res.ticket
                        this.ticket_expires_in = res.expires_in
                        return Promise.resolve(res)
                    })
            }
        }
        //上传临时素材的方法
        uploadTemporaryFile({type,fileName,filePath}){
            //获取文件路径
            const newFilePath = resolve(__dirname, filePath, fileName);
            return new Promise(async(resolve, reject) => {
                try {
                    const data = await this.fetchAccessToken()
                    const url = `${api.temporary.upload}access_token=${data.access_token}&type=${type}`
                    let formData = {
                        media:createReadStream(newFilePath)
                    }
                    let res = await rp({
                        method:"POST",
                        json:true,
                        url,
                        formData
                    })
                    resolve(res)
                }catch (e) {
                    reject(`uploadTemporaryFile方法出了问题${e}`)
                }
            })
        }
        //获取临时素材的方法
        getTemporaryFile({type,mediaId,fileName,filePath}){
            const newFilePath = resolve(__dirname,filePath, fileName);
            return new Promise(async(resolve1, reject) => {
                try {
                    const accessToken = await this.fetchAccessToken()
                    let url = `${api.temporary.get}access_token=${accessToken}&media_id=${mediaId}`
                    if(type === 'video'){
                        url = url.replace('https://','http://')
                        let data = await rp({method: 'GET', url, json: true})
                        resolve1(data)
                    }else {
                        request(url)
                            .pipe(createWriteStream(newFilePath))
                            .once('close',resolve1)
                    }
                }catch (e) {
                    reject(`getTemporaryFile方法出了问题:${e}`);
                }
            })

        }
        //上传永久素材的方法
        uploadPermanentFile({type,material,videoBody,filePath}){
            //获取文件路径
            return new Promise(async(resolve, reject) => {
                try {
                    const data = await this.fetchAccessToken()
                    const option = {
                        method:"POST",
                        json:true,
                    }
                    let url;
                    if(type === 'news'){
                        url = `${api.permanent.uploadNews}access_token=${data.access_token}&type=${type}`
                        option.body = material
                    }else if(type === 'pic'){
                        url = `${api.permanent.uploadImg}access_token=${data.access_token}&type=${type}`
                        const filePath = resolve(__dirname, filePath, material);
                        option.formData = {
                            media:createReadStream(filePath)
                        }
                    }else {
                        const filePath = resolve(__dirname, filePath, material);
                        option.formData = {
                            media:createReadStream(filePath)
                        }
                        url = `${api.permanent.uploadOthers}access_token=${data.access_token}&type=${type}`
                        option.body = videoBody
                    }
                    option.url = url
                    let res = await rp(option)
                    resolve(res)
                }catch (e) {
                    reject(`uploadTemporaryFile方法出了问题${e}`)
                }

            })
        }
        //获取永久素材的方法
        getPermanentFile({type,mediaId,fileName,filePath}){
            return new Promise(async(resolve1, reject) => {
                try {
                    const accessToken = await this.fetchAccessToken()
                    let url = `${api.permanent.get}access_token=${accessToken}`
                    let option = {
                        method: 'POST',
                        url,
                        json: true,
                        body:{
                            media_id:mediaId
                        }
                    }
                    if(type === 'video'|| type === 'news'){
                        let data = await rp(option)
                        resolve1(data)
                    }else {
                        const filePath = resolve(__dirname, filePath, fileName);
                        request(url)
                            .pipe(createWriteStream(filePath))
                            .once('close',resolve1)
                    }
                }catch (e) {
                    reject(`getTemporaryFile方法出了问题:${e}`);
                }
            })
        }
        //上传素材的方法(临时素材和永久素材)
        uploadFile(type,material,videoBody,isPermanent=true){
            return new Promise(async(resolve, reject) => {
                try {
                    const data = await this.fetchAccessToken()
                    const option = {
                        method:"POST",
                        json:true,
                        formData:{
                            media:createReadStream(resolve(__dirname, '../media', material))
                        }
                    }
                    let url;
                    if(isPermanent){
                        if(type === 'news'){
                            url = `${api.permanent.uploadNews}access_token=${data.access_token}&type=${type}`
                            option.body = material
                            option.formData = null
                        }else if(type === 'pic'){
                            url = `${api.permanent.uploadImg}access_token=${data.access_token}&type=${type}`
                        }else {
                            url = `${api.permanent.uploadOthers}access_token=${data.access_token}&type=${type}`
                            option.body = videoBody
                        }
                        option.url = url
                        let res = await rp(option)
                        resolve(res)
                    }else {
                        url = `${api.temporary.upload}access_token=${data.access_token}&type=${type}`
                        option.url = url
                        let res = await rp(option)
                        resolve(res)
                    }
                }catch (e) {
                    reject(`uploadFile方法出了问题:${e}`)
                }

            })
        }
        //返回微信网页开发的JSSDK对象的方法
        jssdkObject(url){
            let jsapi_ticket = this.fetchTicket()
            let noncestr = Math.random().toString().split('.')
            let timestamp = Date.now()
            let arr = [
                `jsapi_ticket=${jsapi_ticket}`,
                `noncestr=${noncestr}`,
                `timestamp=${timestamp}`,
                `url=${url}`
            ]
            let signature = sha1(arr.join('&'))
            return{
                noncestr,
                timestamp,
                signature,
                appID
            }
        }
    }
    return Wechat
}

