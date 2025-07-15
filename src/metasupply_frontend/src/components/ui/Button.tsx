import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
  type?: "button" | "submit";
  href?: string;
  className?: string;
}



const Button: React.FC<ButtonProps> = ({ children, onClick, variant = "primary", className }) => {
  const baseClasses = "px-4 py-2 rounded font-medium focus:outline-none";
  const variantClasses =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className || ""}`}
    >
      {children}
    </button>
  );
};

export default Button;
