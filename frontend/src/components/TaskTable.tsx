import React from "react";
import { Table, Tag, Button } from "antd";
import type { ColumnsType,ColumnType  } from "antd/es/table";
import dayjs from "dayjs";
import { Task, TaskStatus,UserRole } from "../types/TaskStatus";

interface TaskTableProps {
  tasks: Task[];
  onEvaluate: (task: Task) => void;
  onShowEvaluationDetails: (task: Task) => void;
  userRole?: UserRole | null;
}

const statusMap: Record<TaskStatus, { color: string; text: string }> = {
  pending: { color: "orange", text: "Pending" },
  in_progress: { color: "blue", text: "In Progress" },
  completed: { color: "green", text: "Completed" },
};

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEvaluate ,userRole,onShowEvaluationDetails}) => {
  const importanceColor = (level: number) => {
    switch (level) {
      case 1: return "red";
      case 2: return "orange";
      default: return "green";
    }
    
  };
  
  const columns: ColumnsType<Task> = [
    { title: "Title", dataIndex: "title", key: "title" },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      render: (status: TaskStatus) => <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
    },
    { 
      title: "Importance", 
      dataIndex: "importance_degree",
      key: "importance",
      render: (level: number) => (
        <Tag color={importanceColor(level)}>
          {level === 1 ? "High" : level === 2 ? "Medium" : "Low"}
        </Tag>
      )
    },
    { 
      title: "Deadline", 
      dataIndex: "deadline", 
      key: "deadline",
      render: (date: string) => dayjs(date).format("DD MMM YYYY")
    },

    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Task) => {
        // 1. إذا كانت المهمة مقيمة بالفعل
        if (record.evaluation) {
          return (
            // زر يعرض التفاصيل للجميع (المدير والموظف)
            <Button 
              type="default" 
              onClick={() => onShowEvaluationDetails(record)} // دالة تفتح Modal للعرض فقط
            >
              View Evaluation
            </Button>
          );
        } 
        
        // 2. إذا لم تقيم بعد، والمستخدم مدير
        // نستخدم toLowerCase() لتحويل أي كلمة لحروف صغيرة قبل المقارنة
      if (userRole?.toLowerCase() === "manager") {
        return (
          <Button type="primary" onClick={() => onEvaluate(record)}>
            Evaluate
          </Button>
        );
      }
        
        // 3. إذا لم تقيم بعد، والمستخدم موظف
        return <Tag color="default">Pending Evaluation</Tag>; // أفضل من تركها فارغة (null)
      },
    } as ColumnType<Task>
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={tasks}
      pagination={{ pageSize: 6 }}
      locale={{ emptyText: "No tasks available" }}
    />
  );
};

export default TaskTable;