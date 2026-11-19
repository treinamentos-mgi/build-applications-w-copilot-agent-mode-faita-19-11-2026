import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Workout = { title: string; reason?: string; minutes?: number; difficulty?: string };
const userEmail = 'mona@example.com';
const loadWorkouts = () => getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`).then(({ suggestions }) => suggestions);

export default function Workouts() {
  return <CapabilityCard<Workout>
    title="Sugestões de treino"
    description="Receba recomendações de treino com base nos seus padrões de atividade."
    loadItems={loadWorkouts}
    emptyText="Nenhuma sugestão de treino disponível."
    itemKey={(workout, index) => `${workout.title}-${index}`}
    renderItem={(workout) => <>
      <strong>{workout.title}</strong>
      {workout.minutes !== undefined && <span> · {workout.minutes} min</span>}
      {workout.reason && <p className="mb-0">{workout.reason}</p>}
    </>}
  />;
}
