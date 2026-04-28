// @ts-ignore
/* eslint-disable */
declare namespace HealthyHub {
  export interface DashboardStats {
    totalWorkouts: number;
    totalCaloriesBurned: number;
    streakDays: number;
    goalCompletionPercentage: number;
  }

  export interface WorkoutRecord {
    _id?: string;
    date: string;
    exerciseType: 'Cardio' | 'Strength' | 'Yoga' | 'HIIT' | 'Other';
    durationMinutes: number;
    caloriesBurned: number;
    notes?: string;
    status: 'Hoàn thành' | 'Bỏ lỡ';
  }

  export interface HealthMetric {
    _id?: string;
    date: string;
    weight: number; // kg
    height: number; // cm
    bmi?: number; // Tự tính = Cân nặng / (Chiều cao/100)^2
    restingHeartRate?: number; // bpm
    notes?: string;
  }

  export interface Goal {
    _id?: string;
    name: string;
    type: 'Giảm cân' | 'Tăng cơ' | 'Cải thiện sức bền' | 'Khác';
    targetValue: number;
    currentValue: number;
    deadline: string; // ISO date string
    status: 'Đang thực hiện' | 'Đã đạt' | 'Đã hủy';
  }

  export interface Exercise {
    _id?: string;
    name: string;
    muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
    difficulty: 'Dễ' | 'Trung bình' | 'Khó';
    description?: string;
    caloriesPerHour: number;
  }
}
