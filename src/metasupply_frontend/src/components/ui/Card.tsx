import React from "react";

interface CardProps {
  title: string;
  subtitle?: string; // optional if not always used
}


const Card: React.FC<CardProps> = ({ title, subtitle }) => {
  return (
    <div className="border p-4 rounded shadow hover:shadow-md transition">
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
};


export default Card;