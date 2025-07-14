import React from 'react';

const GoalItem = ({ goal }) => {
  return (
    <div>
      <h3>{goal.name}</h3>
      <p>{goal.description}</p>
    </div>
  );
};

export default GoalItem;
