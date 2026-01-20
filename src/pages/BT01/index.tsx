import { Table, Button, Input, Modal, Form, InputNumber, Space, Popconfirm, message } from 'antd';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const ProductPage = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
    { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
    { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
    { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
    { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
  ]);

  const handleAdd = (values: any) => {
    const newProduct = { ...values, id: Date.now() };
    setProducts([...products, newProduct]);
    setIsModalOpen(false);
    form.resetFields();
    message.success('Thêm sản phẩm thành công!');
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    message.success('Đã xóa sản phẩm');
  };

  const filteredData = products.filter(p => 
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'STT', render: (_: any, __: any, index: number) => index + 1 },
    { title: 'Tên sản phẩm', dataIndex: 'name' },
    { title: 'Giá', dataIndex: 'price', render: (v: number) => v.toLocaleString() + ' đ' },
    { title: 'Số lượng', dataIndex: 'quantity' },
    {
      title: 'Thao tác',
      render: (_: any, record: Product) => (
        <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: '#fff' }}>
      <h2>Quản lý sản phẩm</h2>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Input.Search 
          placeholder="Tìm theo tên sản phẩm..." 
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={() => setIsModalOpen(true)}>Thêm mới</Button>
      </Space>

      <Table dataSource={filteredData} columns={columns} rowKey="id" />

      <Modal title="Thêm sản phẩm mới" visible={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, type: 'number', min: 1, message: 'Giá phải là số dương!' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, type: 'number', min: 1, message: 'Số lượng phải từ 1!' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductPage;