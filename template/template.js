module.exports = options =>{
    //用户加工处理最终恢复用户消息的模板（XML数据）
    let {MsgType} = options
    let str = `<xml>
    <ToUserName><![CDATA[${options.ToUserName}]]></ToUserName>
    <FromUserName><![CDATA[${options.FromUserName}]]></FromUserName>
    <CreateTime>${options.CreateTime}</CreateTime>
    <MsgType><![CDATA[${options.MsgType}]]></MsgType>`

    if(MsgType === 'text'){
        str += `<Content><![CDATA[${options.Content}]]></Content>`
    }else if(MsgType === 'image'){
        str += `<Image>
    <MediaId><![CDATA[${options.MediaId}]]></MediaId>
  </Image>`
    }else if(MsgType === 'voice'){
        str += `<Voice>
    <MediaId><![CDATA[${options.MediaId}]]></MediaId>
  </Voice>`
    }else if(MsgType === 'video'){
        str += `<Video>
    <MediaId><![CDATA[${options.MediaId}]]></MediaId>
    <Title><![CDATA[${options.Title}]]></Title>
    <Description><![CDATA[${options.Description}]]></Description>
  </Video>`
    }else if(MsgType === 'music'){
        str += `<Music>
    <Title><![options.Title]]></Title>
    <Description><![${options.Description}]]></Description>
    <MusicUrl><![CDATA[${options.MusicURL}]]></MusicUrl>
    <HQMusicUrl><![CDATA[${options.HQMusicUrl}]]></HQMusicUrl>
    <ThumbMediaId><![CDATA[${options.ThumbMediaId}]]></ThumbMediaId>
  </Music>`
    }else if(MsgType === 'news'){
        str += `<ArticleCount>${options.Articles}</ArticleCount>
  <Articles>`
        options.Articles.forEach((value)=>{
            str += `<item>
      <Title><![CDATA[${value.Title}]]></Title>
      <Description><![CDATA[${value.Description}]]></Description>
      <PicUrl><![CDATA[${value.PicUrl}]]></PicUrl>
      <Url><![CDATA[${value.Url}]]></Url>
    </item>`
        })

        str += `</Articles>`
    }

    str += `</xml>`
    return str
}