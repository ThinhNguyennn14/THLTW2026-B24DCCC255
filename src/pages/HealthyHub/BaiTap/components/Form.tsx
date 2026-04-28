import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';

const { Option } = Select;

interface ExerciseFormProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  initialValues: HealthyHub.Exercise | null;
}

const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const difficulties = ['Dễ', 'Trung bình', 'Khó'];

const ExerciseForm: React.FC<ExerciseFormProps> = ({ visible, onCancel, onFinish, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [initialValues, visible, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        onFinish(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title={initialValues ? 'Chỉnh sửa bài tập' : 'Thêm bài tập mới'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnClose
      forceRender
    >
      <Form
        form={form}
        layout="vertical"
        name="exercise_form"
        initialValues={{ difficulty: 'Trung bình', ...initialValues }}
      >
        <Form.Item
          name="name"
          label="Tên bài tập"
          rules={[{ required: true, message: 'Vui lòng nhập tên bài tập!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="muscleGroup"
          label="Nhóm cơ"
          rules={[{ required: true, message: 'Vui lòng chọn nhóm cơ!' }]}
        >
          <Select placeholder="Chọn nhóm cơ">
            {muscleGroups.map(group => <Option key={group} value={group}>{group}</Option>)}
          </Select>
        </Form.Item>

        <Form.Item
          name="difficulty"
          label="Mức độ khó"
          rules={[{ required: true, message: 'Vui lòng chọn mức độ khó!' }]}
        >
          <Select>
            {difficulties.map(level => <Option key={level} value={level}>{level}</Option>)}
          </Select>
        </Form.Item>

        <Form.Item
          name="caloriesPerHour"
          label="Lượng calo đốt cháy (Kcal/giờ)"
          rules={[{ required: true, message: 'Vui lòng nhập lượng calo!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả ngắn"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item
          name="instructions"
          label="Hướng dẫn chi tiết"
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExerciseForm;