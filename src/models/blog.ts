import { message } from 'antd';
import { useState } from 'react';
import { useModel } from 'umi';

export default () => {
	const { dsTags, setDsTags } = useModel('tag');

	const MOCK_AUTHOR: Blog.IAuthor = {
		id: 'A1',
		name: 'Nguyễn Đức Thịnh',
		avatar: 'https://scontent.fhan2-4.fna.fbcdn.net/v/t39.30808-6/527319399_1590757162161592_4021549460790400345_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=53a332&_nc_eui2=AeGti8G3rFGDpvNIwZBMZS47bpPmtLft87huk-a0t-3zuPU3cQ6wjxmprfaT-VfeZoNa7ZopjQB1JAmVf33-jSlr&_nc_ohc=oKDEcT7lbT4Q7kNvwGpV76m&_nc_oc=AdptHxo3e-vMANOUKcMUzNvq5mJkMT0nYaOVC9GJ-YWhuU7uzPgHgCfzpFJtsDoAU5NXoie0BojJUDoZxIkuKIVU&_nc_zt=23&_nc_ht=scontent.fhan2-4.fna&_nc_gid=OnsXpfwfw9aWSiWgK_sRpw&_nc_ss=7a3a8&oh=00_Af01ApxzoZ_vrOmRq199etp6o_GTXRys2K_vaC_9K6kkXQ&oe=69ED1F6B',
		bio: 'hura hura.',
		skills: ['React', 'TypeScript', 'Ant Design', 'CapCut'],
		socials: [
			{ platform: 'facebook', url: 'https:' },
			{ platform: 'github', url: 'https' },
		],
	};

	const MOCK_POSTS: Blog.IPost[] = [
		{
			id: 'P1',
			title: 'Cách setup Background xanh tím cực nghệ',
			slug: 'cach-setup-background-xanh-tim-cuc-nghe',
			thumbnail: 'https://picsum.photos/id/1/800/450',
			summary: 'Hướng dẫn chi tiết cách tạo quầng sáng Mesh Gradient cho Web bằng CSS.',
			content: 'Đây là phần content của bài viết',
			author: MOCK_AUTHOR,
			createdAt: '2026-04-21T10:00:00Z',
			viewCount: 150,
			status: 'published',
			tags: ['T1', 'T2'],
		},
		{
			id: 'P2',
			title: 'Review CapCut PC 2026',
			slug: 'review-capcut-pc-2026',
			thumbnail: 'jjjjj',
			summary: 'Tính năng AI mới trong CapCut có thực sự đỉnh như lời đồn?',
			content: 'Nội dung đang cập nhật...',
			author: MOCK_AUTHOR,
			createdAt: '2026-04-20T08:30:00Z',
			viewCount: 45,
			status: 'draft',
			tags: ['T3'],
		},
	];

	const [dsPosts, setDsPosts] = useState<Blog.IPost[]>(() => {
		const saved = localStorage.getItem('dsPosts');
		return saved ? JSON.parse(saved) : MOCK_POSTS;
	});

	const syncWithTags = (newPosts: Blog.IPost[]) => {
		const updatedTags = dsTags.map((tag) => ({
			...tag,
			postCount: newPosts.filter((p) => p.tags.includes(tag.id)).length,
		}));
		setDsTags(updatedTags);
		localStorage.setItem('dsTags', JSON.stringify(updatedTags));
		localStorage.setItem('dsPosts', JSON.stringify(newPosts));
	};

	const addPost = (values: Blog.IPost) => {
		const cleanTitle = values.title.toLowerCase().trim();
		const baseSlug = cleanTitle.split(' ').filter(Boolean).join('-');
		const finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

		const newPost: Blog.IPost = {
			...values,
			id: `P${Date.now()}`,
			slug: finalSlug,
			author: MOCK_AUTHOR,
			viewCount: 0,
			createdAt: new Date().toISOString(),
		};

		const newDs = [...dsPosts, newPost];
		setDsPosts(newDs);
		syncWithTags(newDs);
		message.success('Đã đăng bài thành công!');
	};

	const deletePost = (id: string) => {
		const newDs = dsPosts.filter((p) => p.id !== id);
		setDsPosts(newDs);
		syncWithTags(newDs);
		message.success('Đã xóa bài viết!');
	};

	const updatePost = (id: string, values: Partial<Blog.IPost>) => {
		const newDs = dsPosts.map((p) => (p.id === id ? { ...p, ...values } : p));
		setDsPosts(newDs);
		syncWithTags(newDs);
		message.success('Cập nhật thành công!');
	};
	const incrementView = (id: string) => {
		const currentPosts = JSON.parse(localStorage.getItem('dsPosts') || '[]');
		const newData = currentPosts.map((p: Blog.IPost) =>
			p.id === id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p,
		);

		setDsPosts(newData);
		localStorage.setItem('dsPosts', JSON.stringify(newData));
	};

	return { dsPosts, addPost, updatePost, deletePost, incrementView };
};