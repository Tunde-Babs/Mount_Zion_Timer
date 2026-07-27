import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, ExternalLink, Radio } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function ShareRoomModal({ roomCode, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const presenterUrl = `${window.location.origin}/present/${roomCode}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, presenterUrl, { width: 200, margin: 1, color: { dark: '#111827', light: '#ffffff' } });
    }
  }, [presenterUrl]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(presenterUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-sm p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share Presenter View</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Open this link on a projector, TV, or second device. It updates live as you control timers here.
        </p>
        <div className="mb-4 flex justify-center rounded-xl bg-white p-4">
          <canvas ref={canvasRef} />
        </div>
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
          <code className="flex-1 truncate text-xs text-slate-600 dark:text-slate-300">{presenterUrl}</code>
          <button onClick={copyLink} className="btn-ghost btn-sm !px-2 !py-1">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="flex gap-2">
          <a href={presenterUrl} target="_blank" rel="noreferrer" className="btn-primary btn-md flex-1">
            <ExternalLink className="h-4 w-4" /> Open Presenter View
          </a>
        </div>
        <div className={`mt-4 flex items-start gap-2 rounded-lg p-3 text-xs ${isSupabaseConfigured ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
          <Radio className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          {isSupabaseConfigured
            ? 'Cross-device sync is on — this works on any device, anywhere.'
            : 'Cross-device sync isn’t configured yet, so this link only stays live within tabs on this same browser/device.'}
        </div>
        <div className="mt-3 text-center text-xs text-slate-400">Session code: <span className="font-mono font-semibold">{roomCode}</span></div>
      </div>
    </div>
  );
}
