const rp = require('request-promise')
const getAccessToken = require('../utils/getAccessToken')

const callCloudFn = async (ctx, fnName, params) => {
    const ACCESS_TOKEN = await getAccessToken()
    const URL = `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${ACCESS_TOKEN}&env=${ctx.state.ENV}&name=${fnName}`
    const options = {
        method: 'POST',
        uri: URL,
        body: {
            ...params
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

module.exports = callCloudFn