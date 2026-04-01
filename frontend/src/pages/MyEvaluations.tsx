import React, { useEffect, useState } from "react";
import { Table, Card, Tag, Empty, message, Statistic, Row, Col } from "antd";
import api from "../axios";

interface Evaluation {
  id: number;
  final_score: number;
  feedback?: string;
  created_at: string;
  task: {
    title: string;
  };
}

const MyEvaluations: React.FC = () => {
  const [data, setData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const res = await api.get("/my-evaluations/");
      setData(res.data);
    } catch (error) {
      message.error("Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  };

  const averageScore =
    data.length > 0
      ? (data.reduce((sum, item) => sum + (item.final_score || 0), 0) /
          data.length).toFixed(2)
      : 0;

  const columns = [
    {
      title: "Task",
      dataIndex: ["task", "title"],
      key: "task",
    },
    {
      title: "Score",
      dataIndex: "final_score",
      key: "final_score",
      render: (score: number) => (
        <Tag color={score >= 4 ? "green" : score >= 3? "orange" : "red"}>
          {(score ?? 0).toFixed(2)}
        </Tag>
      ),
    },
    {
      title: "Feedback",
      dataIndex: "feedback",
      key: "feedback",
      render: (feedback: string) => feedback || "-",
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) =>
        new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <Card title="My Evaluations">
      {/* 📊 Stats Section */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Statistic title="Total Evaluations" value={data.length} />
        </Col>
        <Col span={8}>
          <Statistic title="Average Score" value={averageScore} />
        </Col>
        <Col span={8}>
          <Statistic
            title="Last Evaluation"
            value={
              data.length > 0
                ? new Date(data[0].created_at).toLocaleDateString()
                : "-"
            }
          />
        </Col>
      </Row>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        locale={{
          emptyText: <Empty description="No evaluations available" />,
        }}
      />
    </Card>
  );
};

export default MyEvaluations;