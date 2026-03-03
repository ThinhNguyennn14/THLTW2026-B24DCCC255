import React, { useState, ChangeEvent } from 'react';
import { Layout, Card, Input, Button, Typography, Space, Alert, Statistic } from 'antd';
import { ReloadOutlined, SendOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Content } = Layout;

const GuessNumberGame: React.FC = () => {
  const [targetNumber, setTargetNumber] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [userInput, setUserInput] = useState<string>('');
  const [message, setMessage] = useState<string>('Hãy đoán một số từ 1 đến 100!');
  const [status, setStatus] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [attempts, setAttempts] = useState<number>(10);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const startNewGame = (): void => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setAttempts(10);
    setMessage('Trò chơi mới đã bắt đầu. Hãy đoán một số từ 1 đến 100!');
    setStatus('info');
    setIsGameOver(false);
    setUserInput('');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUserInput(e.target.value);
  };

  const handleGuess = (): void => {
    if (isGameOver) return;
    const guess = parseInt(userInput);

    if (isNaN(guess) || guess < 1 || guess > 100) {
      setMessage('Vui lòng nhập một số hợp lệ trong khoảng 1 - 100.');
      setStatus('warning');
      return;
    }

    const remainingAttempts = attempts - 1;
    setAttempts(remainingAttempts);

    if (guess === targetNumber) {
      setMessage("Chúc mừng! Bạn đã đoán đúng!");
      setStatus('success');
      setIsGameOver(true);
    } else if (remainingAttempts === 0) {
      setMessage(`Bạn đã hết lượt! Số đúng là ${targetNumber}.`);
      setStatus('error');
      setIsGameOver(true);
    } else if (guess > targetNumber) {
      setMessage("Bạn đoán quá cao!");
      setStatus('warning');
    } else {
      setMessage("Bạn đoán quá thấp!");
      setStatus('info');
    }
    setUserInput('');
  };

  return (
    <Layout style={{ background: '#fff', padding: 24 }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 112px)' }}>
        <Card
          style={{ width: '100%', maxWidth: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}
          title={<Title level={4} style={{ margin: 0, textAlign: 'center' }}>Bài 1: Trò chơi Đoán số</Title>}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message={message}
              type={status}
              showIcon
              style={{ textAlign: 'center' }}
            />

            <Statistic
              title="Số lượt đoán còn lại"
              value={attempts}
              valueStyle={{
                color: attempts <= 3 ? '#ff4d4f' : '#1890ff',
                textAlign: 'center',
                fontSize: '3rem',
              }}
            />

            {!isGameOver ? (
              <Input.Group compact>
                <Input
                  type="number"
                  size="large"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Nhập số"
                  onPressEnter={handleGuess}
                  autoFocus
                  style={{ width: 'calc(100% - 90px)' }}
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  onClick={handleGuess}
                  disabled={!userInput}
                  style={{ width: '90px' }}
                >
                  Đoán
                </Button>
              </Input.Group>
            ) : (
              <Button
                type="primary"
                size="large"
                block
                icon={<ReloadOutlined />}
                onClick={startNewGame}
              >
                Chơi lại
              </Button>
            )}
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default GuessNumberGame;