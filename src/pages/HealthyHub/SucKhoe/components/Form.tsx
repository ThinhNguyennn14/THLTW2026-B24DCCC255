import { useEffect } from 'react';
import { Modal, Form, InputNumber, DatePicker, message, Typography, Row, Col } from 'antd';
import moment from 'moment';
import { useModel } from 'umi';

const { Text } = Typography;

const HealthForm = ({ visible, onCancel, record }: any) => {
  const [form] = Form.useForm();
  const { addHealthMetric, updateHealthMetric } = useModel('healthy');

  // Theo dõi giá trị cân nặng, chiều cao để tính BMI trực tiếp trên Form
  const weight = Form.useWatch('weight', form);
  const height = Form.useWatch('height', form);
  const bmi = (weight && height) ? ((weight / Math.pow(height / 100, 2)).toFixed(1)) : null;

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
        if(updateHealthMetric) updateHealthMetric(record._id, payload);
        message.success('Cập nhật thành công!');
      } else {
        if(addHealthMetric) addHealthMetric({ ...payload, _id: Date.now().toString() });
        message.success('Thêm mới thành công!');
      }
      onCancel();
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <Modal
      title={<div style={{ fontSize: 18, fontWeight: 'bold' }}>{record ? "✏️ Sửa chỉ số" : "✨ Thêm chỉ số sức khỏe"}</div>}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ style: { borderRadius: 6 } }}
      cancelButtonProps={{ style: { borderRadius: 6 } }}
      centered
    >
      <Form form={form} layout="vertical" name="health_form" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="date" label={<span style={{ fontWeight: 500 }}>Ngày ghi nhận</span>} rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}> 
              <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" allowClear={false} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="weight" label={<span style={{ fontWeight: 500 }}>Cân nặng (kg)</span>} rules={[{ required: true, message: 'Nhập cân nặng!' }]}>
              <InputNumber min={1} style={{ width: '100%', borderRadius: 6 }} placeholder="VD: 65" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="height" label={<span style={{ fontWeight: 500 }}>Chiều cao (cm)</span>} rules={[{ required: true, message: 'Nhập chiều cao!' }]}>
              <InputNumber min={1} style={{ width: '100%', borderRadius: 6 }} placeholder="VD: 170" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="restingHeartRate" label={<span style={{ fontWeight: 500 }}>Nhịp tim nghỉ (bpm)</span>} rules={[{ required: true, message:'Nhập nhịp tim!' }]}>
              <InputNumber min={30} max={200} style={{ width: '100%', borderRadius: 6 }} placeholder="VD: 75" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="sleepHours" label={<span style={{ fontWeight: 500 }}>Giờ ngủ (h)</span>} rules={[{ required: true, message:'Nhập giờ ngủ!' }]}>
              <InputNumber min={0} max={24} step={0.5} style={{ width: '100%', borderRadius: 6 }} placeholder="VD: 8" />
            </Form.Item>
          </Col>
        </Row>
        {bmi && (
          <div style={{ padding: '12px 16px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>BMI Dự kiến:</Text> 
            <Text strong type="success" style={{ fontSize: 16 }}>{bmi}</Text>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default HealthForm;
