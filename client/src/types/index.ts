export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

export enum TaskPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  profilePictureUrl?: string;
  phone?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  createdBy: User;
  tasks: Task[];
  members: User[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  project: Project;
  assignedToId: string;
  assignedTo?: User;
  createdById: string;
  createdBy?: User;
}

export interface SolarCompany {
  id: string;
  name: string;
  location: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
}
