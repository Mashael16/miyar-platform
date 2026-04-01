import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Flex, Form, Input, message } from "antd";
import { useNavigate,Link } from "react-router-dom";
import api from "axios";
import type { FormProps } from "antd";
import type { CSSProperties } from "react";

interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onFinish: FormProps<LoginFormValues>["onFinish"] = async (values) => {
    try {
      const response = await api.post<{
        access: string;
        refresh: string;
      }>("http://127.0.0.1:8000/api/token/", {
        username: values.username,
        password: values.password,
      });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      message.success("Login successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      message.error("Invalid username or password");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign: "center" }}>Performance Platform</h2>

        <Form<LoginFormValues>
          name="login"
          initialValues={{ remember: true }}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Flex justify="space-between" align="center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <a href="">Forgot password</a>
            </Flex>
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit">
              Log in
            </Button>
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <span style={{ marginRight: 6 }}>ليس لديك حساب؟</span>
                <Link to="/Register" style={{ fontWeight: 500 }}>
                سجل الآن
              </Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

const styles: {
  container: CSSProperties;
  card: CSSProperties;
} = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    margin: 0,
    boxSizing: "border-box",
  },
  card: {
    width: 350,
    padding: 30,
    borderRadius: 12,
    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
};

export default Login;