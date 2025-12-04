// src/components/common/Input.jsx
import React from 'react';

const Input = ({ label, name, value, onChange, type = 'text', placeholder = '', className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default Input;
