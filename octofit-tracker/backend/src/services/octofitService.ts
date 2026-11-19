import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Os dados da atividade são inválidos'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' || !mongoose.isObjectIdOrHexString(userId) ||
    typeof teamId !== 'string' || !mongoose.isObjectIdOrHexString(teamId) ||
    typeof type !== 'string' || !type.trim() ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0
  ) {
    throw Object.assign(new Error('Os dados da atividade são inválidos'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id'),
    Team.findById(teamId).select('_id'),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('A pessoa ou equipe informada não existe'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Os dados da equipe são inválidos'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof mascot !== 'string' || !mascot.trim() ||
    !Array.isArray(members) ||
    members.some((member) => typeof member !== 'string' || !mongoose.isObjectIdOrHexString(member))
  ) {
    throw Object.assign(new Error('Os dados da equipe são inválidos'), { status: 400 });
  }

  const memberIds = [...new Set((members as string[]).map((member) => member.toLowerCase()))];
  const existingMembers = await User.find({ _id: { $in: memberIds } }).select('_id');
  if (existingMembers.length !== memberIds.length) {
    throw Object.assign(new Error('Um ou mais integrantes informados não existem'), { status: 404 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate<{ teamName: string; totalPoints: number }>([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    {
      $project: {
        _id: 0,
        teamName: '$name',
        totalPoints: { $sum: '$activities.points' },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) {
    throw Object.assign(new Error('Pessoa não encontrada'), { status: 404 });
  }

  const recentActivity = await Activity.findOne({ user: user._id })
    .sort({ occurredAt: -1 })
    .lean();
  const workouts = await Workout.find().lean();
  const goalLabels: Record<string, string> = {
    endurance: 'resistência',
    strength: 'força',
    run: 'corrida',
  };
  const activityLabels: Record<string, string> = {
    run: 'corrida',
    cycle: 'ciclismo',
    walk: 'caminhada',
    strength: 'força',
  };
  const goalLabel = goalLabels[user.fitnessGoal] ?? user.fitnessGoal;
  const recentActivityLabel = recentActivity
    ? activityLabels[recentActivity.type] ?? recentActivity.type
    : undefined;

  return workouts
    .sort((left, right) => Number(right.focus === user.fitnessGoal) - Number(left.focus === user.fitnessGoal))
    .map((workout) => ({
      ...workout,
      reason: workout.focus === user.fitnessGoal && recentActivityLabel
        ? `Recomendado pela atividade recente de ${recentActivityLabel} e pela meta de ${goalLabel}.`
        : `Recomendado para sua meta de ${goalLabel}.`,
    }));
}

export { User };
