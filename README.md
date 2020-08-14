# axios-request
> 可引入 vue react项目中
## 用法

克隆仓库到本地

```
git clone https://github.com/ueumd/axios-request.git
```

进入仓库根目录,安装依赖
```
npm install
```

启动node 接口服务
```
npm run serve
```

启动前端运行 serve.html

## 前端配置

```$xslt
import {http} from "./HttpRequest.js"

  http.config({
    baseURL: 'http://localhost:3000/api/v1',
    timeout: 100000,
  })

  http.setCommonHeader('TOKEN', res.token)
  http.setCommonHeader('UUID', Date.now())
```

## 前端请求

- get请求
  ```
   /**
    * @param url          接口地址
    * @param data         参数 {id:1, type:'xxx'}
    * @param header       自定义 header
    * @param timeout      自定义 超时
    * @param abort        是否需要取消请求
  */
  
  http.get({url, data, header, timeout})
  
  ```
- post请求  
```$xslt
   /**
    * @param url          接口地址
    * @param data         参数 {id:1, type:'xxx'}
    * @param header       自定义 header
    * @param timeout      自定义 超时
    * @param abort        是否需要取消请求
  */
  http.post({url, data, header, timeout})
```

- 并发请求 
```$xslt
http.all({url, data, header, timeout})
```

## 项目结构

```
src
├── serve.js       ## API接口
├── serve.html     ## 请求demo示例
├── HttpRequest.js ## 封装axios请求
```
