import React, { useState } from 'react';
import { Send, X, MessageSquareOff, Eye, EyeOff, Trash2 } from 'lucide-react';

export default function MessagesPanel({ messages, onSend, onClear, onToggleVisibility, onDelete, onClose }) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <aside className="flex w-full flex-shrink-0 flex-col border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03] sm:w-96 sm:border-l">
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
        <h3 className="font-semibold">Presenter messages</h3>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button onClick={onClear} className="btn-ghost btn-sm !px-2" title="Clear all messages">
              <MessageSquareOff className="h-4 w-4" />
            </button>
          )}
          <button onClick={onClose} className="btn-ghost btn-sm !px-2 sm:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No messages yet. Announcements appear on the presenter screen.</p>}
        {[...messages].reverse().map((msg) => {
          const isVisible = msg.visible !== false;
          return (
            <div key={msg.id} className={`rounded-lg p-3 text-sm transition-colors ${isVisible ? 'bg-slate-50 dark:bg-white/5' : 'bg-slate-50/50 opacity-60 dark:bg-white/[0.02]'}`}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">{msg.timestamp}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleVisibility(msg.id)}
                    className={`rounded p-1 ${isVisible ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    title={isVisible ? 'Visible on presenter screen — click to hide' : 'Hidden from presenter screen — click to show'}
                  >
                    {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => onDelete(msg.id)}
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                    title="Delete message"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {msg.text}
              {!isVisible && <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Hidden</div>}
            </div>
          );
        })}
      </div>
      <div className="border-t border-slate-200 p-4 dark:border-white/10">
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Send an announcement…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button onClick={submit} className="btn-primary btn-md !px-3">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
