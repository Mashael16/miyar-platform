import React, { useEffect, useState } from 'react';
import api from '../axios';
import PerformanceRadar from './PerformanceRadar';

interface RadarDataPoint {
  metric: string; 
  score: number;
  fullMark: number;
}

const Dashboard: React.FC = () => {
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);

  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const response = await api.get(`/users/${user.id}/radar/`);
        setRadarData(response.data);
      } catch (error) {
        console.error("Error fetching radar data:", error);
      }
    };

    fetchRadarData();
  }, []);

  return <PerformanceRadar data={radarData} />;
};

export default Dashboard;