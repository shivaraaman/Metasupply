import React from "react";

interface InputProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  name?: string; // ✅ Add this line
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  className = "",
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 ${className}`}
      />
    </div>
  );
};

export default Input;
