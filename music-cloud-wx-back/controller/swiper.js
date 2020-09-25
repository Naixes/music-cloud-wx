const Router = require('koa-router')
const callCloudStorage = require('../utils/callCloudStorage')
const callCloudDB = require('../utils/callCloudDB')

const router = new Router()

// 删除轮播图
router.get('/delete', async (ctx, next) => {
    const params = ctx.request.query
    // console.log(params)
    // 删除数据库
    const query = `db.collection('swiper').doc('${params._id}').remove()`;
    const delDBRes = await callCloudDB(ctx, 'databasedelete', query)
    // 删除云存储
    const delStorageRes = await callCloudStorage.delete(ctx, [params.fileId])
    ctx.body = {
        data: {
            delDBRes,
            delStorageRes
        },
        code: 20000
    }
})

// 上传图片
router.post('/upload', async (ctx, next) => {
    const fileId = await callCloudStorage.upload(ctx)
    // 存入数据库
    const query = `db.collection('swiper').add({
        data: {
            fileId: '${fileId}'
        }
    })`
    const res = await callCloudDB(ctx, 'databaseadd', query)
    ctx.body = {
        id_list: res.id_list,
        code: 20000
    }
})

// 轮播图列表
router.get('/list', async (ctx, next) => {
    const query = `db.collection('swiper').get()`;
    const res = await callCloudDB(ctx, 'databasequery', query)
    const data = res.data
    let fileList = []
    data.forEach(ele => {
        fileList.push({
            fileid: JSON.parse(ele).fileId,
            max_age: 7200
        })
    });
    const dlRes = await callCloudStorage.download(ctx, fileList)
    const resList = dlRes.file_list
    let returnData = []
    resList.forEach((ele, index) => {
        returnData.push({
            download_url:  ele.download_url,
            fileId: ele.fileid,
            _id: JSON.parse(data[index])._id
        })
    });
    // console.log(returnData);
    ctx.body = {
        data: returnData,
        code: 20000
    }
})

module.exports = router