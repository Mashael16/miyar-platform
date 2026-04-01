import React from "react";
import { Card, Avatar, Typography, Descriptions, Tag, Row, Col } from "antd";
import { UserOutlined, IdcardOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Title } = Typography;

const Me: React.FC = () => {
  const { user } = useAuth();

  // في حال كانت البيانات تحمل، نعرض رسالة بسيطة
  if (!user) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading profile...</div>;
  }

  return (
    <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
      <Card
        style={{ 
          width: "100%", 
          maxWidth: 600, 
          borderRadius: 16, 
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)" 
        }}
        bordered={false}
      >
        {/* الجزء العلوي: الصورة الرمزية والاسم */}
        <Row justify="center" style={{ marginBottom: 20 }}>
          <Col>
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: user.role === "manager" ? "#1677ff" : "#52c41a" }} 
            />
          </Col>
        </Row>
        
        <Row justify="center" style={{ marginBottom: 30, textAlign: "center" }}>
          <Col>
            <Title level={3} style={{ margin: 0, textTransform: "capitalize" }}>
              {user.username}
            </Title>
            <Tag 
              color={user.role === "manager" ? "blue" : "green"} 
              style={{ marginTop: 10, fontSize: 14, padding: "4px 16px", borderRadius: 20 }}
            >
              {user.role === "manager" ? "Manager" : "Employee"}
            </Tag>
          </Col>
        </Row>


        <Descriptions title="Account Details" bordered column={1}>
          <Descriptions.Item label={<><IdcardOutlined /> User ID</>}>
            {user.id}
          </Descriptions.Item>
          <Descriptions.Item label={<><UserOutlined /> Username</>}>
            {user.username}
          </Descriptions.Item>
          <Descriptions.Item label={<><SafetyCertificateOutlined /> System Role</>}>
            <span style={{ textTransform: "capitalize" }}>{user.role}</span>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Me;