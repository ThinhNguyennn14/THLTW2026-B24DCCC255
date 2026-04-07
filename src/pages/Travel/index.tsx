import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Modal,
  message,
  Popconfirm,
  Progress,
  Rate,
  Row,
  Select,
  Slider,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
  UploadProps,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import { useTravelLogic, Destination, DestinationInput } from './useTravelLogic';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const destinationTypeLabel: Record<Destination['type'], string> = {
  beach: 'Vùng biển',
  mountain: 'Vùng núi',
  city: 'Thành phố',
};

const emptyDestination: DestinationInput = {
  name: '',
  description: '',
  type: 'city',
  image: '',
  location: '',
  rating: 4,
  visitDuration: 4,
  costs: {
    dining: 0,
    accommodation: 0,
    transport: 0,
  },
};

const TravelApp: React.FC = () => {
  const {
    filteredData,
    itinerary,
    stats,
    adminStats,
    setFilters,
    addToDay,
    addDay,
    removeDay,
    resetTrip,
    removeDest,
    moveDest,
    destinations,
    addDestination,
    updateDestination,
    deleteDestination,
  } = useTravelLogic();

  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDestinationByDay, setSelectedDestinationByDay] = useState<Record<number, string | undefined>>({});

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue(emptyDestination);
    setModalVisible(true);
  };

  const openEditModal = (destination: Destination) => {
    setEditingId(destination.id);
    form.setFieldsValue(destination);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    const values = (await form.validateFields()) as DestinationInput;

    if (editingId) {
      updateDestination(editingId, values);
    } else {
      addDestination(values);
    }

    setModalVisible(false);
  };

  const handleAddToDay = (dayNum: number, destination: Destination) => {
    const result = addToDay(dayNum, destination);

    if (result.ok) {
      message.success(result.message);
      return;
    }

    message.warning(result.message);
  };

  const handleImageUpload: UploadProps['beforeUpload'] = file => {
    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        form.setFieldsValue({ image: result });
        message.success('Đã tải ảnh lên thành công');
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleAddSelected = (dayNum: number) => {
    const destinationId = selectedDestinationByDay[dayNum];
    const destination = destinations.find(item => item.id === destinationId);

    if (!destination) {
      message.warning('Hãy chọn một điểm đến để thêm vào lịch trình');
      return;
    }

    handleAddToDay(dayNum, destination);
    setSelectedDestinationByDay(prev => ({ ...prev, [dayNum]: undefined }));
  };

  const handleAddDay = () => {
    const result = addDay();
    if (result.ok) {
      message.success(result.message);
      return;
    }

    message.warning(result.message);
  };

  const handleRemoveDay = (dayNum: number) => {
    const result = removeDay(dayNum);
    if (result.ok) {
      setSelectedDestinationByDay(prev => {
        const next = { ...prev };
        delete next[dayNum];
        return next;
      });
      message.success(result.message);
      return;
    }

    message.warning(result.message);
  };

  const handleResetTrip = () => {
    const result = resetTrip();
    if (result.ok) {
      setSelectedDestinationByDay({});
      message.success(result.message);
      return;
    }

    message.warning(result.message);
  };

  const totalProgress = stats.grandTotal > 0 ? stats.grandTotal : 1;
  const totalCost = stats.grandTotal;
  const latestMonthlyStat = adminStats.byMonth[adminStats.byMonth.length - 1];
  const liveCostStructure = useMemo(
    () => [
      { category: 'Ăn uống', value: stats.dining },
      { category: 'Di chuyển', value: stats.transport },
      { category: 'Lưu trú', value: stats.accommodation },
    ],
    [stats.accommodation, stats.dining, stats.transport],
  );
  const costStructureWithPercent = useMemo(
    () =>
      liveCostStructure.map(item => ({
        ...item,
        percent: totalCost > 0 ? Math.round((item.value / totalCost) * 100) : 0,
      })),
    [liveCostStructure, totalCost],
  );

  return (
    <Layout style={{ background: '#fff' }}>
      <Content style={{ padding: '20px' }}>
        <Tabs defaultActiveKey="1" type="card">
          <TabPane tab="Khám phá điểm đến" key="1">
            <Alert
              message="Dữ liệu được lưu cục bộ trên trình duyệt này"
              description="Khi bạn thêm/sửa/xóa điểm đến hoặc lịch trình, dữ liệu sẽ còn lại sau khi tải lại trang."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Card size="small" title="Bộ lọc tìm kiếm" style={{ marginBottom: 20 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Select allowClear placeholder="Loại hình" style={{ width: '100%' }} onChange={v => setFilters({ type: (v || '') as '' | Destination['type'] })}>
                    <Select.Option value="beach">Vùng Biển</Select.Option>
                    <Select.Option value="mountain">Vùng Núi</Select.Option>
                    <Select.Option value="city">Thành phố</Select.Option>
                  </Select>
                </Col>
                <Col xs={24} md={8}>
                  <Text>Mức giá: </Text>
                  <Slider range max={500} defaultValue={[0, 500]} onAfterChange={v => setFilters({ priceRange: v as [number, number] })} />
                </Col>
                <Col xs={24} md={8}>
                  <Text>Đánh giá ít nhất: </Text>
                  <Rate allowClear={false} onChange={v => setFilters({ rating: v })} />
                </Col>
              </Row>
            </Card>

            <Row gutter={[16, 16]}>
              {filteredData.length === 0 && (
                <Col span={24}>
                  <Card>
                    <Empty description="Không có điểm đến phù hợp với bộ lọc hiện tại" />
                  </Card>
                </Col>
              )}

              {filteredData.map(dest => (
                <Col xs={24} sm={12} lg={6} key={dest.id}>
                  <Card
                    hoverable
                    cover={<img alt={dest.name} src={dest.image} style={{ height: 160, objectFit: 'cover' }} />}
                  >
                    <Card.Meta
                      title={dest.name}
                      description={
                        <Space direction="vertical" size={2}>
                          <Text type="secondary">{dest.location}</Text>
                          <Tag color="blue">{destinationTypeLabel[dest.type]}</Tag>
                        </Space>
                      }
                    />
                    <div style={{ marginTop: 10 }}>
                      <Rate disabled defaultValue={dest.rating} style={{ fontSize: 12 }} />
                      <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                        ${dest.costs.dining + dest.costs.accommodation + dest.costs.transport}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="Lịch trình" key="2">
            <Card style={{ marginBottom: 16 }}>
              <Space>
                <Button type="primary" onClick={handleAddDay}>
                  Thêm ngày
                </Button>
                <Popconfirm
                  title={`Xóa ${itinerary[itinerary.length - 1]?.day ? `ngày ${itinerary[itinerary.length - 1].day}` : 'ngày cuối'}?`}
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => {
                    const lastDay = itinerary[itinerary.length - 1]?.day;
                    if (lastDay) {
                      handleRemoveDay(lastDay);
                    }
                  }}
                >
                  <Button danger disabled={itinerary.length <= 1}>
                    Xóa ngày cuối
                  </Button>
                </Popconfirm>
                <Button onClick={handleResetTrip} type="default">
                  Chốt đơn & làm mới
                </Button>
              </Space>
            </Card>

            <Card style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Statistic title="Tổng giờ tham quan" value={stats.visitTime} suffix="giờ" />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic title="Giờ di chuyển giữa điểm" value={stats.transferTime} suffix="giờ" />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic title="Tổng giờ lịch trình" value={stats.time} suffix="giờ" />
                </Col>
              </Row>
            </Card>

            <Row gutter={[16, 16]}>
              {itinerary.map(day => (
                <Col xs={24} lg={12} key={day.day}>
                  <Card title={`Ngày ${day.day}`}>
                    <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="middle">
                      <Select
                        showSearch
                        placeholder="Chọn điểm đến"
                        optionFilterProp="children"
                        style={{ width: '100%' }}
                        value={selectedDestinationByDay[day.day]}
                        onChange={value => setSelectedDestinationByDay(prev => ({ ...prev, [day.day]: value }))}
                      >
                        {destinations.map(item => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                      <Button
                        type="primary"
                        block
                        onClick={() => handleAddSelected(day.day)}
                        disabled={!selectedDestinationByDay[day.day]}
                      >
                        Thêm vào ngày này
                      </Button>
                    </Space>

                    {day.destinations.length === 0 ? (
                      <Empty description="Chưa có điểm đến nào" />
                    ) : (
                      <List
                        dataSource={day.destinations}
                        renderItem={(item, index) => (
                          <List.Item
                            actions={[
                              <Button
                                key="up"
                                type="link"
                                onClick={() => moveDest(day.day, item.id, 'up')}
                                disabled={index === 0}
                              >
                                Lên
                              </Button>,
                              <Button
                                key="down"
                                type="link"
                                onClick={() => moveDest(day.day, item.id, 'down')}
                                disabled={index === day.destinations.length - 1}
                              >
                                Xuống
                              </Button>,
                              <Button key="remove" type="link" danger onClick={() => removeDest(day.day, item.id)}>
                                Xóa
                              </Button>,
                            ]}
                          >
                            <List.Item.Meta title={item.name} description={`${item.location} · ${item.visitDuration}h`} />
                            <div>${item.costs.dining + item.costs.accommodation + item.costs.transport}</div>
                          </List.Item>
                        )}
                      />
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="Ngân sách" key="3">
            <Alert
              message="Doanh số theo tháng"
              description="Các biểu đồ thống kê đang tổng hợp từ doanh số đã chốt và lưu lại, nên bạn có thể reset lịch trình mà không mất số tiền đã ghi nhận."
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={10}>
                <Card title="Quản lý ngân sách & Thời gian">
                  {stats.isOver && <Alert message="Cảnh báo: Đã vượt quá ngân sách dự kiến!" type="error" showIcon style={{ marginBottom: 16 }} />}

                  <Statistic title="Tổng ngân sách dự tính" value={stats.grandTotal} prefix="$" precision={2} />
                  <Divider />

                  <Text>Ăn uống: ${stats.dining}</Text>
                  <Progress percent={Math.min(100, Math.round((stats.dining / totalProgress) * 100))} status="active" strokeColor="#fadb14" />

                  <Text>Di chuyển: ${stats.transport}</Text>
                  <Progress percent={Math.min(100, Math.round((stats.transport / totalProgress) * 100))} status="active" />

                  <Text>Lưu trú: ${stats.accommodation}</Text>
                  <Progress percent={Math.min(100, Math.round((stats.accommodation / totalProgress) * 100))} status="active" strokeColor="#52c41a" />

                  <Divider />
                  <Statistic title="Tổng thời gian di chuyển & tham quan" value={stats.time} suffix="giờ" />
                </Card>
              </Col>

              <Col xs={24} lg={14}>
                <Card title="Biểu đồ phân bổ ngân sách">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <Progress type="circle" percent={Math.min(100, Math.round((stats.dining / totalProgress) * 100))} strokeColor="#fadb14" />
                        <Text>Ăn uống</Text>
                        <Text strong>${stats.dining}</Text>
                      </Space>
                    </Col>
                    <Col xs={24} md={8}>
                      <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <Progress type="circle" percent={Math.min(100, Math.round((stats.transport / totalProgress) * 100))} />
                        <Text>Di chuyển</Text>
                        <Text strong>${stats.transport}</Text>
                      </Space>
                    </Col>
                    <Col xs={24} md={8}>
                      <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <Progress type="circle" percent={Math.min(100, Math.round((stats.accommodation / totalProgress) * 100))} strokeColor="#52c41a" />
                        <Text>Lưu trú</Text>
                        <Text strong>${stats.accommodation}</Text>
                      </Space>
                    </Col>
                  </Row>
                  <Divider />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {costStructureWithPercent.map(item => (
                      <Text key={item.category}>
                        {item.category}: ${item.value} ({item.percent}%)
                      </Text>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Quản trị (Admin)" key="4">
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <Title level={4}>Quản lý điểm đến</Title>
              <Button type="primary" onClick={openCreateModal}>
                Thêm điểm đến mới
              </Button>
            </div>

            <Table
              scroll={{ x: 980 }}
              size="small"
              rowKey="id"
              dataSource={destinations}
              columns={[
                { title: 'Tên', dataIndex: 'name', fixed: 'left' },
                { title: 'Mô tả', dataIndex: 'description', ellipsis: true, width: 260 },
                { title: 'Loại hình', render: (_, record) => destinationTypeLabel[record.type] },
                { title: 'Địa điểm', dataIndex: 'location' },
                { title: 'Đánh giá', render: (_, record) => <Rate disabled defaultValue={record.rating} style={{ fontSize: 12 }} /> },
                { title: 'Tham quan (h)', dataIndex: 'visitDuration' },
                { title: 'Ăn uống ($)', render: (_, record) => record.costs.dining },
                { title: 'Lưu trú ($)', render: (_, record) => record.costs.accommodation },
                {
                  title: 'Ảnh',
                  render: (_, record) => <img alt={record.name} src={record.image} style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }} />,
                },
                {
                  title: 'Thao tác',
                  fixed: 'right',
                  width: 180,
                  render: (_, record) => (
                    <Space split="|">
                      <a onClick={() => openEditModal(record)}>Sửa</a>
                      <Popconfirm title="Xóa điểm đến này?" okText="Xóa" cancelText="Hủy" onConfirm={() => deleteDestination(record.id)}>
                        <a style={{ color: 'red' }}>Xóa</a>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
            />

            <Divider orientation="left">Thống kê hệ thống</Divider>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Card>
                  <Statistic title="Lịch trình đã chốt tháng này" value={latestMonthlyStat?.itineraries || 0} />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card>
                  <Statistic title="Doanh thu ($)" value={adminStats.revenue} precision={2} />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card>
                  <Statistic title="Địa điểm phổ biến" value={adminStats.popular[0]?.name || 'Chưa có'} />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card>
                  <Statistic title="Hạng mục chi nhiều" value={adminStats.topCategory} />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              <Col xs={24} lg={12}>
                <Card title="Biểu đồ lịch trình theo tháng">
                  <Column
                    height={260}
                    data={adminStats.byMonth}
                    xField="month"
                    yField="itineraries"
                    color="#1890ff"
                    label={{ position: 'middle', style: { fill: '#fff' } }}
                    xAxis={{ label: { autoRotate: false } }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Biểu đồ doanh thu theo tháng">
                  <Column
                    height={260}
                    data={adminStats.byMonth}
                    xField="month"
                    yField="revenue"
                    color="#52c41a"
                    xAxis={{ label: { autoRotate: false } }}
                  />
                </Card>
              </Col>
              <Col xs={24}>
                <Card title="Cơ cấu chi phí (ăn uống/di chuyển/lưu trú)">
                  {totalCost === 0 ? (
                    <Empty description="Chưa có chi phí. Hãy thêm điểm đến vào lịch trình để thấy cơ cấu." />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {costStructureWithPercent.map(item => (
                        <Col xs={24} md={8} key={`admin-${item.category}`}>
                          <Card size="small">
                            <Space direction="vertical" align="center" style={{ width: '100%' }}>
                              <Progress type="dashboard" percent={item.percent} />
                              <Text strong>{item.category}</Text>
                              <Text>${item.value}</Text>
                            </Space>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">Top điểm đến</Divider>
            <Row gutter={[16, 16]}>
              {adminStats.popular.map(item => (
                <Col xs={24} md={8} key={item.id}>
                  <Card cover={<img alt={item.name} src={item.image} style={{ height: 180, objectFit: 'cover' }} />}>
                    <Card.Meta title={item.name} description={item.location} />
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
        </Tabs>
      </Content>

      <Modal
        title={editingId ? 'Cập nhật điểm đến' : 'Thêm điểm đến mới'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingId ? 'Lưu' : 'Thêm'}
        cancelText="Hủy"
        width={720}
      >
        <Form form={form} layout="vertical" initialValues={emptyDestination}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Tên điểm đến" rules={[{ required: true, message: 'Nhập tên điểm đến' }]}>
                <Input placeholder="Ví dụ: Vịnh Hạ Long" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="location" label="Địa điểm" rules={[{ required: true, message: 'Nhập địa điểm' }]}>
                <Input placeholder="Ví dụ: Quảng Ninh" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Loại hình" rules={[{ required: true, message: 'Chọn loại hình' }]}>
                <Select>
                  <Select.Option value="beach">Vùng Biển</Select.Option>
                  <Select.Option value="mountain">Vùng Núi</Select.Option>
                  <Select.Option value="city">Thành phố</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="image" label="URL ảnh" rules={[{ required: true, message: 'Nhập URL ảnh' }]}>
                <Input placeholder="https://..." />
              </Form.Item>
              <Form.Item label="Hoặc upload ảnh từ máy">
                <Upload showUploadList={false} beforeUpload={handleImageUpload} accept="image/*">
                  <Button icon={<UploadOutlined />}>Upload ảnh</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Nhập mô tả' }]}>
                <Input.TextArea rows={3} placeholder="Mô tả ngắn về điểm đến" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rating" label="Đánh giá" rules={[{ required: true, message: 'Nhập đánh giá' }]}>
                <InputNumber min={1} max={5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="visitDuration" label="Thời gian tham quan (giờ)" rules={[{ required: true, message: 'Nhập thời gian tham quan' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["costs", "dining"]} label="Ăn uống ($)" rules={[{ required: true, message: 'Nhập chi phí ăn uống' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["costs", "accommodation"]} label="Lưu trú ($)" rules={[{ required: true, message: 'Nhập chi phí lưu trú' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["costs", "transport"]} label="Di chuyển ($)" rules={[{ required: true, message: 'Nhập chi phí di chuyển' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
};

export default TravelApp;