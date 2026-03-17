import React, { useState, useEffect } from 'react';
import {
  Layout, Tabs, Card, Table, Button, Modal, Form, Input,
  Select, DatePicker, TimePicker, InputNumber, Tag, Space,
  message, Rate, Row, Col, Statistic, Divider, Typography,
  Popconfirm
} from 'antd';
import {
  UserOutlined, CalendarOutlined, BarChartOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, ClockCircleOutlined,
  DollarOutlined, TeamOutlined
} from '@ant-design/icons';
import moment from 'moment';
import Chart from 'react-apexcharts';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Staff {
  id: string;
  name: string;
  maxDaily: number;
  workStart: string;
  workEnd: string;
}

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: number;
}

interface Review {
  id: string;
  appointmentId: string;
  staffId: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialServices: Service[] = [
  { id: '1', name: 'Cắt tóc nam', price: 100000, duration: 30 },
  { id: '2', name: 'Gội đầu massage', price: 150000, duration: 45 },
  { id: '3', name: 'Nhuộm tóc', price: 500000, duration: 120 },
];

const initialStaffs: Staff[] = [
  { id: '1', name: 'Nguyễn Văn A', maxDaily: 5, workStart: '08:00', workEnd: '17:00' },
  { id: '2', name: 'Trần Thị B', maxDaily: 8, workStart: '09:00', workEnd: '18:00' },
];

const AppointmentApp: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('booking');

  useEffect(() => {
    const loadData = () => {
      const s = localStorage.getItem('app_services');
      const st = localStorage.getItem('app_staffs');
      const a = localStorage.getItem('app_appointments');
      const r = localStorage.getItem('app_reviews');

      setServices(s ? JSON.parse(s) : initialServices);
      setStaffs(st ? JSON.parse(st) : initialStaffs);
      setAppointments(a ? JSON.parse(a) : []);
      setReviews(r ? JSON.parse(r) : []);
    };
    loadData();
  }, []);

  useEffect(() => localStorage.setItem('app_services', JSON.stringify(services)), [services]);
  useEffect(() => localStorage.setItem('app_staffs', JSON.stringify(staffs)), [staffs]);
  useEffect(() => localStorage.setItem('app_appointments', JSON.stringify(appointments)), [appointments]);
  useEffect(() => localStorage.setItem('app_reviews', JSON.stringify(reviews)), [reviews]);


  const checkAvailability = (staffId: string, date: string, time: string, serviceId: string): { available: boolean; reason?: string } => {
    const staff = staffs.find(s => s.id === staffId);
    const service = services.find(s => s.id === serviceId);
    if (!staff || !service) return { available: false, reason: 'Dữ liệu không hợp lệ' };

    const bookingTime = moment(time, 'HH:mm');
    const startWork = moment(staff.workStart, 'HH:mm');
    const endWork = moment(staff.workEnd, 'HH:mm');
    const endTime = bookingTime.clone().add(service.duration, 'minutes');

    if (bookingTime.isBefore(startWork) || endTime.isAfter(endWork)) {
      return { available: false, reason: `Nhân viên chỉ làm việc từ ${staff.workStart} đến ${staff.workEnd}` };
    }

    const staffAppsToday = appointments.filter(a =>
      a.staffId === staffId &&
      a.date === date &&
      a.status !== 'cancelled'
    );
    if (staffAppsToday.length >= staff.maxDaily) {
      return { available: false, reason: 'Nhân viên đã nhận đủ số khách trong ngày' };
    }

    const hasConflict = staffAppsToday.some(a => {
      const aStart = moment(a.time, 'HH:mm');
      const aEnd = moment(a.endTime, 'HH:mm');
      return bookingTime.isBefore(aEnd) && endTime.isAfter(aStart);
    });

    if (hasConflict) {
      return { available: false, reason: 'Khung giờ này đã bị trùng lịch' };
    }

    return { available: true };
  };

  const getStaffRating = (staffId: string): number => {
    const staffReviews = reviews.filter(r => r.staffId === staffId);
    if (staffReviews.length === 0) return 0;
    const total = staffReviews.reduce((sum, r) => sum + r.rating, 0);
    return Number((total / staffReviews.length).toFixed(1));
  };

  
  const BookingTab = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
      const dateStr = values.date.format('YYYY-MM-DD');
      const timeStr = values.time.format('HH:mm');
      const service = services.find(s => s.id === values.serviceId);

      if (!service) return;

      const check = checkAvailability(values.staffId, dateStr, timeStr, values.serviceId);
      if (!check.available) {
        message.error(check.reason);
        return;
      }

      const endTime = moment(timeStr, 'HH:mm').add(service.duration, 'minutes').format('HH:mm');

      const newApp: Appointment = {
        id: generateId(),
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        serviceId: values.serviceId,
        staffId: values.staffId,
        date: dateStr,
        time: timeStr,
        endTime,
        status: 'pending',
        createdAt: Date.now(),
      };

      setAppointments([...appointments, newApp]);
      message.success('Đặt lịch thành công! Vui lòng chờ xác nhận.');
      form.resetFields();
    };

    return (
      <Card title="Đặt lịch hẹn mới" bordered={false}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerName" label="Họ tên khách hàng" rules={[{ required: true }]}>
                <Input placeholder="Nhập họ tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerPhone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="serviceId" label="Dịch vụ" rules={[{ required: true }]}>
                <Select placeholder="Chọn dịch vụ">
                  {services.map(s => (
                    <Option key={s.id} value={s.id}>{s.name} - {s.price.toLocaleString()}đ ({s.duration}p)</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="staffId" label="Nhân viên" rules={[{ required: true }]}>
                <Select placeholder="Chọn nhân viên">
                  {staffs.map(s => (
                    <Option key={s.id} value={s.id}>
                      {s.name} (Đánh giá: {getStaffRating(s.id)} <Rate disabled defaultValue={1} count={1} style={{ fontSize: 12 }} />)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Ngày hẹn" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < moment().startOf('day')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="time" label="Giờ hẹn" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" block size="large" icon={<CheckCircleOutlined />}>
            Xác nhận đặt lịch
          </Button>
        </Form>
      </Card>
    );
  };

  const ManagementTab = () => {
    const [activeSubTab, setActiveSubTab] = useState('appointments');

    const StaffManager = () => {
      const [isModalVisible, setIsModalVisible] = useState(false);
      const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
      const [form] = Form.useForm();

      const handleSave = (values: any) => {
        const workStart = values.workTime[0].format('HH:mm');
        const workEnd = values.workTime[1].format('HH:mm');
        const newStaffData = { ...values, workStart, workEnd, workTime: undefined };

        if (editingStaff) {
          setStaffs(staffs.map(s => s.id === editingStaff.id ? { ...editingStaff, ...newStaffData } : s));
          message.success('Cập nhật nhân viên thành công');
        } else {
          setStaffs([...staffs, { ...newStaffData, id: generateId() }]);
          message.success('Thêm nhân viên thành công');
        }
        setIsModalVisible(false);
        form.resetFields();
        setEditingStaff(null);
      };

      const columns = [
        { title: 'Tên nhân viên', dataIndex: 'name' },
        { title: 'Giới hạn khách/ngày', dataIndex: 'maxDaily' },
        { title: 'Giờ làm việc', render: (_: any, r: Staff) => `${r.workStart} - ${r.workEnd}` },
        { title: 'Đánh giá TB', render: (_: any, r: Staff) => <Rate disabled allowHalf value={getStaffRating(r.id)} /> },
        {
          title: 'Thao tác',
          render: (_: any, r: Staff) => (
            <Space>
              <Button icon={<EditOutlined />} onClick={() => {
                setEditingStaff(r);
                form.setFieldsValue({
                  ...r,
                  workTime: [moment(r.workStart, 'HH:mm'), moment(r.workEnd, 'HH:mm')]
                });
                setIsModalVisible(true);
              }} />
              <Popconfirm title="Xóa nhân viên này?" onConfirm={() => setStaffs(staffs.filter(s => s.id !== r.id))}>
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )
        }
      ];

      return (
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingStaff(null); form.resetFields(); setIsModalVisible(true); }} style={{ marginBottom: 16 }}>
            Thêm nhân viên
          </Button>
          <Table dataSource={staffs} columns={columns} rowKey="id" />
          <Modal
            title={editingStaff ? "Sửa nhân viên" : "Thêm nhân viên"}
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            onOk={() => form.submit()}
          >
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item name="name" label="Tên nhân viên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="maxDaily" label="Số khách tối đa/ngày" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="workTime" label="Thời gian làm việc" rules={[{ required: true }]}>
                <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      );
    };
    const ServiceManager = () => {
      const [isModalVisible, setIsModalVisible] = useState(false);
      const [editingService, setEditingService] = useState<Service | null>(null);
      const [form] = Form.useForm();

      const handleSave = (values: any) => {
        if (editingService) {
          setServices(services.map(s => s.id === editingService.id ? { ...editingService, ...values } : s));
        } else {
          setServices([...services, { ...values, id: generateId() }]);
        }
        setIsModalVisible(false);
        form.resetFields();
        setEditingService(null);
      };

      const columns = [
        { title: 'Tên dịch vụ', dataIndex: 'name' },
        { title: 'Giá (VNĐ)', dataIndex: 'price', render: (v: number) => v.toLocaleString() },
        { title: 'Thời gian (phút)', dataIndex: 'duration' },
        {
          title: 'Thao tác',
          render: (_: any, r: Service) => (
            <Space>
              <Button icon={<EditOutlined />} onClick={() => { setEditingService(r); form.setFieldsValue(r); setIsModalVisible(true); }} />
              <Popconfirm title="Xóa dịch vụ này?" onConfirm={() => setServices(services.filter(s => s.id !== r.id))}>
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )
        }
      ];

      return (
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingService(null); form.resetFields(); setIsModalVisible(true); }} style={{ marginBottom: 16 }}>
            Thêm dịch vụ
          </Button>
          <Table dataSource={services} columns={columns} rowKey="id" />
          <Modal
            title={editingService ? "Sửa dịch vụ" : "Thêm dịch vụ"}
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            onOk={() => form.submit()}
          >
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="price" label="Giá tiền" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
              <Form.Item name="duration" label="Thời gian thực hiện (phút)" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      );
    };

    const AppointmentManager = () => {
      const [reviewModalVisible, setReviewModalVisible] = useState(false);
      const [selectedAppForReview, setSelectedAppForReview] = useState<Appointment | null>(null);
      const [reviewForm] = Form.useForm();

      const [replyModalVisible, setReplyModalVisible] = useState(false);
      const [selectedReview, setSelectedReview] = useState<Review | null>(null);
      const [replyContent, setReplyContent] = useState('');

      const updateStatus = (id: string, status: Appointment['status']) => {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
        message.success(`Đã cập nhật trạng thái: ${status}`);
      };

      const handleReviewSubmit = (values: any) => {
        if (!selectedAppForReview) return;
        const newReview: Review = {
          id: generateId(),
          appointmentId: selectedAppForReview.id,
          staffId: selectedAppForReview.staffId,
          rating: values.rating,
          comment: values.comment,
          createdAt: Date.now(),
        };
        setReviews([...reviews, newReview]);
        setReviewModalVisible(false);
        message.success('Cảm ơn bạn đã đánh giá!');
      };

      const handleReplySubmit = () => {
        if (!selectedReview) return;
        setReviews(reviews.map(r => r.id === selectedReview.id ? { ...r, reply: replyContent } : r));
        setReplyModalVisible(false);
        message.success('Đã phản hồi đánh giá');
      };

      const columns = [
        {
          title: 'Khách hàng',
          render: (_: any, r: Appointment) => (
            <div>
              <div><b>{r.customerName}</b></div>
              <div style={{ fontSize: 12, color: '#888' }}>{r.customerPhone}</div>
            </div>
          )
        },
        {
          title: 'Dịch vụ & Nhân viên',
          render: (_: any, r: Appointment) => {
            const s = services.find(sv => sv.id === r.serviceId);
            const st = staffs.find(sf => sf.id === r.staffId);
            return (
              <div>
                <Tag color="blue">{s?.name}</Tag>
                <div>NV: {st?.name}</div>
              </div>
            );
          }
        },
        {
          title: 'Thời gian',
          render: (_: any, r: Appointment) => (
            <div>
              <div>{moment(r.date).format('DD/MM/YYYY')}</div>
              <Tag icon={<ClockCircleOutlined />}>{r.time} - {r.endTime}</Tag>
            </div>
          )
        },
        {
          title: 'Trạng thái',
          dataIndex: 'status',
          render: (status: string) => {
            const colors: any = { pending: 'orange', confirmed: 'blue', completed: 'green', cancelled: 'red' };
            const labels: any = { pending: 'Chờ duyệt', confirmed: 'Đã xác nhận', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
            return <Tag color={colors[status]}>{labels[status]}</Tag>;
          }
        },
        {
          title: 'Thao tác',
          render: (_: any, r: Appointment) => (
            <Space direction="vertical" size="small">
              {r.status === 'pending' && (
                <Space>
                  <Button type="primary" size="small" onClick={() => updateStatus(r.id, 'confirmed')}>Duyệt</Button>
                  <Button danger size="small" onClick={() => updateStatus(r.id, 'cancelled')}>Hủy</Button>
                </Space>
              )}
              {r.status === 'confirmed' && (
                <Button type="primary" ghost size="small" onClick={() => updateStatus(r.id, 'completed')}>Hoàn thành</Button>
              )}
              {r.status === 'completed' && !reviews.find(rv => rv.appointmentId === r.id) && (
                <Button size="small" onClick={() => { setSelectedAppForReview(r); reviewForm.resetFields(); setReviewModalVisible(true); }}>
                  Đánh giá
                </Button>
              )}
              {r.status === 'completed' && reviews.find(rv => rv.appointmentId === r.id) && (
                <Button size="small" onClick={() => {
                  const rv = reviews.find(rev => rev.appointmentId === r.id);
                  setSelectedReview(rv || null);
                  setReplyContent(rv?.reply || '');
                  setReplyModalVisible(true);
                }}>
                  Xem đánh giá
                </Button>
              )}
            </Space>
          )
        }
      ];

      return (
        <div>
          <Table dataSource={[...appointments].reverse()} columns={columns} rowKey="id" />
          
          <Modal
            title="Đánh giá dịch vụ"
            visible={reviewModalVisible}
            onCancel={() => setReviewModalVisible(false)}
            onOk={() => reviewForm.submit()}
          >
            <Form form={reviewForm} layout="vertical" onFinish={handleReviewSubmit}>
              <Form.Item name="rating" label="Mức độ hài lòng" rules={[{ required: true }]}>
                <Rate />
              </Form.Item>
              <Form.Item name="comment" label="Nhận xét">
                <TextArea rows={3} />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Chi tiết đánh giá"
            visible={replyModalVisible}
            onCancel={() => setReplyModalVisible(false)}
            onOk={handleReplySubmit}
            okText="Gửi phản hồi"
          >
            {selectedReview && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Rate disabled value={selectedReview.rating} />
                  <p><b>Khách hàng:</b> {selectedReview.comment}</p>
                </div>
                <Divider />
                <p><b>Phản hồi của nhân viên:</b></p>
                <TextArea 
                  rows={3} 
                  value={replyContent} 
                  onChange={(e) => setReplyContent(e.target.value)} 
                  placeholder="Nhập phản hồi..."
                />
              </div>
            )}
          </Modal>
        </div>
      );
    };

    return (
      <Tabs activeKey={activeSubTab} onChange={setActiveSubTab} type="card">
        <TabPane tab={<span><CalendarOutlined />Quản lý Lịch hẹn</span>} key="appointments">
          <AppointmentManager />
        </TabPane>
        <TabPane tab={<span><TeamOutlined />Quản lý Nhân viên</span>} key="staffs">
          <StaffManager />
        </TabPane>
        <TabPane tab={<span><DollarOutlined />Quản lý Dịch vụ</span>} key="services">
          <ServiceManager />
        </TabPane>
      </Tabs>
    );
  };

  const StatisticsTab = () => {
    const revenueByService = services.map(s => {
      const total = appointments
        .filter(a => a.serviceId === s.id && a.status === 'completed')
        .reduce((sum, _) => sum + s.price, 0);
      return { name: s.name, value: total };
    });

    const revenueChartOptions = {
      chart: { type: 'pie' as const },
      labels: revenueByService.map(r => r.name),
      title: { text: 'Doanh thu theo dịch vụ' }
    };

    const revenueByStaff = staffs.map(s => {
      const total = appointments
        .filter(a => a.staffId === s.id && a.status === 'completed')
        .reduce((sum, a) => {
          const svc = services.find(sv => sv.id === a.serviceId);
          return sum + (svc ? svc.price : 0);
        }, 0);
      return { name: s.name, value: total };
    });

    const staffRevenueChartOptions = {
      chart: { type: 'bar' as const },
      xaxis: { categories: revenueByStaff.map(r => r.name) },
      title: { text: 'Doanh thu theo nhân viên' },
      plotOptions: { bar: { horizontal: true } }
    };

    return (
      <div style={{ padding: 20 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <Statistic 
                title="Doanh thu ước tính (Tháng này)" 
                value={appointments
                  .filter(a => a.status === 'completed' && moment(a.date).isSame(moment(), 'month'))
                  .reduce((sum, a) => sum + (services.find(s => s.id === a.serviceId)?.price || 0), 0)
                } 
                suffix="VNĐ"
                prefix={<DollarOutlined />} 
                formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Đánh giá trung bình" value={reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0} suffix="/ 5" prefix={<UserOutlined />} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col span={24}>
            <Card>
              <Chart options={revenueChartOptions} series={revenueByService.map(r => r.value)} type="pie" height={300} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col span={24}>
            <Card>
              <Chart options={staffRevenueChartOptions} series={[{ name: 'Doanh thu', data: revenueByStaff.map(r => r.value) }]} type="bar" height={300} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ margin: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Hệ Thống Đặt Lịch Dịch Vụ</Title>
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered size="large">
          <TabPane tab={<span><CalendarOutlined />Đặt Lịch Ngay</span>} key="booking">
            <BookingTab />
          </TabPane>
          <TabPane tab={<span><UserOutlined />Quản Trị Viên</span>} key="admin">
            <ManagementTab />
          </TabPane>
          <TabPane tab={<span><BarChartOutlined />Báo Cáo & Thống Kê</span>} key="stats">
            <StatisticsTab />
          </TabPane>
        </Tabs>
      </Card>
    </Layout>
  );
};

export default AppointmentApp;