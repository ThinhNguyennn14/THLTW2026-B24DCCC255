import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip } from 'antd';
import { useState } from 'react';
import { useModel } from 'umi';
import FormBaiViet from './components/Form';

const PostManager = () => {
	const { dsPosts, addPost, updatePost, deletePost } = useModel('blog');
	const { dsTags } = useModel('tag');

	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [editingPost, setEditingPost] = useState<Blog.IPost | null>(null);

	const handleAdd = () => {
		setEditingPost(null);
		setIsModalVisible(true);
	};

	const handleEdit = (record: Blog.IPost) => {
		setEditingPost(record);
		setIsModalVisible(true);
	};

	const handleSave = (values: any) => {
		if (editingPost) {
			updatePost(editingPost.id, values);
		} else {
			addPost(values);
		}
		setIsModalVisible(false);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	const columns = [
		{
			title: 'STT',
			width: 60,
			align: 'center' as const,
			render: (_: any, __: any, index: number) => index + 1,
		},
		{
			title: 'Tiêu đề',
			dataIndex: 'title',
			ellipsis: true,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			width: 150,
			render: (s: string) => (
				<Tag color={s === 'published' ? 'green' : 'orange'}>{s === 'published' ? 'Đã đăng' : 'Bản nháp'}</Tag>
			),
		},
		{
			title: 'Thẻ',
			dataIndex: 'tags',
			width: 200,
			render: (ids: string[]) => (
				<Space wrap>
					{ids?.map((id) => (
						<Tag key={id}>{dsTags.find((t) => t.id === id)?.name || id}</Tag>
					))}
				</Space>
			),
		},
		{
			title: 'Lượt xem',
			dataIndex: 'viewCount',
			width: 100,
			align: 'center' as const,
			render: (v: number) => (
				<span>
					<EyeOutlined /> {v || 0}
				</span>
			),
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			width: 150,
			render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
		},
		{
			title: 'Thao tác',
			width: 120,
			align: 'center' as const,
			render: (_: any, record: any) => (
				<Space>
					<Tooltip title='Chỉnh sửa bài viết'>
						<Button type='text' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
					</Tooltip>
					<Popconfirm
						title='Hệ thống sẽ xóa bài viết này. Bạn có chắc chắn muốn tiếp tục?'
						onConfirm={() => deletePost(record.id)}
						okText='Xác nhận'
						cancelText='Hủy bỏ'
						okButtonProps={{ danger: true }}
					>
						<Tooltip title='Xóa bài viết'>
							<Button type='text' danger icon={<DeleteOutlined />} />
						</Tooltip>
					</Popconfirm>
				</Space>
			),
		},
	];

	const filtered = dsPosts.filter(
		(p) => p.title.toLowerCase().includes(search.toLowerCase()) && (statusFilter ? p.status === statusFilter : true),
	);

	return (
		<Card title='Quản lý danh sách bài viết'>
			<Space style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
				<Space>
					<Input
						placeholder='Tìm tiêu đề bài viết...'
						prefix={<SearchOutlined />}
						onChange={(e) => setSearch(e.target.value)}
						allowClear
					/>
					<Select placeholder='Lọc theo trạng thái' allowClear style={{ width: 180 }} onChange={setStatusFilter}>
						<Select.Option value='published'>Đã đăng</Select.Option>
						<Select.Option value='draft'>Bản nháp</Select.Option>
					</Select>
				</Space>
				<Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
					Thêm bài viết mới
				</Button>
			</Space>

			<Table columns={columns} dataSource={filtered} rowKey='id' bordered pagination={{ pageSize: 10 }} />

			<Modal
				title={editingPost ? 'Cập nhật thông tin bài viết' : 'Thêm bài viết mới'}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={null}
				destroyOnClose
				width={1000}
			>
				<FormBaiViet initialValues={editingPost} dsTags={dsTags} onSave={handleSave} onCancel={handleCancel} />
			</Modal>
		</Card>
	);
};

export default PostManager;