import React, { useEffect } from 'react';
import { Drawer, Form, Input, Button, InputNumber, Select, DatePicker, Space } from 'antd';
import moment from 'moment';

interface GoalFormProps {
  visible: boolean;
  onClose: () => void;
  record: HealthyHub.Goal | null;
  onFinish: (values: any) => void;
}

const { Option } = Select;

const GoalDrawerForm: React.FC<GoalFormProps> = ({ visible, onClose, record, onFinish }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          ...record,
          deadline: record.deadline ? moment(record.deadline) : null,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 'Đang thực hiện',
          currentValue: 0,
        });
      }
    }
  }, [visible, record, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = {
          ...values,
          deadline: values.deadline ? values.deadline.toISOString() : null,
        };
        onFinish(payload);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Drawer
      title={record ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu mới'}
      width={400}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} type="primary">
            Lưu
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" hideRequiredMark>
        <Form.Item
          name="name"
          label="Tên mục tiêu"
          rules={[{ required: true, message: 'Vui lòng nhập tên mục tiêu' }]}
        >
          <Input placeholder="Vd: Giảm 5kg trong 1 tháng" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Loại mục tiêu"
          rules={[{ required: true, message: 'Vui lòng chọn loại mục tiêu' }]}
        >
          <Select placeholder="Chọn loại mục tiêu">
            <Option value="Giảm cân">Giảm cân</Option>
            <Option value="Tăng cơ">Tăng cơ</Option>
            <Option value="Cải thiện sức bền">Cải thiện sức bền</Option>
            <Option value="Khác">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="targetValue"
          label="Giá trị mục tiêu"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị mục tiêu' }]}
        >
          <InputNumber style={{ width: '100%' }} min={1} placeholder="Vd: 5" />
        </Form.Item>

        <Form.Item
          name="currentValue"
          label="Giá trị hiện tại"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị hiện tại' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item
          name="deadline"
          label="Thời hạn (Deadline)"
          rules={[{ required: true, message: 'Vui lòng chọn thời hạn' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="Đang thực hiện">Đang thực hiện</Option>
            <Option value="Đã đạt">Đã đạt</Option>
            <Option value="Đã hủy">Đã hủy</Option>
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default GoalDrawerForm;
