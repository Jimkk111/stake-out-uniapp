import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
	state: () => ({
		// 全局 loading
		lodding: false,
		// 地址页返回的目标页面（如 /pages/order/index）
		addressBackUrl: '',
	}),
	actions: {
		setLodding(v) {
			this.lodding = v
		},
		setAddressBackUrl(url) {
			this.addressBackUrl = url
		},
	},
})
