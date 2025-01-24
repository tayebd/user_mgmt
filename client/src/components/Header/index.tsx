import React from "react";

interface HeaderProps {
  name: string;
  buttonComponent?: React.ReactNode;
  isSmallText?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  name, 
  buttonComponent = null, 
  isSmallText = false 
}) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h1 className={`${isSmallText ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 dark:text-white`}>
        {name}
      </h1>
      {buttonComponent}
    </div>
  );
};

export default Header;
