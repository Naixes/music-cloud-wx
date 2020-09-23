const rp = require('request-promise')
const fs = require('fs')
const path = require('path')

const APPID = 'wxa04740d6201a7919'
const APPSECRET = 'b98b0c194cc9e9aca9f59bb11c369de0'
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
const fileName = path.resolve(__dirname, './access_token.json')

const updateAccessToken = async() => {
    const resultStr = await rp(URL)
    const res = JSON.parse(resultStr)
    if(res.access_token) {
        fs.writeFileSync(fileName, JSON.stringify({
            access_token: res.access_token,
            createTime: new Date()
        }))
    }else {
        await updateAccessToken()
    }
}

const getAccessToken = async () => {
    try {
        const readStr = fs.readFileSync(fileName, 'utf-8')
        const readObj = JSON.parse(readStr)
        // 判断是否过期
        const now = new Date().getTime()
        const createTime = new Date(readObj.createTime).getTime()
        if(now - createTime >= 7200000) {
            await updateAccessToken()
            await getAccessToken()
        }
        return readObj.access_token
    } catch (error) {
        await updateAccessToken()
        await getAccessToken()
    }
}

// 自动更新access_token，，更新时可以提前5分钟获取
setInterval(async () => {
    await updateAccessToken()
}, (7200 - 300) * 1000)

module.exports = getAccessToken
