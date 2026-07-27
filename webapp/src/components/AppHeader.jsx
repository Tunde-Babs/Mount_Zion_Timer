import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Plus, Users, Save, FolderOpen, LayoutTemplate, Share2, MessageSquare,
  Keyboard, Settings as SettingsIcon, UserCircle2, ChevronDown, Pencil, Trash2
} from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import PlanBadge from './PlanBadge';

export default function AppHeader({ onOpenSave, onOpenLoad, onOpenTemplates, onOpenShare, onOpenSettings, onOpenShortcuts, onToggleMessages, messagesOpen }) {
  const rooms = useTimerStore((s) => s.rooms);
  const activeRoomId = useTimerStore((s) => s.activeRoomId);
  const setActiveRoomId = useTimerStore((s) => s.setActiveRoomId);
  const addRoom = useTimerStore((s) => s.addRoom);
  const renameRoom = useTimerStore((s) => s.renameRoom);
  const deleteRoom = useTimerStore((s) => s.deleteRoom);
  const { user, isPremium, signOut, enabled } = useAuth();
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  return (
    <header className="flex flex-shrink-0 flex-col gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-brand-600 p-1.5"><Clock className="h-4 w-4 text-white" /></div>
          <span className="hidden font-bold sm:inline">Mount Zion Timer</span>
        </Link>

        <div className="relative">
          <button onClick={() => setRoomMenuOpen((v) => !v)} className="btn-secondary btn-sm">
            <Users className="h-3.5 w-3.5" /> {activeRoom.name} <ChevronDown className="h-3 w-3" />
          </button>
          {roomMenuOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-900" onMouseLeave={() => setRoomMenuOpen(false)}>
              {rooms.map((room) => (
                <div key={room.id} className={`group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm ${room.id === activeRoomId ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <button className="flex-1 text-left" onClick={() => { setActiveRoomId(room.id); setRoomMenuOpen(false); }}>
                    {room.name}
                  </button>
                  <div className="hidden items-center gap-1 group-hover:flex">
                    <button
                      onClick={() => {
                        const name = prompt('Rename session', room.name);
                        if (name?.trim()) renameRoom(room.id, name.trim());
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {rooms.length > 1 && (
                      <button onClick={() => deleteRoom(room.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={() => { addRoom(); setRoomMenuOpen(false); }} className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10">
                <Plus className="h-3.5 w-3.5" /> New session
              </button>
            </div>
          )}
        </div>
        <PlanBadge />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <ThemeToggle />
        <button onClick={onOpenSettings} className="btn-ghost btn-sm" title="Settings"><SettingsIcon className="h-4 w-4" /></button>
        <button onClick={onOpenShortcuts} className="btn-ghost btn-sm" title="Keyboard shortcuts"><Keyboard className="h-4 w-4" /></button>
        <button onClick={onOpenTemplates} className="btn-secondary btn-sm"><LayoutTemplate className="h-3.5 w-3.5" /> Templates</button>
        <button onClick={onOpenSave} className="btn-secondary btn-sm"><Save className="h-3.5 w-3.5" /> Save</button>
        <button onClick={onOpenLoad} className="btn-secondary btn-sm"><FolderOpen className="h-3.5 w-3.5" /> Load</button>
        <button onClick={onOpenShare} className="btn-primary btn-sm"><Share2 className="h-3.5 w-3.5" /> Presenter</button>
        <button onClick={onToggleMessages} className={messagesOpen ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>
          <MessageSquare className="h-3.5 w-3.5" /> Messages
        </button>

        {enabled && (
          user ? (
            <Link to="/account" className="btn-ghost btn-sm" title={user.email}>
              <UserCircle2 className="h-4 w-4" />
            </Link>
          ) : (
            <Link to="/login" className="btn-ghost btn-sm">Sign in</Link>
          )
        )}
      </div>
    </header>
  );
}
