import { ITask } from "../services/TaskManagement/typing";
import { Status } from "../services/TaskManagement/constant";

const LOCAL_STORAGE_KEY = 'tasks';

// Hàm lấy tất cả các task từ localStorage
export const getTasks = (): ITask[] => {
  try {
    const tasksJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error("Lỗi khi đọc tasks từ localStorage", error);
    return [];
  }
};

// Hàm lưu tất cả các task vào localStorage
const saveTasks = (tasks: ITask[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Lỗi khi lưu tasks vào localStorage", error);
  }
};

// Hàm thêm một task mới
export const addTask = (taskData: Omit<ITask, 'id' | 'status'>): ITask => {
  const tasks = getTasks();
  const newTask: ITask = {
    id: new Date().getTime().toString(), // Tạo ID đơn giản
    status: Status.TODO, // Trạng thái mặc định
    ...taskData,
  };
  const updatedTasks = [...tasks, newTask];
  saveTasks(updatedTasks);
  return newTask;
};

// Hàm cập nhật một task đã có
export const updateTask = (taskId: string, updates: Partial<Omit<ITask, 'id'>>): ITask | undefined => {
  const tasks = getTasks();
  let updatedTask: ITask | undefined;
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      updatedTask = { ...task, ...updates };
      return updatedTask;
    }
    return task;
  });

  if (updatedTask) {
    saveTasks(updatedTasks);
  }
  
  return updatedTask;
};

// Hàm xóa một task
export const deleteTask = (taskId: string): void => {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  saveTasks(updatedTasks);
};