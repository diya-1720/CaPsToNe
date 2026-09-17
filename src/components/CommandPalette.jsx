import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Home, 
  Sun, 
  Compass, 
  Lightbulb, 
  MessageCircle, 
  FileText, 
  Settings as SettingsIcon, 
  User, 
  Cpu, 
  Moon, 
  ArrowRight, 
  X,
  Sparkles
} from 'lucide-react';

export const CommandPalette = ({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onOpenHardware, 
  onOpenReport 
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const COMMANDS = [
    // Navigation
    { id: 'home', label: 'Go to Home (Executive Overview)', category: 'Navigation', icon: Home, action: () => onNavigate('home') },
    { id: 'today', label: 'Go to Today (Chronology & Recovery)', category: 'Navigation', icon: Sun, action: () => onNavigate('today') },
    { id: 'journey', label: 'Go to Journey (7-Day Evolution)', category: 'Navigation', icon: Compass, action: () => onNavigate('journey') },
    { id: 'insights', label: 'Go to Insights (Comparative Analytics)', category: 'Navigation', icon: Lightbulb, action: () => onNavigate('insights') },
    { id: 'talk', label: 'Go to AI Companion (Talk with AWEN)', category: 'Navigation', icon: MessageCircle, action: () => onNavigate('talk') },
    { id: 'settings', label: 'Go to Settings (System & Preferences)', category: 'Navigation', icon: SettingsIcon, action: () => onNavigate('settings') },
    { id: 'you', label: 'Go to Profile & Baseline (YouScreen)', category: 'Navigation', icon: User, action: () => onNavigate('you') },
    // Actions
    { id: 'report', label: 'Generate Clinical Health Report (PDF/JSON)', category: 'Live Actions', icon: FileText, action: () => { onClose(); onOpenReport(); } },
    { id: 'hardware', label: 'ESP32 Hardware & Web Serial Controls', category: 'Live Actions', icon: Cpu, action: () => { onClose(); onOpenHardware(); } },
  ];

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 animate-fadeIn backdrop-blur-sm">
      <div 
        className="w-full max-w-xl neo-surface overflow-hidden shadow-[6px_6px_0px_#111] border-2 border-[var(--border-strong)] bg-[var(--surface-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b-2 border-[var(--border-strong)] bg-[var(--surface-secondary)]">
          <Search className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or jump to screen..."
            className="w-full bg-transparent text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[var(--surface-primary)] border border-[var(--border-strong)] shadow-[1px_1px_0px_#111] uppercase shrink-0">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-xs font-semibold text-[var(--text-muted)]">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => { cmd.action(); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 flex items-center justify-between cursor-pointer border-2 transition-all ${
                    isSelected 
                      ? 'bg-[var(--accent-green)] border-[var(--border-strong)] text-[var(--text-primary)] shadow-[2px_2px_0px_#111]' 
                      : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">{cmd.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold uppercase opacity-60">
                      {cmd.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] flex items-center justify-between text-[10px] font-mono font-bold text-[var(--text-muted)]">
          <span>Navigate with ↑ ↓</span>
          <span>Select with ↵</span>
        </div>
      </div>
    </div>
  );
};
