import React from 'react';

export const EnforcementConsole = ({ logs }) => {
  const getEventStyle = (event) => {
    switch (event) {
      case 'CRITICAL': return 'text-red-500 font-black border-l-4 border-red-500 pl-4';
      case 'HIGH_GUARD': return 'text-yellow-500 font-bold italic';
      case 'VERIFIED': return 'text-emerald-500 font-medium opacity-90';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-[2rem] p-10 font-mono h-full overflow-hidden flex flex-col shadow-2xl">
      {/* HEADER SECTION - Now with significantly larger text */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <span className="text-cyan-400 text-lg font-black uppercase tracking-[0.2em]">
          Nexis_Agent_Forensics_Stream
        </span>
        <div className="flex items-center gap-3">
            <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-red-500 text-xs font-black uppercase tracking-widest">
                LIVE_INFERENCE
            </span>
        </div>
      </div>
      
      <div className="space-y-6 overflow-y-auto flex-1 pr-4 custom-scrollbar">
        {logs.map((l, i) => (
          <div key={i} className={`py-4 border-b border-white/[0.05] last:border-0 transition-all ${getEventStyle(l.event)}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600 text-[10px] font-bold">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-[10px] uppercase font-black bg-white/10 px-3 py-1 rounded-md text-white tracking-widest">{l.event}</span>
            </div>
            <p className="text-base leading-relaxed tracking-tight text-white/90">
              <span className="text-emerald-500/40 mr-3 font-black">❯</span>
              {l.message}
            </p>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <p className="text-sm italic tracking-widest uppercase text-slate-500">Awaiting Signal Ingestion...</p>
          </div>
        )}
      </div>
    </div>
  );
};