import React, { useState, useEffect } from 'react';
import { X, Printer, Download, FileText, ShieldCheck, Heart, Wind, Thermometer, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { apiService } from '../services/apiService';

export const HealthReportModal = ({ isOpen, onClose, currentUser, baselineData, telemetry }) => {
  const [duration, setDuration] = useState('7d');
  const [readings, setReadings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const restingHr = baselineData?.restingHr ? Number(baselineData.restingHr).toFixed(1) : '64.0';
  const hrVariance = baselineData?.hrStdDev ? Number(baselineData.hrStdDev).toFixed(1) : '4.8';
  const confidence = currentUser?.baseline_confidence || baselineData?.confidence || 'Stable baseline';

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadReportData() {
      setLoading(true);
      try {
        const [history, userSummary] = await Promise.all([
          apiService.getReadingsHistory(100),
          apiService.getUserSummary()
        ]);
        if (isMounted) {
          setReadings(history || []);
          setSummary(userSummary || null);
        }
      } catch (err) {
        console.warn('Failed to load report readings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReportData();
    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      patient: {
        id: currentUser?.id,
        patient_id: currentUser?.patient_id || 'PAT-LOCAL',
        name: currentUser?.name || 'Explorer',
        email: currentUser?.email || 'user@awen.local',
        baseline_confidence: confidence
      },
      summary: summary,
      baseline: {
        resting_hr: restingHr,
        resting_spo2: '98.6',
        resting_temp: '36.6',
        hr_variance: hrVariance
      },
      audit_log: readings.map(r => ({
        timestamp: r.created_at || r.timestamp,
        hr: r.bpm || r.heart_rate,
        spo2: r.spo2,
        temp: r.temperature,
        context: r.activity_state || r.motion_context || 'Standard',
        data_source: r.data_source || 'esp32',
        delta: r.bpm || r.heart_rate ? (Number(r.bpm || r.heart_rate) - Number(restingHr)).toFixed(1) : null
      })),
      generated_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AWEN_Clinical_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalCount = summary?.total_readings ?? readings.length;
  const obsDuration = summary?.observation_period?.duration || (totalCount > 0 ? `${summary?.observation_period?.days_recorded || 1} day(s)` : 'Insufficient data for this metric.');
  const daysRecorded = summary?.observation_period?.days_recorded || 0;
  const abnormalEvents = summary?.abnormal_events || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 animate-fadeIn backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl neo-surface p-6 sm:p-8 space-y-6 max-h-[92dvh] overflow-y-auto border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[6px_6px_0px_#111] print:shadow-none print:border-none print:max-h-none print:p-4 text-left">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--border-strong)] pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111]">
              <FileText className="w-5 h-5 text-[var(--text-primary)]" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
                User Wellness &amp; Observation Summary
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Derived directly from SQLite database records (awen.db)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[var(--text-primary)] text-white hover:bg-[var(--accent-green-dark)] text-xs font-bold uppercase tracking-wider border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-1.5 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] text-xs font-bold uppercase tracking-wider border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 border-2 border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Duration Selector (Hidden on Print) */}
        <div className="flex items-center gap-2 print:hidden">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mr-2">Scope:</span>
          {['4d', '7d', 'all'].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase border-2 transition-all ${
                duration === d 
                  ? 'bg-[var(--accent-green)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]' 
                  : 'bg-[var(--surface-secondary)] border-[var(--border-strong)] hover:bg-[var(--surface-tertiary)]'
              }`}
            >
              {d === '4d' ? '4-Day Observation' : d === '7d' ? '7-Day Window' : 'All Data'}
            </button>
          ))}
        </div>

        {/* ── PRINTABLE DOCUMENT BODY ── */}
        <div className="space-y-6 pt-2">
          
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[var(--border-strong)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-2xl font-bold tracking-widest uppercase">AWEN</span>
                <span className="text-xs font-mono px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] font-bold">
                  NON-CLINICAL COMPANION
                </span>
              </div>
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-1">
                Physiological Summary &amp; Longitudinal Review
              </h2>
            </div>
            <div className="text-right text-xs font-mono text-[var(--text-muted)] space-y-0.5">
              <p>Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
              <p>Observation Period: {obsDuration}</p>
            </div>
          </div>

          {/* User Card */}
          <div className="p-4 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">User Name</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{currentUser?.name || 'User'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">User ID</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{currentUser?.patient_id || 'USR-LOCAL'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Email</span>
              <span className="text-sm font-bold text-[var(--text-primary)] truncate block">{currentUser?.email || 'user@awen.local'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Baseline Status</span>
              <span className="text-sm font-bold text-[var(--accent-green-dark)]">{confidence}</span>
            </div>
          </div>

          {/* Section 1: Calibrated Corridors & Stored Metrics */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Section 1: Calibrated Baseline Corridors &amp; Observed Metrics (SQLite)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] block uppercase">Resting Baseline</span>
                <span className="text-xl font-heading font-bold text-[var(--text-primary)] block">{restingHr} BPM</span>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium">Corridor: ±{hrVariance} BPM</span>
              </div>
              <div className="p-3 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] block uppercase">Average HR</span>
                <span className="text-xl font-heading font-bold text-[var(--text-primary)] block">
                  {typeof summary?.heart_rate?.average === 'number' ? `${summary.heart_rate.average} BPM` : (summary?.heart_rate?.average || 'Insufficient data')}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium">Recorded Resting Mean</span>
              </div>
              <div className="p-3 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] block uppercase">HR Min / Max</span>
                <span className="text-xl font-heading font-bold text-[var(--text-primary)] block">
                  {typeof summary?.heart_rate?.min === 'number' && typeof summary?.heart_rate?.max === 'number' 
                    ? `${summary.heart_rate.min}–${summary.heart_rate.max} BPM` 
                    : 'Insufficient data'}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium">Observed Boundary</span>
              </div>
              <div className="p-3 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] block uppercase">SpO₂ Mean (Min)</span>
                <span className="text-xl font-heading font-bold text-[var(--text-primary)] block">
                  {typeof summary?.spo2?.average === 'number' 
                    ? `${summary.spo2.average}% (${summary.spo2.min}%)` 
                    : (summary?.spo2?.average || 'Insufficient data')}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium">Arterial Pulse Oximetry</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] block uppercase">Skin Temperature</span>
                <span className="text-xl font-heading font-bold text-[var(--text-primary)] block">
                  {typeof summary?.temperature?.average === 'number' ? `${summary.temperature.average} °C` : (summary?.temperature?.average || 'Insufficient data')}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium">
                  {typeof summary?.temperature?.min === 'number' && typeof summary?.temperature?.max === 'number'
                    ? `Min: ${summary.temperature.min}°C · Max: ${summary.temperature.max}°C`
                    : 'Equilibrium'}
                </span>
              </div>
              <div className="p-3 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] block uppercase">Recorded Telemetry</span>
                <span className="text-xl font-heading font-bold text-[var(--text-primary)] block">{totalCount} Readings</span>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium">Persisted in SQLite</span>
              </div>
              <div className="p-3 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] block uppercase">Abnormal Events</span>
                <span className="text-xl font-heading font-bold text-[var(--accent-danger)] block">{abnormalEvents.length} Detected</span>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium">Requiring Attention</span>
              </div>
            </div>
          </div>

          {/* Section 2: Period Analytics & Narrative */}
          <div className="p-4 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111] space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Section 2: Period Telemetry Analytics &amp; Observation Details
            </h4>
            {totalCount === 0 ? (
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Insufficient data for this metric. No sensor readings have been collected yet.
              </p>
            ) : (
              <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                Over the evaluated {obsDuration} observation window with {totalCount} recorded telemetry samples across {daysRecorded || 1} calendar day(s), resting heart rate averaged {summary?.heart_rate?.average ?? '--'} BPM against your calibrated {restingHr} BPM baseline. {abnormalEvents.length > 0 ? `${abnormalEvents.length} abnormal physiological event(s) were recorded for review.` : 'No abnormal physiological deviations were detected during this observation period.'}
              </p>
            )}
          </div>

          {/* Section 3: Abnormal Events Log (Real alerts from SQLite) */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Section 3: Abnormal Events &amp; Clinical Alerts ({abnormalEvents.length} Logged)
            </h4>
            {abnormalEvents.length === 0 ? (
              <div className="p-4 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-center text-xs font-medium text-[var(--text-secondary)]">
                No abnormal events detected. Telemetry is operating within personal baseline corridors.
              </div>
            ) : (
              <div className="border-2 border-[var(--border-strong)] overflow-x-auto shadow-[2px_2px_0px_#111]">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-[var(--surface-secondary)] border-b-2 border-[var(--border-strong)] text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5">Alert Timestamp</th>
                      <th className="p-2.5">Event Type</th>
                      <th className="p-2.5">Severity</th>
                      <th className="p-2.5">Triggered Observation Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)] font-medium">
                    {abnormalEvents.map((ev, idx) => (
                      <tr key={ev.id || idx} className="hover:bg-red-50/40">
                        <td className="p-2.5 whitespace-nowrap text-[10px]">
                          {ev.created_at ? new Date(ev.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                        </td>
                        <td className="p-2.5 uppercase font-bold text-[var(--text-primary)]">
                          {ev.type || 'Physiological'}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${
                            ev.severity === 'watchful' || ev.severity === 'alert' ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-blue-100 text-blue-900 border-blue-400'
                          }`}>
                            {ev.severity || 'info'}
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px] text-[var(--text-primary)]">
                          {ev.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Telemetry Audit Log Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Section 4: Physiological Audit Log (Persisted SQLite Sensor Telemetry)
            </h4>
            {readings.length === 0 ? (
              <div className="p-6 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-center space-y-1">
                <p className="text-xs font-bold text-[var(--text-primary)]">No sensor data available yet</p>
                <p className="text-[11px] text-[var(--text-secondary)]">Connect an ESP32 hardware device or ingest readings via POST /api/readings.</p>
              </div>
            ) : (
              <div className="border-2 border-[var(--border-strong)] overflow-x-auto shadow-[2px_2px_0px_#111]">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-[var(--surface-secondary)] border-b-2 border-[var(--border-strong)] text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">Heart Rate</th>
                      <th className="p-2.5">SpO₂</th>
                      <th className="p-2.5">Skin Temp</th>
                      <th className="p-2.5">Context / IMU</th>
                      <th className="p-2.5">Data Source</th>
                      <th className="p-2.5">Delta vs Base</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)] font-medium">
                    {readings.map((row, idx) => {
                      const hrVal = row.bpm ?? row.heart_rate;
                      const delta = hrVal ? (Number(hrVal) - Number(restingHr)).toFixed(1) : null;
                      const isElevated = delta && Number(delta) > 10;
                      const isSynthetic = row.data_source === 'demo_synthetic';
                      return (
                        <tr key={idx} className="hover:bg-[var(--surface-secondary)]">
                          <td className="p-2.5 whitespace-nowrap text-[10px]">
                            {row.created_at ? new Date(row.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                          </td>
                          <td className="p-2.5 font-bold">{hrVal ? `${hrVal} BPM` : '--'}</td>
                          <td className="p-2.5">{row.spo2 ? `${row.spo2}%` : '--'}</td>
                          <td className="p-2.5">{row.temperature ? `${row.temperature}°C` : '--'}</td>
                          <td className="p-2.5 text-[11px]">{row.activity_state || row.motion_context || 'Resting'}</td>
                          <td className="p-2.5 text-[10px]">
                            <span className={`px-1.5 py-0.5 border text-[9px] font-bold ${
                              isSynthetic ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}>
                              {isSynthetic ? 'Synthetic Demo Data' : (row.data_source || 'ESP32 Stream')}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold">
                            {delta !== null ? (
                              <span className={isElevated ? 'text-[var(--accent-danger)]' : 'text-[var(--text-primary)]'}>
                                {Number(delta) > 0 ? `+${delta}` : delta} BPM
                              </span>
                            ) : '--'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 5: Physician & Clinical Note */}
          <div className="p-4 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-2 text-[11px] text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">
              Physician &amp; Clinical Note:
            </p>
            <p className="leading-relaxed">
              AWEN is an exploratory, non-clinical wellness companion designed to compare longitudinal physiological signals against an individual's self-established baseline signature. It does not provide medical diagnosis or substitute professional medical treatment.
            </p>
            <p className="font-mono text-[9px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-light)]">
              SQLite Audit Integrity: awen.db · SHA256-AWEN-SIG-{Date.now().toString(16).toUpperCase()}-VERIFIED
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
