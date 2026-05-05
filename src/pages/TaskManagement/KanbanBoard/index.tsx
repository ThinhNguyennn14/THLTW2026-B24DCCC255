import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import { Card, Col, Row, Typography, Tag } from 'antd';

import { getTasks, updateTask } from '../../../models/taskmanagement';
import { Status, Priority } from '../../../services/TaskManagement/constant';
import type { ITask } from '../../../services/TaskManagement/typing';

const { Title, Text } = Typography;

const columnTitles = {
  [Status.TODO]: 'Cần làm',
  [Status.IN_PROGRESS]: 'Đang làm',
  [Status.DONE]: 'Hoàn thành',
};

const priorityColors: Record<Priority, string> = {
  [Priority.HIGH]: 'red',
  [Priority.MEDIUM]: 'orange',
  [Priority.LOW]: 'blue',
};

// Component con để hiển thị một thẻ công việc
const TaskCard: React.FC<{ task: ITask; index: number }> = ({ task, index }) => (
  <Draggable draggableId={task.id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{
          userSelect: 'none',
          marginBottom: 8,
          ...provided.draggableProps.style,
        }}
      >
        <Card
          hoverable
          size='small'
          style={{
            borderLeft: `5px solid ${priorityColors[task.priority]}`,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
        >
          <Text strong>{task.name}</Text>
          <Text type='secondary' style={{ display: 'block', margin: '4px 0' }}>
            {task.description}
          </Text>
          <Tag color={priorityColors[task.priority]}>{task.priority}</Tag>
          <Text type='secondary' style={{ fontSize: '12px', float: 'right' }}>
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </Text>
        </Card>
      </div>
    )}
  </Draggable>
);


const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Record<Status, ITask[]>>({
    [Status.TODO]: [],
    [Status.IN_PROGRESS]: [],
    [Status.DONE]: [],
  });

  useEffect(() => {
    const loadTasks = () => {
      const allTasks = getTasks();
      const newColumns = {
        [Status.TODO]: allTasks.filter(t => t.status === Status.TODO),
        [Status.IN_PROGRESS]: allTasks.filter(t => t.status === Status.IN_PROGRESS),
        [Status.DONE]: allTasks.filter(t => t.status === Status.DONE),
      };
      setColumns(newColumns);
    };

    loadTasks();
    window.addEventListener('storage', loadTasks);
    return () => {
      window.removeEventListener('storage', loadTasks);
    };
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceStatus = source.droppableId as Status;
    const destStatus = destination.droppableId as Status;

    // Nếu không có gì thay đổi
    if (sourceStatus === destStatus && source.index === destination.index) {
      return;
    }

    const startColumn = columns[sourceStatus];
    const endColumn = columns[destStatus];
    
    const [movedTask] = startColumn.splice(source.index, 1);

    // Di chuyển trong cùng một cột
    if (startColumn === endColumn) {
      startColumn.splice(destination.index, 0, movedTask);
      const newColumns = {
        ...columns,
        [sourceStatus]: [...startColumn],
      };
      setColumns(newColumns);
      // Tùy chọn: Lưu lại thứ tự mới vào localStorage nếu cần
    } else {
      // Di chuyển sang cột khác
      endColumn.splice(destination.index, 0, movedTask);
      const newColumns = {
        ...columns,
        [sourceStatus]: [...startColumn],
        [destStatus]: [...endColumn],
      };
      setColumns(newColumns);
      updateTask(draggableId, { status: destStatus });
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Bảng Kanban</Title>
      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={16}>
          {Object.entries(columns).map(([status, tasks]) => (
            <Col xs={24} sm={8} key={status}>
              <Card title={`${columnTitles[status as Status]} (${tasks.length})`}>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        background: snapshot.isDraggingOver ? '#e6f7ff' : '#f0f2f5',
                        padding: 8,
                        minHeight: 500,
                        borderRadius: '4px',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      {tasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </Col>
          ))}
        </Row>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;