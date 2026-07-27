import { supabase } from './supabaseClient';

// Cloud persistence is intentionally narrow: only account/plan status and the
// saved-schedule library sync to Supabase. Live timer state stays local per
// device (see store/useTimerStore.js) and cross-device presenter sync is
// handled separately, ephemerally, via lib/presenterChannel.js. That split
// keeps the schema tiny and avoids fighting Realtime for sub-second state.

export async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function fetchSchedules(userId) {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createSchedule(userId, schedule) {
  const { data, error } = await supabase
    .from('schedules')
    .insert({
      user_id: userId,
      name: schedule.name,
      room_name: schedule.roomName,
      timers: schedule.timers
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteScheduleCloud(scheduleId) {
  const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
  if (error) throw error;
}
