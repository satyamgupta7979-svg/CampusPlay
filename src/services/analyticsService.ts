import api from './api';

export interface DashboardMetrics {
  totalTournaments: number;
  activeTournaments: number;
  upcomingTournaments: number;
  completedTournaments: number;
  totalTeams: number;
  totalParticipants: number;
  pendingRegistrations: number;
  upcomingMatches: number;
  completedMatches: number;
  liveMatches: number;
}

export interface ParticipationMetrics {
  bySport: Array<{
    sport: string;
    tournamentCount: number;
    teamCount: number;
    registrationCount: number;
  }>;
  byDepartment: Array<{
    department: string;
    teams: number;
    totalPoints: number;
    totalWins: number;
  }>;
}

export interface PerformanceMetrics {
  topTeams: Array<{
    id: string;
    name: string;
    department: string;
    played: number;
    wins: number;
    losses: number;
    points: number;
    tournamentName?: string;
    sport?: string;
  }>;
  matchDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

export const analyticsService = {
  async getDashboardAnalytics(): Promise<DashboardMetrics> {
    const res = await api.get<{ success: boolean; data: DashboardMetrics }>('/analytics/dashboard');
    return res.data;
  },

  async getParticipationAnalytics(): Promise<ParticipationMetrics> {
    const res = await api.get<{ success: boolean; data: ParticipationMetrics }>('/analytics/participation');
    return res.data;
  },

  async getPerformanceAnalytics(): Promise<PerformanceMetrics> {
    const res = await api.get<{ success: boolean; data: PerformanceMetrics }>('/analytics/performance');
    return res.data;
  },
};

export default analyticsService;

