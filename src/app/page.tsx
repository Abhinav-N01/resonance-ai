"use client";

import { useState } from "react";
import { TaskDecomposer } from "@/components/TaskDecomposer";
import { Pomodoro } from "@/components/Pomodoro";
import { BrainDump } from "@/components/BrainDump";
import { SecondBrain } from "@/components/SecondBrain";
import { SpatialCanvas } from "@/components/SpatialCanvas";
import { DigitalReset } from "@/components/DigitalReset";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Timer, Map, Smartphone, LayoutList, Search } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"tasks" | "pomodoro" | "braindump" | "search" | "canvas" | "reset">("pomodoro");

  return (
    <>
      {/* Fixed Ambient Background */}
      <div className="fixed inset-0 w-full h-full ambient-bg -z-10" />
      
      {/* Scrollable Content */}
      <div className="min-h-screen w-full text-zinc-50 flex flex-col font-sans selection:bg-purple-500/30">
      
      {/* 3D Glass Orb Logo */}
      <div className="absolute top-0 left-0 w-full px-8 py-6 flex items-center justify-between z-50 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto cursor-pointer">
          <div className="resonance-orb-3d"></div>
          <div className="text-white font-semibold tracking-wide text-lg">
            Resonance AI
          </div>
        </div>
      </div>

      {/* Top Pill Navigation */}
      <div className="w-full flex justify-center pt-8 pb-4 sticky top-0 z-40">
        <nav className="glass-pill rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl">
          <NavButton 
            icon={<Timer className="w-5 h-5" />} 
            label="Pomodoro" 
            isActive={activeTab === "pomodoro"} 
            onClick={() => setActiveTab("pomodoro")} 
          />
          <NavButton 
            icon={<LayoutList className="w-5 h-5" />} 
            label="Tasks" 
            isActive={activeTab === "tasks"} 
            onClick={() => setActiveTab("tasks")} 
          />
          <NavButton 
            icon={<BrainCircuit className="w-5 h-5" />} 
            label="Brain Dump" 
            isActive={activeTab === "braindump"} 
            onClick={() => setActiveTab("braindump")} 
          />
          <NavButton 
            icon={<Search className="w-5 h-5" />} 
            label="Search" 
            isActive={activeTab === "search"} 
            onClick={() => setActiveTab("search")} 
          />
          <NavButton 
            icon={<Map className="w-5 h-5" />} 
            label="Canvas" 
            isActive={activeTab === "canvas"} 
            onClick={() => setActiveTab("canvas")} 
          />
          <NavButton 
            icon={<Smartphone className="w-5 h-5" />} 
            label="Reset" 
            isActive={activeTab === "reset"} 
            onClick={() => setActiveTab("reset")} 
          />
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pb-20 pt-8 flex flex-col relative z-10">
        
        {/* Dynamic Header */}
        {activeTab !== "pomodoro" && (
          <header className="mb-12 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-light tracking-tight mb-3 text-white/90"
            >
              {activeTab === "tasks" && "Decompose"}
              {activeTab === "braindump" && "Brain Dump"}
              {activeTab === "search" && "Second Brain"}
              {activeTab === "canvas" && "Spatial Canvas"}
              {activeTab === "reset" && "Digital Reset"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/50 text-lg"
            >
              {activeTab === "tasks" && "Break down your next move into bite-sized steps."}
              {activeTab === "braindump" && "Clear your mind. We'll sort it out."}
              {activeTab === "search" && "Search your past thoughts, ideas, and tasks."}
              {activeTab === "canvas" && "Navigate your thoughts visually. The Semantic Clustering Engine automatically groups similar ideas together so you don't have to."}
              {activeTab === "reset" && "Clear the digital noise."}
            </motion.p>
          </header>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col"
          >
            {activeTab === "tasks" && <TaskDecomposer />}
            {activeTab === "pomodoro" && <Pomodoro />}
            {activeTab === "braindump" && <BrainDump />}
            {activeTab === "search" && <SecondBrain />}
            {activeTab === "canvas" && <SpatialCanvas />}
            {activeTab === "reset" && <DigitalReset />}
          </motion.div>
        </AnimatePresence>
      </main>
      </div>
    </>
  );
}

function NavButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300 ${
        isActive ? 'text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
      }`}
    >
      {isActive && (
        <motion.div 
          layoutId="active-pill"
          className="absolute inset-0 bg-white/10 rounded-full"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-2">
        {icon}
        <span className={`text-sm font-medium ${isActive ? 'block' : 'hidden md:block'}`}>{label}</span>
      </div>
    </button>
  );
}
