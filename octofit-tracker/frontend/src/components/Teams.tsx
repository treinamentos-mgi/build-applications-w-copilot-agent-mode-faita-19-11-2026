import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Team = { _id?: string; name: string; mascot?: string; members?: string[] };
const loadTeams = () => getJson<{ teams: Team[] }>('/api/teams').then(({ teams }) => teams);

export default function Teams() {
  return <CapabilityCard<Team>
    title="Equipes"
    description="Gerencie equipes e integrantes."
    loadItems={loadTeams}
    emptyText="Nenhuma equipe cadastrada."
    itemKey={(team, index) => team._id ?? `${team.name}-${index}`}
    renderItem={(team) => <>
      <strong>{team.name}</strong>{team.mascot && <span> · Mascote: {team.mascot}</span>}
      <p className="mb-0">{team.members?.length ?? 0} integrantes</p>
    </>}
  />;
}
