import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export const RadarDNA = ({ risk }) => {
  // Mapping behavioral vectors to a mathematical field [cite: 6, 12]
  const data = [
    { subject: 'CADENCE', A: 100 - (risk * 50), fullMark: 100 },
    { subject: 'LATENCY', A: risk * 100, fullMark: 100 },
    { subject: 'GEO_LOCK', A: 95, fullMark: 100 },
    { subject: 'SEQUENCE', A: 85, fullMark: 100 },
    { subject: 'ENTROPY', A: 40 + (risk * 60), fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        {/* Neon Green Grid lines */}
        <PolarGrid stroke="#22EE5B" strokeOpacity={0.1} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: '0.1em' }} 
        />
        <Radar
          name="Identity_DNA"
          dataKey="A"
          stroke="#22EE5B"
          strokeWidth={3}
          fill="#22EE5B"
          fillOpacity={0.15}
          animationBegin={0}
          animationDuration={1500}
          animationEasing="ease-in-out"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};