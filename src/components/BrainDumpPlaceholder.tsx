"use client";

import { Mic } from "lucide-react";

export function BrainDumpPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center mt-20">
      <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-2xl">
        <Mic className="w-10 h-10 text-zinc-600" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-100 mb-3">Brain Dump & Organizer</h2>
      <p className="text-zinc-400 max-w-md mx-auto text-lg">
        This feature is coming in Phase 2! You'll be able to record chaotic voice notes and let AI automatically organize them into tasks and calendar events.
      </p>
      <div className="mt-8 inline-flex px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-medium border border-purple-500/20">
        Phase 2 in progress...
      </div>
    </div>
  );
}
