const Koa = require('koa')
const app = new Koa()

app.use(async ctx => {
    ctx.body = 'hi'
})
app.listen(3000, () => {
    console.log('port 3000')
})