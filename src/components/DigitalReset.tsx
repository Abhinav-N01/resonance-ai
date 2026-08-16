"use client";

import { useState } from "react";
import { CheckCircle2, Smartphone, Brain, Moon, BellOff, ListChecks } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HABITS = [
  {
    category: "Quick Digital Reset",
    icon: <ListChecks className="w-5 h-5 text-blue-400" />,
    items: [
      { id: "qr1", text: "Delete apps you don't actively use" },
      { id: "qr2", text: "Turn off non-essential badges and banners" },
      { id: "qr3", text: "Audit notifications (keep only top 3-4)" },
      { id: "qr4", text: "Move distracting apps off your home screen" },
      { id: "qr5", text: "Close old browser tabs" }
    ]
  },
  {
    category: "Habits for a Calmer Mind",
    icon: <Brain className="w-5 h-5 text-purple-400" />,
    items: [
      { id: "cm1", text: "Delay checking your phone in the morning (15-30 mins)" },
      { id: "cm2", text: "Let some moments stay quiet (no music/podcasts)" },
      { id: "cm3", text: "Take short 'thinking walks' without input" },
      { id: "cm4", text: "Write down lingering thoughts" },
      { id: "cm5", text: "Pause before opening social media (Why am I opening this?)" }
    ]
  },
  {
    category: "Protect Your Attention",
    icon: <BellOff className="w-5 h-5 text-emerald-400" />,
    items: [
      { id: "pa1", text: "Turn on Do Not Disturb when focusing" },
      { id: "pa2", text: "Batch check your notifications at set times" }
    ]
  },
  {
    category: "Evening Wind-Down",
    icon: <Moon className="w-5 h-5 text-indigo-400" />,
    items: [
      { id: "ew1", text: "Turn off stimulating apps an hour before bed" },
      { id: "ew2", text: "Charge your phone outside your bed area" }
    ]
  }
];

export function DigitalReset() {
  const [completed, setCompleted] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setCompleted(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="glass-panel w-full max-w-4xl mx-auto p-8 rounded-[2rem] flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-zinc-100">
          <Smartphone className="w-6 h-6 text-purple-400" />
          Digital Reset Checklist
        </h2>
        <p className="text-zinc-400">
          Modern life creates overwhelming mental noise. Use these habits and quick resets to clear the digital clutter and give your brain room to breathe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {HABITS.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-zinc-200 border-b border-zinc-800 pb-2">
                {section.icon}
                {section.category}
              </h3>
              <div className="flex flex-col gap-3">
                {section.items.map(item => {
                  const isDone = completed.includes(item.id);
                  return (
                    <motion.div 
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isDone ? 'bg-zinc-900/40 border-zinc-800/50 opacity-60' : 'bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800/70'}`}
                    >
                      <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isDone ? 'border-emerald-500 bg-emerald-500/20' : 'border-zinc-500'}`}>
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className={`text-sm ${isDone ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                        {item.text}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
