import { useMemo } from 'react';
import { Card, Row, Col, Statistic, Timeline, Typography, Tag, Space, Empty } from 'antd';
import { useModel } from 'umi';
import LineChart from '@/components/Chart/LineChart';
import ColumnChart from '@/components/Chart/ColumnChart';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { workouts = [], healthMetrics = [], goals = [] } = useModel('healthy') || {};

  // Lọc dữ liệu cho tháng hiện tại
  const currentMonthWorkouts = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return workouts.filter((w: any) => {
      const wDate = new Date(w.date);
      return (
        wDate.getMonth() === currentMonth &&
        wDate.getFullYear() === currentYear &&
        w.status === 'Hoàn thành'
      );
    });
  }, [workouts]);

  // 1. TỔNG SỐ BUỔI TẬP TRONG THÁNG
  const totalWorkouts = currentMonthWorkouts.length;

  // 2. TỔNG CALO ĐÃ ĐỐT TRONG THÁNG
  const totalCaloriesBurned = currentMonthWorkouts.reduce(
    (sum: number, w: any) => sum + (Number(w.caloriesBurned) || 0),
    0
  );

  // 3. SỐ NGÀY TẬP LIÊN TIẾP (Streak)
  const streakDays = useMemo(() => {
    const completedWorkoutDates = [...new Set(
      workouts
        .filter((w: any) => w.status === 'Hoàn thành')
        .map((w: any) => new Date(new Date(w.date).setHours(0, 0, 0, 0)).getTime())
    )].sort((a: any, b: any) => b - a);

    if (completedWorkoutDates.length === 0) return 0;
    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const dayInMs = 86400000;

    let expectedDate = today;
    
    if (completedWorkoutDates[0] !== today) {
      if (completedWorkoutDates[0] === today - dayInMs) {
        expectedDate = today - dayInMs;
      } else {
        return 0;
      }
    }

    for (let i = 0; i < completedWorkoutDates.length; i++) {
      if (completedWorkoutDates[i] === expectedDate) {
        streak++;
        expectedDate -= dayInMs;
      } else {
        break;
      }
    }
    return streak;
  }, [workouts]);

  // 4. MỤC TIÊU HOÀN THÀNH (%)
  const goalCompletionPercentage = useMemo(() => {
    if (goals.length === 0) return 0;
    const achieved = goals.filter((g: any) => g.status === 'Đã đạt').length;
    return Math.round((achieved / goals.length) * 100);
  }, [goals]);

  // DỮ LIỆU BIỂU ĐỒ CỘT
  const columnChartData = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    currentMonthWorkouts.forEach((w: any) => {
      const date = new Date(w.date).getDate();
      let weekIndex = Math.floor((date - 1) / 7);
      if (weekIndex > 3) weekIndex = 3; 
      weeks[weekIndex]++;
    });

    return {
      xAxis: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
      yAxis: [weeks],
      yLabel: ['Số buổi tập']
    };
  }, [currentMonthWorkouts]);

  // DỮ LIỆU BIỂU ĐỒ ĐƯỜNG
  const lineChartData = useMemo(() => {
    const sorted = [...healthMetrics].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      xAxis: sorted.map((m: any) => new Date(m.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })),
      yAxis: [sorted.map((m: any) => m.weight)],
      yLabel: ['Cân nặng']
    };
  }, [healthMetrics]);

  // TOP 5 BUỔI TẬP GẦN NHẤT
  const recentWorkouts = useMemo(() => {
    return [...workouts]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [workouts]);

  // Style cho các thẻ Card để có nền trắng hơi đục che được logo nền nhưng vẫn chừa mép
  const cardStyle = {
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24, fontWeight: 600 }}>Dashboard - Trang Chủ</Title>

      {/* 4 Chỉ số nhanh */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: '20px 24px' }}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: '#8c8c8c' }}>Tổng buổi tập</span>} 
              value={totalWorkouts} 
              valueStyle={{ color: '#1890ff', fontWeight: 800, fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: '20px 24px' }}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: '#8c8c8c' }}>Calo đã đốt</span>} 
              value={totalCaloriesBurned} 
              suffix={<span style={{ fontSize: 16, color: '#faad14' }}>kcal</span>} 
              valueStyle={{ color: '#faad14', fontWeight: 800, fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: '20px 24px' }}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: '#8c8c8c' }}>Chuỗi ngày tập (Streak)</span>} 
              value={streakDays} 
              suffix={<span style={{ fontSize: 16, color: '#52c41a' }}>ngày</span>}
              valueStyle={{ color: '#52c41a', fontWeight: 800, fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: '20px 24px' }}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: '#8c8c8c' }}>Mục tiêu đạt được</span>} 
              value={goalCompletionPercentage} 
              suffix={<span style={{ fontSize: 16, color: '#722ed1' }}>%</span>} 
              valueStyle={{ color: '#722ed1', fontWeight: 800, fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Biểu đồ Cột và Đường */}
        <Col xs={24} lg={16}>
          <Card 
            title={<span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>📊 Tần suất tập luyện tháng này</span>} 
            bordered={false} 
            style={{ ...cardStyle, marginBottom: 24 }}
          >
            {columnChartData.yAxis[0]?.some((val: number) => val > 0) ? (
              <ColumnChart 
                xAxis={columnChartData.xAxis} 
                yAxis={columnChartData.yAxis} 
                yLabel={columnChartData.yLabel}
                formatY={(val: number) => val.toString()}
              />
            ) : (
              <Empty description={<span style={{ color: '#8c8c8c' }}>Chưa có lịch tập trong tháng này</span>} style={{ margin: '60px 0' }} />
            )}
          </Card>

          <Card 
            title={<span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>📈 Sự thay đổi cân nặng theo thời gian</span>} 
            bordered={false} 
            style={cardStyle}
          >
             {lineChartData.yAxis[0]?.length > 0 ? (
               <LineChart 
                 xAxis={lineChartData.xAxis} 
                 yAxis={lineChartData.yAxis} 
                 yLabel={lineChartData.yLabel}
                 formatY={(val: number) => Math.round(val * 10) / 10 + ' kg'}
               />
             ) : (
               <Empty description={<span style={{ color: '#8c8c8c' }}>Chưa có dữ liệu nhật ký chỉ số</span>} style={{ margin: '60px 0' }} />
             )}
          </Card>
        </Col>

        {/* Danh sách 5 buổi tập gần nhất */}
        <Col xs={24} lg={8}>
          <Card 
            title={<span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>🏆 5 Buổi tập gần nhất</span>} 
            bordered={false} 
            style={{ ...cardStyle, height: '100%' }}
          >
             {recentWorkouts.length > 0 ? (
                <Timeline style={{ marginTop: 16 }}>
                  {recentWorkouts.map((w: any, index: number) => (
                    <Timeline.Item 
                      key={w._id || String(index)} 
                      color={w.status === 'Hoàn thành' ? '#52c41a' : '#f5222d'}
                    >
                      <Space direction="vertical" size={2} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ fontSize: 14 }}>{new Date(w.date).toLocaleDateString('vi-VN')}</Text>
                          <Tag color={w.status === 'Hoàn thành' ? 'success' : 'error'} style={{ margin: 0 }}>{w.status}</Tag>
                        </div>
                        <Text type="secondary">{w.exerciseType} • {w.durationMinutes} phút</Text>
                        <Tag color="orange" style={{ width: 'fit-content', marginTop: 4 }}>🔥 {w.caloriesBurned} kcal</Tag>
                        {w.notes && (
                          <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.02)', borderRadius: 8, borderLeft: '3px solid #d9d9d9' }}>
                            <Text style={{ fontStyle: 'italic', color: '#595959', fontSize: 13 }}>{w.notes}</Text>
                          </div>
                        )}
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
             ) : (
                <Empty description={<span style={{ color: '#8c8c8c' }}>Chưa có buổi tập nào được ghi nhận</span>} style={{ margin: '60px 0' }} />
             )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
