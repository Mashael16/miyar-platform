import React from 'react';
import { Card, Typography } from 'antd';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const { Title, Text } = Typography;

export interface RadarDataPoint {
  metric: string; 
  score: number;
  fullMark: number;
}
interface PerformanceRadarProps {
  data: RadarDataPoint[];
}

const PerformanceRadar: React.FC<PerformanceRadarProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card variant="borderless" style={{ borderRadius: 12, height: '100%', textAlign: 'center', padding: 50 }}>
        <Text type="secondary">Loading Performance Data...</Text>
      </Card>
    );
  }

  return (
    <Card 
      variant="borderless" 
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: 12, height: '100%' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#1677ff' }}>Comprehensive Performance</Title>
        <Text type="secondary">Based on Rule Engine Metrics</Text>
      </div>
      
      <div style={{ width: "100%", height: 300, minHeight: 300 }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e0e0e0" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#595959', fontSize: 12, fontWeight: 500 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            
            <Tooltip 
              wrapperStyle={{ borderRadius: '8px' }} 
              formatter={(value: any) => [`${value || 0} / 100`, 'Score']} 
            />
            
            <Radar
              name="Employee Score"
              dataKey="score"
              stroke="#1677ff"
              fill="#1677ff"
              fillOpacity={0.5} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PerformanceRadar;