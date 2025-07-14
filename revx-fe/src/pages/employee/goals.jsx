import React, { useState, useEffect } from 'react';
import { fetchEmployeeGoals } from '../../utils/api';

const EmployeeGoals = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const loadGoals = async () => {
      const data = await fetchEmployeeGoals();
      setGoals(data);
    };
    loadGoals();
  }, []);

  return (
    <div>
      <h1>Your Goals</h1>
      <ul>
        {goals.map((goal) => (
          <li key={goal.id}>
            {goal.description} - {goal.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeGoals;
