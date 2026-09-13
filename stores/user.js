import { defineStore } from 'pinia'

const KEY_SESSION = 'session_id'
const KEY_USER = 'base_user_info'

export const useUserStore = defineStore('user', {
	state: () => ({
		// 启动时从本地存储恢复登录态，实现免重复授权
		sessionId: uni.getStorageSync(KEY_SESSION) || '',
		baseUserInfo: uni.getStorageSync(KEY_USER) || null,
	}),
	actions: {
		setSession(id) {
			this.sessionId = id
			id ? uni.setStorageSync(KEY_SESSION, id) : uni.removeStorageSync(KEY_SESSION)
		},
		setUser(info) {
			this.baseUserInfo = info
			info ? uni.setStorageSync(KEY_USER, info) : uni.removeStorageSync(KEY_USER)
		},
		logout() {
			this.setSession('')
			this.setUser(null)
		},
	},
})
