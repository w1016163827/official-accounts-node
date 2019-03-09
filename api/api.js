//所有请求接口的地址前缀
const prefix = 'https://api.weixin.qq.com/cgi-bin/';

module.exports = {
    accessToken:`${prefix}token?grant_type=client_credential`,
    ticket:`${prefix}ticket/getticket?type=jsapi`,
    menu:{
        //https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN
        create:`${prefix}menu/create?`,
        delete:`${prefix}menu/delete?`
    },
    temporary:{
        upload: `${prefix}media/upload?`,
        get: `${prefix}media/get?`
    },
    permanent:{
        uploadNews:`${prefix}material/add_news?`,
        uploadImg:`${prefix}media/uploadimg?`,
        uploadOthers:`${prefix}material/add_material?`,
        get:`${prefix}material/get_material?`
    }
}