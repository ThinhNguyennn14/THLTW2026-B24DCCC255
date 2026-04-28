import { useState, useMemo } from 'react';
import { Card, Table, Button, Space, Tag, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import HealthForm from './components/Form';

const { Title } = Typography;

// Hàm tính toán BMI và gán Tag theo yêu cầu
const getBmiInfo = (weight: number, height: number) => {
  if (!weight || !height) return { value: 0, tag: 'default', label: 'N/A' };
  
  // Chiều cao quy đổi ra mét
  const heightInMeter = height / 100;
  const bmi = weight / (heightInMeter * heightInMeter);
  const value = Math.round(bmi * 10) / 10;
  
  if (value < 18.5) return { value, tag: 'blue', label: 'Thiếu cân' };
  if (value < 25) return { value, tag: 'green', label: 'Bình thường' };
  if (value < 30) return { value, tag: 'gold', label: 'Thừa cân' };
  return { value, tag: 'red', label: 'Béo phì' };
};

const NhatKySucKhoe = () => {
  const { healthMetrics, deleteHealthMetric } = useModel('healthy');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const sortedData = useMemo(() => {
    return [...(healthMetrics || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthMetrics]);

  const handleDelete = (id: string) => {
    if(deleteHealthMetric) {
        deleteHealthMetric(id);
        message.success('Đã xóa dữ liệu chỉ số!');
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => <strong>{moment(text).format('DD/MM/YYYY')}</strong>,
    },
    {
      title: 'Cân nặng (kg)',
      dataIndex: 'weight',
      key: 'weight',
      render: (val: number) => <span style={{ fontWeight: 500, color: '#1890ff' }}>{val} kg</span>
    },
    {
      title: 'Chiều cao (cm)',
      dataIndex: 'height',
      key: 'height',
      render: (val: number) => <span>{val} cm</span>
    },
    {
      title: 'Chỉ số BMI',
      key: 'bmi',
      render: (_: any, record: any) => {
        const bmiInfo = getBmiInfo(record.weight, record.height);
        return (
          <Space direction="vertical" size={2} align="center">
            <span style={{ fontWeight: 'bold', fontSize: 15 }}>{bmiInfo.value}</span>
            <Tag color={bmiInfo.tag} style={{ borderRadius: 4, margin: 0 }}>{bmiInfo.label}</Tag>
          </Space>
        );
      }
    },
    {
      title: 'Nhịp tim ngủ (bpm)',
      dataIndex: 'restingHeartRate',
      key: 'restingHeartRate',
      render: (val: number) => <span>❤️ {val}</span>
    },
    {
      title: 'Giờ ngủ',
      dataIndex: 'sleepHours',
      key: 'sleepHours',
      render: (val: number) => <span>🌙 {val} giờ</span>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1890ff' }}/>} 
            onClick={() => {
              setEditingRecord(record);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa không?"
            onConfirm={() => handleDelete(record._id || record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1f1f1f' }}>
          ❤️ Nhật ký chỉ số sức khỏe
        </Title>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingRecord(null);
              setIsModalVisible(true);
            }}
            size="middle"
            style={{ borderRadius: 8, background: '#1890ff', fontWeight: 500 }}
          >
            Thêm chỉ số
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={sortedData} 
          rowKey={(record) => record._id || Math.random().toString()}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <HealthForm 
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        record={editingRecord}
      />
    </div>
  );
};

export default NhatKySucKhoe;
