import React, { useState } from 'react';

const Form = ({ onSubmit }) => {
  const [data, setData] = useState("");

  const handleChange = (e) => {
    setData(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={data} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;
