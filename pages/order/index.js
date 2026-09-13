import {
	submitOrderSubmit,
	getAddressBookDefault
} from '../api/api.js'
import {mapState, mapMutations} from 'vuex'
import { baseUrl } from '../../utils/env'

export default {
	data () {
		return {
			platform: 'ios',
			orderDishPrice: 0,
			openPayType: false,
			psersonUrl: '../../static/btn_waiter_sel.png',
			nickName: '',
			gender: '0',
			phoneNumber: '',
			address: '',
			remark: '',
			arrivalTime: '',
			addressBookId: '',
			// 加入购物车数量
			orderDishNumber: 0,
		}
	},
	computed: {
		orderListDataes: function () {
			return this.orderListData()
		}
	},
	onLoad (options) {
		this.initPlatform()
		this.psersonUrl = this.$store.state.baseUserInfo && this.$store.state.baseUserInfo.avatarUrl
		this.nickName = this.$store.state.baseUserInfo && this.$store.state.baseUserInfo.nickName
		this.gender = this.$store.state.baseUserInfo && this.$store.state.baseUserInfo.gender
		// 计算订单金额与数量
		this.computOrderInfo()
		// 获取一小时以后的时间
		this.getHarfAnOur()
		// 存在options说明换地址了
		if (options && options.address) {
			this.addressBookId = ''
			const newAddress = JSON.parse(options.address)
			this.address = newAddress.provinceName + newAddress.cityName + newAddress.districtName + newAddress.detail
			this.phoneNumber = newAddress.phone
			this.nickName = newAddress.consignee
			this.gender = newAddress.sex
			this.addressBookId = newAddress.id
		}

		// 默认地址查询
		this.getAddressBookDefault()
	},
	methods: {
		...mapState(['orderListData']),
		...mapMutations(['setAddressBackUrl']),
		initPlatform(){
			const res = uni.getSystemInfoSync();
			this.platform = res.platform
		},
		// 获取一小时以后的时间
		getHarfAnOur () {
			const date = new Date()
			date.setTime(date.getTime() + 3600000)
			let hours = date.getHours()
			let minutes = date.getMinutes()
			if (hours < 10) hours = '0' + hours
			if (minutes < 10) minutes = '0' + minutes
			this.arrivalTime = hours + ':' + minutes
		},
		// 默认地址查询
		getAddressBookDefault () {
			getAddressBookDefault().then(res => {
				if (res.code === 1) {
					this.addressBookId = ''
					this.address = res.data.provinceName + res.data.cityName + res.data.districtName + res.data.detail
					this.phoneNumber = res.data.phone
					this.nickName = res.data.consignee
					this.gender = res.data.sex
					this.addressBookId = res.data.id
				}
			})
		},
		// 去地址页面
		goAddress () {
			this.setAddressBackUrl('/pages/order/index')
			uni.redirectTo({
				url: '/pages/address/address'
			})
		},
		// 重新拼装image
		getNewImage (image) {
			if (!image) return ''
			// 后端返回的是 OSS 完整 URL 时直接使用，仅对纯文件名拼接下载地址
			return /^https?:\/\//.test(image) ? image : `${baseUrl}/common/download?name=${image}`
		},
		// 订单里和总订单价格计算
		computOrderInfo () {
			let oriData = this.orderListDataes
			this.orderDishNumber = this.orderDishPrice = 0
			this.orderDishPrice = 0
			oriData.map((n,i) => {
				this.orderDishPrice += n.number * n.amount
				this.orderDishNumber += n.number
			})
		},
		// 返回上一级
		goback () {
			uni.navigateBack()
		},
		closeMask () {
			this.openPayType = false
		},
		// 支付下单
		payOrderHandle () {
			if(!this.address){
				uni.showToast({
					title: '请选择收货地址',
					icon: 'none',
				})
				return false
			}
			const params = {
				payMethod: 1,
				addressBookId: this.addressBookId,
				remark: this.remark
			}
			submitOrderSubmit(params).then(res => {
				if (res.code === 1) {
					uni.redirectTo({
						url: '/pages/order/success'
					})
				}else{
					uni.showToast({
						title: res.msg || '操作失败',
						icon: 'none',
					})
				}
			})
		}
	}
}
