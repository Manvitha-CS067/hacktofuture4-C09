import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutDashboard, Activity, Database, Globe, Monitor } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { motion } from 'framer-motion';

import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import NetworkGuard from './pages/NetworkGuard';
import Environment from './pages/Environment';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [risk, setRisk] = useState(0.1);           
  const [networkRisk, setNetworkRisk] = useState(0.05); 
  const [envRisk, setEnvRisk] = useState(0.02);     
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [latency, setLatency] = useState(0); 
  const [homeLocation, setHomeLocation] = useState('SYNCING...');
  const [challengeRequired, setChallengeRequired] = useState(false); 
  const [systemMetadata, setSystemMetadata] = useState({ os: "Windows 11", browser: "Edge Stable" });

  const socketRef = useRef(null);
  const mouseRef = useRef({ lastX: 0, lastY: 0, velocity: 0 }); 

  const detectSystem = useCallback(async () => {
    const ua = navigator.userAgent;
    let os = "Windows 11";
    let browser = "Edge Stable";
    if (navigator.userAgentData) {
      const hints = await navigator.userAgentData.getHighEntropyValues(["platformVersion"]);
      if (navigator.userAgentData.platform === "Windows") {
        os = parseInt(hints.platformVersion.split('.')[0]) >= 13 ? "Windows 11" : "Windows 10";
      }
    }
    if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome")) browser = "Google Chrome";
    setSystemMetadata({ os, browser });
  }, []);

  const getHardwareFingerprint = () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Generic_Silicon";
    const components = [navigator.hardwareConcurrency, renderer, `${screen.width}x${screen.height}`, new Date().getTimezoneOffset(), navigator.language];
    return btoa(components.join('|')).substring(0, 32);
  };

  const handleMouseMove = useCallback((e) => {
    const now = Date.now();
    const dt = now - (mouseRef.current.lastTime || now);
    if (dt > 0) {
      const dx = e.clientX - mouseRef.current.lastX;
      const dy = e.clientY - mouseRef.current.lastY;
      mouseRef.current.velocity = Math.sqrt(dx * dx + dy * dy) / dt; 
    }
    mouseRef.current.lastX = e.clientX; mouseRef.current.lastY = e.clientY; mouseRef.current.lastTime = now;
  }, []);

  useEffect(() => {
    detectSystem();
    let startTime;
    let pingInterval;

    const connect = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) return;
      const socket = new WebSocket('ws://localhost:8000/ws');
      
      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.pong) {
            setLatency(Date.now() - startTime);
            return;
          }
          setRisk(data.risk_score);
          setProgress(data.progress || 0);
          setChallengeRequired(data.challenge_required || false); 
          if (data.event) setLogs(prev => [data, ...prev].slice(0, 50));
          setChartData(prev => [...prev, { t: new Date().toLocaleTimeString().slice(3, 8), s: data.risk_score * 100 }].slice(-50));
        } catch (err) { console.error(err); }
      };

      socket.onopen = () => {
        socketRef.current = socket; 
        window.demoSocket = socket; // EXPOSED FOR CONSOLE TRIGGER
        
        pingInterval = setInterval(() => {
          startTime = Date.now();
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ 
                ping: true, 
                mouse_velocity: mouseRef.current.velocity,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                hardware_id: getHardwareFingerprint(),
                latency: latency // Sends the previous measured latency
            }));
          }
        }, 3000);
      };
      socket.onclose = () => { clearInterval(pingInterval); setTimeout(connect, 2000); };
    };

    connect();
    window.addEventListener('mousemove', handleMouseMove);
    return () => { clearInterval(pingInterval); window.removeEventListener('mousemove', handleMouseMove); }; 
  }, [handleMouseMove, latency, detectSystem]); 

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col overflow-hidden">
      <SignedIn>
        <header className="h-24 border-b border-white/10 flex items-center justify-between px-16 bg-black/40 backdrop-blur-2xl z-50">
          <div className="flex items-center gap-6"><img src="/Nexis_logo.png" alt="Nexis" className="w-12 h-12 rounded-xl border border-emerald-500/20" /></div>
          <nav className="flex gap-2">
            {[{ id: 'dashboard', label: 'Home', icon: LayoutDashboard }, { id: 'analytics', label: 'DNA', icon: Activity }, { id: 'network', label: 'Geo', icon: Globe }, { id: 'environment', label: 'Systems', icon: Monitor }, { id: 'audit', label: 'Logs', icon: Database }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 text-sm font-bold px-8 py-3 rounded-full transition-all ${activeTab === tab.id ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><tab.icon size={18} /> {tab.label}</button>
            ))}
          </nav>
          <div className="flex items-center gap-12"><div className="flex flex-col items-end"><span className="text-[10px] text-slate-500 uppercase font-black">Latency</span><span className="text-sm font-bold text-cyan-500">{latency}ms</span></div><UserButton /></div>
        </header>
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_2px,transparent_2px),linear-gradient(to_bottom,#80808008_2px,transparent_2px)] bg-[size:80px_80px]" />
          <div className="h-full w-full relative z-10">
            {activeTab === 'dashboard' && <Dashboard risk={risk} progress={progress} socketRef={socketRef} challenge_required={challengeRequired} latency={latency} />}
            {activeTab === 'analytics' && <Analytics risk={risk} chartData={chartData} />}
            {activeTab === 'network' && <NetworkGuard networkRisk={networkRisk} latency={latency} homeLocation={homeLocation} />}
            {activeTab === 'environment' && <Environment envRisk={envRisk} systemMetadata={systemMetadata} />}
            {activeTab === 'audit' && <AuditLogs logs={logs} />}
          </div>
        </main>
      </SignedIn>
    </div>
  );
};

export default App;