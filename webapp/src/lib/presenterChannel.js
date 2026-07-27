import { supabase, isSupabaseConfigured } from './supabaseClient';

// Presenter sync has two layers:
//  1. BroadcastChannel — instant, same-device, works with zero configuration
//     (e.g. control laptop + presenter tab dragged onto the projector output).
//  2. Supabase Realtime broadcast (optional) — lets the presenter view run on a
//     *different* device (a phone controlling a laptop plugged into a screen).
// Both publish the same payload shape; the presenter view merges by timestamp.

function channelName(roomCode) {
  return `mzt-presenter-${roomCode}`;
}

export function createPresenterPublisher(roomCode) {
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName(roomCode)) : null;
  const realtime = isSupabaseConfigured ? supabase.channel(channelName(roomCode), { config: { broadcast: { self: false } } }) : null;
  if (realtime) realtime.subscribe();

  return {
    publish(state) {
      const payload = { ...state, ts: Date.now() };
      bc?.postMessage(payload);
      realtime?.send({ type: 'broadcast', event: 'state', payload });
    },
    close() {
      bc?.close();
      if (realtime) supabase.removeChannel(realtime);
    }
  };
}

export function subscribePresenterChannel(roomCode, onState) {
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName(roomCode)) : null;
  let latestTs = 0;

  const handle = (payload) => {
    if (!payload || payload.ts < latestTs) return;
    latestTs = payload.ts;
    onState(payload);
  };

  if (bc) bc.onmessage = (e) => handle(e.data);

  let realtime = null;
  if (isSupabaseConfigured) {
    realtime = supabase.channel(channelName(roomCode), { config: { broadcast: { self: false } } });
    realtime.on('broadcast', { event: 'state' }, ({ payload }) => handle(payload));
    realtime.subscribe();
  }

  return () => {
    bc?.close();
    if (realtime) supabase.removeChannel(realtime);
  };
}
