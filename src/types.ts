export interface Material {
  id: string;
  type: 'pdf' | 'video' | 'link';
  title: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  deadline: string;
  description: string;
  order?: number;
  attachmentUrl?: string;
  editionId?: string;
}

export interface ClassModule {
  id: string;
  order?: number;
  title: string;
  description: string;
  materials: Material[];
  extra: Material[];
  task: Task | null;
  visible: boolean;
  notebookLMUrl?: string;
  editionId?: string;
}

export interface ForumPost {
  id: string;
  user: string;
  text: string;
  date: string;
  uid: string;
  editionId?: string;
  replies?: ForumPost[];
}

export interface Submission {
  id: string;
  studentName: string;
  studentUid: string;
  taskId: string;
  taskTitle: string;
  fileName: string;
  fileUrl: string;
  date: string;
  status: 'Recibido' | 'Calificado';
  editionId?: string;
  studentComment?: string;
  teacherFeedback?: string;
}

export interface Edition {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  status: 'activa' | 'archivada' | 'planificada';
  createdAt: string;
  createdOrder?: number;
}

export type UserRole = 'profesor' | 'alumno' | 'administrador';
export type UserStatus = 'pending' | 'approved';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  enrolledEditions?: string[];
  defaultEditionId?: string;
  survey_completed?: boolean;
  suggested_level?: 'Principiante' | 'Avanzado';
  teacherFeedback?: string;
}

export interface SurveyResponse {
  id: string;
  user_id: string;
  user_name: string;
  familiarity: number;
  tools: string[];
  frequency: string;
  professional_profile: string;
  automation_goal: string;
  technical_validation: string;
  timestamp: string;
  suggested_level: 'Principiante' | 'Avanzado';
  editionId?: string;
  custom_responses?: Record<string, string>;
}
