import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Row,
  Col,
  Select,
  Modal,
  message,
  Tag,
  Typography,
} from 'antd';
import { ColumnsType, SorterResult } from 'antd/es/table/interface';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { KhoaHoc } from '../../services/QuanLyKhoaHoc/typing';
import { TrangThaiKhoaHoc } from '../../services/QuanLyKhoaHoc/constants';
import { quanLyKhoaHocService, danhSachGiangVien } from '../../models/khoahoc';
import CourseForm from './form';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

type SortOrder = 'asc' | 'desc' | undefined;

const QuanLyKhoaHocPage: React.FC = () => {
  const [courses, setCourses] = useState<KhoaHoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<KhoaHoc | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGiangVien, setFilterGiangVien] = useState<string | undefined>(undefined);
  const [filterTrangThai, setFilterTrangThai] = useState<TrangThaiKhoaHoc | undefined>(undefined);
  const [sortBySoLuongHocVien, setSortBySoLuongHocVien] = useState<SortOrder>(undefined);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    try {
      const data = quanLyKhoaHocService.layDanhSachKhoaHoc({
        searchTerm,
        filterGiangVien,
        filterTrangThai,
        sortBySoLuongHocVien,
      });
      setCourses(data);
    } catch (error) {
      message.error('Không thể tải danh sách khóa học.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterGiangVien, filterTrangThai, sortBySoLuongHocVien]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleTableChange = (
    pagination: any,
    filters: any,
    sorter: SorterResult<KhoaHoc> | SorterResult<KhoaHoc>[]
  ) => {
    if (!Array.isArray(sorter) && sorter.field === 'soLuongHocVien') {
      const order =
        sorter.order
          ? sorter.order === 'ascend'
            ? 'asc'
            : 'desc'
          : undefined;

      setSortBySoLuongHocVien(order);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa khóa học này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          quanLyKhoaHocService.xoaKhoaHoc(id);
          message.success('Xóa khóa học thành công!');
          fetchCourses();
        } catch (error: any) {
          message.error(error.message || 'Đã có lỗi xảy ra khi xóa.');
        }
      },
    });
  };

  const handleAdd = () => {
    setEditingCourse(null);
    setIsFormVisible(true);
  };

  const handleEdit = (course: KhoaHoc) => {
    setEditingCourse(course);
    setIsFormVisible(true);
  };

  const handleFormSuccess = () => {
    setIsFormVisible(false);
    fetchCourses();
  };

  const columns: ColumnsType<KhoaHoc> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên khóa học',
      dataIndex: 'tenKhoaHoc',
      key: 'tenKhoaHoc',
      ellipsis: true,
    },
    {
      title: 'Giảng viên',
      dataIndex: 'giangVien',
      key: 'giangVien',
      width: 150,
    },
    {
      title: 'Số lượng học viên',
      dataIndex: 'soLuongHocVien',
      key: 'soLuongHocVien',
      sorter: true,
      sortOrder: sortBySoLuongHocVien
        ? sortBySoLuongHocVien === 'asc'
          ? 'ascend'
          : 'descend'
        : undefined,
      width: 180,
      align: 'right',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 150,
      render: (status: TrangThaiKhoaHoc) => {
        let color = 'default';

        if (status === TrangThaiKhoaHoc.DANG_MO) color = 'green';
        if (status === TrangThaiKhoaHoc.DA_KET_THUC) color = 'red';
        if (status === TrangThaiKhoaHoc.TAM_DUNG) color = 'orange';

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'moTa',
      key: 'moTa',
      ellipsis: true,
      render: (html: string) => (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        Quản lý khóa học Online
      </Title>

      <Row
        gutter={[16, 16]}
        style={{ marginBottom: 24 }}
      >
        <Col xs={24} sm={12} md={8} lg={6}>
          <Search
            placeholder="Tìm kiếm theo tên khóa học"
            onSearch={value =>
              setSearchTerm(value)
            }
            onChange={e => {
              if (e.target.value === '')
                setSearchTerm('');
            }}
            allowClear
            enterButton
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={5}>
          <Select
            placeholder="Lọc theo giảng viên"
            style={{ width: '100%' }}
            onChange={value =>
              setFilterGiangVien(value)
            }
            allowClear
          >
            {danhSachGiangVien.map(gv => (
              <Option key={gv} value={gv}>
                {gv}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={5}>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: '100%' }}
            onChange={value =>
              setFilterTrangThai(value)
            }
            allowClear
          >
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
        </Col>

        <Col
          xs={24}
          sm={12}
          md={24}
          lg={8}
          style={{ textAlign: 'right' }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm khóa học
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
      />

      {isFormVisible && (
        <CourseForm
          visible={isFormVisible}
          onCancel={() =>
            setIsFormVisible(false)
          }
          onSuccess={handleFormSuccess}
          initialData={editingCourse}
        />
      )}
    </div>
  );
};

export default QuanLyKhoaHocPage;