import store from './../store'
import { baseUrl } from './env'
// 参数： url:请求地址  param：请求参数  method：请求方式 callBack：回调函数
export function request({url='', params={}, method='GET'}) {
	const storeInfo = store.state
	let header = {
			'Accept': 'application/json',
			'Access-Control-Allow-Origin':'*',
			'Content-Type': 'application/json',
			Cookie: 'JSESSIONID=' + storeInfo.sessionId
		}

	const requestRes = new Promise((resolve, reject) => {
		store.commit('setLodding', false)
		 uni.request({
			url: baseUrl+url,
			data: params,
			header: header,
			method: method,
			success: (res) => {
				const { data, statusCode } = res
				// 登录态失效：清空 sessionId，跳回首页重新授权登录
				if (statusCode === 401) {
					store.commit('setSessionId', '')
					uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
					reject({ code: 401, msg: '登录已失效' })
					return
				}
				if (data && (data.code == 200 || data.code === 1)) {
					resolve(res.data)
				}else{
					reject(res.data)
				}
			},
			fail: (err) => {
				const error = {data:{msg:err.data}}
				reject(error)
			}
		});
	})
	return requestRes
}

