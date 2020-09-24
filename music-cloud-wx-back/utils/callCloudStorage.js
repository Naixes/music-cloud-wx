const rp = require('request-promise')
const getAccessToken = require('./getAccessToken')

const cloudStorage = {
    download: async (ctx, fileList) => {
        const ACCESS_TOKEN = await getAccessToken()
        const URL = `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`
        const options = {
            method: 'POST',
            uri: URL,
            body: {
                file_list: fileList, 
                env: ctx.state.ENV
            },
            json: true // Automatically stringifies the body to JSON
        };
        return await rp(options)
        .then(function (res) {
            // console.log(res)
            return res
        })
        .catch(function (err) {
            console.log(err)
        });
    }
}

module.exports = cloudStorage