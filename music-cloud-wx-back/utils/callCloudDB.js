const rp = require('request-promise')
const getAccessToken = require('../utils/getAccessToken')

const callCloudDB = async (ctx, fnName, query = {}) => {
    const ACCESS_TOKEN = await getAccessToken()
    const URL = `https://api.weixin.qq.com/tcb/${fnName}?access_token=${ACCESS_TOKEN}`
    const options = {
        method: 'POST',
        uri: URL,
        body: {
            query, 
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

module.exports = callCloudDB