"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, ShieldCheck, Sparkles, Truck, Heart } from "lucide-react";

// Narrative journey phases
const PHASES = [
  { text: "Sourcing Organic Goods", icon: Leaf },
  { text: "Quality Assurance Check", icon: ShieldCheck },
  { text: "Sealing Freshness", icon: Sparkles },
  { text: "Preparing Delivery", icon: Truck },
];

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [scanIdx, setScanIdx] = useState(0); // The clockwise "clock" index

  useEffect(() => {
    // Session persistent hide
    if (sessionStorage.getItem("pjbite_loaded")) {
      setVisible(false);
      return;
    }

    // 1. One Full Round Logic (6 hexagons)
    const scanInterval = 550; // ms per step
    const totalSteps = 6;
    const duration = scanInterval * totalSteps;
    const interval = 80; // 12.5 fps — visually smooth, ~3x less CPU than 30ms
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const val = 1 - Math.pow(1 - currentStep / steps, 4);
      setProgress(Math.min(val * 100, 100));

      // Sync narrative phases to the 6 steps (4 phases distributed)
      const phase = Math.min(Math.floor((currentStep / steps) * PHASES.length), PHASES.length - 1);
      if (phase !== phaseIdx) setPhaseIdx(phase);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem("pjbite_loaded", "1");
        }, 400); // Quick fade after the round ends
      }
    }, interval);

    // 2. Clockwise Scan Timer (Sync to the duration)
    const scanTimer = setInterval(() => {
      setScanIdx((prev) => {
        if (prev >= 5) return 5; // Stay at last before close
        return prev + 1;
      });
    }, scanInterval);

    return () => {
      clearInterval(timer);
      clearInterval(scanTimer);
    };
  }, []); // Remove phaseIdx from dependencies to prevent effect restart

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(25px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FAF7F2] overflow-hidden"
        >
          {/* 💎 SaaS Honeycomb Cluster with Clockwise Scan */}
          <div className="relative w-full max-w-lg flex flex-col items-center justify-center scale-[0.8] sm:scale-110">
            
            {/* Top Row (Index 0, 1) */}
            <div className="flex gap-2.5 -mb-7">
                <HexSub icon={PHASES[0].icon} active={phaseIdx >= 0} isScanning={scanIdx === 0} />
                <HexSub icon={PHASES[1].icon} active={phaseIdx >= 1} isScanning={scanIdx === 1} />
            </div>

            {/* Middle Row (Index 5 -> LOGO -> Index 2) */}
            <div className="flex gap-2.5 items-center">
                <HexSub icon={PHASES[2].icon} active={phaseIdx >= 2} isScanning={scanIdx === 5} />
                
                {/* 🎯 Central Master Hexagon */}
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-36 h-40 flex items-center justify-center p-5 group"
                >
                    <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full fill-brand-primary drop-shadow-[0_25px_55px_rgba(22,74,32,0.35)]">
                         <path d="M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z" />
                    </svg>
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center p-3 shadow-inner ring-4 ring-white/50"
                    >
                        <Image src="/navbarlogo.png" alt="Logo" width={75} height={75} className="object-contain" priority />
                    </motion.div>
                </motion.div>

                <HexSub icon={PHASES[3].icon} active={phaseIdx >= 3} isScanning={scanIdx === 2} />
            </div>

            {/* Bottom Row (Index 4, 3) */}
            <div className="flex gap-2.5 -mt-7">
                <HexSub icon={Heart} active={progress > 85} isScanning={scanIdx === 4} />
                <HexSub icon={Sparkles} active={progress > 95} isScanning={scanIdx === 3} />
            </div>
          </div>

          {/* 📝 Narrative Progress UI */}
          <div className="mt-24 flex flex-col items-center gap-8 w-full max-w-[300px]">
            <div className="h-6 flex items-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={PHASES[phaseIdx].text}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="text-brand-text/30 text-[10px] sm:text-xs font-black tracking-[0.5em] uppercase text-center"
                    >
                        {PHASES[phaseIdx].text}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Progress Container */}
            <div className="w-full flex flex-col items-center gap-4">
                <div className="w-full h-[3px] bg-brand-primary/10 rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-brand-primary rounded-full shadow-[0_0_20px_rgba(22,74,32,0.6)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[9px] font-mono font-black text-brand-primary/20 tracking-[0.6em]"
                >
                    {Math.round(progress)}% COMPLETE
                </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Specialized Sub-Hexagon with "Scanning" Support
 */
function HexSub({ icon: Icon, active, isScanning }: any) {
    return (
        <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-24 h-28 flex items-center justify-center p-3"
        >
            {/* Background Hexagon Shape */}
            <svg 
                viewBox="0 0 100 115" 
                className={`absolute inset-0 w-full h-full transition-all duration-700 
                    ${isScanning 
                        ? 'fill-white stroke-brand-primary stroke-[3px] scale-110 drop-shadow-[0_0_20px_rgba(22,74,32,0.4)] z-20' 
                        : active 
                            ? 'fill-white stroke-[#164a20]/20 stroke-[2px] opacity-100 z-10' 
                            : 'fill-white/30 stroke-[#E8E6E1] stroke-[1px] opacity-40'
                    }`}
            >
                 <path d="M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z" />
            </svg>

            {/* Lucide Icon */}
            <Icon 
                className={`relative z-30 w-6 h-6 transition-all duration-700 
                    ${isScanning 
                        ? 'text-brand-primary scale-125' 
                        : active 
                            ? 'text-brand-primary/40' 
                            : 'text-brand-text/10'
                    }`} 
                strokeWidth={isScanning ? 2.5 : 1.5} 
            />

            {/* Sweep light effect inside hexagon when scanning */}
            {isScanning && (
                <motion.div
                    initial={{ opacity: 0, x: "-100%" }}
                    animate={{ opacity: 1, x: "100%" }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent skew-x-12 z-25 pointer-events-none"
                />
            )}
        </motion.div>
    )
}
