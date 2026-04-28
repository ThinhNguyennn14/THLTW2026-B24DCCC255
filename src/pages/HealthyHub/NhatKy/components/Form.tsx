import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from 'antd';
import moment from 'moment';
import { useModel } from 'umi';

const WorkoutForm = ({ visible, onCancel, record }: any) => {
  const [form] = Form.useForm();
  const { addWorkout, updateWorkout } = useModel('healthy');

  useEffect(() => {
    if (visible) {
      if (record) {
        form.setFieldsValue({
          ...record,
          date: record.date ? moment(record.date) : moment(),
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          date: moment(),
          status: 'Hoàn thành'
        });
      }
    }
  }, [visible, record, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...record,
        ...values,
        date: values.date.toDate().toISOString(),
      };
      if (record) {
        if(updateWorkout) updateWorkout(record._id, payload);
        message.success('Cập nhật thành công!');
      } else {
        if(addWorkout) addWorkout({ ...payload, _id: Date.now().toString() });
        message.success('Thêm mới thành công!');
      }
      onCancel();
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <Modal
      title={<div style={{ fontSize: 18, fontWeight: 'bold' }}>{record ? "✏️ Sửa buổi tập" : "✨ Thêm buổi tập mới"}</div>}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ style: { borderRadius: 6 } }}
      cancelButtonProps={{ style: { borderRadius: 6 } }}
      centered
    >
      <Form form={form} layout="vertical" name="workout_form" style={{ marginTop: 16 }}>
        <Form.Item name="date" label={<span style={{ fontWeight: 500 }}>Ngày tập</span>} rules={[{ required: true, message: 'Vui lòng chọn ngày tập!' }]}> 
          <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" allowClear={false} />
        </Form.Item>
        <Form.Item name="exerciseType" label={<span style={{ fontWeight: 500 }}>Loại bài tập</span>} rules={[{ required: true, message: 'Vui lòng chọn loại bài tập!' }]}>
          <Select placeholder="Chọn loại bài tập">
            <Select.Option value="Cardio">Cardio</Select.Option>
            <Select.Option value="Strength">Strength</Select.Option>
            <Select.Option value="Yoga">Yoga</Select.Option>
            <Select.Option value="HIIT">HIIT</Select.Option>
            <Select.Option value="Other">Other</Select.Option>
          </Select>
        </Form.Item>
        <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="durationMinutes" label={<span style={{ fontWeight: 500 }}>Thời lượng (phút)</span>} rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%', borderRadius: 6 }} placeholder="VD: 30" />
            </Form.Item>
            <Form.Item name="caloriesBurned" label={<span style={{ fontWeight: 500 }}>Calo đã đốt (kcal)</span>} rules={[{ required: true, message: 'Vui lòng nhập số calo!' }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%', borderRadius: 6 }} placeholder="VD: 250" />
            </Form.Item>
        </div>
        <Form.Item name="status" label={<span style={{ fontWeight: 500 }}>Trạng thái</span>} rules={[{ required: true }]}>
          <Select>
            <Select.Option value="Hoàn thành"><span style={{ color: '#52c41a', fontWeight: 500 }}>Hoàn thành</span></Select.Option>
            <Select.Option value="Bỏ lỡ"><span style={{ color: '#f5222d', fontWeight: 500 }}>Bỏ lỡ</span></Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="notes" label={<span style={{ fontWeight: 500 }}>Ghi chú</span>}>
          <Input.TextArea rows={3} placeholder="Nhập ghi chú cảm nhận buổi tập..." style={{ borderRadius: 6 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WorkoutForm;
