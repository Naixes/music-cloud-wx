const Koa = require('koa')
const Router = require('koa-router')
const cors = require('koa2-cors')
const koaBody = require('koa-body')

const playlist = require('./controller/playlist.js')
const swiper = require('./controller/swiper.js')
const blog = require('./controller/blog.js')

const app = new Koa()
const router = new Router()

const ENV = 'music-80lxv'

// 跨域
app.use(cors({
    origin: ['http://localhost:9528'],
    // Access-Control-Allow-Credentials：意义是允许客户端携带验证信息，例如 cookie 之类的
    credentials: true
}))

// 接收post参数解析
app.use(koaBody({
    multipart: true,
}))

// 全局变量
app.use(async (ctx, next) => {
    ctx.state.ENV = ENV
    await next()
})

router.use('/playlist', playlist.routes())
router.use('/swiper', swiper.routes())
router.use('/blog', blog.routes())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, () => {
    console.log('port 3000')
})