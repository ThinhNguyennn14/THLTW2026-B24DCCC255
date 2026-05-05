import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { getTasks } from '../../../models/taskmanagement';
import type { ITask } from '../../../services/TaskManagement/typing';
import { Status } from '../../../services/TaskManagement/constant';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);

  useEffect(() => {
    const handleStorageChange = () => {
      const allTasks = getTasks();
      setTasks(allTasks);
    };

    // Lấy dữ liệu lần đầu và lắng nghe sự kiện storage để tự động cập nhật
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);

    // Dọn dẹp listener khi component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === Status.DONE).length;
  const overdueTasks = tasks.filter(
    task => task.status !== Status.DONE && new Date(task.deadline) < new Date()
  ).length;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Bảng điều khiển</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Statistic
              title='Tổng số công việc'
              value={totalTasks}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Statistic
              title='Công việc đã hoàn thành'
              value={completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Statistic
              title='Công việc quá hạn'
              value={overdueTasks}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;