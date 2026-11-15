import api from './api';
import type { Registration, RegistrationStatus } from '../types';

export interface CreateRegistrationPayload {
  tournamentId: string;
  type: 'team' | 'individual';
  teamName?: string;
  playerNames: string[];
  captainName?: string;
}

export const registrationService = {
  async createRegistration(payload: CreateRegistrationPayload): Promise<Registration> {
    const res = await api.post<{ success: boolean; message: string; registration: Registration }>(
      '/registrations',
      payload
    );
    return res.registration;
  },

  async getMyRegistrations(): Promise<Registration[]> {
    const res = await api.get<{ success: boolean; count: number; registrations: Registration[] }>('/registrations/my');
    return res.registrations;
  },

  async getAllRegistrations(params?: { tournamentId?: string; status?: string; type?: string }): Promise<Registration[]> {
    const query = new URLSearchParams();
    if (params?.tournamentId) query.append('tournamentId', params.tournamentId);
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.type) query.append('type', params.type);
    const qs = query.toString();
    const res = await api.get<{ success: boolean; count: number; registrations: Registration[] }>(
      `/registrations${qs ? `?${qs}` : ''}`
    );
    return res.registrations;
  },

  async updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<Registration> {
    const res = await api.patch<{ success: boolean; message: string; registration: Registration }>(
      `/registrations/${id}/status`,
      { status }
    );
    return res.registration;
  },

  async cancelRegistration(id: string): Promise<void> {
    await api.delete(`/registrations/${id}`);
  },
};

export default registrationService;

