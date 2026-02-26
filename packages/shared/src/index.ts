// ============================================================
//  @ai-interview/shared — Central types used by both
//  the backend (Express API) and the frontend (React Native)
// ============================================================

// ── User ────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

// ── Interview ────────────────────────────────────────────────

export type InterviewStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Interview {
  _id: string;
  userId: string;
  title: string;
  jobRole: string;
  status: InterviewStatus;
  resumeUrl?: string;
  createdAt: string;
  completedAt?: string;
}

// ── Question & Answer ────────────────────────────────────────

export interface Question {
  _id: string;
  interviewId: string;
  text: string;
  order: number;
}

export interface Answer {
  _id: string;
  questionId: string;
  interviewId: string;
  userId: string;
  audioUrl?: string;
  transcription?: string;
  aiFeedback?: string;
  score?: number;
}

// ── API Response shapes ──────────────────────────────────────
// These ensure the backend sends and the frontend receives
// the same data structure — no more guessing!

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
