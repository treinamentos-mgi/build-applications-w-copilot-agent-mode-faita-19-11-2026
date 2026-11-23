import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Activity = { _id?: string; type: string; minutes: number; points: number; occurredAt?: string };
const activityLabels: Record<string, string> = { run: 'Corrida', cycle: 'Ciclismo', walk: 'Caminhada', strength: 'Força' };
const loadActivities = () => getJson<{ activities: Activity[] }>('/api/activities').then(({ activities }) => activities);

export default function Activities() {
  return <CapabilityCard<Activity>
    title="Atividades"
    description="Acompanhe os minutos de atividade e os pontos das pessoas participantes."
    loadItems={loadActivities}
    emptyText="Nenhuma atividade registrada."
    itemKey={(activity, index) => activity._id ?? `${activity.type}-${activity.occurredAt ?? index}`}
    renderItem={(activity) => <><strong>{activityLabels[activity.type] ?? activity.type}</strong> · {activity.minutes} min · {activity.points} pontos</>}
  />;
}
