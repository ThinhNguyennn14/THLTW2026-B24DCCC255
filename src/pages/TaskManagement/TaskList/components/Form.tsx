import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button } from 'antd';
import moment from 'moment';
import type { ITask } from '../../../../services/TaskManagement/typing';
import { Priority, Status } from '../../../../services/TaskManagement/constant';

const { Option } = Select;

interface TaskFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Omit<ITask, 'id' | 'status'>) => void;
  initialData?: ITask | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ visible, onCancel, onSubmit, initialData }) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;

  useEffect(() => {
    if (visible) {
      if (isEditing && initialData) {
        form.setFieldsValue({
          ...initialData,
          deadline: moment(initialData.deadline),
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialData, form, isEditing]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        onSubmit({ ...values, deadline: values.deadline.toISOString() });
        form.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
      footer={[
        <Button key='back' onClick={onCancel}>
          Hủy
        </Button>,
        <Button key='submit' type='primary' onClick={handleOk}>
          {isEditing ? 'Lưu thay đổi' : 'Tạo công việc'}
        </Button>,
      ]}
    >
      <Form form={form} layout='vertical' name='task_form'>
        <Form.Item
          name='name'
          label='Tên công việc'
          rules={[{ required: true, message: 'Vui lòng nhập tên công việc!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='description'
          label='Mô tả'
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name='deadline'
          label='Deadline'
          rules={[{ required: true, message: 'Vui lòng chọn deadline!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name='priority'
          label='Mức độ ưu tiên'
          rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
          initialValue={Priority.MEDIUM}
        >
          <Select>
            <Option value={Priority.HIGH}>Cao</Option>
            <Option value={Priority.MEDIUM}>Trung bình</Option>
            <Option value={Priority.LOW}>Thấp</Option>
          </Select>
        </Form.Item>
        {isEditing && (
           <Form.Item
            name='status'
            label='Trạng thái'
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value={Status.TODO}>Cần làm</Option>
              <Option value={Status.IN_PROGRESS}>Đang làm</Option>
              <Option value={Status.DONE}>Hoàn thành</Option>
            </Select>
          </Form.Item>
        )}
        <Form.Item
          name='tags'
          label='Tags'
        >
          <Select mode='tags' placeholder='Nhập các tags' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm;