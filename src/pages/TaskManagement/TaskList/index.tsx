import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Input, Select, Space, Popconfirm, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

import { getTasks, addTask, updateTask, deleteTask } from '../../../models/taskmanagement';
import { Status, Priority } from '../../../services/TaskManagement/constant';
import type { ITask } from '../../../services/TaskManagement/typing';
import TaskForm from './components/Form';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const priorityColors: Record<Priority, string> = {
  [Priority.HIGH]: 'red',
  [Priority.MEDIUM]: 'orange',
  [Priority.LOW]: 'blue',
};

const statusColors: Record<Status, string> = {
    [Status.TODO]: 'gold',
    [Status.IN_PROGRESS]: 'processing',
    [Status.DONE]: 'success',
};

const TaskListPage: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');

  const loadTasks = () => {
    setTasks(getTasks());
  };

  useEffect(() => {
    loadTasks();
    window.addEventListener('storage', loadTasks);
    return () => {
      window.removeEventListener('storage', loadTasks);
    };
  }, []);

  const handleAdd = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleEdit = (task: ITask) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
    loadTasks(); // Tải lại danh sách sau khi xóa
  };

  const handleFormSubmit = (values: Omit<ITask, 'id' | 'status'> | ITask) => {
    if (editingTask) {
      updateTask(editingTask.id, values);
    } else {
      addTask(values as Omit<ITask, 'id' | 'status'>);
    }
    loadTasks(); // Tải lại danh sách sau khi thêm/sửa
    setIsModalVisible(false);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => statusFilter === 'all' || task.status === statusFilter)
      .filter(task => task.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tasks, searchTerm, statusFilter]);

  const columns: ColumnsType<ITask> = [
    {
      title: 'Tên công việc',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: Status) => <Tag color={statusColors[status]}>{status}</Tag>,
      filters: Object.values(Status).map(s => ({ text: s, value: s })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Mức độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: Priority) => <Tag color={priorityColors[priority]}>{priority}</Tag>,
      sorter: (a, b) => a.priority.localeCompare(b.priority),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (text: string) => moment(text).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.deadline).unix() - moment(b.deadline).unix(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm
            title='Bạn có chắc muốn xóa công việc này?'
            onConfirm={() => handleDelete(record.id)}
            okText='Xóa'
            cancelText='Hủy'
          >
            <Button icon={<DeleteOutlined />} danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#fff' }}>
      <Title level={2}>Danh sách công việc</Title>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Search
            placeholder='Tìm kiếm theo tên'
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            defaultValue='all'
            style={{ width: 150 }}
            onChange={value => setStatusFilter(value as Status | 'all')}
          >
            <Option value='all'>Tất cả trạng thái</Option>
            {Object.values(Status).map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>
        </Space>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm công việc
        </Button>
      </Space>
      <Table columns={columns} dataSource={filteredTasks} rowKey='id' />
      <TaskForm
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
      />
    </div>
  );
};

export default TaskListPage;