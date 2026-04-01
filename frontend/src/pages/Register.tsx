import { Form, Input, Button, Card, Select, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../axios";
import React from "react";

const { Option } = Select;

const Register: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      await api.post("/register/", values);
      message.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      message.error("Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <Card title="Create Account" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter username" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Enter valid email" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter password" },
              { min: 6, message: "Minimum 6 characters" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: "Please select gender" }]}
          >
            <Select placeholder="Select gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Register
          </Button>

        </Form>
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
};

export default Register;