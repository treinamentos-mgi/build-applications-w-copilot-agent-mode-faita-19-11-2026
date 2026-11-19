import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
const loadLeaderboard = () => getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard').then(({ leaderboard }) => leaderboard);

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardEntry>
    title="Placar"
    description="Compare a pontuação total das equipes."
    loadItems={loadLeaderboard}
    emptyText="Sem classificação disponível."
    itemKey={(entry) => entry.teamName}
    renderItem={(entry) => <><strong>{entry.rank}º lugar · {entry.teamName}</strong> · {entry.totalPoints} pontos</>}
  />;
}
