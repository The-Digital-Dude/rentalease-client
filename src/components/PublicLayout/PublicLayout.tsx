import React from "react";
import "./PublicLayout.scss";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="public-layout">
      <div className="public-content">{children}</div>
    </div>
  );
};
