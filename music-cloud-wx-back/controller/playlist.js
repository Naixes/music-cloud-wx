const Router = require('koa-router')
const callCloudFn = require('../utils/callCloudFn')
const callCloudDB = require('../utils/callCloudDB')

const router = new Router()

router.get('/delete', async (ctx, next) => {
    const query = `db.collection('playlist').doc('${ctx.request.query.id}').remove()`;
    const res = await callCloudDB(ctx, 'databasedelete', query)
    ctx.body = {
        data: res,
        code: 20000
    }
})

router.post('/edit', async (ctx, next) => {
    const params = ctx.request.body
    const query = `db.collection('playlist').doc('${params.id}').update({
        data: {
            name: '${params.name}',
            copywriter: '${params.copywriter}'
        }
    })`;
    const res = await callCloudDB(ctx, 'databaseupdate', query)
    ctx.body = {
        data: res,
        code: 20000
    }
})

router.get('/detail', async (ctx, next) => {
    // 获取一个doc(id)，获取多个where()
    const query = `db.collection('playlist').doc('${ctx.request.query.id}').get()`;
    // 查询歌单详情
    const res = await callCloudDB(ctx, 'databasequery', query)
    ctx.body = {
        data: JSON.parse(res.data),
        code: 20000
    }
})

router.get('/list', async (ctx, next) => {
    const {start, limit} = ctx.request.query
    const params = {
        $url: 'playlist',
        start: parseInt(start),
        limit: parseInt(limit)
    };
    // 查询歌单列表
    const res = await callCloudFn(ctx, 'music', params)
    let data = []
    if(res) {
        data = JSON.parse(res.resp_data).data
    }
    ctx.body = {
        data,
        code: 20000
    }
})

module.exports = router