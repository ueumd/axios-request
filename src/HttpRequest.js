/*
 * axios 请求封装
 * https://github.com/ueumd/axios-request
 */

const CancelToken = axios.CancelToken

const HttpRequestAbortMap = {}

const codeMap = {
  400: '错误请求',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求错误,未找到该资源',
  405: '请求方法未允许',
  408: '请求超时',
  500: '服务器端出错',
  501: '网络未实现',
  502: '网络错误',
  503: '服务不可用',
  504: '网络超时',
  505: 'http版本不支持该请求'
}

/**
 * 请求拦截器
 * config 发起请求的参数实体
 */
axios.interceptors.request.use(
    (request) => {

      // 添加需要取消请求时的key
      if (http.abortFlag || request.abort) {
        request.cancelToken = new CancelToken((cancel) => {
          HttpRequestAbortMap[request.url] = {}
          HttpRequestAbortMap[request.url] = {
            cancel: cancel
          }
        })
      }

      // 自定义header
      if (request.header && Object.keys(request.headers).length) {
        for (let key in request.header) {
          request.headers[key] = request.header[key]
        }
      }

      return request
    },
    (error) => {
      return Promise.reject(error)
    }
)

/**
 * 响应拦截
 * data: {
 *   code: 200,
 *   data: '',
 *   msg: 'ok'
 * }
 */
axios.interceptors.response.use(
    (response) => {
      if (response.status === 200 && response.statusText === 'OK') {
        try {
          // 没有code正常正确请求
          if (response.data && typeof response.data.code === 'undefined') {
            return Promise.resolve(response.data)
          }
          // 后端code为200 data = {code: 200, data: {}, msg: ''}
          if (response.data && response.data.code === 200) {
            // 返回带有msg信息 {data: 'xxx', msg: 'ok'}
            if (response.config.msg) {
              return Promise.resolve(response.data)
            }
            // 只返回data {data: 'xxx'}
            return Promise.resolve(response.data.data)
          } else {
            // 监听后端异常code，方便业务层处理
            if (http.exceptionCode) {
              http.emit('exceptionCode', response.data)
              return Promise.reject(response.data)
            }
            return Promise.reject(response.data)
          }
        } catch (err) {
          console.error('[http 请求错误： ]', err)
          return Promise.reject(err)
        }
      }
    },
    (error) => {
      if (error && error.response) {
        if (codeMap[error.response.status]) {
          error.message = codeMap[error.response.status]
        } else {
          error.message = `连接错误${error.response.status}`
        }
      } else {
        // 断网情况 || 中断请求
        error.message = '连接到服务器失败'
      }
      return Promise.reject(error.message)
    }
)

/**
 * 请求封装
 */
class HttpRequest {
  constructor() {
    this.events = {}
    this.baseURL = ''
    this.timeout = ''
    this.exceptionCode = false
    this.abortFlag = false
    this.abortMap = HttpRequestAbortMap
  }

  static getInstance() {
    if (!this.http) {
      this.http = new HttpRequest()
    }
    return this.http
  }

  config(options) {
    const {baseURL, timeout, exceptionCode, abortFlag} = options
    this.exceptionCode = exceptionCode || false
    this.abortFlag = abortFlag || false
    axios.defaults.baseURL = this.baseURL = baseURL
    axios.defaults.timeout = this.timeout = timeout || 100000
  }

  setCommonHeader(key, value) {
    axios.defaults.headers.common[key] = value
  }

  setDefaultValue(key, value) {
    axios.defaults[key] = value
  }

  setDefaultValues(defaultValues) {
    for (let key in defaultValues) {
      axios.defaults[key] = defaultValues[key]
    }
  }
  on (event, fn) {
    (this.events[event] || (this.events[event] = [])).push(fn)
  }
  off (event, fn) {
    let events = this.events
    if (events[event]) {
      let list = events[event]
      if (fn) {
        let pos = list.indexOf(fn)
        if (pos !== -1) {
          list.splice(pos, 1)
        }
      } else {
        delete events[event]
      }
    }
  }
  emit (event, ...args) {
    let events = this.events
    if (events[event]) {
      let list = events[event].slice()
      let fn
      while ((fn = list.shift())) {
        fn(...args)
      }
    }
  }

  /**
   * 取消特定的请求
   * @param abortName  请求时传入的aobrt参数
   */
  abort(api) {
    if (this.abortMap[api] && typeof this.abortMap[api].cancel === 'function') {
      this.abortMap[api].cancel()
    }
  }

  /**
   * 取消所有请求
   */
  abortAll() {
    if (Object.keys(this.abortMap).length) {
      for(let key of this.abortMap) {
        if (typeof this.abortMap[key].cancel === 'function') {
          this.abortMap[key].cancel()
        }
      }
    }
  }

  /**
   * @param url
   * @param data         参数 {id:1, type:'xxx'}
   * @param header       自定义 header
   * @param timeout      自定义 超时
   * @param abort        是否需要取消息
   * @param opts         其他axios配置
   * @param msg          是需要返回带msg信息 {data: [], msg: 'ok'}
   * @returns {Promise<R>}
   */
  post({url, data = {}, header = {}, timeout = null, abort = false, msg = false, opts = {}}) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url,
        data,
        header,
        timeout,
        abort,
        msg,
        ...opts
      })
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
    })
  }

  get({url, data = {}, header = {}, timeout = null, abort = false, msg = false, opts = {}}) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
        params: data,
        header,
        timeout,
        abort,
        msg,
        ...opts
      })
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
    })
  }

  all(promiseArray) {
    return new Promise((resolve, reject) => {
      Promise.all(promiseArray)
          .then(allResponse => {
            resolve(allResponse)
          })
          .catch((error) => {
            reject(error)
          })
    })
  }
}

export const http = HttpRequest.getInstance()
