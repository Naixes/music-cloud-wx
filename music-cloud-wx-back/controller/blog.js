const Router = require('koa-router')
const callCloudStorage = require('../utils/callCloudStorage')
const callCloudDB = require('../utils/callCloudDB')

const router = new Router()

// 删除博客
router.post('/delete', async (ctx, next) => {
    const params = ctx.request.body
    // console.log('params', params)
    // 删除博客
    const delBlogResQuery = `db.collection('blog').doc('${params._id}').remove()`;
    const delBlogRes = await callCloudDB(ctx, 'databasedelete', delBlogResQuery)
    // 删除评论
    const delCommentQuery = `db.collection('blog-comment').where({
        blogId: '${params._id}'
    }).remove()`;
    const delCommentRes = await callCloudDB(ctx, 'databasedelete', delCommentQuery)
    // 删除图片
    const delStorageRes = await callCloudStorage.delete(ctx, params.img)
    ctx.body = {
        data: {
            delBlogRes,
            delCommentRes,
            delStorageRes
        },
        code: 20000
    }
})

// 博客列表
router.get('/list', async (ctx, next) => {
    const params = ctx.request.query
    const query = `db.collection('blog').skip(${params.start}).limit(${params.limit}).orderBy('createTime', 'desc').get()`;
    const res = await callCloudDB(ctx, 'databasequery', query)
    ctx.body = {
        data: res.data,
        code: 20000
    }
})

module.exports = router