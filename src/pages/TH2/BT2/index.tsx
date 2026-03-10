import { useState, useMemo } from 'react';
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Typography,
  Space,
  InputNumber,
  notification,
  Row,
  Col,
  List,
  Tag,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

// --- Mock Data ---
const mockKnowledgeBlocks = [
  { id: 1, name: 'Tổng quan' },
  { id: 2, name: 'Chuyên sâu' },
  { id: 3, name: 'Nâng cao' },
];

const initialSubjects = [
  { id: 1, code: 'CS101', name: 'Nhập môn Lập trình', credits: 3 },
  { id: 2, code: 'DB202', name: 'Cơ sở dữ liệu', credits: 3 },
  { id: 3, code: 'NW301', name: 'Mạng máy tính', credits: 4 },
];

const initialQuestions = [
    { id: 1, subjectId: 1, knowledgeBlockId: 1, content: 'Trình bày khái niệm về biến và kiểu dữ liệu.', difficulty: 'Dễ' },
    { id: 2, subjectId: 1, knowledgeBlockId: 2, content: 'So sánh giữa vòng lặp for và while.', difficulty: 'Trung bình' },
    { id: 3, subjectId: 2, knowledgeBlockId: 1, content: 'SQL là gì?', difficulty: 'Dễ' },
    { id: 4, subjectId: 1, knowledgeBlockId: 2, content: 'Đệ quy là gì? Cho ví dụ.', difficulty: 'Khó' },
    { id: 5, subjectId: 2, knowledgeBlockId: 2, content: 'Phân biệt Primary Key và Foreign Key.', difficulty: 'Trung bình' },
    { id: 6, subjectId: 3, knowledgeBlockId: 1, content: 'Mô hình OSI có bao nhiêu tầng?', difficulty: 'Dễ' },
    { id: 7, subjectId: 3, knowledgeBlockId: 3, content: 'Giải thích cơ chế hoạt động của TCP.', difficulty: 'Rất khó' },
];

const initialExamStructures = [
    { id: 1, name: 'Đề cuối kỳ - Nhập môn lập trình', subjectId: 1, structure: [{ knowledgeBlockId: 1, difficulty: 'Dễ', count: 1 }, { knowledgeBlockId: 2, difficulty: 'Trung bình', count: 1 }, { knowledgeBlockId: 2, difficulty: 'Khó', count: 1 }] },
    { id: 2, name: 'Đề giữa kỳ - Cơ sở dữ liệu', subjectId: 2, structure: [{ knowledgeBlockId: 1, difficulty: 'Dễ', count: 2 }, { knowledgeBlockId: 2, difficulty: 'Trung bình', count: 1 }] },
];


const ExamManagement = () => {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [knowledgeBlocks] = useState(mockKnowledgeBlocks);
  const [questions, setQuestions] = useState(initialQuestions);
  const [examStructures, setExamStructures] = useState(initialExamStructures);
  const [generatedExams, setGeneratedExams] = useState<any[]>([]);
  const [filters, setFilters] = useState({ subjectId: null, knowledgeBlockId: null, difficulty: null });
  
  const [isAddQuestionModalVisible, setIsAddQuestionModalVisible] = useState(false);
  const [addQuestionForm] = Form.useForm();

  const [isAddSubjectModalVisible, setIsAddSubjectModalVisible] = useState(false);
  const [addSubjectForm] = Form.useForm();

  const [isAddStructureModalVisible, setIsAddStructureModalVisible] = useState(false);
  const [addStructureForm] = Form.useForm();

  const [isViewExamModalVisible, setIsViewExamModalVisible] = useState(false);
  const [viewingExam, setViewingExam] = useState<any | null>(null);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => 
        (!filters.subjectId || q.subjectId === filters.subjectId) &&
        (!filters.knowledgeBlockId || q.knowledgeBlockId === filters.knowledgeBlockId) &&
        (!filters.difficulty || q.difficulty === filters.difficulty)
    );
  }, [questions, filters]);

  // --- Modal Handlers ---
  const showAddQuestionModal = () => setIsAddQuestionModalVisible(true);
  const handleCancelAddQuestion = () => {
    setIsAddQuestionModalVisible(false);
    addQuestionForm.resetFields();
  };

  const showAddSubjectModal = () => setIsAddSubjectModalVisible(true);
  const handleCancelAddSubject = () => {
      setIsAddSubjectModalVisible(false);
      addSubjectForm.resetFields();
  }

  const showAddStructureModal = () => setIsAddStructureModalVisible(true);
  const handleCancelAddStructure = () => {
      setIsAddStructureModalVisible(false);
      addStructureForm.resetFields();
  }

  const showViewExamModal = (exam: any) => {
      setViewingExam(exam);
      setIsViewExamModalVisible(true);
  }
  const handleCancelViewExam = () => {
      setIsViewExamModalVisible(false);
      setViewingExam(null);
  }

  // --- Data Handlers ---
  const handleAddQuestion = (values: any) => {
    const newQuestion = { id: questions.length + 1, ...values };
    setQuestions([...questions, newQuestion]);
    notification.success({ message: 'Thành công', description: 'Đã thêm câu hỏi mới vào ngân hàng.' });
    handleCancelAddQuestion();
  };

  const handleAddSubject = (values: any) => {
      const newSubject = { id: subjects.length + 1, ...values };
      setSubjects([...subjects, newSubject]);
      notification.success({ message: 'Thành công', description: 'Đã thêm môn học mới.' });
      handleCancelAddSubject();
  }

  const handleAddStructure = (values: any) => {
      const newStructure = { id: examStructures.length + 1, ...values };
      setExamStructures([...examStructures, newStructure]);
      notification.success({ message: 'Thành công', description: 'Đã thêm cấu trúc đề thi mới.' });
      handleCancelAddStructure();
  }

  const handleGenerateExam = (values: any) => {
    const { structureId } = values;
    const structure = examStructures.find(s => s.id === structureId);
    if (!structure) return;

    const examQuestions: any[] = [];
    let possible = true;

    for (const rule of structure.structure) {
        const available = questions.filter(q => 
            q.subjectId === structure.subjectId &&
            q.knowledgeBlockId === rule.knowledgeBlockId &&
            q.difficulty === rule.difficulty &&
            !examQuestions.some(eq => eq.id === q.id) // ensure not picking the same question
        );

        if (available.length < rule.count) {
            possible = false;
            break;
        }
        
        const picked = available.sort(() => 0.5 - Math.random()).slice(0, rule.count);
        examQuestions.push(...picked);
    }

    if (possible) {
        const newExam = { id: generatedExams.length + 1, name: `${structure.name} - #${generatedExams.length + 1}`, questions: examQuestions };
        setGeneratedExams([...generatedExams, newExam]);
        notification.success({ message: 'Tạo đề thi thành công!', description: `Đã tạo đề thi "${newExam.name}".` });
    } else {
        notification.error({ message: 'Không đủ câu hỏi', description: 'Không đủ câu hỏi trong ngân hàng để tạo đề thi theo cấu trúc đã chọn.' });
    }
  };

  // --- Columns ---
  const questionColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nội dung', dataIndex: 'content', key: 'content' },
    { title: 'Môn học', dataIndex: 'subjectId', key: 'subjectId', render: (id: number) => subjects.find(s => s.id === id)?.name },
    { title: 'Khối kiến thức', dataIndex: 'knowledgeBlockId', key: 'knowledgeBlockId', render: (id: number) => knowledgeBlocks.find(b => b.id === id)?.name },
    { title: 'Mức độ', dataIndex: 'difficulty', key: 'difficulty', render: (d: string) => <Tag>{d}</Tag> },
  ];

  const structureColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên cấu trúc', dataIndex: 'name', key: 'name' },
    { title: 'Môn học', dataIndex: 'subjectId', key: 'subjectId', render: (id: number) => subjects.find(s => s.id === id)?.name },
    { title: 'Chi tiết', dataIndex: 'structure', key: 'structure', render: (s: any[]) => (
        <Space direction="vertical">
            {s.map((rule, i) => <Text key={i}>{`${rule.count} câu ${rule.difficulty} - ${knowledgeBlocks.find(b => b.id === rule.knowledgeBlockId)?.name}`}</Text>)}
        </Space>
    )},
  ];

  return (
    <Card style={{ margin: '24px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Hệ thống Quản lý Ngân hàng câu hỏi</Title>
      <Tabs defaultActiveKey="3">
        <TabPane tab="Quản lý Khối kiến thức" key="1">
          <Table dataSource={knowledgeBlocks} columns={[{ title: 'ID', dataIndex: 'id' }, { title: 'Tên khối kiến thức', dataIndex: 'name' }]} rowKey="id" pagination={false} />
        </TabPane>
        <TabPane tab="Quản lý Môn học" key="2">
            <Button type="primary" onClick={showAddSubjectModal} style={{ marginBottom: 16 }}>Thêm môn học mới</Button>
            <Table dataSource={subjects} columns={[{ title: 'Mã môn', dataIndex: 'code' }, { title: 'Tên môn học', dataIndex: 'name' }, { title: 'Số tín chỉ', dataIndex: 'credits' }]} rowKey="id" pagination={false} />
        </TabPane>
        <TabPane tab="Quản lý Câu hỏi" key="3">
            <Card style={{marginBottom: 16}}>
                <Form layout="inline">
                    <Form.Item label="Môn học">
                        <Select allowClear placeholder="Tất cả" style={{ width: 200 }} onChange={val => setFilters(f => ({...f, subjectId: val}))}>
                            {subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Khối kiến thức">
                        <Select allowClear placeholder="Tất cả" style={{ width: 150 }} onChange={val => setFilters(f => ({...f, knowledgeBlockId: val}))}>
                            {knowledgeBlocks.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Mức độ">
                        <Select allowClear placeholder="Tất cả" style={{ width: 120 }} onChange={val => setFilters(f => ({...f, difficulty: val}))}>
                            <Option value="Dễ">Dễ</Option><Option value="Trung bình">Trung bình</Option><Option value="Khó">Khó</Option><Option value="Rất khó">Rất khó</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Card>
            <Button type="primary" onClick={showAddQuestionModal} style={{ marginBottom: 16 }}>Thêm câu hỏi mới</Button>
            <Table dataSource={filteredQuestions} columns={questionColumns} rowKey="id" />
        </TabPane>
        <TabPane tab="Quản lý Cấu trúc đề thi" key="4">
            <Button type="primary" onClick={showAddStructureModal} style={{ marginBottom: 16 }}>Thêm cấu trúc mới</Button>
            <Table dataSource={examStructures} columns={structureColumns} rowKey="id" />
        </TabPane>
        <TabPane tab="Tạo Đề thi" key="5">
            <Row gutter={24}>
                <Col span={8}>
                    <Card title="Tạo đề thi">
                        <Form onFinish={handleGenerateExam} layout="vertical">
                            <Form.Item name="structureId" label="Chọn cấu trúc đề thi" rules={[{ required: true }]}>
                                <Select placeholder="Chọn một cấu trúc có sẵn">
                                    {examStructures.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">Tạo đề thi</Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col span={16}>
                    <Card title="Danh sách đề thi đã tạo">
                        <List
                            bordered
                            dataSource={generatedExams}
                            renderItem={(exam: any) => (
                                <List.Item actions={[<Button type="link" onClick={() => showViewExamModal(exam)}>Xem chi tiết</Button>]}>
                                    <List.Item.Meta title={exam.name} description={`Gồm ${exam.questions.length} câu hỏi`} />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </TabPane>
      </Tabs>

      {/* Modals */}
      <Modal title="Thêm câu hỏi tự luận mới" visible={isAddQuestionModalVisible} onCancel={handleCancelAddQuestion} onOk={() => addQuestionForm.submit()}>
        <Form form={addQuestionForm} onFinish={handleAddQuestion} layout="vertical">
          <Form.Item name="content" label="Nội dung câu hỏi" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="subjectId" label="Môn học" rules={[{ required: true }]}>
            <Select>{subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select>
          </Form.Item>
          <Form.Item name="knowledgeBlockId" label="Khối kiến thức" rules={[{ required: true }]}>
            <Select>{knowledgeBlocks.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}</Select>
          </Form.Item>
          <Form.Item name="difficulty" label="Mức độ khó" rules={[{ required: true }]}>
            <Select>
              <Option value="Dễ">Dễ</Option><Option value="Trung bình">Trung bình</Option><Option value="Khó">Khó</Option><Option value="Rất khó">Rất khó</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Thêm môn học mới" visible={isAddSubjectModalVisible} onCancel={handleCancelAddSubject} onOk={() => addSubjectForm.submit()}>
        <Form form={addSubjectForm} onFinish={handleAddSubject} layout="vertical">
            <Form.Item name="code" label="Mã môn học" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="name" label="Tên môn học" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="credits" label="Số tín chỉ" rules={[{ required: true }]}><InputNumber min={1} style={{width: '100%'}} /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Chi tiết đề thi: ${viewingExam?.name}`}
        visible={isViewExamModalVisible}
        onCancel={handleCancelViewExam}
        footer={[<Button key="back" onClick={handleCancelViewExam}>Đóng</Button>]}
        width={800}
      >
        {viewingExam && (
            <List
                header={<Text strong>Danh sách câu hỏi</Text>}
                dataSource={viewingExam.questions}
                renderItem={(item: any, index: number) => (
                    <List.Item>
                        <Text strong>{`Câu ${index + 1}: `}</Text> {item.content} <Tag>{item.difficulty}</Tag>
                    </List.Item>
                )}
            />
        )}
      </Modal>

      <Modal title="Thêm cấu trúc đề thi mới" visible={isAddStructureModalVisible} onCancel={handleCancelAddStructure} onOk={() => addStructureForm.submit()} width={800}>
        <Form form={addStructureForm} onFinish={handleAddStructure} layout="vertical" autoComplete="off">
            <Form.Item name="name" label="Tên cấu trúc" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="subjectId" label="Môn học" rules={[{ required: true }]}>
                <Select placeholder="Chọn môn học">{subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select>
            </Form.Item>
            <Form.Item label="Chi tiết cấu trúc">
                <Form.List name="structure">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item {...restField} name={[name, 'knowledgeBlockId']} rules={[{ required: true, message: 'Vui lòng chọn' }]} style={{width: 200}}><Select placeholder="Khối kiến thức">{knowledgeBlocks.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}</Select></Form.Item>
                                    <Form.Item {...restField} name={[name, 'difficulty']} rules={[{ required: true, message: 'Vui lòng chọn' }]} style={{width: 150}}><Select placeholder="Mức độ"><Option value="Dễ">Dễ</Option><Option value="Trung bình">Trung bình</Option><Option value="Khó">Khó</Option><Option value="Rất khó">Rất khó</Option></Select></Form.Item>
                                    <Form.Item {...restField} name={[name, 'count']} rules={[{ required: true, message: 'Vui lòng nhập' }]} style={{width: 120}}><InputNumber min={1} placeholder="Số lượng" style={{width: '100%'}} /></Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm dòng cấu trúc</Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ExamManagement;