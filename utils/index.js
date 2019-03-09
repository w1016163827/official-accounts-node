const {parseString}  = require('xml2js')
const {writeFile,readFile} = require('fs')
const {resolve} = require('path')

module.exports = {
    getUserDataAsync(req) {
        return new Promise((resolve, reject) => {
            let str = ''
            req.on('data', data => {
                str += data.toString()
            })
                .on('end', err => {
                    if (!err) {
                        resolve(str)
                    } else {
                        reject('getUserDataAsync方法出了问题', err)
                    }
                })
        })
    },
    parseXMLAsync(str) {
        return new Promise(((resolve, reject) => {
            parseString(str, {trim: true}, (err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    reject('parseXMLAsync方法出了问题', err)
                }
            })
        }))
    },
    formatMessage(data) {
        let resData = {}
        data = data.xml
        if (typeof data === 'object') {
            Object.keys(data).forEach((key, index) => {
                //过滤没用的数据
                const value = data[key]
                if (Array.isArray(value) && value.length > 0) {
                    resData[key] = value[0]
                }
            })
        }
        return resData
    },
    writeFileAsync(fileName, data) {
        //将所有数据转换成JSON字符串
        data = JSON.stringify(data)
        let filePath = resolve(__dirname,fileName)
        return new Promise((resolve, reject) => {
            writeFile(filePath, data, (err) => {
                if (!err) {
                    resolve('保存文件成功');
                } else {
                    reject('保存文件失败');
                }
            })
        })
    },
    readFileAsync(fileName) {
        let filePath = resolve(__dirname,fileName)
        return new Promise((resolve, reject) => {
            readFile(filePath, (err, data) => {
                if (!err) {
                    data = JSON.parse(data)
                    resolve(data)
                } else {
                    reject('获取文件失败' + err)
                }
            })
        })
    }
}