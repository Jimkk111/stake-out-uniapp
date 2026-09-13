import { defineStore } from 'pinia'
import {
	getShoppingCartList,
	newAddShoppingCartAdd,
	newShoppingCartSub,
	delShoppingCart
} from '@/pages/api/api.js'

export const useCartStore = defineStore('cart', {
	state: () => ({
		// 购物车列表（后端为唯一数据源，操作后统一 refresh）
		list: [],
	}),
	getters: {
		totalCount: (s) => s.list.reduce((n, i) => n + (Number(i.number) || 0), 0),
		totalPrice: (s) => s.list.reduce((n, i) => n + (Number(i.number) || 0) * (Number(i.amount) || 0), 0),
		// 菜品id -> 已点数量，首页右侧列表回显用
		countMap() {
			const map = {}
			this.list.forEach((i) => {
				if (i.dishId !== null && i.dishId !== undefined) map[i.dishId] = i.number
			})
			return map
		},
	},
	actions: {
		async refresh() {
			const res = await getShoppingCartList({})
			if (res.code === 1) {
				this.list = res.data || []
			}
			return res
		},
		async add(params) {
			const res = await newAddShoppingCartAdd(params)
			if (res.code === 1) await this.refresh()
			return res
		},
		async sub(params) {
			const res = await newShoppingCartSub(params)
			if (res.code === 1) await this.refresh()
			return res
		},
		async clear() {
			const res = await delShoppingCart()
			if (res.code === 1) await this.refresh()
			return res
		},
	},
})
