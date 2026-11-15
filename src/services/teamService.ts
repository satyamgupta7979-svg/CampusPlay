import api from './api';
import type { Team } from '../types';

export const teamService = {
  async getTeams(params?: { tournamentId?: string; department?: string }): Promise<Team[]> {
    const query = new URLSearchParams();
    if (params?.tournamentId) query.append('tournamentId', params.tournamentId);
    if (params?.department) query.append('department', params.department);
    const qs = query.toString();
    const res = await api.get<{ success: boolean; count: number; teams: Team[] }>(`/teams${qs ? `?${qs}` : ''}`);
    return res.teams;
  },

  async getTeamById(id: string): Promise<Team> {
    const res = await api.get<{ success: boolean; team: Team }>(`/teams/${id}`);
    return res.team;
  },

  async createTeam(data: Partial<Team>): Promise<Team> {
    const res = await api.post<{ success: boolean; message: string; team: Team }>('/teams', data);
    return res.team;
  },

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
    const res = await api.put<{ success: boolean; message: string; team: Team }>(`/teams/${id}`, updates);
    return res.team;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  async addPlayer(id: string, payload: { playerId?: string; playerName?: string }): Promise<Team> {
    const res = await api.post<{ success: boolean; message: string; team: Team }>(`/teams/${id}/players`, payload);
    return res.team;
  },

  async removePlayer(id: string, playerId: string): Promise<Team> {
    const res = await api.delete<{ success: boolean; message: string; team: Team }>(`/teams/${id}/players/${playerId}`);
    return res.team;
  },

  async assignCaptain(id: string, newCaptainId: string): Promise<Team> {
    const res = await api.patch<{ success: boolean; message: string; team: Team }>(`/teams/${id}/captain`, {
      newCaptainId,
    });
    return res.team;
  },
};

export default teamService;

