import { message } from 'antd';
import { useState } from 'react';

const MOCK_TAGS: Blog.ITag[] = [
	{ id: 'T1', name: 'ReactJS', slug: 'reactjs', postCount: 0 },
	{ id: 'T2', name: 'UI/UX', slug: 'ui-ux', postCount: 0 },
];

export default () => {
	const [dsTags, setDsTags] = useState<Blog.ITag[]>(() => {
		const saved = localStorage.getItem('dsTags');
		return saved ? JSON.parse(saved) : MOCK_TAGS;
	});

	const saveAndSync = (data: Blog.ITag[]) => {
		setDsTags(data);
		localStorage.setItem('dsTags', JSON.stringify(data));
	};

	// CRUD cho Thẻ
	const addTag = (values: Blog.ITag) => {
		const slug = values.name.toLowerCase().trim().split(' ').filter(Boolean).join('-');
		const newTag = { ...values, id: `T${Date.now()}`, slug, postCount: 0 };
		saveAndSync([...dsTags, newTag]);
		message.success('Thêm thẻ mới thành công');
	};

	const updateTag = (id: string, values: Partial<Blog.ITag>) => {
		const newData = dsTags.map((t) => (t.id === id ? { ...t, ...values } : t));
		saveAndSync(newData);
		message.success('Cập nhật thẻ thành công');
	};

	const deleteTag = (id: string) => {
		const newData = dsTags.filter((t) => t.id !== id);
		saveAndSync(newData);
		message.success('Đã xóa thẻ');
	};

	return { dsTags, addTag, updateTag, deleteTag, setDsTags };
};