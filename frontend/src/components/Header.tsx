import React from "react";
import { Layout, Badge, Avatar, Dropdown, Menu } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  GlobalOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth} from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";


const { Header } = Layout;



const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout_action") {
      logout();
    } else {
      navigate(key); 
    }
  };

  // <Menu
  //   onClick={handleMenuClick}
  //   selectedKeys={[location.pathname]}
  //       items={[
  //       { key: "/Me", icon: <UserOutlined />, label: "Profile" },
  //       {
  //         type: "divider",
  //       },
  //       {key: "logout_action", icon: <LogoutOutlined />, label: "Logout",danger: true},
      
  //   ]}
  
    const items = [
      {
        key: "/Me",
        icon: <UserOutlined />,
        label: "Profile",
      },
      {
        type: "divider" as const,
      },
      {
        key: "logout_action", 
        icon: <LogoutOutlined />,
        label: "Logout",
        danger: true, 
      },
    ];


  return (
    <Header
      style={{
        background: "white",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 24px",
        gap: "30px",
      }}
    >
      <SearchOutlined style={{ color: "#001529", fontSize: 18 }} />

      <Badge count={11} size="small">
        <BellOutlined style={{ color: "#001529", fontSize: 18 }} />
      </Badge>

      <GlobalOutlined style={{ color: "#001529", fontSize: 18}} />

      <Dropdown menu={{ items ,onClick: handleMenuClick}} placement="bottomRight">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: 10,
          }}
        >
          <Avatar icon={<UserOutlined />} />
          <span style={{ color: "#001529", fontWeight: 500 }}>
            {user?.username}
          </span>
        </div>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;