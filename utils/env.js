// 本地开发环境（本地后端服务，端口 8081，接口文档 http://localhost:8081/doc.html）
export const devBaseUrl = 'http://localhost:8081'
// 线上环境
export const prodBaseUrl = 'https://registakeaway.itheima.net'

// HBuilderX：运行=development，发行=production
export const baseUrl = process.env.NODE_ENV === 'development' ? devBaseUrl : prodBaseUrl
