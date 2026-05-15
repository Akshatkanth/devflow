// ─── Enums ────────────────────────────────────────────────────────────────────

export enum DeploymentStatus {
  QUEUED = 'QUEUED',
  CLONING = 'CLONING',
  VALIDATING = 'VALIDATING',
  BUILDING = 'BUILDING',
  HEALTH_CHECK = 'HEALTH_CHECK',
  HEALTHY = 'HEALTHY',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SUCCESS = 'success',
}

export enum ProjectRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  branch: string;
  description: string | null;
  framework: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectWithStats extends Project {
  deploymentCount: number;
  lastDeployment: Deployment | null;
}

// ─── Deployment ───────────────────────────────────────────────────────────────

export interface Deployment {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  commitSha: string | null;
  commitMessage: string | null;
  triggeredBy: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  duration: number | null;    // seconds
  error: string | null;
  createdAt: Date;
}

export interface DeploymentLog {
  id: string;
  deploymentId: string;
  message: string;
  level: LogLevel;
  timestamp: Date;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export interface WsDeploymentEvent {
  deploymentId: string;
  type: 'log' | 'status';
}

export interface WsLogEvent extends WsDeploymentEvent {
  type: 'log';
  log: {
    message: string;
    level: LogLevel;
    timestamp: string;
  };
}

export interface WsStatusEvent extends WsDeploymentEvent {
  type: 'status';
  status: DeploymentStatus;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
