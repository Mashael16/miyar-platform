import React from "react";
import { Layout } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/Header";
import AppFooter from "../components/Footer";

const MainLayout: React.FC = () => {

  // const handleLogout = () => {
  //   navigate("/login");
  // };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <AppHeader/>
        <Layout.Content style={{ margin: 20 }}>
          <Outlet />
        </Layout.Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
};

export default MainLayout;