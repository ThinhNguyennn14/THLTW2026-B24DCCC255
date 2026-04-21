import { DeleteOutlined, EditOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import { useState } from 'react';
import { useModel } from 'umi';

const TagManager = () => {
	const { dsTags, addTag, updateTag, deleteTag } = useModel('tag');

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [editingTag, setEditingTag] = useState<Blog.ITag | null>(null);
	const [form] = Form.useForm();

	const handleOpenModal = (record?: Blog.ITag) => {
		if (record) {
			setEditingTag(record);
			form.setFieldsValue(record);
		} else {
			setEditingTag(null);
			form.resetFields();
		}
		setIsModalVisible(true);
	};

	const handleOk = () => {
		form.validateFields().then((values) => {
			if (editingTag) {
				updateTag(editingTag.id, values);
			} else {
				addTag(values);
			}
			setIsModalVisible(false);
		});
	};

	const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!editingTag) {
			const name = e.target.value;
			const slug = name
				.toLowerCase()
				.trim()
				.split(' ')
				.filter((word) => word.length > 0)
				.join('-');
			form.setFieldsValue({ slug });
		}
	};

	const columns = [
		{
			title: 'STT',
			render: (_: any, __: any, i: number) => i + 1,
			width: 80,
			align: 'center' as const,
		},
		{
			title: 'Tên thẻ tag',
			dataIndex: 'name',
			render: (text: string) => (
				<Space>
					<TagsOutlined /> {text}
				</Space>
			),
		},
		{
			title: 'Đường dẫn (Slug)',
			dataIndex: 'slug',
			render: (text: string) => <code>{text}</code>,
		},
		{
			title: 'Số bài viết sử dụng',
			dataIndex: 'postCount',
			width: 180,
			align: 'center' as const,
			render: (count: number) => <Tag color='blue'>{count || 0}</Tag>,
		},
		{
			title: 'Thao tác',
			width: 120,
			align: 'center' as const,
			render: (_: any, record: Blog.ITag) => (
				<Space size='middle'>
					<Tooltip title='Chỉnh sửa thẻ'>
						<Button type='text' icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
					</Tooltip>

					<Popconfirm
						title='Hệ thống sẽ xóa thẻ này. Bạn có chắc chắn muốn tiếp tục?'
						onConfirm={() => deleteTag(record.id)}
						okText='Xác nhận xóa'
						cancelText='Hủy bỏ'
						okButtonProps={{ danger: true }}
					>
						<Tooltip title='Xóa thẻ'>
							<Button type='text' danger icon={<DeleteOutlined />} />
						</Tooltip>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<Card
			title='Quản lý danh mục thẻ tag'
			extra={
				<Button type='primary' icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
					Thêm thẻ mới
				</Button>
			}
		>
			<Table columns={columns} dataSource={dsTags} rowKey='id' bordered />

			<Modal
				title={editingTag ? 'Cập nhật thông tin thẻ' : 'Thêm thẻ bài viết mới'}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={() => setIsModalVisible(false)}
				okText='Lưu thông tin'
				cancelText='Đóng'
				destroyOnClose
			>
				<Form form={form} layout='vertical'>
					<Form.Item name='name' label='Tên thẻ tag' rules={[{ required: true, message: 'Vui lòng nhập tên thẻ tag' }]}>
						<Input placeholder='Ví dụ: Lập trình, Đời sống...' onChange={onNameChange} />
					</Form.Item>
					<Form.Item
						name='slug'
						label='Mã đường dẫn (Slug)'
						rules={[{ required: true, message: 'Vui lòng nhập mã đường dẫn' }]}
						extra='Mã đường dẫn dùng để tạo link lọc bài viết (ví dụ: lap-trinh)'
					>
						<Input placeholder='lap-trinh' />
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default TagManager;