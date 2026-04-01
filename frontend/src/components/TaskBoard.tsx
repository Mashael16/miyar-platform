import React from 'react';
import { Row, Col, Card, Tag, Typography, Space } from 'antd';
import { Task } from '../types/TaskStatus';

const { Title, Text } = Typography;

interface TaskBoardProps {
  tasks: Task[];
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const renderColumn = (title: string, columnTasks: Task[], color: string, bgColor: string) => (
    <Col xs={24} md={8}>
      <div style={{ backgroundColor: bgColor, padding: '16px', borderRadius: '12px', minHeight: '600px' }}>
        
        <Title level={4} style={{ color: color, marginTop: 0 }}>
          {title} <Tag color={color} style={{ borderRadius: '10px', float: 'right' }}>{columnTasks.length}</Tag>
        </Title>
        

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {columnTasks.map((task) => (
            <Card
              key={task.id}
              hoverable
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${color}` }}
              bodyStyle={{ padding: '16px' }}
            >
              <Text strong style={{ fontSize: '16px' }}>{task.title}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '13px' }}>

                {task.description ? `${task.description.substring(0, 50)}...` : 'No description'}
              </Text>
            </Card>
          ))}
        </Space>

      </div>
    </Col>
  );

  return (
    <Row gutter={24}>
      {renderColumn('To Do', pendingTasks, '#faad14', '#fffbe6')}       {/* أصفر فاتح */}
      {renderColumn('In Progress', inProgressTasks, '#1677ff', '#e6f4ff')} {/* أزرق فاتح */}
      {renderColumn('Done', completedTasks, '#52c41a', '#f6ffed')}         {/* أخضر فاتح */}
    </Row>
  );
};

export default TaskBoard;