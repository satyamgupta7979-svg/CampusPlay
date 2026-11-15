import { api } from './api';
import type { User, Role } from '../types';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  collegeId: string;
  department: string;
  year: string;
  section: string;
  role: Role;
  avatarColor?: string;
}

/** Returned by /auth/login — MFA required, no JWT yet */
export interface MfaChallengeResponse {
  success: boolean;
  requiresMfa: true;
  challengeId: string;
  maskedEmail: string;
  expiresInMinutes: number;
  message: string;
}

export interface VerifyOtpRequest {
  challengeId: string;
  otp: string;
}

export interface ResendOtpRequest {
  challengeId: string;
}

export interface ResendOtpResponse {
  success: boolean;
  maskedEmail: string;
  expiresInMinutes: number;
  resendCooldownSeconds: number;
  message: string;
}

export const authService = {
  /**
   * Step 1 of login: validate credentials and trigger MFA.
   * Returns a challengeId — does NOT return a JWT.
   */
  async initiateLogin(credentials: LoginCredentials): Promise<MfaChallengeResponse> {
    return api.post<MfaChallengeResponse>('/auth/login', credentials);
  },

  /**
   * Step 2 of login: verify OTP with the challengeId.
   * Returns JWT + user on success.
   */
  async verifyOtp(payload: VerifyOtpRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/verify-otp', payload);
    if (res.token) {
      api.setToken(res.token);
    }
    return res;
  },

  /**
   * Resend OTP for the current MFA challenge.
   */
  async resendOtp(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
    return api.post<ResendOtpResponse>('/auth/resend-otp', payload);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    if (res.token) {
      api.setToken(res.token);
    }
    return res;
  },

  async getMe(): Promise<User> {
    const res = await api.get<{ success: boolean; user: User }>('/auth/me');
    return res.user;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      api.setToken(null);
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/reset-password', { token, password });
    if (res.token) {
      api.setToken(res.token);
    }
    return res;
  },

  async getProfile(): Promise<User> {
    const res = await api.get<{ success: boolean; user: User }>('/users/profile');
    return res.user;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await api.put<{ success: boolean; user: User }>('/users/profile', updates);
    return res.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/users/change-password', { currentPassword, newPassword });
  },

  async getUsers(params?: { role?: string; search?: string; department?: string }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);
    const qs = query.toString();
    const res = await api.get<{ success: boolean; count: number; users: User[] }>(`/users${qs ? `?${qs}` : ''}`);
    return res.users;
  },
};

export default authService;
