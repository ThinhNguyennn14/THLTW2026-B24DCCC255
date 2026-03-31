import React, { useState } from 'react';
import {
  Tabs, Table, Button, Modal, Form, Input, Select, DatePicker, Avatar, Tag, Space, Popconfirm, message, Card, Row, Col, Statistic, Switch
} from 'antd';
import { Column } from '@ant-design/plots';
import moment, { Moment } from 'moment';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, UsergroupAddOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface Club {
  id: number;
  avatar: string;
  name: string;
  foundationDate: Moment;
  description: string;
  president: string;
  isActive: boolean;
}

interface Application {
  id: number;
  key: number;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  address: string;
  school: string;
  clubId: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
}

interface ActionHistory {
  timestamp: Moment;
  action: string;
}

const initialClubs: Club[] = [
  { id: 1, avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg', name: 'CLB Guitar', foundationDate: moment('2020-09-01'), description: 'Nơi hội tụ đam mê âm nhạc và guitar.', president: 'Nguyễn Văn A', isActive: true },
  { id: 2, avatar: 'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.jpeg', name: 'CLB Nhiếp ảnh', foundationDate: moment('2019-03-15'), description: 'Ghi lại những khoảnh khắc đẹp của cuộc sống.', president: 'Trần Thị B', isActive: true },
  { id: 3, avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png', name: 'CLB Sách', foundationDate: moment('2021-01-20'), description: 'Cùng nhau chia sẻ tri thức.', president: 'Lê Văn C', isActive: false },
];

const initialApplications: Application[] = [
  { id: 1, key: 1, fullName: 'Phạm Văn D', email: 'd@example.com', phone: '0987654321', gender: 'Nam', address: '123 Đường ABC, Q1, TPHCM', school: 'ĐH KHTN', clubId: 1, reason: 'Em yêu thích guitar', status: 'Pending' },
  { id: 2, key: 2, fullName: 'Nguyễn Thị E', email: 'e@example.com', phone: '0987123456', gender: 'Nữ', address: '456 Đường XYZ, Q3, TPHCM', school: 'ĐH KHXHNV', clubId: 2, reason: 'Muốn học hỏi về nhiếp ảnh', status: 'Approved' },
  { id: 3, key: 3, fullName: 'Trần Văn F', email: 'f@example.com', phone: '0912345678', gender: 'Nam', address: '789 Đường LMN, Q5, TPHCM', school: 'ĐH Bách Khoa', clubId: 1, reason: 'Đã biết chơi guitar cơ bản', status: 'Rejected', notes: 'Hồ sơ chưa đầy đủ' },
  { id: 4, key: 4, fullName: 'Lê Thị G', email: 'g@example.com', phone: '0905112233', gender: 'Nữ', address: '101 Đường OPQ, Q7, TPHCM', school: 'ĐH Sư phạm', clubId: 2, reason: 'Đam mê chụp ảnh', status: 'Pending' },
];

const TH5Page: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);

  const [isClubModalVisible, setIsClubModalVisible] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [clubForm] = Form.useForm();

  const [isAppModalVisible, setIsAppModalVisible] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [appForm] = Form.useForm();

  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [appsToProcess, setAppsToProcess] = useState<React.Key[]>([]);
  const [processAction, setProcessAction] = useState<'Approve' | 'Reject' | null>(null);
  const [selectedAppKeys, setSelectedAppKeys] = useState<React.Key[]>([]);

  const [isViewMembersModalVisible, setIsViewMembersModalVisible] = useState(false);
  const [viewingClub, setViewingClub] = useState<Club | null>(null);

  const [isChangeClubModalVisible, setIsChangeClubModalVisible] = useState(false);
  const [membersToChangeClub, setMembersToChangeClub] = useState<React.Key[]>([]);
  const [targetClubId, setTargetClubId] = useState<number | null>(null);
  const [selectedMemberKeys, setSelectedMemberKeys] = useState<React.Key[]>([]);

  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);

  const logAction = (action: string) => {
    const newHistory = [{ timestamp: moment(), action }, ...actionHistory];
    setActionHistory(newHistory);
  };

  const showClubModal = (club?: Club) => {
    if (club) {
      setEditingClub(club);
      clubForm.setFieldsValue({ ...club, foundationDate: moment(club.foundationDate) });
    } else {
      setEditingClub(null);
      clubForm.resetFields();
    }
    setIsClubModalVisible(true);
  };

  const handleClubFormFinish = (values: any) => {
    if (editingClub) {
      const updatedClubs = clubs.map(c => c.id === editingClub.id ? { ...editingClub, ...values } : c);
      setClubs(updatedClubs);
      message.success('Cập nhật câu lạc bộ thành công!');
      logAction(`Admin đã cập nhật CLB: ${values.name}`);
    } else {
      const newClub = { id: Date.now(), ...values, avatar: 'https://joeschmoe.io/api/v1/random' };
      setClubs([...clubs, newClub]);
      message.success('Thêm câu lạc bộ thành công!');
      logAction(`Admin đã thêm CLB mới: ${values.name}`);
    }
    setIsClubModalVisible(false);
  };

  const handleDeleteClub = (clubId: number) => {
    const clubName = clubs.find(c => c.id === clubId)?.name;
    setClubs(clubs.filter(c => c.id !== clubId));
    message.success(`Xóa câu lạc bộ "${clubName}" thành công!`);
    logAction(`Admin đã xóa CLB: ${clubName}`);
  };

  const showViewMembersModal = (club: Club) => {
    setViewingClub(club);
    setIsViewMembersModalVisible(true);
  };

  const showAppModal = (app?: Application) => {
    if (app) {
      setEditingApp(app);
      appForm.setFieldsValue(app);
    } else {
      setEditingApp(null);
      appForm.resetFields();
    }
    setIsAppModalVisible(true);
  };

  const handleAppFormFinish = (values: any) => {
    if (editingApp) {
      const updatedApps = applications.map(a => a.id === editingApp.id ? { ...editingApp, ...values } : a);
      setApplications(updatedApps);
      message.success('Cập nhật đơn đăng ký thành công!');
      logAction(`Admin đã cập nhật đơn của: ${values.fullName}`);
    } else {
      const newApp = { id: Date.now(), key: Date.now(), status: 'Pending' as const, ...values };
      setApplications([...applications, newApp]);
      message.success('Thêm đơn đăng ký thành công!');
      logAction(`Admin đã tạo đơn mới cho: ${values.fullName}`);
    }
    setIsAppModalVisible(false);
  };

  const handleDeleteApp = (appId: number) => {
    const appName = applications.find(a => a.id === appId)?.fullName;
    setApplications(applications.filter(a => a.id !== appId));
    message.success(`Xóa đơn của "${appName}" thành công!`);
    logAction(`Admin đã xóa đơn của: ${appName}`);
  };

  const handleProcessApps = (keys: React.Key[], action: 'Approve' | 'Reject') => {
    setAppsToProcess(keys);
    setProcessAction(action);
    if (action === 'Reject') {
      setIsRejectModalVisible(true);
    } else {
      const updatedApps = applications.map(app => {
        if (keys.includes(app.key)) {
          logAction(`Admin đã duyệt đơn của ${app.fullName}`);
          return { ...app, status: 'Approved' as const };
        }
        return app;
      });
      setApplications(updatedApps);
      message.success(`Đã duyệt ${keys.length} đơn đã chọn.`);
      setSelectedAppKeys([]);
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason) {
      message.error('Vui lòng nhập lý do từ chối.');
      return;
    }
    const updatedApps = applications.map(app => {
      if (appsToProcess.includes(app.key)) {
        logAction(`Admin đã từ chối đơn của ${app.fullName} với lý do: ${rejectionReason}`);
        return { ...app, status: 'Rejected' as const, notes: rejectionReason };
      }
      return app;
    });
    setApplications(updatedApps);
    message.info(`Đã từ chối ${appsToProcess.length} đơn đã chọn.`);
    setIsRejectModalVisible(false);
    setRejectionReason('');
    setSelectedAppKeys([]);
  };

  const showChangeClubModal = () => {
    setMembersToChangeClub(selectedMemberKeys);
    setIsChangeClubModalVisible(true);
  };

  const handleChangeClub = () => {
    if (!targetClubId) {
      message.error('Vui lòng chọn câu lạc bộ muốn chuyển đến.');
      return;
    }
    const updatedApps = applications.map(app => {
      if (membersToChangeClub.includes(app.key)) {
        const oldClubName = clubs.find(c => c.id === app.clubId)?.name || 'N/A';
        const newClubName = clubs.find(c => c.id === targetClubId)?.name || 'N/A';
        logAction(`Admin đã chuyển ${app.fullName} từ CLB ${oldClubName} đến CLB ${newClubName}`);
        return { ...app, clubId: targetClubId };
      }
      return app;
    });
    setApplications(updatedApps);
    message.success(`Đã chuyển ${membersToChangeClub.length} thành viên.`);
    setIsChangeClubModalVisible(false);
    setTargetClubId(null);
    setSelectedMemberKeys([]);
  };

  const clubColumns = [
    { title: 'Ảnh đại diện', dataIndex: 'avatar', key: 'avatar', render: (avatar: string) => <Avatar src={avatar} /> },
    { title: 'Tên câu lạc bộ', dataIndex: 'name', key: 'name', sorter: (a: Club, b: Club) => a.name.length - b.name.length },
    { title: 'Ngày thành lập', dataIndex: 'foundationDate', key: 'foundationDate', render: (date: Moment) => date.format('DD/MM/YYYY'), sorter: (a: Club, b: Club) => a.foundationDate.unix() - b.foundationDate.unix() },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', render: (html: string) => <div dangerouslySetInnerHTML={{ __html: html }} /> },
    { title: 'Chủ nhiệm', dataIndex: 'president', key: 'president' },
    { title: 'Hoạt động', dataIndex: 'isActive', key: 'isActive', render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Có' : 'Không'}</Tag> },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Club) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showClubModal(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDeleteClub(record.id)}>
            <Button icon={<DeleteOutlined />} danger>Xóa</Button>
          </Popconfirm>
          <Button icon={<EyeOutlined />} onClick={() => showViewMembersModal(record)}>Xem TV</Button>
        </Space>
      ),
    },
  ];

  const applicationColumns = [
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', sorter: (a: Application, b: Application) => a.fullName.localeCompare(b.fullName) },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
    { title: 'Câu lạc bộ', dataIndex: 'clubId', key: 'clubId', render: (clubId: number) => clubs.find(c => c.id === clubId)?.name || 'N/A' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value: string | number | boolean, record: Application) => record.status === value,
      render: (status: string) => {
        let color = 'geekblue';
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'volcano';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Application) => (
        <Space size="small">
          <Button size="small" onClick={() => showAppModal(record)}>Chi tiết/Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa đơn này?" onConfirm={() => handleDeleteApp(record.id)}>
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
          {record.status === 'Pending' && (
            <>
              <Button size="small" type="primary" onClick={() => handleProcessApps([record.key], 'Approve')}>Duyệt</Button>
              <Button size="small" danger onClick={() => handleProcessApps([record.key], 'Reject')}>Từ chối</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const memberColumns = [
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { title: 'Câu lạc bộ', dataIndex: 'clubId', key: 'clubId', render: (clubId: number) => clubs.find(c => c.id === clubId)?.name || 'N/A' },
  ];

  const approvedMembers = applications.filter(app => app.status === 'Approved');
  const appStats = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = clubs.flatMap(club => {
    const clubApps = applications.filter(app => app.clubId === club.id);
    const pending = clubApps.filter(app => app.status === 'Pending').length;
    const approved = clubApps.filter(app => app.status === 'Approved').length;
    const rejected = clubApps.filter(app => app.status === 'Rejected').length;
    return [
      { club: club.name, status: 'Pending', count: pending },
      { club: club.name, status: 'Approved', count: approved },
      { club: club.name, status: 'Rejected', count: rejected },
    ];
  });

  const chartConfig = {
    data: chartData,
    isGroup: true,
    xField: 'club',
    yField: 'count',
    seriesField: 'status',
    color: ['#1890ff', '#52c41a', '#f5222d'],
    label: {
      position: 'middle' as const,
      layout: [{ type: 'interval-adjust-position' }],
    },
  };

  return (
    <div style={{ padding: 24 }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="1. Danh sách câu lạc bộ" key="1">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showClubModal()} style={{ marginBottom: 16 }}>
            Thêm CLB
          </Button>
          <Table columns={clubColumns} dataSource={clubs} rowKey="id" />
        </TabPane>

        <TabPane tab="2. Quản lý đơn đăng ký" key="2">
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showAppModal()}>
              Thêm đơn
            </Button>
            {selectedAppKeys.length > 0 && (
              <>
                <Button
                  type="primary"
                  onClick={() => handleProcessApps(selectedAppKeys, 'Approve')}
                >
                  Duyệt {selectedAppKeys.length} đơn đã chọn
                </Button>
                <Button
                  danger
                  onClick={() => handleProcessApps(selectedAppKeys, 'Reject')}
                >
                  Từ chối {selectedAppKeys.length} đơn đã chọn
                </Button>
              </>
            )}
            <Button onClick={() => setIsHistoryModalVisible(true)}>Xem lịch sử thao tác</Button>
          </Space>
          <Table
            rowSelection={{
              selectedRowKeys: selectedAppKeys,
              onChange: (keys) => setSelectedAppKeys(keys),
            }}
            columns={applicationColumns}
            dataSource={applications}
            rowKey="key"
          />
        </TabPane>

        <TabPane tab="3. Quản lý thành viên CLB" key="3">
          {selectedMemberKeys.length > 0 && (
            <Button
              type="primary"
              icon={<UsergroupAddOutlined />}
              onClick={showChangeClubModal}
              style={{ marginBottom: 16 }}
            >
              Đổi CLB cho {selectedMemberKeys.length} thành viên
            </Button>
          )}
          <Table
            rowSelection={{
              selectedRowKeys: selectedMemberKeys,
              onChange: (keys) => setSelectedMemberKeys(keys),
            }}
            columns={memberColumns}
            dataSource={approvedMembers}
            rowKey="key"
            bordered
            title={() => <b>Danh sách thành viên đã được duyệt</b>}
          />
        </TabPane>

        <TabPane tab="4. Báo cáo và thống kê" key="4">
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}><Card><Statistic title="Tổng số CLB" value={clubs.length} /></Card></Col>
            <Col span={6}><Card><Statistic title="Đơn chờ duyệt (Pending)" value={appStats['Pending'] || 0} valueStyle={{ color: '#1890ff' }} /></Card></Col>
            <Col span={6}><Card><Statistic title="Đơn đã duyệt (Approved)" value={appStats['Approved'] || 0} valueStyle={{ color: '#52c41a' }} /></Card></Col>
            <Col span={6}><Card><Statistic title="Đơn bị từ chối (Rejected)" value={appStats['Rejected'] || 0} valueStyle={{ color: '#f5222d' }} /></Card></Col>
          </Row>
          <Card title="Số lượng đơn đăng ký theo từng CLB">
            <Column {...chartConfig} />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingClub ? 'Chỉnh sửa câu lạc bộ' : 'Thêm câu lạc bộ mới'}
        visible={isClubModalVisible}
        onCancel={() => setIsClubModalVisible(false)}
        onOk={() => clubForm.submit()}
      >
        <Form form={clubForm} layout="vertical" onFinish={handleClubFormFinish}>
          <Form.Item name="name" label="Tên câu lạc bộ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="president" label="Chủ nhiệm CLB" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="foundationDate" label="Ngày thành lập" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="isActive" label="Đang hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingApp ? 'Chi tiết/Chỉnh sửa đơn' : 'Thêm đơn đăng ký'}
        visible={isAppModalVisible}
        onCancel={() => setIsAppModalVisible(false)}
        onOk={() => appForm.submit()}
        width={800}
      >
        <Form form={appForm} layout="vertical" onFinish={handleAppFormFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="Địa chỉ">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="school" label="Trường học">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="clubId" label="Câu lạc bộ đăng ký" rules={[{ required: true }]}>
                <Select>
                  {clubs.map(club => <Option key={club.id} value={club.id}>{club.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="reason" label="Lý do đăng ký">
                <TextArea rows={3} />
              </Form.Item>
            </Col>
             <Col span={24}>
              <Form.Item name="notes" label="Ghi chú (Lý do từ chối...)">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Lý do từ chối"
        visible={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        onOk={handleRejectConfirm}
      >
        <Input.TextArea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Nhập lý do từ chối (bắt buộc)"
        />
      </Modal>

      <Modal
        title={`Thành viên CLB ${viewingClub?.name}`}
        visible={isViewMembersModalVisible}
        onCancel={() => setIsViewMembersModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={memberColumns.filter(c => c.key !== 'club')}
          dataSource={approvedMembers.filter(m => m.clubId === viewingClub?.id)}
          rowKey="key"
          size="small"
        />
      </Modal>

      <Modal
        title={`Đổi CLB cho ${membersToChangeClub.length} thành viên`}
        visible={isChangeClubModalVisible}
        onCancel={() => setIsChangeClubModalVisible(false)}
        onOk={handleChangeClub}
      >
        <Select
          placeholder="Chọn CLB muốn chuyển đến"
          style={{ width: '100%' }}
          onChange={(value) => setTargetClubId(value)}
        >
          {clubs.map(club => <Option key={club.id} value={club.id}>{club.name}</Option>)}
        </Select>
      </Modal>

      <Modal
        title="Lịch sử thao tác"
        visible={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {actionHistory.map((item, index) => (
            <p key={index}>[{item.timestamp.format('HH:mm:ss DD/MM/YYYY')}] {item.action}</p>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default TH5Page;