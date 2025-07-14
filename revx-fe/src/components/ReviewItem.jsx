import React from 'react';

const ReviewItem = ({ review }) => {
  return (
    <div>
      <h3>{review.title}</h3>
      <p>{review.feedback}</p>
    </div>
  );
};

export default ReviewItem;
