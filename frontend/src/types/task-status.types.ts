export type TaskStatus = 'pending' | 'running' | 'succeeded' | 'failed' | null;

export type TaskStatusEntry = {
  status: TaskStatus;
  error: string | null;
} | null;
