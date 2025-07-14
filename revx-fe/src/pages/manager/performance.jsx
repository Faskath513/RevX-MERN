import React, { useState, useEffect } from 'react';
import { fetchPerformanceData } from '../../utils/api';

const ManagerPerformance = () => {
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    const loadPerformanceData = async () => {
      const data = await fetchPerformanceData();
      setPerformanceData(data);
    };
    loadPerformanceData();
  }, []);

  return (
    <div>
      <h1>Employee Performance</h1>
      <ul>
        {performanceData.map((data) => (
          <li key={data.id}>
            {data.employeeName} - {data.performance}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManagerPerformance;
