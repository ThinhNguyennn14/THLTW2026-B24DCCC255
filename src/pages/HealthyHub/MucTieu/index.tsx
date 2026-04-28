﻿﻿import React, { useState } from 'react';
import { useModel } from 'umi';
import { Card, Button, Row, Col, Progress, Segmented, Popconfirm, Tag, InputNumber, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import GoalDrawerForm from './components/Form';
import moment from 'moment';

const { Text, Title } = Typography;

const GoalManagement = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useModel('healthy');
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<HealthyHub.Goal | null>(null);
  
  const [editingValues, setEditingValues] = useState<{ [key: string]: number | string | null }>({});
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');

  // Lọc mục tiêu
  const filteredGoals = goals.filter(
    (g) => filterStatus === 'Tất cả' || g.status === filterStatus,
  );

  const handleAdd = () => {
    setEditingGoal(null);
    setDrawerVisible(true);
  };

  const handleEdit = (record: HealthyHub.Goal) => {
    setEditingGoal(record);
    setDrawerVisible(true);
  };

  const handleDelete = (id?: string) => {
    if (id) deleteGoal(id);
  };

  const handleProgressChange = (id: string, value: number | string | null) => {
    setEditingValues(prev => ({ ...prev, [id]: value }));
  };

  const handleProgressSave = (id: string) => {
    const value = editingValues[id];
    if (value !== undefined && value !== null) {
        handleUpdateCurrentValue(id, value);
    }
    setEditingValues(prev => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
    });
  };

  const handleUpdateCurrentValue = (id?: string, val?: number | string | null) => {
    if (!id || val === undefined || val === null) return;
    const goal = goals.find((g) => g._id === id);

    if (!goal || goal.status === 'Đã hủy') {
      return;
    }

    const newCurrentValue = Number(val);
    let newStatus = goal.status;

    // Automatically update status based on progress
    if (goal.targetValue > 0) {
      if (newCurrentValue >= goal.targetValue) {
        newStatus = 'Đã đạt';
      } else if (goal.status === 'Đã đạt' && newCurrentValue < goal.targetValue) {
        newStatus = 'Đang thực hiện';
      }
    }

    updateGoal(id, { ...goal, currentValue: newCurrentValue, status: newStatus });
  };

  const getTagColor = (status: string) => {
    switch (status) {
      case 'Đang thực hiện': return 'processing';
      case 'Đã đạt': return 'success';
      case 'Đã hủy': return 'default';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      <Card 
        style={{ 
          marginBottom: 24, 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>🎯 Quản lý mục tiêu</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm mục tiêu
          </Button>
        </div>
        
        <div style={{ marginTop: 24 }}>
          <Text strong style={{ marginRight: 16 }}>Lọc trạng thái: </Text>
          <Segmented
            options={['Tất cả', 'Đang thực hiện', 'Đã đạt', 'Đã hủy']}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val as string)}
          />
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {filteredGoals.map((goal) => {
          const percent = goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0;
          return (
            <Col xs={24} sm={12} md={8} lg={8} xl={6} key={goal._id}>
              <Card
                hoverable
                style={{ 
                  borderRadius: 12, 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                bodyStyle={{ flexGrow: 1 }}
                actions={[
                  <EditOutlined key="edit" onClick={() => handleEdit(goal)} />,
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa mục tiêu này?"
                    onConfirm={() => handleDelete(goal._id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <DeleteOutlined key="delete" style={{ color: 'red' }} />
                  </Popconfirm>,
                ]}
              >
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={5} style={{ margin: 0 }}>{goal.name}</Title>
                  <Tag color={getTagColor(goal.status)}>{goal.status}</Tag>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <Tag color="cyan">{goal.type}</Tag>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">Cập nhật tiến độ:</Text>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                    <InputNumber
                      min={0}
                      value={editingValues[goal._id!] ?? goal.currentValue}
                      onChange={(val) => handleProgressChange(goal._id!, val)}
                      onPressEnter={() => handleProgressSave(goal._id!)}
                      onBlur={() => handleProgressSave(goal._id!)}
                      style={{ width: '100%', marginRight: 8 }}
                      disabled={goal.status === 'Đã hủy'}
                    />
                    <Text> / {goal.targetValue}</Text>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Progress 
                    percent={percent > 100 ? 100 : percent} 
                    status={percent >= 100 ? "success" : "active"} 
                  />
                </div>

                <div>
                  <Text type="secondary">Deadline: </Text>
                  <Text strong>{moment(goal.deadline).format('DD/MM/YYYY')}</Text>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <GoalDrawerForm
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        record={editingGoal}
        onFinish={(values) => {
          if (editingGoal && editingGoal._id) {
            updateGoal(editingGoal._id, { ...values, _id: editingGoal._id });
          } else {
            addGoal(values as HealthyHub.Goal);
          }
          setDrawerVisible(false);
        }}
      />
    </div>
  );
};

export default GoalManagement;