import React from 'react';
import { RadarDNA } from '../components/RadarDNA';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, Fingerprint } from 'lucide-react';

const Analytics = ({ risk, chartData }) => {
  return (
    <div className="flex-1 p-16 grid grid-cols-12 gap-12 bg-[#050505] overflow-hidden">
      {/* DNA PROFILE - Behavioral & Environmental Fusion */}
      <div className="col-span-5 glass-panel rounded-[3rem] p-12 flex flex-col items-center justify-center relative">
        <div className="flex items-center gap-4 mb-12 text-sm font-black text-white uppercase tracking-widest">
          <Fingerprint size={20} className="text-emerald-neon" /> Identity_Profile
        </div>
        <div className="h-[450px] w-full">
          <RadarDNA risk={risk} />
        </div>
      </div>

      {/* RISK DRIFT & FORENSIC INTENT */}
      <div className="col-span-7 flex flex-col gap-12">
        <div className="glass-panel rounded-[3rem] p-12 flex flex-col flex-1">
            <div className="flex items-center gap-4 mb-12 text-sm font-black text-white uppercase tracking-widest">
                <Activity size={20} className="text-emerald-neon" /> Real-Time_Verification_Drift
            </div>
            <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                <XAxis dataKey="t" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                    contentStyle={{
                        backgroundColor: '#0A0A0A', 
                        border: '1px solid #ffffff10', 
                        borderRadius: '12px'
                    }} 
                />
                <Area 
                    type="monotone" 
                    dataKey="s" 
                    stroke="#22EE5B" 
                    fill="#22EE5B20" 
                    strokeWidth={4} 
                />
                </AreaChart>
            </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;