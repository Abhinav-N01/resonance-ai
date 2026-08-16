"use client";

import { useState } from "react";
import { Search, BrainCircuit, Loader2, Calendar, Lightbulb, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchDocuments } from "@/lib/vectorStore";

export function SecondBrain() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const res = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query })
      });
      const data = await res.json();
      
      if (data.embedding) {
        const hits = await searchDocuments(data.embedding, 5);
        setResults(hits || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const getIcon = (category: string) => {
    if (category === "tasks") return <ListTodo className="w-5 h-5 text-emerald-400" />;
    if (category === "events") return <Calendar className="w-5 h-5 text-blue-400" />;
    return <Lightbulb className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      
      {/* Search Header */}
      <div className="bg-zinc-900/40 border border-zinc-800/60 p-8 rounded-3xl backdrop-blur-md shadow-xl flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-zinc-100">
          <BrainCircuit className="w-8 h-8 text-purple-500" />
          Second Brain Search
        </h2>
        <p className="text-zinc-400 text-center max-w-lg mb-8">
          Ask your Second Brain anything. It uses semantic vector search to find contextually relevant notes from your Brain Dumps, even if you don't use the exact keywords.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-2xl relative flex items-center">
          <Search className="w-5 h-5 text-zinc-500 absolute left-4" />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where did I write about that portfolio redesign..."
            className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-2xl py-4 pl-12 pr-32 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={!query.trim() || isSearching}
            className="absolute right-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Example Queries */}
        <div className="mt-8 flex flex-col items-center">
          <p className="text-xs text-zinc-500 mb-4 font-bold uppercase tracking-widest">Example Queries</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {[
              "What tab was I on before doing this?",
              "Find my grocery list for this week",
              "Where did I write about that AI app idea?",
              "What article was I reading about React state?",
              "Show me all my uncompleted coding tasks"
            ].map((q, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={() => setQuery(q)}
                className="text-xs px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {hasSearched && !isSearching && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <h3 className="text-xl font-semibold text-zinc-200 flex items-center gap-2">
              Search Results
            </h3>

            {results.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/20 border border-zinc-800/50 rounded-2xl">
                <p className="text-zinc-500">No relevant notes found in your Second Brain.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {results.map((res: any) => (
                  <motion.div 
                    key={res.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl hover:bg-zinc-800/50 transition-all"
                  >
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      {getIcon(res.category)}
                    </div>
                    <div className="flex-1">
                      <p className="text-zinc-200 text-lg leading-relaxed">{res.text}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{res.category}</span>
                        <span className="text-xs text-zinc-600">
                          {new Date(res.createdAt).toLocaleDateString()} at {new Date(res.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className="text-xs text-purple-500/70 font-medium">
                          Similarity: {(res.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
