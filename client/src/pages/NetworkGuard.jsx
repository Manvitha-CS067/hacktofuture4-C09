import React from 'react';
import { MapPin, Globe, Activity, Anchor } from 'lucide-react';

const NetworkGuard = ({ networkRisk, latency, homeLocation }) => {
  const isThreat = networkRisk > 0.5;

  return (
    <div className="flex-1 p-16 flex flex-col gap-12 bg-[#050505]">
      <div className="grid grid-cols-12 gap-12 flex-1">
        <div className="col-span-8 glass-panel rounded-[4rem] relative flex flex-col items-center justify-center">
          <div className="relative text-center z-10">
            <div className="w-64 h-64 rounded-full border-2 border-white/5 flex items-center justify-center relative mb-12">
               <div className={`absolute inset-0 rounded-full border-2 ${isThreat ? 'border-red-500 animate-ping' : 'border-emerald-500/20 animate-pulse'}`} />
               <MapPin className={isThreat ? 'text-critical' : 'text-emerald-neon'} size={60} />
            </div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-4 block">Identity_Birthplace</span>
            <h3 className="text-6xl font-black text-white tracking-tighter uppercase">{homeLocation}</h3>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-8">
          <div className="glass-panel rounded-[3rem] p-12 flex-1 flex flex-col justify-center">
            <h3 className="text-xs font-black text-slate-500 uppercase mb-12 flex items-center gap-4">
              <Activity size={20} className="text-emerald-neon"/> Perimeter_Health
            </h3>
            <div className="space-y-10">
               <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-sm font-bold text-slate-400">LATENCY</span>
                  <span className="text-lg font-black text-cyan-500">{latency}ms</span>
               </div>
               <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-sm font-bold text-slate-400">THREAT_WEIGHT</span>
                  <span className={`text-lg font-black ${isThreat ? 'text-critical' : 'text-white'}`}>{(networkRisk * 10).toFixed(1)}%</span>
               </div>
            </div>
          </div>
          <div className="h-40 glass-panel rounded-[3rem] p-8 flex items-center gap-6">
             <Anchor className="text-emerald-neon" size={32} />
             <p className="text-sm font-bold text-slate-500 uppercase leading-tight italic">Continuous geo-lock prevents token replay on unauthorized networks.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGuard;