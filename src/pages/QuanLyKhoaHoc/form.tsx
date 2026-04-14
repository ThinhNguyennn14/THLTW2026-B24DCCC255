import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { KhoaHoc } from '../../services/QuanLyKhoaHoc/typing';
import { TrangThaiKhoaHoc } from '../../services/QuanLyKhoaHoc/constants';
import { danhSachGiangVien, quanLyKhoaHocService } from '../../models/khoahoc';

interface CourseFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialData: KhoaHoc | null;
}

const { Option } = Select;

const CourseForm: React.FC<CourseFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  initialData,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;

  useEffect(() => {
    if (visible) {
      if (isEditing) {
        form.setFieldsValue(initialData);
      } else {
        form.resetFields();
        form.setFieldsValue({
          soLuongHocVien: 0,
          trangThai: TrangThaiKhoaHoc.DANG_MO,
        });
      }
    }
  }, [visible, initialData, form, isEditing]);

  const handleFinish = async (
    values: Omit<KhoaHoc, 'id'>
  ) => {
    try {
      if (isEditing && initialData) {
        await quanLyKhoaHocService.capNhatKhoaHoc(
          initialData.id,
          values
        );
        message.success('Cập nhật khóa học thành công!');
      } else {
        await quanLyKhoaHocService.themKhoaHoc(
          values
        );
        message.success('Thêm khóa học thành công!');
      }
      onSuccess();
    } catch (error: any) {
      message.error(
        error.message || 'Đã có lỗi xảy ra.'
      );
    }
  };

  return (
    <Modal
      title={
        isEditing
          ? 'Chỉnh sửa khóa học'
          : 'Thêm khóa học mới'
      }
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={
        isEditing ? 'Cập nhật' : 'Thêm mới'
      }
      cancelText="Hủy"
      destroyOnClose
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        name="courseForm"
      >
        <Form.Item
          name="tenKhoaHoc"
          label="Tên khóa học"
          rules={[
            {
              required: true,
              message:
                'Vui lòng nhập tên khóa học!',
            },
            {
              max: 100,
              message:
                'Tên khóa học không được vượt quá 100 ký tự!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="giangVien"
          label="Giảng viên"
          rules={[
            {
              required: true,
              message:
                'Vui lòng chọn giảng viên!',
            },
          ]}
        >
          <Select placeholder="Chọn giảng viên">
            {danhSachGiangVien.map(gv => (
              <Option key={gv} value={gv}>
                {gv}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="soLuongHocVien"
          label="Số lượng học viên"
          rules={[
            {
              required: true,
              message:
                'Vui lòng nhập số lượng học viên!',
            },
          ]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            disabled={isEditing}
          />
        </Form.Item>

        <Form.Item
          name="moTa"
          label="Mô tả (HTML)"
        >
          <Input.TextArea
            rows={4}
            placeholder="Nhập mô tả dưới dạng mã HTML"
          />
        </Form.Item>

        <Form.Item
          name="trangThai"
          label="Trạng thái"
        >
          <Select>
            {Object.values(
              TrangThaiKhoaHoc
            ).map(status => (
              <Option
                key={status}
                value={status}
              >
                {status}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CourseForm;