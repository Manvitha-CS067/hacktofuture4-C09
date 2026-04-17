import React from 'react';
import { EnforcementConsole } from '../components/EnforcementConsole';
import { Database, ZapOff, Ghost, ShieldCheck, AlertTriangle } from 'lucide-react';

const AuditLogs = ({ logs }) => {
  // 1. Total Threats - Sum of all actual security events sent from main.py
  const totalThreats = logs.filter(l => l.event !== 'VERIFIED' && l.event !== 'PONG').length;

  // 2. Strict Filter Logic for Counters
  const ddosCount = logs.filter(l => l.event === 'DDOS_BLOCK').length;
  const semanticCount = logs.filter(l => l.event === 'SEMANTIC_SHIELD').length;
  
  // Grouping the Environmental/Contextual Anomalies
  const envCount = logs.filter(l => 
    ['IDENTITY_CHALLENGE', 'CONCURRENT_COLLISION', 'MITM_ATTACK'].includes(l.event)
  ).length;

  return (
    <div className="flex-1 p-16 flex flex-col gap-10 bg-[#050505] h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Database className="text-emerald-neon" size={32} />
          <h2 className="text-2xl font-black uppercase text-white tracking-tighter">Forensic_Vault</h2>
        </div>
        
        <div className={`px-10 py-5 rounded-[1.5rem] font-black text-base uppercase transition-all duration-500 flex items-center gap-3
          ${totalThreats > 0 ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'bg-white/5 text-slate-500'}`}>
           <AlertTriangle size={20} />
           Threats Detected: {totalThreats}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-10">
        {[
          { label: "DDoS_BLOCKS", val: ddosCount, icon: ZapOff },
          { label: "SEMANTIC_SHIELDS", val: semanticCount, icon: ShieldCheck },
          { label: "ENVIRONMENT_CHALLENGES", val: envCount, icon: Ghost }
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-10 rounded-[2.5rem] flex items-center justify-between border-white/10 group hover:border-emerald-500/30 transition-all">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
              <h3 className="text-5xl font-black text-white tracking-tighter">{stat.val}</h3>
            </div>
            <stat.icon size={44} className="text-emerald-neon opacity-10 group-hover:opacity-30 transition-opacity" />
          </div>
        ))}
      </div>

      <div className="flex-1 relative rounded-[3rem] overflow-hidden border border-white/5 bg-black/20">
          <div className="absolute top-8 right-12 z-20 flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em]">Vault_Active_Encryption</span>
          </div>
          <EnforcementConsole logs={logs} />
      </div>
    </div>
  );
};

export default AuditLogs;