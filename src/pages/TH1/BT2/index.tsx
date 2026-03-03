import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout, Tabs, Button, Table, Popconfirm,
  Progress, InputNumber,
  message, Form, DatePicker, Modal, Input, Select, Space, Card,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');
const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;


interface Subject {
  id: string;
  name: string;
}

interface StudySession {
  id: string;
  subjectId: string;
  date: string;
  duration: number;
  content: string;
  notes?: string;
}

interface Goal {
  subjectId: string;
  month: string;
  target: number;
}

// --- MODAL FORM ---
const StudyFormCustom = ({ visible, type, subjects, onCancel, onFinish, form }: any) => {
  return (
    <Modal
      title={type === 'subject' ? 'Thêm môn học mới' : 'Thêm nhật ký học tập'}
      visible={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {type === 'subject' ? (
          <Form.Item
            name="name"
            label="Tên môn học"
            rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}
          >
            <Input placeholder="Ví dụ: Toán, Lịch sử..." />
          </Form.Item>
        ) : (
          <>
            <Form.Item name="subjectId" label="Môn học" rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}>
              <Select placeholder="Chọn môn học">
                {subjects?.map((s: Subject) => <Option key={s.id} value={s.id}>{s.name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="date" label="Thời gian học" rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}>
              <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
            </Form.Item>
            <Form.Item name="duration" label="Thời lượng học (giờ)" rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}>
              <InputNumber min={0.1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="content" label="Nội dung đã học" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú (tùy chọn)">
              <Input.TextArea rows={2} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

// --- MAIN APP COMPONENT ---
const StudyTrackerApp: React.FC = () => {
  const [form] = Form.useForm();

  // --- STATE MANAGEMENT ---
  const [subjects, setSubjects] = useState<Subject[]>(() => JSON.parse(localStorage.getItem('subjects') || '[]'));
  const [sessions, setSessions] = useState<StudySession[]>(() => JSON.parse(localStorage.getItem('studySessions') || '[]'));
  const [goals, setGoals] = useState<Goal[]>(() => JSON.parse(localStorage.getItem('studyGoals') || '[]'));

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'subject' | 'session'>('subject');
  const [filterMonth, setFilterMonth] = useState<dayjs.Dayjs>(dayjs());

  // --- DATA PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('studySessions', JSON.stringify(sessions));
    localStorage.setItem('studyGoals', JSON.stringify(goals));
  }, [subjects, sessions, goals]);

  // --- HANDLERS ---
  const onFinish = (values: any) => {
    if (modalType === 'subject') {
      setSubjects([...subjects, { id: Date.now().toString(), name: values.name }]);
    } else {
      const newSession: StudySession = { ...values, id: Date.now().toString(), date: values.date.toISOString() };
      setSessions([newSession, ...sessions]);
    }
    setModalVisible(false);
    form.resetFields();
    message.success('Lưu thành công!');
  };

  const handleGoalChange = (subjectId: string, value: number | null) => {
    const month = filterMonth.format('YYYY-MM');
    const targetValue = value === null ? 0 : value;
    const exist = goals.find(g => g.subjectId === subjectId && g.month === month);
    if (exist) {
      setGoals(goals.map(g => (g.subjectId === subjectId && g.month === month) ? { ...g, target: targetValue } : g));
    } else {
      setGoals([...goals, { subjectId, month, target: targetValue }]);
    }
  };

  // --- DATA COMPUTATION ---
  const stats = useMemo(() => {
    const monthStr = filterMonth.format('YYYY-MM');
    return subjects.map(sub => {
      const totalHours = sessions
        .filter(s => s.subjectId === sub.id && dayjs(s.date).format('YYYY-MM') === monthStr)
        .reduce((sum, s) => sum + s.duration, 0);
      const goal = goals.find(g => g.subjectId === sub.id && g.month === monthStr);
      const target = goal?.target || 0;
      return {
        ...sub,
        totalHours,
        target,
        progress: target > 0 ? Math.min((totalHours / target) * 100, 100) : 0,
      };
    });
  }, [subjects, sessions, goals, filterMonth]);

  // --- TABLE COLUMNS ---
  const subjectColumns = [
    {
      title: 'STT',
      key: 'stt',
      render: (text: any, record: any, index: number) => index + 1,
    },
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center' as const,
      render: (text: any, record: Subject) => (
        <Popconfirm title="Bạn có chắc muốn xóa môn này?" onConfirm={() => setSubjects(subjects.filter(s => s.id !== record.id))}>
          <Button type="link" danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  const sessionColumns = [
    {
      title: 'Môn học',
      render: (_: any, r: StudySession) => subjects.find(s => s.id === r.subjectId)?.name || 'N/A',
    },
    {
      title: 'Thời gian',
      dataIndex: 'date',
      render: (d: string) => dayjs(d).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời lượng (giờ)',
      dataIndex: 'duration',
    },
    {
      title: 'Nội dung học',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      align: 'center' as const,
      render: (_: any, r: StudySession) => (
        <Popconfirm title="Bạn có chắc muốn xóa mục này?" onConfirm={() => setSessions(sessions.filter(s => s.id !== r.id))}>
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const goalColumns = [
    {
      title: 'Môn học',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
    },
    {
      title: 'Mục tiêu (giờ)',
      dataIndex: 'target',
      key: 'target',
      width: '15%',
      render: (text: any, record: any) => (
        <InputNumber
          min={0}
          value={record.target || null}
          onChange={(val) => handleGoalChange(record.id, val)}
        />
      ),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (text: any, record: any) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Progress percent={Math.round(record.progress)} />
          <span>{record.totalHours.toFixed(1)}h / {record.target || 0}h</span>
        </Space>
      ),
    },
  ];

  // --- RENDER ---
  return (
    <Content style={{ padding: '24px' }}>
      <Card title="Bài 2 : Quản lý học tập">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Quản lý Môn học" key="1">
            <Button
              type="primary"
              onClick={() => { setModalType('subject'); setModalVisible(true); }}
              icon={<PlusOutlined />}
              style={{ marginBottom: 16 }}
            >
              Thêm môn học
            </Button>
            <Table
              bordered
              rowKey="id"
              columns={subjectColumns}
              dataSource={subjects}
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Nhật ký Học tập" key="2">
            <Button
              type="primary"
              onClick={() => { setModalType('session'); setModalVisible(true); }}
              icon={<PlusOutlined />}
              style={{ marginBottom: 16 }}
            >
              Thêm nhật ký
            </Button>
            <Table
              bordered
              rowKey="id"
              columns={sessionColumns}
              dataSource={sessions}
            />
          </TabPane>

          <TabPane tab="Mục tiêu Tháng" key="3">
            <Space style={{ marginBottom: 16 }}>
              <span>Chọn tháng:</span>
              <DatePicker
                picker="month"
                value={filterMonth}
                onChange={(d: any) => setFilterMonth(d || dayjs())}
                allowClear={false}
              />
            </Space>
            <Table
              bordered
              rowKey="id"
              columns={goalColumns}
              dataSource={stats}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      <StudyFormCustom
        visible={modalVisible}
        type={modalType}
        subjects={subjects}
        form={form}
        onCancel={() => setModalVisible(false)}
        onFinish={onFinish}
      />
    </Content>
  );
};

export default StudyTrackerApp;