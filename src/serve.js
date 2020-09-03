/**
 * https://github.com/ueumd/axios-request
 */

const Koa = require('koa')
const Router = require('koa-router')
const cors = require('koa2-cors')
const multer = require('koa-multer')
const bodyParser = require('koa-bodyparser')

const app = new Koa()

app.use(bodyParser())
app.use(cors({
  origin: function (ctx) {
    return '*'
  }
}))

// 文件上传
// 配置
var storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  //修改文件名称
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".")  //以点分割成数组，数组的最后一项就是后缀名
    cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1])
  }
})
//加载配置
var upload = multer({storage: storage})

const router = new Router({
  prefix: '/api/v1' //全局路由前缀
})

router.get('/', (ctx, next) => {
  ctx.body = 'axios demo'
})

/**
 * 获取热门城市
 * @param adcode 城市 adcode
 */
router.get('/getHotCityList', (ctx, next) => {
  const hotCityList = [
    {
      name: "北京",
      id: "110100",
      levelType: "2",
      children: null
    },
    {
      name: "上海",
      id: "430100",
      levelType: "2",
      children: null
    },
    {
      name: "杭州",
      id: "330100",
      levelType: "2",
      children: null
    },
    {
      name: "长沙",
      id: "430100",
      levelType: "2",
      children: null
    },
    {
      name: "苏州",
      id: "320500",
      levelType: "2",
      children: null
    },
    {
      name: "广州",
      id: "440100",
      levelType: "2",
      children: null
    },
    {
      name: "深圳",
      id: "440300",
      levelType: "2",
      children: null
    },
    {
      name: "南京",
      id: "320100",
      levelType: "2",
      children: null
    },
    {
      name: "天津",
      id: "120100",
      levelType: "2",
      children: null
    }
  ]
  const query = ctx.request.query
  if (Object.keys(query).length && query.adcode) {
    let city = hotCityList.filter(it => it.id === query.adcode)
    ctx.body = {
      code: 200,
      data: city,
      msg: 'success'
    }
  } else {
    ctx.body = {
      code: 200,
      data: hotCityList,
      msg: 'success'
    }
  }
})

/**
 * login
 */
router.post('/login', (ctx, next) => {
  const query = ctx.request.body
  if (Object.keys(query).length) {
    if (query.username === 'admin') {
      ctx.body = {
        code: 200,
        data: {
          username: 'admin',
          pwd: 12345,
          token: 'xxxxx-xxxx-' + Date.now()
        },
        msg: 'ok'
      }
    } else {
      ctx.body = {
        code: '0004',
        data: null,
        msg: '用户名密码错误'
      }
    }
  } else {
    ctx.body = {
      code: '0004',
      data: null,
      msg: '用户名密码错误'
    }
  }
})

/**
 * token
 */
router.post('/token', (ctx, next) => {
  ctx.body = {
    token: 'xxxxx-xxxx-' + Date.now()
  }
})

/**
 * otherCode
 */
router.post('/otherCode', (ctx, next) => {
  ctx.body = {
    code: '0004',
    data: null,
    msg: '用户名密码错误'
  }
})



/**
 * 上传文件
 */
router.post('/upload', upload.single('file'), async (ctx, next) => {
  console.log('filename: ' + ctx.req.file.filename)
  ctx.body = {
    code: 200,
    data: {
      filename: ctx.req.file.filename,
    },
    msg: 'ok'
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, () => {
  console.log(`Server is starting at port 3000`)
})
