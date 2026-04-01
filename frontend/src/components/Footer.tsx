import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const AppFooter: React.FC = () => {
  return (
    <Footer style={{ textAlign: "center" }}>
      Performance Platform ©2026
    </Footer>
  );
};

export default AppFooter;