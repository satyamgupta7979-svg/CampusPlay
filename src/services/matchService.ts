import api from './api';
import type { Match, Team, Tournament } from '../types';

export interface LeaderboardResponse {
  success: boolean;
  tournament: Tournament;
  count: number;
  leaderboard: Array<Team & { rank: number }>;
}

export const matchService = {
  async getMatches(params?: { tournamentId?: string; status?: string; date?: string; venue?: string }): Promise<Match[]> {
    const query = new URLSearchParams();
    if (params?.tournamentId) query.append('tournamentId', params.tournamentId);
    if (params?.status) query.append('status', params.status);
    if (params?.date) query.append('date', params.date);
    if (params?.venue) query.append('venue', params.venue);
    const qs = query.toString();
    const res = await api.get<{ success: boolean; count: number; matches: Match[] }>(`/matches${qs ? `?${qs}` : ''}`);
    return res.matches;
  },

  async getMatchById(id: string): Promise<Match> {
    const res = await api.get<{ success: boolean; match: Match }>(`/matches/${id}`);
    return res.match;
  },

  async createMatch(data: Partial<Match>): Promise<Match> {
    const res = await api.post<{ success: boolean; message: string; match: Match }>('/matches', data);
    return res.match;
  },

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match> {
    const res = await api.put<{ success: boolean; message: string; match: Match }>(`/matches/${id}`, updates);
    return res.match;
  },

  async updateMatchScore(
    id: string,
    scoreData: { scoreA?: string; scoreB?: string; overs?: string; notice?: string; status?: string }
  ): Promise<Match> {
    const res = await api.patch<{ success: boolean; message: string; match: Match }>(
      `/matches/${id}/score`,
      scoreData
    );
    return res.match;
  },

  async deleteMatch(id: string): Promise<void> {
    await api.delete(`/matches/${id}`);
  },

  async submitResult(
    matchId: string,
    resultData: { scoreA?: string; scoreB?: string; winnerId?: string; notice?: string; overs?: string }
  ): Promise<Match> {
    const res = await api.post<{ success: boolean; message: string; match: Match }>(
      `/results/${matchId}`,
      resultData
    );
    return res.match;
  },

  async getResults(params?: { tournamentId?: string }): Promise<Match[]> {
    const query = new URLSearchParams();
    if (params?.tournamentId) query.append('tournamentId', params.tournamentId);
    const qs = query.toString();
    const res = await api.get<{ success: boolean; count: number; results: Match[] }>(`/results${qs ? `?${qs}` : ''}`);
    return res.results;
  },

  async getLeaderboard(tournamentId: string): Promise<LeaderboardResponse> {
    return api.get<LeaderboardResponse>(`/results/leaderboard/${tournamentId}`);
  },
};

export default matchService;

