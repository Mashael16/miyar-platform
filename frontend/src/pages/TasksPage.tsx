import React, { useEffect, useState } from "react";
import { CheckCircleOutlined, SyncOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Table, Tag, Input, Select, Space, Card, Statistic, Row, Col, Modal, Empty, message } from "antd";
import api from "../axios";
import { Task, UserRole } from "../types/TaskStatus";
import TaskTable from "../components/TaskTable";
import { useAuth } from "../context/AuthContext";
import EvaluateTaskModal from '../components/EvaluateTaskModal';
import TaskBoard from "../components/TaskBoard";

const { Search } = Input;

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { user } = useAuth();
  const userRole = user?.role as UserRole | undefined;

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setTasks(data);
    } catch (error) {
      message.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const countByStatus = (status: string) => tasks.filter(t => t.status === status).length;
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: "24px" }}>
      
      {/* 1. قسم الإحصائيات (الكروت العلوية) */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card
            variant="borderless"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: "12px" }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: '500' }}>Total Tasks</span>}
              value={tasks.length}
              prefix={<UnorderedListOutlined style={{ color: '#8c8c8c', marginRight: '8px' }} />}
              valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#1f1f1f' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            variant="borderless"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: "12px", borderBottom: "4px solid #52c41a" }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: '500' }}>Completed</span>}
              value={countByStatus("completed")}
              prefix={<CheckCircleOutlined style={{ marginRight: '8px' }} />}
              valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            variant="borderless"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: "12px", borderBottom: "4px solid #1677ff" }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: '500' }}>In Progress</span>}
              value={countByStatus("in_progress")}
              prefix={<SyncOutlined style={{ marginRight: '8px' }} />}
              valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 2. لوحة المهام (الكانبان) */}
      <div style={{ marginBottom: '24px' }}>
         <TaskBoard tasks={filteredTasks} />
      </div>

      {/* 3. الكارد الأساسي اللي يحتوي على الفلاتر والجدول */}
      <Card title="Tasks List" style={{ borderRadius: '12px' }}>
        
        {/* شريط البحث والفلاتر */}
        <Row justify="end" style={{ marginBottom: 20 }}>
          <Col>
            <Space size="middle">
              <Search
                placeholder="Search tasks by title..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
              <Select
                defaultValue="All"
                style={{ width: 150 }}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'pending', label: 'Pending' },
                ]}
              />
            </Space>
          </Col>
        </Row>

        {/* الجدول */}
        <TaskTable
          tasks={filteredTasks}
          userRole={userRole}
          onEvaluate={(task) => {
            setSelectedTask(task);
            setIsEvaluateModalOpen(true);
          }}
          onShowEvaluationDetails={(task) => {
            setSelectedTask(task);
            setIsViewModalOpen(true);
          }}
        />
      </Card>

      {/* 4. النوافذ المنبثقة (Modals) */}
      {selectedTask && (
        <EvaluateTaskModal
          visible={isEvaluateModalOpen}
          onCancel={() => {
            setIsEvaluateModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSuccess={fetchTasks}
        />
      )}

      <Modal
        title={`Evaluation Report: ${selectedTask?.title}`}
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedTask(null);
        }}
        footer={null}
        centered
      >
        {selectedTask?.evaluation ? (
          <div style={{ padding: "10px 0" }}>
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={12}>
                <Statistic
                  title="Objective Score"
                  value={selectedTask.evaluation.objective_score}
                  valueStyle={{ color: '#3f8600' }}
                  suffix="/ 100"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Subjective Score"
                  value={selectedTask.evaluation.subjective_score}
                  valueStyle={{ color: '#1677ff' }}
                  suffix="/ 100"
                />
              </Col>
            </Row>
            <Card type="inner" title="Manager's Feedback">
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {selectedTask.evaluation.feedback || "No additional feedback provided."}
              </p>
            </Card>
          </div>
        ) : (
          <Empty description="Evaluation data is not available." />
        )}
      </Modal>

    </div>
  );
};

export default TasksPage;