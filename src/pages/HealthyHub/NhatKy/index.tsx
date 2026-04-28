import { useState, useMemo } from 'react';
import { Card, Table, Button, Input, DatePicker, Space, Tag, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import WorkoutForm from './components/Form';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const NhatKyTapLuyen = () => {
  const { workouts, deleteWorkout } = useModel('healthy');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Lọc dữ liệu qua Tìm kiếm và Khoảng thời gian
  const filteredData = useMemo(() => {
    let data = [...(workouts || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (searchText) {
      data = data.filter((item: any) => 
        item.exerciseType?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf('day').toDate();
      const end = dateRange[1].endOf('day').toDate();
      data = data.filter((item: any) => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      });
    }

    return data;
  }, [workouts, searchText, dateRange]);

  const handleDelete = (id: string) => {
    if(deleteWorkout) {
        deleteWorkout(id);
        message.success('Đã xóa buổi tập!');
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => <strong>{moment(text).format('DD/MM/YYYY')}</strong>,
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Loại bài tập',
      dataIndex: 'exerciseType',
      key: 'exerciseType',
      render: (text: string) => <Tag color="blue" style={{ borderRadius: 4, fontWeight: 500 }}>{text}</Tag>,
    },
    {
      title: 'Thời lượng (phút)',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      render: (val: number) => <span>{val} phút</span>
    },
    {
      title: 'Calo đốt',
      dataIndex: 'caloriesBurned',
      key: 'caloriesBurned',
      render: (val: number) => <Tag color="orange" style={{ borderRadius: 4 }}>🔥 {val} kcal</Tag>
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Hoàn thành' ? 'success' : 'error'} style={{ borderRadius: 4, fontWeight: 500 }}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Hoàn thành', value: 'Hoàn thành' },
        { text: 'Bỏ lỡ', value: 'Bỏ lỡ' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
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
            title="Bạn có chắc chắn muốn xóa buổi tập này?"
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
          📝 Nhật ký tập luyện
        </Title>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <Space size="middle" wrap>
            <Input
              placeholder="Tìm theo loại bài tập (vd: Cardio)..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }}/>}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 280, borderRadius: 8 }}
              allowClear
            />
            <RangePicker 
              format="DD/MM/YYYY"
              onChange={(dates) => setDateRange(dates)}
              style={{ borderRadius: 8 }}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Space>
          
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
            Thêm buổi tập
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey={(record) => record._id || Math.random().toString()}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>

      <WorkoutForm 
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        record={editingRecord}
      />
    </div>
  );
};

export default NhatKyTapLuyen;
