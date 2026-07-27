import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Play, Pause, SkipForward, Plus, Trash2, MessageSquare, Users, Maximize2, Save, FolderOpen, X, Volume2, VolumeX, GripVertical, Keyboard, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const MountZionTimerApp = () => {
  const [rooms, setRooms] = useState([{ id: 1, name: 'Room 1', timers: [] }]);
  const [activeRoomId, setActiveRoomId] = useState(1);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMessages, setShowMessages] = useState(false);
  const [presenterOpen, setPresenterOpen] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleAction, setScheduleAction] = useState('');
  const [scheduleName, setScheduleName] = useState('');
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'warning' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [alertSettings, setAlertSettings] = useState({
    warningAt60: true,
    warningAt30: true,
    alarmAtZero: true,
    soundType: 'gentle'
  });
  
  const [draggedTimer, setDraggedTimer] = useState(null);
  const [dragOverTimer, setDragOverTimer] = useState(null);
  
  const alertsPlayedRef = useRef({});
  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

  const timerPresets = [
    { label: '1 min', duration: 60000 },
    { label: '2 min', duration: 120000 },
    { label: '5 min', duration: 300000 },
    { label: '10 min', duration: 600000 },
    { label: '15 min', duration: 900000 },
    { label: '20 min', duration: 1200000 },
    { label: '30 min', duration: 1800000 },
    { label: '45 min', duration: 2700000 },
    { label: '1 hour', duration: 3600000 },
  ];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const showConfirmation = (title, message, onConfirm, type = 'warning') => {
    setConfirmModal({ show: true, title, message, onConfirm, type });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'warning' });
  };

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type) => {
    if (!audioEnabled) return;
    try {
      const ctx = initAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      gainNode.gain.value = volume;
      const now = ctx.currentTime;
      
      if (type === 'warning') {
        if (alertSettings.soundType === 'gentle') {
          oscillator.frequency.setValueAtTime(523.25, now);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(volume * 0.5, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          oscillator.start(now);
          oscillator.stop(now + 0.5);
        } else if (alertSettings.soundType === 'chime') {
          oscillator.frequency.setValueAtTime(783.99, now);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(volume * 0.6, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
          oscillator.start(now);
          oscillator.stop(now + 0.8);
        } else {
          oscillator.frequency.setValueAtTime(880, now);
          oscillator.type = 'square';
          gainNode.gain.setValueAtTime(volume * 0.4, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
        }
      } else if (type === 'alarm') {
        const playBeep = (startTime, freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, startTime);
          osc.type = alertSettings.soundType === 'gentle' ? 'sine' : 'square';
          gain.gain.setValueAtTime(volume * 0.6, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
          osc.start(startTime);
          osc.stop(startTime + 0.25);
        };
        if (alertSettings.soundType === 'gentle') {
          playBeep(now, 523.25); playBeep(now + 0.3, 659.25); playBeep(now + 0.6, 783.99);
        } else if (alertSettings.soundType === 'chime') {
          playBeep(now, 783.99); playBeep(now + 0.25, 659.25); playBeep(now + 0.5, 783.99); playBeep(now + 0.75, 1046.50);
        } else {
          for (let i = 0; i < 5; i++) playBeep(now + i * 0.15, 880);
        }
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [audioEnabled, volume, alertSettings.soundType, initAudioContext]);

  const checkAlerts = useCallback((timer) => {
    if (!timer.isRunning) return;
    const timerId = timer.id;
    const remaining = timer.remainingTime;
    if (!alertsPlayedRef.current[timerId]) {
      alertsPlayedRef.current[timerId] = { warning60: false, warning30: false, alarm: false };
    }
    const alerts = alertsPlayedRef.current[timerId];
    if (alertSettings.warningAt60 && remaining <= 60000 && remaining > 59000 && !alerts.warning60) {
      playSound('warning'); alerts.warning60 = true;
    }
    if (alertSettings.warningAt30 && remaining <= 30000 && remaining > 29000 && !alerts.warning30) {
      playSound('warning'); alerts.warning30 = true;
    }
    if (alertSettings.alarmAtZero && remaining <= 0 && remaining > -1000 && !alerts.alarm) {
      playSound('alarm'); alerts.alarm = true;
    }
  }, [alertSettings, playSound]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRooms(prevRooms => prevRooms.map(room => ({
        ...room,
        timers: room.timers.map(timer => timer.isRunning ? { ...timer, remainingTime: timer.remainingTime - 100 } : timer)
      })));
    }, 100);
    loadSchedulesFromStorage();
    loadSettingsFromStorage();
    if (isElectron && window.electronAPI.onPresenterClosed) {
      window.electronAPI.onPresenterClosed(() => setPresenterOpen(false));
    }
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (activeRoom.timers.length > 0 && activeRoom.timers[0].isRunning) {
      checkAlerts(activeRoom.timers[0]);
    }
  }, [activeRoom.timers, checkAlerts]);

  useEffect(() => {
    if (presenterOpen && activeRoom.timers.length > 0 && isElectron) {
      window.electronAPI.updatePresenter({
        timer: activeRoom.timers[0],
        messages: messages.slice(-3).reverse()
      });
    }
  }, [activeRoom.timers, messages, presenterOpen]);

  useEffect(() => { saveSettingsToStorage(); }, [audioEnabled, volume, alertSettings]);

  const formatTime = (ms) => {
    const isNegative = ms < 0;
    const absoluteMs = Math.abs(ms);
    const totalSeconds = Math.floor(absoluteMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return (isNegative ? '-' : '') + minutes + ':' + seconds.toString().padStart(2, '0');
  };

  const formatTimeToInput = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return hours + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    return minutes + ':' + seconds.toString().padStart(2, '0');
  };

  const addTimer = useCallback((preset = null) => {
    const duration = preset ? preset.duration : 600000;
    const newTimer = {
      id: Date.now(), title: preset ? preset.label : '', duration, remainingTime: duration, isRunning: false, notes: '', timeInput: formatTimeToInput(duration)
    };
    alertsPlayedRef.current[newTimer.id] = { warning60: false, warning30: false, alarm: false };
    setRooms(prevRooms => prevRooms.map(room => room.id === activeRoomId ? { ...room, timers: [...room.timers, newTimer] } : room));
  }, [activeRoomId]);

  const toggleTimer = useCallback((timerId) => {
    setRooms(prevRooms => prevRooms.map(room => {
      if (room.id !== activeRoomId) return room;
      const clickedTimer = room.timers.find(t => t.id === timerId);
      const isStarting = clickedTimer && !clickedTimer.isRunning;
      if (isStarting) alertsPlayedRef.current[timerId] = { warning60: false, warning30: false, alarm: false };
      let updatedTimers = room.timers.map(timer => {
        if (timer.id === timerId) return { ...timer, isRunning: !timer.isRunning };
        else if (isStarting && timer.isRunning) return { ...timer, isRunning: false };
        return timer;
      });
      if (isStarting) updatedTimers = updatedTimers.sort((a, b) => { if (a.id === timerId) return -1; if (b.id === timerId) return 1; return 0; });
      return { ...room, timers: updatedTimers };
    }));
  }, [activeRoomId]);

  const resetTimer = useCallback((timerId) => {
    alertsPlayedRef.current[timerId] = { warning60: false, warning30: false, alarm: false };
    setRooms(prevRooms => prevRooms.map(room => room.id === activeRoomId ? { ...room, timers: room.timers.map(timer => timer.id === timerId ? { ...timer, remainingTime: timer.duration, isRunning: false } : timer) } : room));
  }, [activeRoomId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const timers = activeRoom.timers;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); if (timers.length > 0) toggleTimer(timers[0].id); break;
        case 'n': e.preventDefault(); addTimer(); break;
        case 'r': e.preventDefault(); if (timers.length > 0) resetTimer(timers[0].id); break;
        case 'm': e.preventDefault(); setAudioEnabled(prev => !prev); break;
        case '?': e.preventDefault(); setShowKeyboardShortcuts(prev => !prev); break;
        case 'escape': setShowScheduleModal(false); setShowKeyboardShortcuts(false); closeConfirmModal(); break;
        case 'p': if (e.ctrlKey || e.metaKey) { e.preventDefault(); openPresenterView(); } break;
        default:
          const num = parseInt(e.key);
          if (num >= 1 && num <= 9 && num <= timers.length) { e.preventDefault(); toggleTimer(timers[num - 1].id); }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRoom.timers, toggleTimer, addTimer, resetTimer]);

  const loadSchedulesFromStorage = async () => {
    try {
      if (isElectron) {
        const schedules = await window.electronAPI.storeGet('schedules');
        if (schedules) setSavedSchedules(schedules);
      }
    } catch (error) { console.log('Error loading schedules:', error); }
  };

  const saveSchedulesToStorage = async (schedules) => {
    try {
      if (isElectron) await window.electronAPI.storeSet('schedules', schedules);
    } catch (error) { console.log('Error saving schedules:', error); }
  };

  const loadSettingsFromStorage = async () => {
    try {
      if (isElectron) {
        const settings = await window.electronAPI.storeGet('settings');
        if (settings) {
          setAudioEnabled(settings.audioEnabled ?? true);
          setVolume(settings.volume ?? 0.7);
          setAlertSettings({ warningAt60: settings.warningAt60 ?? true, warningAt30: settings.warningAt30 ?? true, alarmAtZero: settings.alarmAtZero ?? true, soundType: settings.soundType ?? 'gentle' });
        }
      }
    } catch (error) { console.log('Error loading settings:', error); }
  };

  const saveSettingsToStorage = async () => {
    try {
      if (isElectron) await window.electronAPI.storeSet('settings', { audioEnabled, volume, ...alertSettings });
    } catch (error) { console.log('Error saving settings:', error); }
  };

  const addRoom = () => { setRooms([...rooms, { id: Date.now(), name: 'Room ' + (rooms.length + 1), timers: [] }]); };

  const updateTimer = (timerId, updates) => {
    if (updates.duration) alertsPlayedRef.current[timerId] = { warning60: false, warning30: false, alarm: false };
    setRooms(rooms.map(room => room.id === activeRoomId ? { ...room, timers: room.timers.map(timer => timer.id === timerId ? { ...timer, ...updates } : timer) } : room));
  };

  const adjustTime = (timerId, milliseconds) => {
    setRooms(rooms.map(room => room.id === activeRoomId ? { ...room, timers: room.timers.map(timer => timer.id === timerId ? { ...timer, remainingTime: Math.max(0, timer.remainingTime + milliseconds), duration: Math.max(60000, timer.duration + milliseconds) } : timer) } : room));
  };

  const deleteTimer = (timerId) => {
    const timer = activeRoom.timers.find(t => t.id === timerId);
    const timerName = timer?.title || 'Untitled Timer';
    showConfirmation('Delete Timer', `Are you sure you want to delete "${timerName}"? This action cannot be undone.`, () => {
      delete alertsPlayedRef.current[timerId];
      setRooms(rooms.map(room => room.id === activeRoomId ? { ...room, timers: room.timers.filter(t => t.id !== timerId) } : room));
      showToast(`Timer "${timerName}" deleted`, 'success');
      closeConfirmModal();
    }, 'danger');
  };

  const handleDragStart = (e, timer) => { setDraggedTimer(timer); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e, timer) => { e.preventDefault(); if (draggedTimer && timer.id !== draggedTimer.id) setDragOverTimer(timer); };
  const handleDragLeave = () => setDragOverTimer(null);
  const handleDrop = (e, targetTimer) => {
    e.preventDefault();
    if (!draggedTimer || draggedTimer.id === targetTimer.id) { setDraggedTimer(null); setDragOverTimer(null); return; }
    setRooms(prevRooms => prevRooms.map(room => {
      if (room.id !== activeRoomId) return room;
      const timers = [...room.timers];
      const draggedIndex = timers.findIndex(t => t.id === draggedTimer.id);
      const targetIndex = timers.findIndex(t => t.id === targetTimer.id);
      const [removed] = timers.splice(draggedIndex, 1);
      timers.splice(targetIndex, 0, removed);
      return { ...room, timers };
    }));
    setDraggedTimer(null); setDragOverTimer(null);
  };
  const handleDragEnd = () => { setDraggedTimer(null); setDragOverTimer(null); };

  const getTimerColor = (remaining, duration) => {
    const percentageUsed = ((duration - remaining) / duration) * 100;
    if (percentageUsed >= 75) return 'from-red-600 to-red-800';
    if (percentageUsed >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-green-600 to-green-800';
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: Date.now(), text: newMessage, timestamp: new Date().toLocaleTimeString() }]);
      setNewMessage('');
    }
  };

  const parseTimeInput = (value) => {
    const parts = value.split(':');
    let ms = 0;
    if (parts.length === 3) ms = (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])) * 1000;
    else if (parts.length === 2) ms = (parseInt(parts[0]) * 60 + parseInt(parts[1])) * 1000;
    else ms = parseInt(parts[0]) * 1000;
    return isNaN(ms) ? 0 : ms;
  };

  const openScheduleModal = (action) => { setScheduleAction(action); setScheduleName(''); setShowScheduleModal(true); };

  const saveCurrentSchedule = async () => {
    if (!scheduleName.trim()) { showToast('Please enter a schedule name', 'error'); return; }
    const schedule = { id: Date.now(), name: scheduleName.trim(), roomName: activeRoom.name, timers: activeRoom.timers.map(timer => ({ title: timer.title, duration: timer.duration, notes: timer.notes, timeInput: timer.timeInput })), createdAt: new Date().toISOString() };
    const updatedSchedules = [...savedSchedules, schedule];
    setSavedSchedules(updatedSchedules);
    await saveSchedulesToStorage(updatedSchedules);
    setShowScheduleModal(false); setScheduleName('');
    showToast(`Schedule "${schedule.name}" saved successfully!`, 'success');
  };

  const loadSchedule = (schedule) => {
    const loadedTimers = schedule.timers.map((timer, index) => ({ id: Date.now() + index, title: timer.title, duration: timer.duration, remainingTime: timer.duration, isRunning: false, notes: timer.notes, timeInput: timer.timeInput }));
    setRooms(rooms.map(room => room.id === activeRoomId ? { ...room, name: schedule.roomName, timers: loadedTimers } : room));
    setShowScheduleModal(false);
    showToast(`Schedule "${schedule.name}" loaded successfully!`, 'success');
  };

  const deleteSchedule = (scheduleId, scheduleName) => {
    showConfirmation('Delete Schedule', `Are you sure you want to delete the schedule "${scheduleName}"? This action cannot be undone.`, async () => {
      const updatedSchedules = savedSchedules.filter(s => s.id !== scheduleId);
      setSavedSchedules(updatedSchedules);
      await saveSchedulesToStorage(updatedSchedules);
      showToast(`Schedule "${scheduleName}" deleted`, 'success');
      closeConfirmModal();
    }, 'danger');
  };

  const openPresenterView = async () => {
    if (isElectron) {
      try { await window.electronAPI.openPresenter(); setPresenterOpen(true); showToast('Presenter view opened', 'success'); }
      catch (error) { console.error('Error opening presenter:', error); showToast('Failed to open presenter view', 'error'); }
    } else { showToast('Presenter view requires desktop app', 'error'); }
  };

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-yellow-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${confirmModal.type === 'danger' ? 'bg-red-600' : 'bg-yellow-600'}`}><AlertTriangle className="w-6 h-6" /></div>
              <h2 className="text-xl font-bold">{confirmModal.title}</h2>
            </div>
            <p className="text-gray-300 mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeConfirmModal} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors">Cancel</button>
              <button onClick={confirmModal.onConfirm} className={`px-4 py-2 rounded font-medium transition-colors ${confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Clock className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold">Mount Zion Timer - Control Panel</h1>
          <div className="flex items-center space-x-2 ml-8">
            <Users className="w-4 h-4 text-gray-400" />
            <select value={activeRoomId} onChange={(e) => setActiveRoomId(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm">
              {rooms.map(room => (<option key={room.id} value={room.id}>{room.name}</option>))}
            </select>
            <button onClick={addRoom} className="bg-gray-800 hover:bg-gray-700 p-1 rounded transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 mr-4 bg-gray-800 rounded px-3 py-1">
            <button onClick={() => { initAudioContext(); setAudioEnabled(!audioEnabled); }} className={`p-1 rounded transition-colors ${audioEnabled ? 'text-green-400' : 'text-gray-500'}`} title={audioEnabled ? 'Mute (M)' : 'Unmute (M)'}>
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            <select value={alertSettings.soundType} onChange={(e) => setAlertSettings({ ...alertSettings, soundType: e.target.value })} className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs">
              <option value="gentle">Gentle</option><option value="chime">Chime</option><option value="urgent">Urgent</option>
            </select>
          </div>
          <button onClick={() => setShowKeyboardShortcuts(true)} className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors" title="Keyboard Shortcuts (?)"><Keyboard className="w-4 h-4" /></button>
          <button onClick={() => openScheduleModal('save')} className="px-4 py-2 rounded flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors" disabled={activeRoom.timers.length === 0}><Save className="w-4 h-4" /><span>Save</span></button>
          <button onClick={() => openScheduleModal('load')} className="px-4 py-2 rounded flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 transition-colors"><FolderOpen className="w-4 h-4" /><span>Load</span></button>
          <button onClick={openPresenterView} className={`px-4 py-2 rounded flex items-center space-x-2 transition-colors ${presenterOpen ? 'bg-purple-500' : 'bg-purple-600 hover:bg-purple-700'}`}><Maximize2 className="w-4 h-4" /><span>{presenterOpen ? 'Presenter Open' : 'Presenter'}</span></button>
          <button onClick={() => setShowMessages(!showMessages)} className={`px-4 py-2 rounded flex items-center space-x-2 transition-colors ${showMessages ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}><MessageSquare className="w-4 h-4" /><span>Messages</span></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeRoom.timers.length > 0 && (
            <div className={`bg-gradient-to-br ${activeRoom.timers[0]?.remainingTime < 0 ? 'from-red-600 to-red-800' : getTimerColor(activeRoom.timers[0]?.remainingTime, activeRoom.timers[0]?.duration)} p-8 text-center relative flex-shrink-0`}>
              {activeRoom.timers[0]?.remainingTime < 0 && (<div className="mb-4 bg-red-700 border-4 border-white text-white px-6 py-4 rounded-xl inline-block font-bold text-2xl shadow-2xl animate-pulse">⚠️ TIME UP - PLEASE ROUND UP ⚠️</div>)}
              {messages.length > 0 && (<div className="mb-6 space-y-2">{messages.slice(-3).reverse().map(msg => (<div key={msg.id} className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg inline-block font-semibold text-base shadow-lg">📢 {msg.text}</div>))}</div>)}
              <div className={`text-9xl font-bold mb-2 select-none ${activeRoom.timers[0]?.remainingTime < 0 ? 'text-yellow-300' : ''}`}>{formatTime(activeRoom.timers[0]?.remainingTime || 0)}</div>
              <div className="text-3xl opacity-90 mb-1">{activeRoom.timers[0]?.title || 'Untitled Timer'}</div>
              {activeRoom.timers[0]?.notes && <div className="text-xl opacity-75">{activeRoom.timers[0].notes}</div>}
              <div className="mt-6 max-w-4xl mx-auto"><div className="h-2 bg-black bg-opacity-20 rounded-full overflow-hidden"><div className="h-full bg-white bg-opacity-50 transition-all duration-100" style={{ width: activeRoom.timers[0]?.remainingTime < 0 ? '100%' : `${((activeRoom.timers[0]?.duration - activeRoom.timers[0]?.remainingTime) / activeRoom.timers[0]?.duration) * 100}%` }} /></div></div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Timers</h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 mr-4">
                  <Zap className="w-4 h-4 text-yellow-500" /><span className="text-sm text-gray-400 mr-2">Quick:</span>
                  {timerPresets.slice(0, 5).map(preset => (<button key={preset.label} onClick={() => addTimer(preset)} className="bg-gray-800 hover:bg-gray-700 active:bg-green-600 active:scale-95 px-2 py-1 rounded text-xs transition-all duration-150 transform">{preset.label}</button>))}
                  <div className="relative group">
                    <button className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 active:scale-95 px-2 py-1 rounded text-xs transition-all duration-150 transform">More...</button>
                    <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg hidden group-hover:block z-10">
                      {timerPresets.slice(5).map(preset => (<button key={preset.label} onClick={() => addTimer(preset)} className="block w-full text-left px-3 py-2 hover:bg-gray-700 active:bg-green-600 text-sm whitespace-nowrap transition-colors duration-150">{preset.label}</button>))}
                    </div>
                  </div>
                </div>
                <button onClick={() => addTimer()} className="bg-blue-600 hover:bg-blue-700 active:bg-green-500 active:scale-95 px-4 py-2 rounded flex items-center space-x-2 transition-all duration-150 transform"><Plus className="w-4 h-4" /><span>Add Timer (N)</span></button>
              </div>
            </div>

            <div className="space-y-3">
              {activeRoom.timers.map((timer, index) => (
                <div key={timer.id} draggable onDragStart={(e) => handleDragStart(e, timer)} onDragOver={(e) => handleDragOver(e, timer)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, timer)} onDragEnd={handleDragEnd}
                  className={`bg-gray-900 border rounded-lg p-4 transition-all cursor-move ${index === 0 ? 'border-blue-500 border-2' : 'border-gray-800'} ${dragOverTimer?.id === timer.id ? 'border-yellow-500 border-2 bg-gray-800' : ''} ${draggedTimer?.id === timer.id ? 'opacity-50' : ''} hover:border-gray-700`}>
                  <div className="flex items-start gap-2">
                    <div className="pt-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"><GripVertical className="w-5 h-5" /></div>
                    <div className="flex-1">
                      {index === 0 && (<div className="text-xs text-blue-400 font-semibold mb-2 uppercase tracking-wide">Currently Displayed • Press Space to {activeRoom.timers[0]?.isRunning ? 'Pause' : 'Play'}</div>)}
                      {index > 0 && index <= 9 && (<div className="text-xs text-gray-500 mb-2">Press {index + 1} to start this timer</div>)}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div><label className="text-xs text-gray-400 mb-1 block">Timer Title</label><input type="text" value={timer.title} onChange={(e) => updateTimer(timer.id, { title: e.target.value })} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-lg font-semibold w-full outline-none focus:border-blue-500" placeholder="Enter timer title" /></div>
                          <div><label className="text-xs text-gray-400 mb-1 block">Optional Notes</label><input type="text" value={timer.notes} onChange={(e) => updateTimer(timer.id, { notes: e.target.value })} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 w-full outline-none focus:border-blue-500" placeholder="Add notes (optional)" /></div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="text-right">
                            <div className="text-4xl font-mono font-bold mb-2">{formatTime(timer.remainingTime)}</div>
                            <div className="mb-3"><label className="text-xs text-gray-400 mb-1 block">Set Duration</label><input type="text" value={timer.timeInput || formatTimeToInput(timer.duration)} onChange={(e) => updateTimer(timer.id, { timeInput: e.target.value })} onBlur={(e) => { const ms = parseTimeInput(e.target.value); if (ms > 0) updateTimer(timer.id, { duration: ms, remainingTime: ms, timeInput: e.target.value }); }} onKeyPress={(e) => { if (e.key === 'Enter') { const ms = parseTimeInput(e.target.value); if (ms > 0) { updateTimer(timer.id, { duration: ms, remainingTime: ms, timeInput: e.target.value }); e.target.blur(); } } }} placeholder="MM:SS" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 w-32 text-center text-sm outline-none focus:border-blue-500" /></div>
                            <div><label className="text-xs text-gray-400 mb-1 block">Quick Adjust</label><div className="flex gap-1 mb-1">{[1, 2, 3, 5, 10].map(min => (<button key={min} onClick={() => adjustTime(timer.id, min * 60000)} className="bg-green-700 hover:bg-green-600 active:bg-green-500 active:scale-95 px-2 py-1 rounded text-xs transition-all duration-150">+{min}</button>))}</div><div className="flex gap-1">{[1, 2, 3, 5, 10].map(min => (<button key={min} onClick={() => adjustTime(timer.id, -min * 60000)} className="bg-red-700 hover:bg-red-600 active:bg-red-500 active:scale-95 px-2 py-1 rounded text-xs transition-all duration-150">-{min}</button>))}</div></div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button onClick={() => toggleTimer(timer.id)} className={`p-2 rounded transition-all duration-150 active:scale-95 ${timer.isRunning ? 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-500' : 'bg-green-600 hover:bg-green-700 active:bg-green-500'}`}>{timer.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button>
                            <button onClick={() => resetTimer(timer.id)} className="p-2 bg-gray-700 hover:bg-gray-600 active:bg-blue-600 active:scale-95 rounded transition-all duration-150"><SkipForward className="w-5 h-5" /></button>
                            <button onClick={() => deleteTimer(timer.id)} className="p-2 bg-red-600 hover:bg-red-700 active:bg-red-500 active:scale-95 rounded transition-all duration-150"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-100 ${timer.remainingTime < 0 ? 'bg-red-500' : ((timer.duration - timer.remainingTime) / timer.duration) * 100 >= 75 ? 'bg-red-500' : ((timer.duration - timer.remainingTime) / timer.duration) * 100 >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: timer.remainingTime < 0 ? '100%' : `${((timer.duration - timer.remainingTime) / timer.duration) * 100}%` }} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeRoom.timers.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No timers yet. Click "Add Timer" or press N to get started.</p>
                <div className="flex flex-wrap justify-center gap-2">{timerPresets.map(preset => (<button key={preset.label} onClick={() => addTimer(preset)} className="bg-gray-800 hover:bg-gray-700 active:bg-green-600 active:scale-95 px-4 py-2 rounded transition-all duration-150 transform">+ {preset.label}</button>))}</div>
              </div>
            )}
          </div>
        </div>

        {showMessages && (
          <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-800"><h3 className="font-semibold">Messages</h3></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (<div key={msg.id} className="bg-gray-800 rounded-lg p-3"><div className="text-sm text-gray-400 mb-1">{msg.timestamp}</div><div>{msg.text}</div></div>))}
              {messages.length === 0 && <div className="text-center text-gray-500 py-8">No messages yet</div>}
            </div>
            <div className="p-4 border-t border-gray-800"><div className="flex space-x-2"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Enter message..." className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 outline-none focus:border-blue-500" /><button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-500 active:scale-95 px-4 py-2 rounded transition-all duration-150">Send</button></div></div>
          </div>
        )}
      </div>

      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold flex items-center gap-2"><Keyboard className="w-6 h-6" />Keyboard Shortcuts</h2><button onClick={() => setShowKeyboardShortcuts(false)} className="p-2 hover:bg-gray-800 rounded"><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">{[['Play/Pause current timer', 'Space'], ['Add new timer', 'N'], ['Reset current timer', 'R'], ['Toggle mute', 'M'], ['Open presenter view', 'Ctrl+P'], ['Switch to timer 1-9', '1-9'], ['Show shortcuts', '?'], ['Close modals', 'Esc']].map(([action, key]) => (<div key={action} className="flex justify-between items-center py-2 border-b border-gray-800"><span>{action}</span><kbd className="bg-gray-800 px-3 py-1 rounded text-sm font-mono">{key}</kbd></div>))}</div>
            <div className="mt-6 p-4 bg-gray-800 rounded-lg"><h3 className="font-semibold mb-2">Audio Alerts</h3><div className="space-y-2 text-sm text-gray-400">{[['warningAt60', 'Warning at 60 seconds'], ['warningAt30', 'Warning at 30 seconds'], ['alarmAtZero', 'Alarm when timer ends']].map(([key, label]) => (<label key={key} className="flex items-center gap-2"><input type="checkbox" checked={alertSettings[key]} onChange={(e) => setAlertSettings({ ...alertSettings, [key]: e.target.checked })} className="rounded" />{label}</label>))}</div></div>
            <button onClick={() => setShowKeyboardShortcuts(false)} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-500 px-4 py-2 rounded font-medium transition-colors">Close</button>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">{scheduleAction === 'save' ? 'Save Schedule' : 'Load Schedule'}</h2><button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-gray-800 rounded"><X className="w-5 h-5" /></button></div>
            {scheduleAction === 'save' ? (
              <div>
                <p className="text-gray-400 mb-4">Save the current {activeRoom.timers.length} timer(s) as a reusable schedule</p>
                <div className="mb-4"><label className="block text-sm font-medium mb-2">Schedule Name</label><input type="text" value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && saveCurrentSchedule()} placeholder="e.g., Weekly Meeting, Conference Day 1" className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 outline-none focus:border-blue-500" autoFocus /></div>
                <div className="mb-6 bg-gray-800 rounded-lg p-4"><h3 className="font-semibold mb-3">Preview ({activeRoom.timers.length} timers):</h3><div className="space-y-2 max-h-48 overflow-y-auto">{activeRoom.timers.map((timer, index) => (<div key={timer.id} className="flex items-center justify-between text-sm bg-gray-700 rounded px-3 py-2"><span>{index + 1}. {timer.title || 'Untitled'}</span><span className="text-gray-400">{formatTime(timer.duration)}</span></div>))}</div></div>
                <div className="flex space-x-3"><button onClick={saveCurrentSchedule} className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-500 px-4 py-2 rounded font-medium transition-colors">Save Schedule</button><button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">Cancel</button></div>
              </div>
            ) : (
              <div>
                {savedSchedules.length === 0 ? (
                  <div className="text-center py-12 text-gray-500"><FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" /><p className="mb-2">No saved schedules yet</p><p className="text-sm">Create some timers and save them as a schedule for future use</p></div>
                ) : (
                  <div className="space-y-3">{savedSchedules.map(schedule => (
                    <div key={schedule.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="flex items-start justify-between mb-2"><div className="flex-1"><h3 className="font-semibold text-lg mb-1">{schedule.name}</h3><p className="text-sm text-gray-400">{schedule.timers.length} timer{schedule.timers.length !== 1 ? 's' : ''} • Created {new Date(schedule.createdAt).toLocaleDateString()}</p></div><div className="flex space-x-2"><button onClick={() => loadSchedule(schedule)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">Load</button><button onClick={() => deleteSchedule(schedule.id, schedule.name)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors">Delete</button></div></div>
                      <div className="space-y-1 mt-3">{schedule.timers.map((timer, index) => (<div key={index} className="flex items-center justify-between text-sm text-gray-400 rounded px-3 py-1"><span>{index + 1}. {timer.title || 'Untitled'}</span><span>{formatTimeToInput(timer.duration)}</span></div>))}</div>
                    </div>
                  ))}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MountZionTimerApp;
