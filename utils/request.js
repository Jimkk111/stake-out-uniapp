import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { baseUrl } from './env'
// 参数： url:请求地址  params：请求参数  method：请求方式
export function request({url='', params={}, method='GET'}) {
	const userStore = useUserStore()
	const appStore = useAppStore()
	const header = {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		Cookie: 'JSESSIONID=' + userStore.sessionId
	}

	const requestRes = new Promise((resolve, reject) => {
		// 未登录直接拒绝，由页面侧引导授权登录
		if (!userStore.sessionId) {
			reject({ code: 401, msg: '未登录' })
			return
		}
		appStore.setLodding(true)
		uni.request({
			url: baseUrl+url,
			data: params,
			header: header,
			method: method,
			success: (res) => {
				const { data, statusCode } = res
				// 登录态失效：清空登录态，由页面侧引导重新授权登录
				if (statusCode === 401) {
					userStore.logout()
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
			},
			complete: () => {
				appStore.setLodding(false)
			}
		});
	})
	return requestRes
}
