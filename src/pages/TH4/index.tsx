import React, { useState } from 'react';
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Card,
  Row,
  Col,
  message,
  Space,
  Popconfirm,
  InputNumber,
  Descriptions,
  Tooltip,
} from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';

const { TabPane } = Tabs;
const { Option } = Select;

interface DiplomaBook {
  key: number;
  year: number;
  name: string;
  lastEntryNumber: number;
}

interface GraduationDecision {
  key: React.Key;
  decisionNumber: string;
  issueDate: moment.Moment;
  abstract: string;
  diplomaBookYear: number;
  lookupCount: number;
}

interface CustomField {
  key: React.Key;
  fieldName: string;
  dataType: 'String' | 'Number' | 'Date';
}

interface Diploma {
  key: React.Key;
  entryNumber: number;
  diplomaNumber: string;
  studentId: string;
  fullName: string;
  dateOfBirth: moment.Moment;
  decisionKey: React.Key;
  diplomaBookYear: number;
  [key: string]: any;
}

const initialDiplomaBooks: DiplomaBook[] = [
    { key: 2023, year: 2023, name: 'Sổ văn bằng năm 2023', lastEntryNumber: 2 },
    { key: 2024, year: 2024, name: 'Sổ văn bằng năm 2024', lastEntryNumber: 0 },
];

const initialDecisions: GraduationDecision[] = [
    { key: 'QD-01', decisionNumber: 'QD-01', issueDate: moment('2023-10-20'), abstract: 'Quyết định tốt nghiệp đợt 1 năm 2023', diplomaBookYear: 2023, lookupCount: 15 },
];

const initialCustomFields: CustomField[] = [
    { key: 1, fieldName: 'Nơi sinh', dataType: 'String' },
    { key: 2, fieldName: 'Điểm trung bình', dataType: 'Number' },
    { key: 3, fieldName: 'Xếp hạng', dataType: 'String' },
];

const initialDiplomas: Diploma[] = [
    { 
        key: 'VB-2023-001', 
        entryNumber: 1, 
        diplomaNumber: 'VB-2023-001', 
        studentId: 'SV001', 
        fullName: 'Nguyễn Văn An', 
        dateOfBirth: moment('2001-01-15'), 
        decisionKey: 'QD-01',
        diplomaBookYear: 2023,
        'Nơi sinh': 'Hà Nội',
        'Điểm trung bình': 8.5,
        'Xếp hạng': 'Giỏi',
    },
    { 
        key: 'VB-2023-002', 
        entryNumber: 2, 
        diplomaNumber: 'VB-2023-002', 
        studentId: 'SV002', 
        fullName: 'Trần Thị Bình', 
        dateOfBirth: moment('2001-05-20'), 
        decisionKey: 'QD-01',
        diplomaBookYear: 2023,
        'Nơi sinh': 'Hồ Chí Minh',
        'Điểm trung bình': 7.8,
        'Xếp hạng': 'Khá',
    },
];

const TH4 = () => {
  const [diplomaBooks, setDiplomaBooks] = useState<DiplomaBook[]>(initialDiplomaBooks);
  const [decisions, setDecisions] = useState<GraduationDecision[]>(initialDecisions);
  const [customFields, setCustomFields] = useState<CustomField[]>(initialCustomFields);
  const [diplomas, setDiplomas] = useState<Diploma[]>(initialDiplomas);

  const [isBookModalVisible, setIsBookModalVisible] = useState(false);
  const [isDecisionModalVisible, setIsDecisionModalVisible] = useState(false);
  const [isFieldModalVisible, setIsFieldModalVisible] = useState(false);
  const [isDiplomaModalVisible, setIsDiplomaModalVisible] = useState(false);

  const [editingDecision, setEditingDecision] = useState<GraduationDecision | null>(null);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [editingDiploma, setEditingDiploma] = useState<Diploma | null>(null);
  
  const [selectedDecisionForDiplomas, setSelectedDecisionForDiplomas] = useState<React.Key | null>(decisions.length > 0 ? decisions[0].key : null);

  const [searchResult, setSearchResult] = useState<{ diploma: Diploma, decision: GraduationDecision } | null>(null);

  const [bookForm] = Form.useForm();
  const [decisionForm] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const [diplomaForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  const handleAddBook = () => {
    bookForm.resetFields();
    setIsBookModalVisible(true);
  };

  const handleBookOk = () => {
    bookForm.validateFields().then(values => {
      if (diplomaBooks.some(b => b.year === values.year)) {
          message.error(`Sổ văn bằng cho năm ${values.year} đã tồn tại!`);
          return;
      }
      const newBook: DiplomaBook = {
        key: values.year,
        year: values.year,
        name: `Sổ văn bằng năm ${values.year}`,
        lastEntryNumber: 0,
      };
      setDiplomaBooks([...diplomaBooks, newBook].sort((a, b) => b.year - a.year));
      setIsBookModalVisible(false);
      message.success('Mở sổ văn bằng mới thành công!');
    });
  };

  const handleAddDecision = () => {
    setEditingDecision(null);
    decisionForm.resetFields();
    setIsDecisionModalVisible(true);
  };
  
  const handleEditDecision = (record: GraduationDecision) => {
    setEditingDecision(record);
    decisionForm.setFieldsValue({ ...record, issueDate: record.issueDate ? moment(record.issueDate) : null });
    setIsDecisionModalVisible(true);
  };

  const handleDeleteDecision = (key: React.Key) => {
    if (diplomas.some(d => d.decisionKey === key)) {
        message.error('Không thể xóa quyết định đã có văn bằng. Vui lòng xóa các văn bằng liên quan trước.');
        return;
    }
    setDecisions(decisions.filter(d => d.key !== key));
    message.success('Xóa quyết định thành công!');
  };

  const handleDecisionOk = () => {
    decisionForm.validateFields().then(values => {
      if (editingDecision) {
        setDecisions(decisions.map(d => d.key === editingDecision.key ? { ...editingDecision, ...values } : d));
        message.success('Cập nhật quyết định thành công!');
      } else {
        if (decisions.some(d => d.decisionNumber === values.decisionNumber)) {
            message.error('Số quyết định đã tồn tại!');
            return;
        }
        const newDecision: GraduationDecision = { ...values, key: values.decisionNumber, lookupCount: 0 };
        setDecisions([...decisions, newDecision]);
        message.success('Thêm quyết định thành công!');
      }
      setIsDecisionModalVisible(false);
    });
  };

  const handleAddField = () => {
    setEditingField(null);
    fieldForm.resetFields();
    setIsFieldModalVisible(true);
  };

  const handleEditField = (record: CustomField) => {
    setEditingField(record);
    fieldForm.setFieldsValue(record);
    setIsFieldModalVisible(true);
  };

  const handleDeleteField = (key: React.Key) => {
    const fieldToDelete = customFields.find(f => f.key === key);
    if (fieldToDelete && diplomas.some(d => d.hasOwnProperty(fieldToDelete.fieldName))) {
        message.error(`Không thể xóa trường "${fieldToDelete.fieldName}" vì đã có dữ liệu văn bằng sử dụng.`);
        return;
    }
    setCustomFields(customFields.filter(f => f.key !== key));
    message.success('Xóa trường thông tin thành công!');
  };

  const handleFieldOk = () => {
    fieldForm.validateFields().then(values => {
      if (customFields.some(f => f.fieldName.toLowerCase() === values.fieldName.toLowerCase() && f.key !== editingField?.key)) {
          message.error('Tên trường đã tồn tại!');
          return;
      }
      if (editingField) {
        setCustomFields(customFields.map(f => f.key === editingField.key ? { ...editingField, ...values } : f));
        message.success('Cập nhật trường thành công!');
      } else {
        const newField: CustomField = { ...values, key: Date.now() };
        setCustomFields([...customFields, newField]);
        message.success('Thêm trường thành công!');
      }
      setIsFieldModalVisible(false);
    });
  };

  const handleAddDiploma = () => {
    const decision = decisions.find(d => d.key === selectedDecisionForDiplomas);
    const book = diplomaBooks.find(b => b.year === decision?.diplomaBookYear);
    if (!decision || !book) {
        message.error('Không tìm thấy sổ văn bằng hoặc quyết định tương ứng.');
        return;
    }
    
    const nextEntryNumber = book.lastEntryNumber + 1;
    setEditingDiploma(null);
    diplomaForm.resetFields();
    diplomaForm.setFieldsValue({ entryNumber: nextEntryNumber });
    setIsDiplomaModalVisible(true);
  };

  const handleEditDiploma = (record: Diploma) => {
    setEditingDiploma(record);
    const values: { [key: string]: any } = { ...record, dateOfBirth: record.dateOfBirth ? moment(record.dateOfBirth) : null };
    customFields.forEach(field => {
        if (field.dataType === 'Date' && record[field.fieldName]) {
            values[field.fieldName] = moment(record[field.fieldName]);
        }
    });
    diplomaForm.setFieldsValue(values);
    setIsDiplomaModalVisible(true);
  };

  const handleDeleteDiploma = (key: React.Key) => {
    setDiplomas(diplomas.filter(d => d.key !== key));
    message.success('Xóa văn bằng thành công!');
  };

  const handleDiplomaOk = () => {
    diplomaForm.validateFields().then(values => {
        const decision = decisions.find(d => d.key === selectedDecisionForDiplomas);
        if (!decision) return;

        if (editingDiploma) {
            setDiplomas(diplomas.map(d => d.key === editingDiploma.key ? { ...editingDiploma, ...values } : d));
            message.success('Cập nhật văn bằng thành công!');
        } else {
            const book = diplomaBooks.find(b => b.year === decision.diplomaBookYear);
            if (!book) return;
            if (diplomas.some(d => d.diplomaNumber === values.diplomaNumber)) {
                message.error('Số hiệu văn bằng đã tồn tại!');
                return;
            }
            const newDiploma: Diploma = { ...values, key: values.diplomaNumber, decisionKey: selectedDecisionForDiplomas, diplomaBookYear: decision.diplomaBookYear };
            setDiplomas([...diplomas, newDiploma]);
            setDiplomaBooks(diplomaBooks.map(b => b.key === book.key ? { ...b, lastEntryNumber: b.lastEntryNumber + 1 } : b));
            message.success('Thêm văn bằng thành công!');
        }
        setIsDiplomaModalVisible(false);
    });
  };

  const handleSearch = (values: any) => {
    const filledFields = Object.entries(values).filter(([_, value]) => value !== undefined && value !== '' && value !== null);
    if (filledFields.length < 2) {
        message.error('Vui lòng nhập ít nhất 2 tham số tìm kiếm.');
        return;
    }

    const foundDiploma = diplomas.find(diploma => {
        return filledFields.every(([key, value]) => {
            if (key === 'dateOfBirth' && diploma[key]) return (diploma[key] as moment.Moment).isSame(value as moment.Moment, 'day');
            if (typeof diploma[key] === 'string') return (diploma[key] as string).toLowerCase().includes((value as string).toLowerCase());
            return diploma[key] == value;
        });
    });

    if (foundDiploma) {
        const foundDecision = decisions.find(d => d.key === foundDiploma.decisionKey);
        if (foundDecision) {
            setSearchResult({ diploma: foundDiploma, decision: foundDecision });
            setDecisions(decisions.map(d => d.key === foundDecision.key ? { ...d, lookupCount: d.lookupCount + 1 } : d));
            message.success('Đã tìm thấy văn bằng.');
        }
    } else {
        setSearchResult(null);
        message.info('Không tìm thấy văn bằng nào phù hợp.');
    }
  };

  const diplomaTableColumns: ColumnsType<Diploma> = [
    { title: 'Số vào sổ', dataIndex: 'entryNumber', key: 'entryNumber', sorter: (a: Diploma, b: Diploma) => a.entryNumber - b.entryNumber, fixed: 'left', width: 100 },
    { title: 'Số hiệu VB', dataIndex: 'diplomaNumber', key: 'diplomaNumber', fixed: 'left', width: 150 },
    { title: 'Mã SV', dataIndex: 'studentId', key: 'studentId', width: 120 },
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName', width: 200 },
    { title: 'Ngày sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth', render: (date: moment.Moment) => date ? date.format('DD/MM/YYYY') : '', width: 120 },
    ...customFields.map(field => ({
        title: field.fieldName,
        dataIndex: field.fieldName,
        key: field.fieldName,
        render: (value: any) => field.dataType === 'Date' && value ? moment(value).format('DD/MM/YYYY') : value,
        width: 150,
    })),
    {
        title: 'Hành động', key: 'action', fixed: 'right', width: 120,
        render: (_: any, record: Diploma) => (
            <Space size="middle">
                <a onClick={() => handleEditDiploma(record)}>Sửa</a>
                <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDeleteDiploma(record.key)}><a>Xóa</a></Popconfirm>
            </Space>
        ),
    },
  ];

  const renderCustomFormFields = () => customFields.map(field => {
    let inputNode;
    switch (field.dataType) {
        case 'Number': inputNode = <InputNumber style={{ width: '100%' }} />; break;
        case 'Date': inputNode = <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />; break;
        default: inputNode = <Input />;
    }
    return (
        <Col span={12} key={field.key}>
            <Form.Item name={field.fieldName} label={field.fieldName}>{inputNode}</Form.Item>
        </Col>
    );
  });

  return (
    <div style={{ padding: '24px', background: '#f0f2f5' }}>
        <Card title="Hệ thống quản lý và tra cứu văn bằng tốt nghiệp" headStyle={{ fontSize: '30px', fontWeight: 'bold' }}>
            <Tabs defaultActiveKey="2" type="line">
                <TabPane tab="Quản trị hệ thống" key="1">
                    <Tabs type="card">
                        <TabPane tab="Sổ văn bằng" key="admin-1">
                            <Button onClick={handleAddBook} type="primary" style={{ marginBottom: 16 }}>Mở sổ mới</Button>
                            <Table dataSource={diplomaBooks} columns={[{ title: 'Năm', dataIndex: 'year', key: 'year', sorter: (a,b) => a.year - b.year }, { title: 'Tên sổ', dataIndex: 'name', key: 'name' }, { title: 'Số VB đã cấp', dataIndex: 'lastEntryNumber', key: 'lastEntryNumber' }]} bordered title={() => 'Danh sách các sổ văn bằng'} />
                        </TabPane>
                        <TabPane tab="Quyết định tốt nghiệp" key="admin-2">
                            <Button onClick={handleAddDecision} type="primary" style={{ marginBottom: 16 }}>Thêm quyết định</Button>
                            <Table dataSource={decisions} columns={[{ title: 'Số QĐ', dataIndex: 'decisionNumber', key: 'decisionNumber' }, { title: 'Ngày ban hành', dataIndex: 'issueDate', key: 'issueDate', render: (date: moment.Moment) => date ? date.format('DD/MM/YYYY') : '' }, { title: 'Trích yếu', dataIndex: 'abstract', key: 'abstract' }, { title: 'Thuộc sổ năm', dataIndex: 'diplomaBookYear', key: 'diplomaBookYear' }, { title: 'Lượt tra cứu', dataIndex: 'lookupCount', key: 'lookupCount' }, { title: 'Hành động', key: 'action', render: (_: any, record: GraduationDecision) => (<Space size="middle"><a onClick={() => handleEditDecision(record)}>Sửa</a><Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDeleteDecision(record.key)}><a>Xóa</a></Popconfirm></Space>) }]} bordered title={() => 'Danh sách các quyết định tốt nghiệp'} />
                        </TabPane>
                        <TabPane tab="Cấu hình biểu mẫu" key="admin-3">
                            <Button onClick={handleAddField} type="primary" style={{ marginBottom: 16 }}>Thêm trường thông tin</Button>
                            <Table dataSource={customFields} columns={[{ title: 'Tên trường', dataIndex: 'fieldName', key: 'fieldName' }, { title: 'Kiểu dữ liệu', dataIndex: 'dataType', key: 'dataType' }, { title: 'Hành động', key: 'action', render: (_: any, record: CustomField) => (<Space size="middle"><a onClick={() => handleEditField(record)}>Sửa</a><Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDeleteField(record.key)}><a>Xóa</a></Popconfirm></Space>) }]} bordered title={() => 'Các trường thông tin tùy chỉnh trên văn bằng'} />
                        </TabPane>
                        <TabPane tab="Quản lý văn bằng" key="admin-4">
                            <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
                                <span>Chọn quyết định:</span>
                                <Select style={{ width: 300 }} value={selectedDecisionForDiplomas} onChange={value => setSelectedDecisionForDiplomas(value)} placeholder="Chọn một quyết định">
                                    {decisions.map(d => <Option key={d.key} value={d.key}>{`${d.decisionNumber} - ${d.abstract}`}</Option>)}
                                </Select>
                                <Button onClick={handleAddDiploma} type="primary" disabled={!selectedDecisionForDiplomas}>Thêm văn bằng</Button>
                            </Space>
                            <Table dataSource={diplomas.filter(d => d.decisionKey === selectedDecisionForDiplomas)} columns={diplomaTableColumns} bordered title={() => `Danh sách văn bằng thuộc quyết định ${selectedDecisionForDiplomas || ''}`} scroll={{ x: 'max-content' }} />
                        </TabPane>
                    </Tabs>
                </TabPane>
                <TabPane tab="Tra cứu văn bằng" key="2">
                    <Row gutter={16}>
                        <Col xs={24} md={10}>
                            <Card title="Thông tin tra cứu">
                                <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
                                    <Tooltip title="Yêu cầu nhập ít nhất 2 trường để tra cứu"><p>Nhập thông tin và nhấn "Tra cứu".</p></Tooltip>
                                    <Form.Item name="diplomaNumber" label="Số hiệu văn bằng"><Input /></Form.Item>
                                    <Form.Item name="entryNumber" label="Số vào sổ"><InputNumber style={{ width: '100%' }} /></Form.Item>
                                    <Form.Item name="studentId" label="Mã sinh viên (MSV)"><Input /></Form.Item>
                                    <Form.Item name="fullName" label="Họ và tên"><Input /></Form.Item>
                                    <Form.Item name="dateOfBirth" label="Ngày sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item>
                                    <Form.Item><Button type="primary" htmlType="submit">Tra cứu</Button></Form.Item>
                                </Form>
                            </Card>
                        </Col>
                        <Col xs={24} md={14}>
                            <Card title="Kết quả tra cứu">
                                {searchResult ? (
                                    <Descriptions bordered column={1} title="Thông tin chi tiết văn bằng">
                                        <Descriptions.Item label="Họ và tên">{searchResult.diploma.fullName}</Descriptions.Item>
                                        <Descriptions.Item label="Ngày sinh">{searchResult.diploma.dateOfBirth.format('DD/MM/YYYY')}</Descriptions.Item>
                                        <Descriptions.Item label="Mã sinh viên">{searchResult.diploma.studentId}</Descriptions.Item>
                                        <Descriptions.Item label="Số hiệu văn bằng">{searchResult.diploma.diplomaNumber}</Descriptions.Item>
                                        <Descriptions.Item label="Số vào sổ">{searchResult.diploma.entryNumber}</Descriptions.Item>
                                        <Descriptions.Item label="Thuộc sổ năm">{searchResult.diploma.diplomaBookYear}</Descriptions.Item>
                                        <Descriptions.Item label="Quyết định tốt nghiệp số">{searchResult.decision.decisionNumber}</Descriptions.Item>
                                        <Descriptions.Item label="Ngày ban hành QĐ">{searchResult.decision.issueDate.format('DD/MM/YYYY')}</Descriptions.Item>
                                        {customFields.map(field => searchResult.diploma[field.fieldName] && <Descriptions.Item key={field.key} label={field.fieldName}>{searchResult.diploma[field.fieldName]}</Descriptions.Item>)}
                                    </Descriptions>
                                ) : <p>Chưa có kết quả tra cứu.</p>}
                            </Card>
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>
        </Card>

        <Modal title="Mở sổ văn bằng mới" visible={isBookModalVisible} onOk={handleBookOk} onCancel={() => setIsBookModalVisible(false)}>
            <Form form={bookForm} layout="vertical"><Form.Item name="year" label="Năm" rules={[{ required: true, message: 'Vui lòng nhập năm!' }]}><InputNumber min={2000} max={2100} style={{ width: '100%' }} /></Form.Item></Form>
        </Modal>
        <Modal title={editingDecision ? 'Chỉnh sửa quyết định' : 'Thêm quyết định mới'} visible={isDecisionModalVisible} onOk={handleDecisionOk} onCancel={() => setIsDecisionModalVisible(false)} width={600}>
            <Form form={decisionForm} layout="vertical">
                <Form.Item name="decisionNumber" label="Số quyết định" rules={[{ required: true }]}><Input disabled={!!editingDecision} /></Form.Item>
                <Form.Item name="issueDate" label="Ngày ban hành" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item>
                <Form.Item name="abstract" label="Trích yếu" rules={[{ required: true }]}><Input.TextArea /></Form.Item>
                <Form.Item name="diplomaBookYear" label="Thuộc sổ văn bằng năm" rules={[{ required: true }]}>
                    <Select placeholder="Chọn sổ văn bằng">{diplomaBooks.map(b => <Option key={b.key} value={b.year}>{b.name}</Option>)}</Select>
                </Form.Item>
            </Form>
        </Modal>
        <Modal title={editingField ? 'Chỉnh sửa trường' : 'Thêm trường thông tin'} visible={isFieldModalVisible} onOk={handleFieldOk} onCancel={() => setIsFieldModalVisible(false)}>
            <Form form={fieldForm} layout="vertical">
                <Form.Item name="fieldName" label="Tên trường" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="dataType" label="Kiểu dữ liệu" rules={[{ required: true }]}>
                    <Select><Option value="String">String (Chữ)</Option><Option value="Number">Number (Số)</Option><Option value="Date">Date (Ngày tháng)</Option></Select>
                </Form.Item>
            </Form>
        </Modal>
        <Modal title={editingDiploma ? 'Chỉnh sửa văn bằng' : 'Thêm văn bằng mới'} visible={isDiplomaModalVisible} onOk={handleDiplomaOk} onCancel={() => setIsDiplomaModalVisible(false)} width={800}>
            <Form form={diplomaForm} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="entryNumber" label="Số vào sổ"><InputNumber disabled style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="diplomaNumber" label="Số hiệu văn bằng" rules={[{ required: true }]}><Input disabled={!!editingDiploma} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="studentId" label="Mã sinh viên" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
                    {renderCustomFormFields()}
                </Row>
            </Form>
        </Modal>
    </div>
  );
};

export default TH4;