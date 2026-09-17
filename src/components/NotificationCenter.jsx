import React, { useState } from 'react';
import { Bell, Check, Trash2, ChevronRight, Activity, Heart, ShieldCheck, Moon, X } from 'lucide-react';

export const NotificationCenter = ({ isOpen, onClose, onNavigate }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'Baseline Corridor Confirmed',
      desc: 'Resting heart rate established at 64.0 BPM with ±4.8 BPM natural tolerance corridor.',
      time: '12m ago',
      icon: ShieldCheck,
      unread: true,
      tab: 'insights'
    },
    {
      id: 'notif_2',
      title: 'Optimal Movement Recovery',
      desc: 'Stair climbing elevation settled back to baseline within 88 seconds.',
      time: '1h ago',
      icon: Activity,
      unread: true,
      tab: 'today'
    },
    {
      id: 'notif_3',
      title: 'ESP32 Telemetry Ready',
      desc: 'Web Serial driver ready at 115200 baud for MAX30102 PPG pulse stream.',
      time: '3h ago',
      icon: Heart,
      unread: false,
      tab: 'home'
    },
    {
      id: 'notif_4',
      title: 'Evening Quiet Transition',
      desc: 'AWEN entering evening wind-down window. Reduced stimulation recommended.',
      time: 'Yesterday',
      icon: Moon,
      unread: false,
      tab: 'today'
    }
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (tab) => {
    if (tab && onNavigate) {
      onNavigate(tab);
    }
    onClose();
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 neo-surface border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111] animate-fadeIn text-left">
      {/* Header */}
      <div className="p-3.5 border-b-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--text-primary)]" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead} 
              className="hover:text-[var(--accent-green-dark)] transition-colors underline"
            >
              Mark Read
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={clearAll} 
              className="text-[var(--text-muted)] hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-[var(--surface-tertiary)] ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y-2 divide-[var(--border-light)]">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs font-medium text-[var(--text-muted)]">
            No active notifications.
          </div>
        ) : (
          notifications.map(n => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n.tab)}
                className={`p-3 cursor-pointer transition-colors flex items-start gap-3 hover:bg-[var(--surface-secondary)] ${
                  n.unread ? 'bg-[var(--accent-green-bg)]/40' : ''
                }`}
              >
                <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[1px_1px_0px_#111] shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate block">
                      {n.title}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--text-muted)] shrink-0 ml-1">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
                    {n.desc}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 self-center" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
