import React, { useState, useMemo } from 'react';
import { useModel } from 'umi';
import { Card, Button, Row, Col, Popconfirm, Tag, Input, Select, Modal, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FireOutlined, ManOutlined } from '@ant-design/icons';
import ExerciseForm from './components/Form';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const muscleGroups = ['Tất cả', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];

const ExerciseLibrary = () => {
  const { exercises, addExercise, updateExercise, deleteExercise } = useModel('healthy');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<HealthyHub.Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('Tất cả');
  const [selectedExercise, setSelectedExercise] = useState<HealthyHub.Exercise | null>(null);

  const filteredExercises = useMemo(() => {
    return (exercises || [])
      .filter(ex => filterGroup === 'Tất cả' || ex.muscleGroup === filterGroup)
      .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [exercises, searchTerm, filterGroup]);

  const handleAdd = () => {
    setEditingExercise(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: HealthyHub.Exercise) => {
    setEditingExercise(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id?: string) => {
    if (id) deleteExercise(id);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFinish = (values: any) => {
    if (editingExercise && editingExercise._id) {
      updateExercise(editingExercise._id, { ...values, _id: editingExercise._id });
    } else {
      addExercise(values as HealthyHub.Exercise);
    }
    setIsModalVisible(false);
  };

  const getDifficultyTagColor = (difficulty: string) => {
    if (difficulty === 'Dễ') return 'success';
    if (difficulty === 'Trung bình') return 'warning';
    if (difficulty === 'Khó') return 'error';
    return 'default';
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh' }}>
      <Card style={{ marginBottom: 24, backgroundColor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Title level={3} style={{ margin: 0 }}>💪 Thư viện bài tập</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm bài tập
          </Button>
        </div>
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Search
              placeholder="Tìm kiếm bài tập..."
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              value={filterGroup}
              onChange={setFilterGroup}
              style={{ width: '100%' }}
            >
              {muscleGroups.map(group => <Option key={group} value={group}>{group === 'Tất cả' ? 'Tất cả nhóm cơ' : group}</Option>)}
            </Select>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {filteredExercises.map((ex) => (
          <Col xs={24} sm={12} md={8} key={ex._id}>
            <Card
              hoverable
              style={{ borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1 }}
              onClick={() => setSelectedExercise(ex)}
              actions={[
                <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); handleEdit(ex); }} />,
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa bài tập này?"
                  onConfirm={(e) => { e?.stopPropagation(); handleDelete(ex._id); }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <DeleteOutlined key="delete" style={{ color: 'red' }} onClick={(e) => e.stopPropagation()} />
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={<Title level={5} style={{marginBottom: 8}}>{ex.name}</Title>}
                description={
                  <>
                    <Tag icon={<ManOutlined />} color="blue">{ex.muscleGroup}</Tag>
                    <Tag color={getDifficultyTagColor(ex.difficulty)}>{ex.difficulty}</Tag>
                  </>
                }
              />
              <Paragraph ellipsis={{ rows: 3, expandable: false }} style={{ marginTop: 16, flex: 1 }}>
                {ex.description}
              </Paragraph>
              <div style={{ paddingTop: 16 }}>
                <Text strong><FireOutlined /> {ex.caloriesPerHour} Kcal/giờ</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <ExerciseForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onFinish={handleFinish}
        initialValues={editingExercise}
      />

      <Modal
        title={<Title level={4}>{selectedExercise?.name}</Title>}
        visible={!!selectedExercise}
        onCancel={() => setSelectedExercise(null)}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            if (selectedExercise) handleEdit(selectedExercise);
            setSelectedExercise(null);
          }}>
            Chỉnh sửa
          </Button>,
          <Button key="close" onClick={() => setSelectedExercise(null)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedExercise && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Tag icon={<ManOutlined />} color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>{selectedExercise.muscleGroup}</Tag>
              <Tag color={getDifficultyTagColor(selectedExercise.difficulty)} style={{ fontSize: 14, padding: '4px 8px' }}>{selectedExercise.difficulty}</Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong><FireOutlined /> Calo đốt cháy (ước tính): </Text>
              <Text>{selectedExercise.caloriesPerHour} Kcal/giờ</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Mô tả</Title>
              <Paragraph>{selectedExercise.description}</Paragraph>
            </div>
            <div>
              <Title level={5}>Hướng dẫn</Title>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedExercise.instructions || 'Chưa có hướng dẫn chi tiết.'}</Paragraph>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ExerciseLibrary;