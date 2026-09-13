import {request} from "./../../utils/request.js"

// 用户登录
export const userLogin = (params) => {
	return request({
		url: '/user/login',
		method: 'POST',
		params
	})
}

// 菜品和套餐的分类
export const getCategoryList = (params) => {
	return request({
		url: '/category/list',
		method: 'GET',
		params
	})
}

// 查询菜品列表
export const dishListByCategoryId = (params) => {
	return request({
		url: '/dish/list',
		method: 'GET',
		params
	})
}

// 购物车新增接口
export const newAddShoppingCartAdd = (params) => {
	return request({
		url: '/shoppingCart/add',
		method: 'POST',
		params
	})
}

// 购物车减少接口
export const newShoppingCartSub = (params) => {
	return request({
		url: '/shoppingCart/sub',
		method: 'POST',
		params
	})
}

// 获取购物车集合
export const getShoppingCartList = (params) => {
	return request({
		url: '/shoppingCart/list',
		method: 'GET',
		params
	})
}

// 清空购物车
export const delShoppingCart = (params) => {
	return request({
		url: '/shoppingCart/clean',
		method: 'DELETE',
		params
	})
}

// 根据type类型查询套餐接口
export const querySetmeaList = (params) => {
	return request({
		url: '/setmeal/list',
		method: 'GET',
		params
	})
}

// 首页查询套餐详情展示的接口
export const querySetmealDishById = (params) => {
	return request({
		url: `/setmeal/dish/${params.id}`,
		method: 'GET'
	})
}

// 最近订单和历史订单
export const queryOrderUserPage = (params) => {
	return request({
		url: '/order/userPage',
		method: 'GET',
		params
	})
}

// 用户下单
export const submitOrderSubmit = (params) => {
	return request({
		url: '/order/submit',
		method: 'POST',
		params
	})
}

// 再来一单
export const oneOrderAgain = (params) => {
	return request({
		url: '/order/again',
		method: 'POST',
		params
	})
}

// 查询地址列表
export const queryAddressBookList = (params) => {
	return request({
		url: '/addressBook/list',
		method: 'GET',
		params
	})
}

// 查询默认地址
export const getAddressBookDefault = () => {
	return request({
		url: '/addressBook/default',
		method: 'GET'
	})
}

// 设置默认地址
export const putAddressBookDefault = (params) => {
	return request({
		url: '/addressBook/default',
		method: 'PUT',
		params
	})
}

// 新增地址接口
export const addAddressBook = (params) => {
	return request({
		url: '/addressBook',
		method: 'POST',
		params
	})
}

// 修改地址接口
export const editAddressBook = (params) => {
	return request({
		url: '/addressBook',
		method: 'PUT',
		params
	})
}

// 删除地址
export const delAddressBook = (ids) => {
	return request({
		url: `/addressBook?ids=${ids}`,
		method: 'DELETE',
		params: { ids }
	})
}

// 查询地址通过id
export const queryAddressBookById = (params) => {
	return request({
		url: `/addressBook/${params.id}`,
		method: 'GET',
		params
	})
}
