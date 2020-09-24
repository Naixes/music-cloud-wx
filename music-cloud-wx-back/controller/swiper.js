const Router = require('koa-router')
const callCloudStorage = require('../utils/callCloudStorage')
const callCloudDB = require('../utils/callCloudDB')

const router = new Router()

// 轮播图列表
router.get('/list', async (ctx, next) => {
    const query = `db.collection('swiper').get()`;
    const res = await callCloudDB(ctx, 'databasequery', query)
    // console.log(res)
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
            fileid: ele.fileid,
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