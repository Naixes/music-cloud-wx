const rp = require('request-promise')
const getAccessToken = require('./getAccessToken')
const fs = require('fs')

const cloudStorage = {
    delete: async (ctx, fileIdList) => {
        const ACCESS_TOKEN = await getAccessToken()
        const URL = `https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ACCESS_TOKEN}`
        const options = {
            method: 'POST',
            uri: URL,
            body: {
                fileid_list: fileIdList, 
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
    },
    upload: async (ctx, ) => {
        // 获取上传请求参数
        const ACCESS_TOKEN = await getAccessToken()
        const URL = `https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`
        const file = ctx.request.files.file
        const path = `swiper/${Date.now()}-${Math.random()*1000000}-${file.name}`
        // console.log(path)
        const options = {
            method: 'POST',
            uri: URL,
            body: {
                path, 
                env: ctx.state.ENV
            },
            json: true // Automatically stringifies the body to JSON
        }
        const info = await rp(options)
        .then(function (res) {
            // console.log(res)
            return res
        })
        .catch(function (err) {
            console.log(err)
        });
        // 上传图片
        const upOptions = {
            method: 'POST',
            uri: info.url,
            headers: {
                'content-type': 'multipart/form-data'
            },
            formData: {
                key: path,
                Signature: info.authorization,
                'x-cos-security-token': info.token,
                'x-cos-meta-fileid': info.cos_file_id,
                // 文件的二进制内容
                file: fs.createReadStream(file.path)
            },
            json: true // Automatically stringifies the body to JSON
        }
        await rp(upOptions)
        return info.file_id

    },
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