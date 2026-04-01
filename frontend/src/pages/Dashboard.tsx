import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography,Button, Spin, Statistic } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import api from "../axios";
import { Task } from "../types/TaskStatus";
import PerformanceRadar, { RadarDataPoint } from '../components/PerformanceRadar'; 
import { useAuth } from '../context/AuthContext';
import SmartAssistant from '../components/SmartAssistant';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);
  
  useEffect(() => {
    if (!user || !user.id) return;
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks/");
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setTasks(data);
        console.log("Tasks from Backend:", data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchRadarData = async () => {
      try {
        // const user = JSON.parse(localStorage.getItem("user") || "{}");
        // console.log("Current User ID is:", user.id);
        if(user && user.id) {
          const response = await api.get(`/users/${user.id}/radar/`);
          console.log("Radar Data API Success:", response.data);
          setRadarData(response.data);
        }else {
          console.log("Waiting for user data to load from Context...");
        }
      } catch (error) {
        console.error("Error fetching radar data:", error);
      }
    };

    Promise.all([fetchTasks(), fetchRadarData()]).finally(() => {
      setLoading(false);
    });
    
  }, [user]);

  const completedTasks = tasks.filter(t => t.status === "completed");
  const completionRate = tasks.length ? ((completedTasks.length / tasks.length) * 100).toFixed(1) : 0;
  
  // const evaluatedTasks = completedTasks.filter(t => t.evaluation);
  const evaluatedTasks = tasks.filter(t => t.evaluation); 

  const avgScore = evaluatedTasks.length > 0 
    ? ((evaluatedTasks.reduce((sum, t) => sum + (t.evaluation?.final_score || t.evaluation?.objective_score || 0), 0) / evaluatedTasks.length) * 20).toFixed(1)
    : "0";

  const monthlyDataMap: Record<string, { totalScore: number; count: number }> = {};
  evaluatedTasks.forEach(task => {
    const month = dayjs(task.deadline).format("MMM YYYY");
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { totalScore: 0, count: 0 };
    }
    monthlyDataMap[month].totalScore += (task.evaluation?.objective_score || 0);
    monthlyDataMap[month].count += 1;
  });

  const monthlyTrendData = Object.keys(monthlyDataMap).map(month => ({
    month,
    AverageScore: Number((monthlyDataMap[month].totalScore / monthlyDataMap[month].count).toFixed(1))
  })).sort((a, b) => dayjs(a.month).valueOf() - dayjs(b.month).valueOf());

  const statusData = [
    { name: "Completed", value: completedTasks.length, color: "#52c41a" },
    { name: "In Progress", value: tasks.filter(t => t.status === "in_progress").length, color: "#1677ff" },
    { name: "Pending", value: tasks.filter(t => t.status === "pending").length, color: "#faad14" },
  ].filter(item => item.value > 0);

  return (
    <div style={{ padding: 40 }}>
      {/* <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}><Statistic title="Total Tasks" value={tasks.length} /></Col>
        <Col span={8}><Statistic title="Completed" value={countByStatus("completed")} /></Col>
        <Col span={8}><Statistic title="In Progress" value={countByStatus("in_progress")} /></Col>
      </Row>
    */}

      <Row justify="space-between" align="middle" style={{ marginBottom: 30 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Performance Dashboard</Title>
          <Text type="secondary">Analytics & Monthly Reports</Text>
        </Col>
        <Col>
          <Button type="primary" size="large" onClick={() => navigate("/TasksPage")}>
            Manage Tasks
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}><Spin size="large" /></div>
      ) : (
        <>
          {/* (KPI Cards) */}
          <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic title="Total Assigned Tasks" value={tasks.length} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic 
                  title="Completion Rate" 
                  value={completionRate} 
                  suffix="%" 
                  styles={{ content: { color: '#1677ff' } }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="borderless">
                <Statistic 
                  title="Average Evaluation Score" 
                  value={avgScore} 

                  suffix="/ 100" 
                  styles={{ content: { color: '#3f8600' } }} 
                  prefix={<ArrowUpOutlined />} 
                />
              </Card>
            </Col>
          </Row>
          {/* Monthly Performance Trend */}
          <Row gutter={[16, 16]}>
            {/*   */}
            <Col xs={24} lg={16}>
              <Card title="Monthly Performance Trend" bordered={false} style={{ height: "100%" }}>
                {monthlyTrendData.length > 0 ? (
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="AverageScore" stroke="#1677ff" strokeWidth={3} activeDot={{ r: 8 }} name="Avg Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                    Not enough evaluation data to generate a monthly trend.
                  </div>
                )}
              </Card>
            </Col>

            {/**/}
            <Col xs={24} lg={8}>
              <Card title="Current Task Status" bordered={false} style={{ height: "100%" }}>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={statusData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>

          {/**/}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={8}>
              {/**/}
              <PerformanceRadar data={radarData} />
            </Col>
            
            <Col xs={24} lg={16}>
              <SmartAssistant 
                employeeName={user?.username || "Employee"}
                completionRate={Number(completionRate)}
                radarMetrics={radarData.map(d => d.score)} 
                />  
            </Col>
          </Row>

        </>
      )}
    </div>
  );
};

export default Dashboard;