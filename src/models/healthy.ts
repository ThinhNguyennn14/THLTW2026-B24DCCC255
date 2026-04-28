import { useState, useEffect } from 'react';
import { message } from 'antd';

export default () => {
  // --- States ---
  const [workouts, setWorkouts] = useState<HealthyHub.WorkoutRecord[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthyHub.HealthMetric[]>([]);
  const [goals, setGoals] = useState<HealthyHub.Goal[]>([]);
  const [exercises, setExercises] = useState<HealthyHub.Exercise[]>([]);

  // --- Load Data Initial ---
  const loadData = () => {
    const localWorkouts = JSON.parse(localStorage.getItem('healthy_workouts') || '[]');
    const localMetrics = JSON.parse(localStorage.getItem('healthy_metrics') || '[]');
    const localGoals = JSON.parse(localStorage.getItem('healthy_goals') || '[]');
    const localExercises = JSON.parse(localStorage.getItem('healthy_exercises') || '[]');

    setWorkouts(localWorkouts);
    setHealthMetrics(localMetrics);
    setGoals(localGoals);
    setExercises(localExercises);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // 1. WORKOUTS (Nhật ký tập luyện) CRUD
  // ==========================================
  const addWorkout = (workout: HealthyHub.WorkoutRecord) => {
    const newData = [{ ...workout, _id: Date.now().toString() }, ...workouts];
    setWorkouts(newData);
    localStorage.setItem('healthy_workouts', JSON.stringify(newData));
    message.success('Thêm buổi tập thành công');
  };

  const updateWorkout = (id: string, workout: HealthyHub.WorkoutRecord) => {
    const newData = workouts.map(w => w._id === id ? { ...w, ...workout } : w);
    setWorkouts(newData);
    localStorage.setItem('healthy_workouts', JSON.stringify(newData));
    message.success('Cập nhật buổi tập thành công');
  };

  const deleteWorkout = (id: string) => {
    const newData = workouts.filter(w => w._id !== id);
    setWorkouts(newData);
    localStorage.setItem('healthy_workouts', JSON.stringify(newData));
    message.success('Xóa buổi tập thành công');
  };

  // ==========================================
  // 2. HEALTH METRICS (Chỉ số sức khỏe) CRUD
  // ==========================================
  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
  };

  const addHealthMetric = (metric: HealthyHub.HealthMetric) => {
    const bmi = calculateBMI(metric.weight, metric.height);
    const newData = [{ ...metric, bmi, _id: Date.now().toString() }, ...healthMetrics];
    setHealthMetrics(newData);
    localStorage.setItem('healthy_metrics', JSON.stringify(newData));
    message.success('Thêm chỉ số sức khỏe thành công');
  };

  const updateHealthMetric = (id: string, metric: HealthyHub.HealthMetric) => {
    const bmi = calculateBMI(metric.weight, metric.height);
    const newData = healthMetrics.map(m => m._id === id ? { ...m, ...metric, bmi } : m);
    setHealthMetrics(newData);
    localStorage.setItem('healthy_metrics', JSON.stringify(newData));
    message.success('Cập nhật chỉ số sức khỏe thành công');
  };

  const deleteHealthMetric = (id: string) => {
    const newData = healthMetrics.filter(m => m._id !== id);
    setHealthMetrics(newData);
    localStorage.setItem('healthy_metrics', JSON.stringify(newData));
    message.success('Xóa chỉ số sức khỏe thành công');
  };

  // ==========================================
  // 3. GOALS (Quản lý mục tiêu) CRUD
  // ==========================================
  const addGoal = (goal: HealthyHub.Goal) => {
    const newData = [{ ...goal, _id: Date.now().toString() }, ...goals];
    setGoals(newData);
    localStorage.setItem('healthy_goals', JSON.stringify(newData));
    message.success('Thêm mục tiêu thành công');
  };

  const updateGoal = (id: string, goal: HealthyHub.Goal) => {
    const newData = goals.map(g => g._id === id ? { ...g, ...goal } : g);
    setGoals(newData);
    localStorage.setItem('healthy_goals', JSON.stringify(newData));
    message.success('Cập nhật mục tiêu thành công');
  };

  const deleteGoal = (id: string) => {
    const newData = goals.filter(g => g._id !== id);
    setGoals(newData);
    localStorage.setItem('healthy_goals', JSON.stringify(newData));
    message.success('Xóa mục tiêu thành công');
  };

  // ==========================================
  // 4. EXERCISES (Thư viện bài tập) CRUD
  // ==========================================
  const addExercise = (ex: HealthyHub.Exercise) => {
    const newData = [{ ...ex, _id: Date.now().toString() }, ...exercises];
    setExercises(newData);
    localStorage.setItem('healthy_exercises', JSON.stringify(newData));
    message.success('Thêm bài tập thành công');
  };

  const updateExercise = (id: string, ex: HealthyHub.Exercise) => {
    const newData = exercises.map(e => e._id === id ? { ...e, ...ex } : e);
    setExercises(newData);
    localStorage.setItem('healthy_exercises', JSON.stringify(newData));
    message.success('Cập nhật bài tập thành công');
  };

  const deleteExercise = (id: string) => {
    const newData = exercises.filter(e => e._id !== id);
    setExercises(newData);
    localStorage.setItem('healthy_exercises', JSON.stringify(newData));
    message.success('Xóa bài tập thành công');
  };

  return {
    // Workouts
    workouts, setWorkouts, addWorkout, updateWorkout, deleteWorkout,
    // Metrics
    healthMetrics, setHealthMetrics, addHealthMetric, updateHealthMetric, deleteHealthMetric,
    // Goals
    goals, setGoals, addGoal, updateGoal, deleteGoal,
    // Exercises
    exercises, setExercises, addExercise, updateExercise, deleteExercise,
    // Utils
    loadData
  };
};
