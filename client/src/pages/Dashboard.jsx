import React, { useState, useRef } from 'react';
import { Smartphone, Terminal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ risk, progress, socketRef, challenge_required, latency }) => {
  const [otp, setOtp] = useState("");
  const [challengeResolved, setChallengeResolved] = useState(false);
  const lastTypeRef = useRef(Date.now());
  
  const isCritical = risk > 0.92;
  const isWarning = risk > 0.7 && risk <= 0.92;

  const getHardwareSignature = () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Generic";
    const components = [navigator.hardwareConcurrency, renderer, `${screen.width}x${screen.height}`, new Date().getTimezoneOffset(), navigator.language];
    return btoa(components.join('|')).substring(0, 32);
  };

  const handleInputChange = (e) => {
    const now = Date.now();
    const delay = (now - lastTypeRef.current) / 1000;
    lastTypeRef.current = now;

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        content: e.target.value,
        typing_delay: delay,
        hardware_id: getHardwareSignature(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        latency: latency || 0
      }));
    }
  };

  const triggerStressTest = () => {
    for(let i=0; i<10; i++) {
        socketRef.current.send(JSON.stringify({ 
            typing_delay: 0.001, 
            content: "STRESS_TEST",
            hardware_id: getHardwareSignature(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }));
    }
  };

  const verifyMFA = () => {
    if (otp.length === 6) { 
      setChallengeResolved(true);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "RESOLVE_CHALLENGE" }));
      }
    } else {
      alert("INVALID_TOKEN: Please provide the 6-digit code.");
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-between p-8 pb-12 relative overflow-hidden">
      <AnimatePresence>
        {challenge_required && !challengeResolved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            <div className="p-16 glass-panel border-emerald-500/30 rounded-[3rem] text-center max-w-lg">
              <Smartphone size={60} className="text-emerald-neon mb-8 mx-auto animate-pulse" />
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">Identity Challenge</h2>
              <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-transparent border-b-2 border-emerald-500 text-center text-5xl font-mono focus:outline-none mb-12 text-emerald-neon" placeholder="000000" />
              <button onClick={verifyMFA} className="w-full py-6 bg-emerald-500 text-black font-black uppercase rounded-full">Verify Identity</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center pt-4">
        <div className={`text-[160px] md:text-[200px] font-black tracking-tighter leading-none ${isCritical ? 'text-red-500' : 'text-emerald-neon'}`}>
          {Math.round(risk * 100)}<span className="text-4xl opacity-40 ml-2">%</span>
        </div>
      </div>

      <div className="w-full max-w-4xl relative mt-4">
        <div className="flex justify-between items-center mb-4 px-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-neon">Input_Secure_Pipeline</span>
            <button onClick={triggerStressTest} className="text-[10px] font-black uppercase bg-red-500/10 text-red-500 px-4 py-2 rounded-full border border-red-500/20"><Zap size={12} className="inline mr-2" /> Stress Test</button>
        </div>
        <div className="relative glass-panel rounded-[2.5rem] p-8 border-2 border-emerald-500/30">
          <textarea onChange={handleInputChange} autoFocus placeholder="Type here..." className="w-full bg-transparent border-none text-white font-mono text-2xl font-bold resize-none focus:outline-none h-24" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;