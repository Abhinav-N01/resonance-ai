"use client";

import { useState, useRef } from "react";
import { Mic, Square, Sparkles, Loader2, ListTodo, Calendar, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addDocument } from "@/lib/vectorStore";

export function BrainDump() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing mic:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append("file", blob, "braindump.webm");

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTranscript(prev => prev + " " + data.text);
    } catch (error: any) {
      console.error("Transcription error:", error);
      alert(error.message || "Failed to transcribe audio.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleOrganize = async () => {
    if (!transcript.trim()) return;
    setIsOrganizing(true);
    try {
      const res = await fetch("/api/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.organizedData);

      // Save to local IndexedDB vector store
      if (data.itemsWithEmbeddings) {
        for (const item of data.itemsWithEmbeddings) {
          await addDocument(item.text, item.category, item.embedding);
        }
      }
    } catch (error: any) {
      console.error("Organize error:", error);
      alert(error.message || "Failed to organize thoughts.");
    } finally {
      setIsOrganizing(false);
    }
  };

  return (
    <div className="glass-panel w-full max-w-4xl mx-auto p-8 rounded-[2rem] flex flex-col gap-8">
      
      {/* Record Button UI */}
      <div className="bg-zinc-900/40 border border-zinc-800/60 p-8 rounded-3xl backdrop-blur-md shadow-xl flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
            isRecording 
              ? 'bg-red-500/20 text-red-500 border border-red-500 shadow-red-500/30' 
              : 'bg-gradient-to-tr from-purple-600 to-blue-500 text-white shadow-purple-500/20'
          }`}
        >
          {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-10 h-10" />}
        </motion.button>
        
        <p className="mt-4 text-zinc-400 font-medium">
          {isRecording ? "Recording... Click to stop." : "Tap to start brain dumping"}
        </p>
      </div>

      {/* Transcript Editor */}
      <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-zinc-200">Raw Thoughts</h3>
          {isTranscribing && <span className="text-purple-400 text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Transcribing...</span>}
        </div>
        <textarea 
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your transcribed thoughts will appear here. You can also just type directly..."
          className="w-full h-32 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
        />
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleOrganize}
            disabled={!transcript.trim() || isOrganizing}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all flex items-center gap-2"
          >
            {isOrganizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Organize the Chaos
          </button>
        </div>
      </div>

      {/* Organized Results */}
      <AnimatePresence>
        {results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <ResultColumn title="Actionable Tasks" icon={<ListTodo className="w-5 h-5 text-emerald-400" />} items={results.tasks} color="emerald" />
            <ResultColumn title="Calendar Events" icon={<Calendar className="w-5 h-5 text-blue-400" />} items={results.events} color="blue" />
            <ResultColumn title="Random Ideas" icon={<Lightbulb className="w-5 h-5 text-yellow-400" />} items={results.ideas} color="yellow" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
        <p className="text-zinc-400 text-sm flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          Don't worry about structuring your thoughts perfectly. Just get them out of your head.
        </p>
      </div>
    </div>
  );
}

function ResultColumn({ title, icon, items, color }: { title: string, icon: React.ReactNode, items: string[], color: string }) {
  const colorMap: any = {
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-100',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-100',
    yellow: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-100',
  };

  return (
    <div className={`p-5 rounded-2xl border ${colorMap[color]}`}>
      <h4 className="font-semibold flex items-center gap-2 mb-4">
        {icon}
        {title}
      </h4>
      <ul className="space-y-3">
        {items?.length > 0 ? items.map((item, i) => (
          <li key={i} className="text-sm bg-black/20 p-3 rounded-lg border border-white/5">
            {item}
          </li>
        )) : (
          <li className="text-sm text-zinc-500 italic">Nothing found</li>
        )}
      </ul>
    </div>
  );
}
