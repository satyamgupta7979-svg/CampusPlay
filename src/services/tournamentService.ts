import api from './api';
import type { Tournament, Team, Match } from '../types';

export const tournamentService = {
  async getTournaments(params?: { sport?: string; status?: string; search?: string }): Promise<Tournament[]> {
    const query = new URLSearchParams();
    if (params?.sport && params.sport !== 'All sports') query.append('sport', params.sport);
    if (params?.status && params.status !== 'All statuses') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    const res = await api.get<{ success: boolean; count: number; tournaments: Tournament[] }>(
      `/tournaments${qs ? `?${qs}` : ''}`
    );
    return res.tournaments;
  },

  async getTournamentById(id: string): Promise<Tournament> {
    const res = await api.get<{ success: boolean; tournament: Tournament }>(`/tournaments/${id}`);
    return res.tournament;
  },

  async createTournament(data: Partial<Tournament>): Promise<Tournament> {
    const res = await api.post<{ success: boolean; message: string; tournament: Tournament }>('/tournaments', data);
    return res.tournament;
  },

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const res = await api.put<{ success: boolean; message: string; tournament: Tournament }>(
      `/tournaments/${id}`,
      updates
    );
    return res.tournament;
  },

  async deleteTournament(id: string): Promise<void> {
    await api.delete(`/tournaments/${id}`);
  },

  async getTournamentTeams(id: string): Promise<Team[]> {
    const res = await api.get<{ success: boolean; count: number; teams: Team[] }>(`/tournaments/${id}/teams`);
    return res.teams;
  },

  async getTournamentFixtures(id: string): Promise<Match[]> {
    const res = await api.get<{ success: boolean; count: number; matches: Match[] }>(`/tournaments/${id}/fixtures`);
    return res.matches;
  },

  async getTournamentParticipants(id: string): Promise<{ count: number; participants: string[] }> {
    return api.get<{ success: boolean; count: number; participants: string[] }>(`/tournaments/${id}/participants`);
  },
};

export default tournamentService;

