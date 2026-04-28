﻿export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	// {
	// 	path: '/random-user',
	// 	name: 'RandomUser',
	// 	component: './RandomUser',
	// 	icon: 'ArrowsAltOutlined',
	// },
	// {
	// 	path: '/todo-list',
	// 	name: 'TodoList',
	// 	icon: 'OrderedListOutlined',
	// 	component: './TodoList',
	// },

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },
	// 	{
	// 	path: '/Home',
	// 	name: 'Trang chủ',
	// 	icon: 'HomeOutlined',
	// 	component: './Blog/TrangChu',
	// },
	// {
	// 	path: '/gioi-thieu',
	// 	name: 'About',
	// 	component: './TienIch/GioiThieu',
	// 	hideInMenu: true,
	// },
	// {
	// 	path: '/post/:slug',
	// 	name: 'Chi tiết bài viết',
	// 	component: './Blog/ChiTiet',
	// 	hideInMenu: true,
	// },

	// {
	// 	path: '/about',
	// 	name: 'Giới thiệu',
	// 	icon: 'UserOutlined',
	// 	component: './Blog/AuthorAbout',
	// },
	// {
	// 	path: '/quan-ly-bai-viet',
	// 	name: 'Quản lý bài viết',
	// 	icon: 'FileTextOutlined',
	// 	component: './BlogAdmin/PostManager',
	// },

	// {
	// 	path: '/quan-ly-the',
	// 	name: 'Quản lý thẻ',
	// 	icon: 'TagsOutlined',
	// 	component: './BlogAdmin/TagManager',
	// },
	{
	path: '/healthyhub',
	name: 'Healthy App',
	icon: 'HeartOutlined',
	routes: [
		{
		path: '/healthyhub',
		redirect: '/healthyhub/trang-chu',
		},
		{
		path: '/healthyhub/trang-chu',
		name: 'Trang chủ',
		component: './HealthyHub/TrangChu',
		},
		{
		path: '/healthyhub/nhat-ky',
		name: 'Nhật ký tập luyện',
		component: './HealthyHub/NhatKy',
		},
		{
		path: '/healthyhub/suc-khoe',
		name: 'Nhật ký chỉ số sức khỏe',
		component: './HealthyHub/SucKhoe',
		},
		{
		path: '/healthyhub/muc-tieu',
		name: 'Quản lý mục tiêu',
		component: './HealthyHub/MucTieu',
		},
		{
		path: '/healthyhub/bai-tap',
		name: 'Thư viện bài tập',
		component: './HealthyHub/BaiTap',
		},
     ],
	},
	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];