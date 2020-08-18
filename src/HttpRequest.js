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
    (config) => {

      // 添加需要取消请求时的key
      if (config.abort) {
        config.cancelToken = new CancelToken((c) => {
          HttpRequestAbortMap[config.abort] = {}
          HttpRequestAbortMap[config.abort] = {
            cancel: c,
            url: config.url
          }
        })
      }

      // 自定义header
      if (config.header && Object.keys(config.headers).length) {
        for (let key in config.header) {
          config.headers[key] = config.header[key]
        }
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
)

/**
 * 响应拦截
 */
axios.interceptors.response.use(
    (config) => {
      if (config.status === 200) {
        try {
          if (config.data && config.data.code === 200) {
            return Promise.resolve(config.data.data)
          } else {
            if (config.data && config.data.msg) {
              http.emit('errorCode', config.data)
              return Promise.reject(config.data.msg)
            }
            return Promise.reject(config);
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
    this.abortMap = HttpRequestAbortMap
  }

  static getInstance() {
    if (!this.http) {
      this.http = new HttpRequest()
    }
    return this.http
  }

  config(options) {
    const {baseURL, timeout} = options
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
  abort(abortName) {
    if (this.abortMap[abortName] && typeof this.abortMap[abortName].cancel === 'function') {
      this.abortMap[abortName].cancel()
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
   * @param abort        取消请请时所用的名称
   * @param opts         其他axios配置
   * @returns {Promise<R>}
   */
  post({url, data = {}, header = {}, timeout = null, abort = null, opts = {}}) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url,
        data,
        header,
        timeout,
        abort,
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

  get({url, data = {}, header = {}, timeout = null, abort = null, opts = {}}) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
        params: data,
        header,
        timeout,
        abort,
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
