import React, { useState } from 'react';
import { Card, Typography, Button, Divider, Spin, Tag, message } from 'antd';
import { RobotOutlined, BulbOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import api from '../axios';

const { Title, Text, Paragraph } = Typography;

// 🎯 أضفنا الـ Props عشان نقدر نمرر بيانات الموظف من الداشبورد لهذا الكومبوننت
interface SmartAssistantProps {
  employeeName: string;
  completionRate: number;
  radarMetrics: number[];
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ employeeName, completionRate, radarMetrics }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<{ strengths: string[], areas_for_improvement: string[], summary: string } | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await api.post('/generate-insights/', {
        employee_name: employeeName,
        completion_rate: completionRate,
        metrics: radarMetrics
      });

      setInsights(response.data.insights); 

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";
      message.error("Failed to generate insights: " + errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      variant="borderless"
      style={{ 
        borderRadius: 12, 
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
        height: '100%', 
        background: 'linear-gradient(145deg, #f4f8ff 0%, #ffffff 100%)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <RobotOutlined style={{ fontSize: 24, color: '#722ed1', marginRight: 8 }} />
        <Title level={4} style={{ margin: 0, color: '#722ed1' }}>AI Manager Assistant</Title>
      </div>
      <Text type="secondary">
        Get instant, AI-driven insights on performance metrics, strengths, and actionable recommendations.
      </Text>

      <Divider style={{ margin: '16px 0' }} />

      {/* الحالة الأولى: قبل التحليل */}
      {!insights && !loading && (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <Button
            type="primary"
            icon={<BulbOutlined />}
            size="large"
            onClick={generateInsights}
            style={{ borderRadius: 8, background: '#722ed1', borderColor: '#722ed1' }}
          >
            Generate Smart Insights
          </Button>
        </div>
      )}

      {/* الحالة الثانية: وقت التحميل */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Analyzing Rule Engine Data..." size="large" />
        </div>
      )}

      {/* الحالة الثالثة: عرض النتيجة */}
      {/* الحالة الثالثة: عرض النتيجة */}
      {insights && !loading && (
        <div className="insights-container">
          
          {/* 🛡️ الدرع الواقي: إذا رجع الذكاء الاصطناعي نص عادي بدل JSON */}
          {typeof insights === 'string' ? (
            <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: 15 }}>
              {insights}
            </Paragraph>
          ) : (
            /* 🛡️ إذا رجعها JSON مرتب، نعرضها بالـ Tags بشكل آمن */
            <>
              <Paragraph style={{ fontSize: 15 }}>
                <Text strong>📊 Executive Summary: </Text>
                {insights.summary || "Analysis completed successfully."}
              </Paragraph>

              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}><CheckCircleOutlined style={{ color: '#52c41a' }}/> Top Strengths:</Text>
                {/* نفحص هل هي مصفوفة فعلاً قبل ما نسوي map */}
                {Array.isArray(insights.strengths) ? insights.strengths.map((str, idx) => (
                  <Tag color="success" key={idx} style={{ marginBottom: 4, padding: '4px 8px', fontSize: 13 }}>{str}</Tag>
                )) : <Text type="secondary">No specific strengths listed.</Text>}
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}><WarningOutlined style={{ color: '#faad14' }}/> Areas for Growth:</Text>
                {Array.isArray(insights.areas_for_improvement) ? insights.areas_for_improvement.map((area, idx) => (
                  <Tag color="warning" key={idx} style={{ marginBottom: 4, padding: '4px 8px', fontSize: 13 }}>{area}</Tag>
                )) : <Text type="secondary">No specific areas listed.</Text>}
              </div>
            </>
          )}

          <Divider style={{ margin: '16px 0' }} />
          <div style={{ textAlign: 'center' }}>
             <Button type="default" icon={<BulbOutlined />} onClick={generateInsights}>
               Regenerate Analysis
             </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SmartAssistant;