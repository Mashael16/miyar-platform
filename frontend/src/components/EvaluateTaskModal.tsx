import React, { useState } from 'react';
import { Modal, Form, Slider, Input, message, Typography, Row, Col, Button } from 'antd';
import { CheckCircleOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../axios';

const { Text } = Typography;
const { TextArea } = Input;

const SliderWithButtons = ({ value, onChange }: any) => {
  const min = 0;
  const max = 100;
  const step = 1; 

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button shape="circle" icon={<MinusOutlined />} onClick={() => onChange(Math.max(min, (value || 0) - step))} />
      <Slider style={{ flex: 1 }} value={value} onChange={onChange} min={min} max={max} marks={{ 0: '0', 50: '50', 100: '100' }} />
      <Button shape="circle" icon={<PlusOutlined />} onClick={() => onChange(Math.min(max, (value || 0) + step))} />
    </div>
  );
};

interface EvaluateTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  task: any; 
  onSuccess: () => void; 
}

const EvaluateTaskModal: React.FC<EvaluateTaskModalProps> = ({ visible, onCancel, task, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      
      await api.post("/evaluations/", {
        task: task.id,
        subjective_score: values.subjective_score, 
        feedback: values.feedback
      });

      message.success("Evaluation submitted successfully!");
      form.resetFields();
      onSuccess(); 
      onCancel();  
    } catch (error) {
      console.error("Evaluation failed:", error);
      message.error("Failed to submit evaluation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
          <span>Evaluate Task: <Text type="secondary">{task?.title}</Text></span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Submit Evaluation"
      cancelText="Cancel"
      width={600}
      centered
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="subjective_score" label="Quality & Collaboration" initialValue={80}>
              <SliderWithButtons />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          name="feedback" 
          label="Manager's Feedback "
          rules={[{ required: true, message: "Please write feedback" }]}
        >
          <TextArea rows={4} placeholder="Write any strengths or areas of improvement..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EvaluateTaskModal;