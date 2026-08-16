"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Brain, Coffee, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Pomodoro() {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [currentNudge, setCurrentNudge] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const focusNudges = [
    "Turn on Do Not Disturb.",
    "Close tabs you aren't actively using.",
    "Delay checking your phone.",
    "Notice your default scroll moments."
  ];

  const breakNudges = [
    "Take a short 'thinking walk' without input.",
    "Let this moment stay quiet.",
    "Write down lingering thoughts to clear your head.",
    "Pause before opening social media."
  ];

  useEffect(() => {
    const nudges = mode === "focus" ? focusNudges : breakNudges;
    setCurrentNudge(nudges[Math.floor(Math.random() * nudges.length)]);
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === "focus") {
        setMode("break");
        setTimeLeft(breakDuration * 60);
      } else {
        setMode("focus");
        setTimeLeft(focusDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, focusDuration, breakDuration]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? focusDuration * 60 : breakDuration * 60);
  };

  const switchMode = (newMode: "focus" | "break") => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === "focus" ? focusDuration * 60 : breakDuration * 60);
  };

  const handleDurationChange = (type: "focus" | "break", val: number) => {
    if (type === "focus") {
      setFocusDuration(val);
      if (mode === "focus") {
        setIsActive(false);
        setTimeLeft(val * 60);
      }
    } else {
      setBreakDuration(val);
      if (mode === "break") {
        setIsActive(false);
        setTimeLeft(val * 60);
      }
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const totalSeconds = mode === "focus" ? focusDuration * 60 : breakDuration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100; // 0 to 100

  // The glow intensity changes slightly with progress
  const glowScale = isActive ? 1 + (Math.sin(Date.now() / 1000) * 0.05) : 1;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative">

      {/* Settings Toggle in top right */}
      <div className="absolute top-0 right-4 z-50">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, originX: 1, originY: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-14 right-4 glass-pill p-6 rounded-2xl w-80 z-50 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-white/70">Focus Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {[25, 30, 45, 60].map(val => (
                  <button 
                    key={`focus-${val}`}
                    onClick={() => handleDurationChange("focus", val)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${focusDuration === val ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-white/70">Break Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map(val => (
                  <button 
                    key={`break-${val}`}
                    onClick={() => handleDurationChange("break", val)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${breakDuration === val ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Switcher */}
      <div className="absolute top-0 glass-pill p-1.5 rounded-full flex z-40">
        <button 
          onClick={() => switchMode("focus")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === "focus" ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          <Brain className="w-4 h-4" /> Focus
        </button>
        <button 
          onClick={() => switchMode("break")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === "break" ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          <Coffee className="w-4 h-4" /> Break
        </button>
      </div>

      {/* The Orb */}
      <motion.div 
        className="relative flex items-center justify-center cursor-pointer mt-16 mb-8 group"
        onClick={toggleTimer}
        animate={{ scale: glowScale }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        <div 
          className={`absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-60 transition-colors duration-1000 ${mode === "focus" ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
          style={{ transform: `scale(${1 + (progress / 200)})` }}
        />
        
        <div className={`relative w-80 h-80 rounded-full flex flex-col items-center justify-center glass-pill backdrop-blur-3xl shadow-2xl transition-all duration-1000 ${mode === "focus" ? 'border-indigo-400/20 shadow-indigo-500/20' : 'border-emerald-400/20 shadow-emerald-500/20'}`}>
          
          <div className="flex flex-col items-center z-10">
            <span className="text-7xl font-light tracking-tight text-white tabular-nums drop-shadow-lg">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-white/60 mt-4 text-xs font-semibold tracking-[0.2em] uppercase">
              {mode === "focus" ? "Stay focused" : "Take a breather"}
            </span>
          </div>

          {/* Hover Play/Pause Overlay */}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
            {isActive ? <Pause className="w-16 h-16 text-white" /> : <Play className="w-16 h-16 text-white ml-2" />}
          </div>
        </div>
      </motion.div>

      {/* Contextual Nudge */}
      <motion.div 
        key={currentNudge}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm text-white/50 italic flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
          {currentNudge}
        </p>
      </motion.div>

      {/* Reset Control */}
      <button 
        onClick={resetTimer}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest font-medium">Reset Timer</span>
      </button>

    </div>
  );
}
