import React from "react";
import { Layout, Menu } from "antd";
import {
  ProfileOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider>
      <div
        style={{
          color: "white",
          padding: 20,
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        Performance
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          { key: "/dashboard", icon: <ProfileOutlined />, label: "Dashboard" },
          { key: "/TasksPage", icon: <UnorderedListOutlined />, label: "Tasks" },
          { key: "/MyEvaluations", icon: <CheckCircleOutlined />, label: "Evaluations" },
          { key: "/Me", icon: <UserOutlined />, label: "Profile" },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;