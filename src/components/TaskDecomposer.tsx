"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, BatteryCharging, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export function TaskDecomposer() {
  const [goal, setGoal] = useState("");
  const [energy, setEnergy] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [isOverwhelmed, setIsOverwhelmed] = useState(false);

  const handleDecompose = async () => {
    if (!goal) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, energy, isOverwhelmed: false })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else if (data.tasks) {
        setSubTasks(data.tasks.map((t: any, i: number) => ({ id: Date.now() + "-" + i, title: t.title, completed: false })));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to decompose task. Is the API running?");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOverwhelmed = async () => {
    setIsOverwhelmed(true);
    try {
      const res = await fetch("/api/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, energy, isOverwhelmed: true, currentTasks: subTasks.map(t => t.title) })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else if (data.tasks && data.tasks.length > 0) {
        setSubTasks(prev => [
          { id: Date.now().toString(), title: data.tasks[0].title, completed: false },
          ...prev
        ]);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to get a smaller task.");
    } finally {
      setIsOverwhelmed(false);
    }
  };

  const toggleTask = (id: string) => {
    setSubTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="glass-panel w-full max-w-4xl mx-auto p-8 rounded-[2rem] flex flex-col gap-8">
      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-md shadow-xl"
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="text-zinc-400 text-sm font-medium mb-2 block">What feels overwhelming right now?</label>
            <input 
              type="text" 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Clean my entire room..." 
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-4 text-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-8 items-center">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="text-zinc-400 text-sm font-medium flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  Current Energy Level
                </label>
                <span className="text-zinc-500 text-xs">{energy}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <button 
              onClick={handleDecompose}
              disabled={!goal || isProcessing}
              className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Decompose Task
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {subTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
                Micro-Steps
              </h3>
              
              <button 
                onClick={handleOverwhelmed}
                disabled={isOverwhelmed}
                className="text-sm px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                I'm overwhelmed, make it smaller
              </button>
            </div>

            <div className="grid gap-3">
              <AnimatePresence>
                {subTasks.map((task, index) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${task.completed ? 'bg-zinc-900/30 border-zinc-800/50 opacity-60' : 'bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800/60'} transition-colors cursor-pointer`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.completed ? 'border-emerald-500 bg-emerald-500/20' : 'border-zinc-500'}`}>
                      {task.completed && <motion.div initial={{scale:0}} animate={{scale:1}}><CheckCircle2 className="w-4 h-4 text-emerald-400" /></motion.div>}
                    </div>
                    <span className={`text-lg ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                      {task.title}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
        <p className="text-zinc-400 text-sm flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          You don't have to finish all these steps today. Just starting the first one is a massive win.
        </p>
      </div>
    </div>
  );
}
