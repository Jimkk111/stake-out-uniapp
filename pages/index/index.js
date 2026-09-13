import navBar from '../common/Navbar/navbar.vue'
import {
	userLogin,
	getCategoryList,
	dishListByCategoryId,
	querySetmeaList,
	querySetmealDishById
} from '../api/api.js'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useAppStore } from '@/stores/app'
import { baseUrl } from '../../utils/env'
export default {
	data () {
		return {
			// 去结算部分
			openOrderCartList: false,
			// 存放左侧滚动区域菜品分类数组
			typeListData: [],
			dishListData: [],
			// 存放右侧对应菜品每个菜名称的数组
			dishListItems: [],
			dishDetailes: {},
			openDetailPop: false,
			openMoreNormPop: false,
			moreNormDishdata:null,
			moreNormdata:null,
			// 套餐中查询到的菜品名称
			dishMealData:null,
			// 选中左侧菜品的索引
			typeIndex: 0,
			// 规格有关的数组
			flavorDataes: [],
			// 添加一个右侧number更新以后重新刷新接口的id --- 这个id来自左侧菜品分类的id
			rightIdAndType: {}
		}
	},
	computed: {
		userStore: () => useUserStore(),
		cartStore: () => useCartStore(),
		appStore: () => useAppStore(),
		// 购物车信息列表
		orderListDataes: function () {
			return this.cartStore.list
		},
		loaddingSt: function () {
			return this.appStore.lodding
		},
		// 加入购物车数量
		orderDishNumber: function () {
			return this.cartStore.totalCount
		},
		// 菜品金额
		orderDishPrice: function () {
			return this.cartStore.totalPrice
		},
		orderAndUserInfo: function () {
			let orderData = []
			Array.isArray(this.orderListDataes) && this.orderListDataes.forEach((n,i) => {
				let userData = {}
				userData.nickName = n.name ?? ''
				userData.avatarUrl = n.image ?? ''
				userData.dishList = [n]
				const num = orderData.findIndex(o => o.nickName == userData.nickName)
				if (num != -1) {
					orderData[num].dishList.push(n)
				} else {
					orderData.push(userData)
				}
			})
			return orderData
		},
		ht: function () {
			return uni.getMenuButtonBoundingClientRect().top + uni.getMenuButtonBoundingClientRect().height + 7
		}
	},
	components: { navBar },
	onLoad (options) {
		uni.onNetworkStatusChange(function(res) {
			if (res.isConnected == false) {
				uni.navigateTo({url: '/pages/nonet/index'})
			}
		})
		if (options) {
			if (!options.status && !options.formOrder) {
				this.getData()
			}
		}
	},
	onShow () {
		// 有sessionId免授权
		this.userStore.sessionId && this.init()
	},
	methods: {
		loginSync () {
			return new Promise((resolve, reject) => {
				uni.login({
					success: (loginRes) => {
						if (loginRes.errMsg === 'login:ok') {
							resolve(loginRes.code)
						}
					}
				})
			})
		},
		getData () {
			let res = uni.getMenuButtonBoundingClientRect()
			let _this = this
			this.selectHeight = res.height
			uni.showModal({
				title: '温馨提示',
				content: '亲，授权微信登录后才能正点餐！',
				showCancel: false,
				success(res) {
					if (res.confirm) {
						uni.getUserProfile({
							desc: '登录',
							success: async function (userInfo) {
								_this.userStore.setUser(JSON.parse(userInfo.rawData))
								// 先拿 code 再调登录，避免 uni.login 异步回调与请求的竞态
								const jsCode = await _this.loginSync()
								const params = {
									phone: jsCode,
									avatar: userInfo.userInfo.avatarUrl,
									name: userInfo.userInfo.nickName,
									sex: userInfo.userInfo.gender
								}
								userLogin(params).then(success => {
									if (success.code === 1) {
										success.data && _this.userStore.setSession(success.data.sessionId)
										_this.init()
									}
								}).catch(err => {
								})
							},
							fail: function (err) {

							}
						})
					}
				}
			})
		},

		async init () {
			// 获取菜品和套餐分类接口
			getCategoryList().then(res => {
				if (res && res.code === 1) {
					this.typeListData = [ ...res.data ]
					if (res.data.length > 0){
						this.getDishListDataes(res.data[this.typeIndex || 0])
					}
				}
			})
			// 调用一次购物车集合---初始化
			this.cartStore.refresh()
		},
		// 获取菜品列表
		async getDishListDataes (params, index) {
			this.rightIdAndType = {}
			this.rightIdAndType = {
				id: params.id,
				type: params.type
			}
			const param = {categoryId: params.id,type: params.type, page: 1, pageSize: 1000,status:1}
			if (params.type === 1) {
				await dishListByCategoryId(param).then(res => {
					if (res && res.code === 1) {
						this.dishListData = res.data && res.data.map((obj) => ({ ...obj, type: 1, newCardNumber: 0 }))
					}
				}).catch(err => {
				})
			} else {
				await querySetmeaList(param).then(success => {
					if (success && success.code === 1) {
						// dishListItems被转换数组---原始this.dishListData
						this.dishListData = success.data && success.data.map((obj) => ({ ...obj, type: 2, newCardNumber: 0 }))
					}
				}).catch(err => {
				})
			}
			this.typeIndex = index
			this.setOrderNum()
		},
		// 重新拼装image
		getNewImage (image) {
			if (!image) return ''
			// 后端返回的是 OSS 完整 URL 时直接使用，仅对纯文件名拼接下载地址
			return /^https?:\/\//.test(image) ? image : `${baseUrl}/common/download?name=${image}`
		},
		// 去订单页面
		goOrder () {
			uni.navigateTo({url: '/pages/order/index'})
		},
		// 加菜 - 添加菜品
		async addDishAction (item, form) {
			// 规格
			if(this.openMoreNormPop && (!this.flavorDataes || this.flavorDataes.length<=0) ){
				uni.showToast({
					title: '请选择规格',
					icon: 'none',
				})
				return false
			}
			if(this.orderListDataes && !this.orderListDataes.some(n => n.id == item.dishId) && this.flavorDataes.length > 0) {
				item.flavorRemark = JSON.stringify(this.flavorDataes)
			}
			let params = {
				amount: item.price,
				dishFlavor: this.flavorDataes.join(','),
				number: 1 || item.dishNumber,
				name: item.name,
				image: item.image
			}
			if (item.type === 1 || item.dishId !== null) {
				params = {
					...params,
					dishId: form === '购物车' ? item.dishId : item.id
				}
			} else {
				params = {
					...params,
					setmealId: form === '购物车' ? item.setmealId : item.id
				}
			}
			this.cartStore.add(params).then(res => {
				if (res.code === 1) {
					// 菜品详情弹框隐藏---暂时这么处理，去更新购物车状态
					this.openDetailPop = false
					this.openMoreNormPop = false
					// 重新调取刷新右侧具体菜品列表（内部会按购物车数量回显）
					this.getDishListDataes(this.rightIdAndType)
				}
			}).catch(err => {
			})
		},
		// 减菜 - 减少菜品
		async redDishAction (item, form) {
			let params = {}
			if (item.type === 1 || item.dishId !== null) {
				params = {
					...params,
					dishId: form === '购物车' ? item.dishId : item.id
				}
			} else {
				params = {
					...params,
					setmealId: form === '购物车' ? item.setmealId : item.id
				}
			}
			this.cartStore.sub(params).then(res => {
				if (res.code === 1) {
					// 重新调取刷新右侧具体菜品列表（内部会按购物车数量回显）
					this.getDishListDataes(this.rightIdAndType)
				}
			}).catch(err => {
			})
		},
		// 清空购物车
		clearCardOrder () {
			this.cartStore.clear().then(res => {
				this.openOrderCartList = false
				// 重新调取刷新右侧具体菜品列表（内部会按购物车数量回显）
				this.getDishListDataes(this.rightIdAndType)
			}).catch(err => {
			})
		},
		// 打开菜品详情
		openDetailHandle (item) {
			this.dishDetailes = item
			if (item.type === 2) {
				querySetmealDishById({ id: item.id }).then(res => {
					if (res.code === 1) {
						this.openDetailPop = true
						this.dishMealData = res.data
					}
				}).catch(err => {
				})
			} else {
				this.openDetailPop = true
			}
		},
		// 多规格数据处理
		moreNormDataesHandle (item) {
			this.flavorDataes.splice(0)
			this.moreNormDishdata = item
			this.openMoreNormPop = true
			this.moreNormdata = item.flavors.map(obj => ({ ...obj, value: JSON.parse(obj.value) }))
			this.moreNormdata.forEach((item)=>{
				if(item.value && item.value.length>0){
					this.flavorDataes.push(item.value[0])
				}
			})
		},
		// 选规格 处理一行只能选择一种
		checkMoreNormPop (obj, item) {
			let ind
			let findst = obj.some(n => {
				ind = this.flavorDataes.findIndex(o => o == n)
				return ind != -1
			})
			const num = this.flavorDataes.findIndex(it => it == item)
			if (num == -1 && !findst){
				this.flavorDataes.push(item)
			} else if(findst) {
				this.flavorDataes.splice(ind, 1)
				this.flavorDataes.push(item)
			} else {
				this.flavorDataes.splice(num, 1)
			}
		},
		// 关闭选规格弹窗
		closeMoreNorm (moreNormDishdata) {
			this.flavorDataes.splice(0, this.flavorDataes.length)
			this.openMoreNormPop = false
		},
		// 处理点餐数量 - 更新菜品已点餐数量
		setOrderNum () {
			let ODate = this.dishListData
			const countMap = this.cartStore.countMap
			ODate && ODate.map((obj, index) => {
				obj.dishNumber = countMap[obj.id] || 0
			})
			if (this.dishListItems.length == 0) {
				this.dishListItems = ODate
			} else {
				this.dishListItems.splice(0, this.dishListItems.length, ...ODate)
			}
		},
	}
}
