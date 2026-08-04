import { supabase, isSupabaseConfigured } from './supabaseClient';

// Presenter sync has two layers:
//  1. BroadcastChannel — instant, same-device, works with zero configuration
//     (e.g. control laptop + presenter tab dragged onto the projector output).
//  2. Supabase Realtime broadcast (optional) — lets the presenter view run on a
//     *different* device (a phone controlling a laptop plugged into a screen).
// Both publish the same payload shape; the presenter view merges by timestamp.
//
// Neither layer retains history: a presenter opening mid-session has missed every
// broadcast sent before it joined. So joining presenters ask for the current state
// and the control panel answers immediately — see REQUEST_EVENT below. Without
// that handshake a late joiner shows "Waiting for the control panel…" until the
// next state change, which may be a long time (or never, if the control tab is in
// the background and has stopped publishing).

const STATE_EVENT = 'state';
const REQUEST_EVENT = 'request-state';

function channelName(roomCode) {
  return `mzt-presenter-${roomCode}`;
}

export function createPresenterPublisher(roomCode) {
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName(roomCode)) : null;
  const realtime = isSupabaseConfigured ? supabase.channel(channelName(roomCode), { config: { broadcast: { self: false } } }) : null;

  let handleRequest = null;

  // Only reacts to join requests. Other tabs' state broadcasts also arrive here
  // (BroadcastChannel is per-origin, not per-tab) and are deliberately ignored.
  if (bc) {
    bc.onmessage = (e) => {
      if (e.data?.type === REQUEST_EVENT) handleRequest?.();
    };
  }
  if (realtime) {
    realtime.on('broadcast', { event: REQUEST_EVENT }, () => handleRequest?.());
    realtime.subscribe();
  }

  return {
    publish(state) {
      const payload = { ...state, type: STATE_EVENT, ts: Date.now() };
      bc?.postMessage(payload);
      realtime?.send({ type: 'broadcast', event: STATE_EVENT, payload });
    },
    /** Called when a presenter joins and asks for the current state. */
    onStateRequest(fn) {
      handleRequest = fn;
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
  let realtime = null;

  const handle = (payload) => {
    // Requires a numeric ts, which also filters out our own REQUEST_EVENT frames.
    // Payloads from an older build carry no `type`, so key off ts rather than it.
    if (typeof payload?.ts !== 'number' || payload.ts < latestTs) return;
    latestTs = payload.ts;
    onState(payload);
  };

  const requestState = () => {
    bc?.postMessage({ type: REQUEST_EVENT });
    realtime?.send({ type: 'broadcast', event: REQUEST_EVENT, payload: {} });
  };

  if (bc) bc.onmessage = (e) => handle(e.data);

  if (isSupabaseConfigured) {
    realtime = supabase.channel(channelName(roomCode), { config: { broadcast: { self: false } } });
    realtime.on('broadcast', { event: STATE_EVENT }, ({ payload }) => handle(payload));
    // Ask again once actually joined — send() before SUBSCRIBED is dropped.
    realtime.subscribe((status) => {
      if (status === 'SUBSCRIBED') requestState();
    });
  }

  // BroadcastChannel needs no join, so a same-device presenter is served at once.
  requestState();

  return () => {
    bc?.close();
    if (realtime) supabase.removeChannel(realtime);
  };
}
