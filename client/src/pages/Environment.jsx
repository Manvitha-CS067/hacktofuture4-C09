import React, { useState } from 'react';
import { Monitor, Search, CheckCircle, AlertTriangle, Smartphone, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Environment = ({ envRisk, systemMetadata }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [isBound, setIsBound] = useState(false);

  const mfaSecret = "JBSWY3DPEHPK3PXP"; 
  const issuer = "Nexis_Sentinel";
  const userAccount = "User_Nexus_09";
  const qrData = `otpauth://totp/${issuer}:${userAccount}?secret=${mfaSecret}&issuer=${issuer}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

  const handleVerify = () => {
    // For the demo, any 6-digit code works, or you can check for a specific one
    if (mfaCode.length === 6) {
      setIsBound(true);
      setTimeout(() => setShowSetup(false), 2000); // Return to dashboard after success
    } else {
      alert("INVALID_SYNC_CODE: Please enter the 6 digits from your app.");
    }
  };

  const audits = [
    { label: "OS_Baseline", status: "Verified", sub: systemMetadata?.os || "Windows 11" },
    { label: "Browser_Seal", status: "Match", sub: systemMetadata?.browser || "Edge Stable" },
    { label: "Automation", status: envRisk > 0.5 ? "FAILED" : "NONE", sub: "Bot_Detection" },
    { label: "MFA_Anchor", status: isBound ? "ENFORCED" : "READY", sub: isBound ? "Device_Linked" : "Authenticator_App" }
  ];

  return (
    <div className="flex-1 p-16 flex flex-col gap-12 bg-[#050505] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-white">
          <Monitor className="text-emerald-neon" size={24} />
          <h2 className="text-xl font-black uppercase tracking-widest">System_Integrity</h2>
        </div>
        
        <button onClick={() => setShowSetup(!showSetup)}
          className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
          {showSetup ? "Back to Status" : "Configure MFA"}
        </button>
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {showSetup ? (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="h-full glass-panel rounded-[3.5rem] p-16 flex flex-col items-center justify-center border-emerald-500/20 relative">
              
              {isBound ? (
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <ShieldCheck size={80} className="text-emerald-500 mb-6 animate-bounce" />
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Hardware Anchored</h3>
                    <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Security_Protocol_Active</p>
                </motion.div>
              ) : (
                <>
                  <Smartphone size={48} className="text-emerald-neon mb-6" />
                  <h3 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter">MFA Enrollment</h3>
                  
                  <div className="flex gap-12 items-center">
                    <div className="p-6 bg-white rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                       <img src={qrUrl} alt="MFA Anchor QR" className="w-[180px] h-[180px]" />
                    </div>

                    <div className="flex flex-col gap-6 w-64">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input 
                                type="text" maxLength="6" placeholder="ENTER CODE"
                                value={mfaCode} onChange={(e) => setMfaCode(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-center font-mono text-xl text-emerald-neon focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <button onClick={handleVerify} className="w-full py-4 rounded-full bg-emerald-500 text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-lg">
                            Verify & Bind Device
                        </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-10">
              {audits.map((item, idx) => (
                <div key={idx} className={`glass-panel rounded-[3.5rem] p-12 flex flex-col justify-between group h-64 border transition-all duration-500 ${isBound && item.label === "MFA_Anchor" ? "border-emerald-500 bg-emerald-500/5" : "border-white/5"}`}>
                  <div className="flex justify-between items-start">
                    <Search size={28} className="text-emerald-neon/20 group-hover:text-emerald-neon transition-colors" />
                    {item.status === "FAILED" ? <AlertTriangle className="text-red-500 animate-pulse" size={28}/> : <CheckCircle className={`${isBound && item.label === "MFA_Anchor" ? "text-emerald-400" : "text-emerald-500"}`} size={28} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                    <h3 className={`text-3xl font-black ${item.status === "FAILED" ? "text-red-500" : "text-white"}`}>{item.status}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2 italic">{item.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Environment;