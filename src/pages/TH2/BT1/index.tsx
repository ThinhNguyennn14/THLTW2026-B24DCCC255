import { useState } from 'react';
import { Button, Row, Col, Typography, List, Card, Divider } from 'antd';

const { Title, Text } = Typography;

const CHOICES = ['Búa', 'Kéo', 'Bao'];

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const handlePlayerChoice = (choice: string) => {
    const randomComputerChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    let resultText = '';

    if (choice === randomComputerChoice) {
      resultText = 'Hòa';
    } else if (
      (choice === 'Búa' && randomComputerChoice === 'Kéo') ||
      (choice === 'Kéo' && randomComputerChoice === 'Bao') ||
      (choice === 'Bao' && randomComputerChoice === 'Búa')
    ) {
      resultText = 'Bạn Thắng';
    } else {
      resultText = 'Bạn Thua';
    }

    setPlayerChoice(choice);
    setComputerChoice(randomComputerChoice);
    setResult(resultText);
    setHistory([
      `Bạn chọn: ${choice} - Máy chọn: ${randomComputerChoice} => ${resultText}`,
      ...history,
    ]);
  };

  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: 'auto' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center' }}>
          Trò chơi Oẳn Tù Tì
        </Title>
        <Row justify="center" gutter={16} style={{ marginBottom: '20px' }}>
          {CHOICES.map((choice) => (
            <Col key={choice}>
              <Button
                type="primary"
                size="large"
                onClick={() => handlePlayerChoice(choice)}
              >
                {choice}
              </Button>
            </Col>
          ))}
        </Row>

        {playerChoice && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text strong>Bạn đã chọn: </Text>
            <Text>{playerChoice}</Text>
            <br />
            <Text strong>Máy đã chọn: </Text>
            <Text>{computerChoice}</Text>
            <br />
            <Title level={4}>Kết quả: {result}</Title>
          </div>
        )}

        <Divider>Lịch sử các ván đấu</Divider>

        <List
          bordered
          dataSource={history}
          renderItem={(item) => <List.Item>{item}</List.Item>}
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        />
      </Card>
    </div>
  );
};

export default RockPaperScissors;
