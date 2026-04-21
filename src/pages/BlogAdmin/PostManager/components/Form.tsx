import { Button, Col, Divider, Form, Input, Row, Select, Space } from 'antd';
import React, { useEffect } from 'react';

interface Props {
	initialValues?: Blog.IPost | null;
	dsTags: Blog.ITag[];
	onSave: (values: any) => void;
	onCancel: () => void;
}

const FormBaiViet: React.FC<Props> = ({ initialValues, dsTags, onSave, onCancel }) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (initialValues) {
			form.setFieldsValue(initialValues);
		} else {
			form.resetFields();
		}
	}, [initialValues]);

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const title = e.target.value;
		const slug = title
			.toLowerCase()
			.trim()
			.split(' ')
			.filter((word) => word.length > 0)
			.join('-');

		if (!initialValues) {
			form.setFieldsValue({ slug });
		}
	};

	return (
		<Form form={form} layout='vertical' onFinish={onSave} initialValues={{ status: 'draft' }}>
			<Row gutter={16}>
				<Col span={24}>
					<Form.Item
						name='title'
						label='Tiêu đề bài viết'
						rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết' }]}
					>
						<Input placeholder='Ví dụ: Cách học React hiệu quả' onChange={handleTitleChange} />
					</Form.Item>
				</Col>

				<Col span={24}>
					<Form.Item
						name='slug'
						label='Đường dẫn (Slug)'
						rules={[{ required: true, message: 'Vui lòng nhập đường dẫn' }]}
						extra='Đường dẫn này sẽ hiển thị trên URL của bài viết.'
					>
						<Input placeholder='cach-hoc-react-hieu-qua' />
					</Form.Item>
				</Col>

				<Col span={24}>
					<Form.Item
						name='thumbnail'
						label='Ảnh đại diện (URL)'
						rules={[{ required: true, message: 'Vui lòng dán link ảnh đại diện' }]}
					>
						<Input placeholder='https://example.com/image.jpg' />
					</Form.Item>
				</Col>

				<Col span={12}>
					<Form.Item
						name='tags'
						label='Thẻ tag liên quan'
						rules={[{ required: true, message: 'Vui lòng chọn ít nhất một thẻ' }]}
					>
						<Select
							mode='multiple'
							placeholder='Chọn các thẻ bài viết'
							options={dsTags.map((t) => ({ label: t.name, value: t.id }))}
						/>
					</Form.Item>
				</Col>

				<Col span={12}>
					<Form.Item name='status' label='Trạng thái bài đăng'>
						<Select
							options={[
								{ label: 'Công khai (Published)', value: 'published' },
								{ label: 'Bản nháp (Draft)', value: 'draft' },
							]}
						/>
					</Form.Item>
				</Col>

				<Divider />

				<Col span={24}>
					<Form.Item
						name='summary'
						label='Tóm tắt ngắn gọn'
						rules={[{ required: true, message: 'Vui lòng nhập tóm tắt bài viết' }]}
					>
						<Input.TextArea rows={2} placeholder='Viết một đoạn ngắn giới thiệu nội dung...' />
					</Form.Item>
				</Col>

				<Col span={24}>
					<Form.Item
						name='content'
						label='Nội dung chi tiết (Định dạng văn bản)'
						rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết' }]}
					>
						<Input.TextArea rows={8} placeholder='Nhập nội dung bài viết tại đây...' />
					</Form.Item>
				</Col>

				<Divider />

				<Col span={24} style={{ textAlign: 'right' }}>
					<Space>
						<Button onClick={onCancel}>Hủy bỏ</Button>
						<Button type='primary' htmlType='submit'>
							{initialValues ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}
						</Button>
					</Space>
				</Col>
			</Row>
		</Form>
	);
};

export default FormBaiViet;