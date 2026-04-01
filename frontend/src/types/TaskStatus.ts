export type TaskStatus = "pending" | "in_progress" | "completed";
export type UserRole = "manager" | "employee";
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string;
  importance_degree: number;
  evaluation?: {
    objective_score: number;
    subjective_score: number;
    feedback: string;
    evaluated_by?: string;
    final_score?:number;
  };
}