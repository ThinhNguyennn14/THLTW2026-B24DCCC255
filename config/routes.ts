﻿﻿﻿export default [
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
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/todo-list',
		name: 'TodoList',
		icon: 'OrderedListOutlined',
		component: './TodoList',
	},
	{
	name: 'Bài tập 1',
	path: '/bt01',
	component: './BT01',
	icon: 'shop', 
	},
	{
	name: 'Thực Hành 1',
	path: '/th1',
	routes: [
		{
		name: 'Bài 1',
		path: '/th1/bt1',
		component: './TH1/BT1',
		},
		{
		name: 'Bài 2',
		path: '/th1/bt2',
		component: './TH1/BT2',
		},
	],
	},
	{
	name: 'Thực Hành 2',
	path: '/th2',
	routes: [
		{
		name: 'Bài 1',
		path: '/th2/bt1',
		component: './TH2/BT1',
		},
		{
		name: 'Bài 2',
		path: '/th2/bt2',
		component: './TH2/BT2',
		},
	],
	},
	{
	name: 'Thực Hành 3',
	path: '/th3',
	component: './TH3',
	},
	{
	name: 'Thực Hành 4',
	path: '/th4',
	component: './TH4',
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