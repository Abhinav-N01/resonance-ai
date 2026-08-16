"use client";

import { useEffect, useState, useMemo } from "react";
import { ReactFlow, Background, Controls, Node, Edge, BackgroundVariant, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cosineSimilarity } from "@/lib/vectorStore";
import { BrainCircuit, ListTodo, Calendar, Lightbulb, Map, Plus, Loader2 } from "lucide-react";
import { openDB } from "idb";

const getIcon = (category: string) => {
  if (category === "tasks") return <ListTodo className="w-4 h-4 text-emerald-400" />;
  if (category === "events") return <Calendar className="w-4 h-4 text-blue-400" />;
  return <Lightbulb className="w-4 h-4 text-yellow-400" />;
};

function CustomStickyNode({ data }: { data: any }) {
  return (
    <div className="glass-panel p-4 rounded-2xl w-60 border border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all cursor-pointer relative overflow-hidden group">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent pointer-events-none group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
          <div className="p-1.5 bg-black/40 rounded-lg shadow-inner">
            {getIcon(data.category)}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{data.category}</span>
        </div>
        <p className="text-sm font-medium leading-relaxed text-zinc-200 whitespace-pre-wrap">{data.label}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

export function SpatialCanvas() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const nodeTypes = useMemo(() => ({ customNode: CustomStickyNode }), []);

  const loadAndCluster = async () => {
    try {
      const db = await openDB('second-brain-db', 1);
      const docs = await db.getAll('documents');
      
      if (!docs || docs.length === 0) {
        // Provide dummy data so the user instantly sees what the canvas looks like
        const dummyNodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: { label: 'Buy milk and eggs', category: 'tasks' }, type: 'customNode' },
          { id: '2', position: { x: 280, y: 50 }, data: { label: 'Grocery run on Tuesday', category: 'tasks' }, type: 'customNode' },
          { id: '3', position: { x: -350, y: 150 }, data: { label: 'Learn React Flow for Spatial Canvas', category: 'ideas' }, type: 'customNode' },
          { id: '4', position: { x: -330, y: 400 }, data: { label: 'Build vector embedding pipeline', category: 'ideas' }, type: 'customNode' },
          { id: '5', position: { x: 450, y: -200 }, data: { label: 'Doctor appointment at 4PM', category: 'events' }, type: 'customNode' },
          { id: '6', position: { x: 500, y: 50 }, data: { label: 'Pick up prescription', category: 'events' }, type: 'customNode' },
        ];
        const dummyEdges: Edge[] = [
          { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'rgba(255,255,255,0.1)' } },
          { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: 'rgba(255,255,255,0.1)' } },
          { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: 'rgba(255,255,255,0.1)' } }
        ];
        setNodes(dummyNodes);
        setEdges(dummyEdges);
        setIsLoading(false);
        return;
      }

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      newNodes.push({
        id: docs[0].id,
        position: { x: 0, y: 0 },
        data: { label: docs[0].text, category: docs[0].category },
        type: 'customNode'
      });

      const positions: Record<string, {x: number, y: number}> = { [docs[0].id]: {x: 0, y: 0} };

      for (let i = 1; i < docs.length; i++) {
        const doc = docs[i];
        let bestMatchId = docs[0].id;
        let highestSim = -1;

        for (let j = 0; j < i; j++) {
          const sim = cosineSimilarity(doc.embedding, docs[j].embedding);
          if (sim > highestSim) {
            highestSim = sim;
            bestMatchId = docs[j].id;
          }
        }

        const distance = Math.max(150, 600 * (1 - highestSim)); 
        const angle = Math.random() * 2 * Math.PI;

        const basePos = positions[bestMatchId];
        const newX = basePos.x + Math.cos(angle) * distance;
        const newY = basePos.y + Math.sin(angle) * distance;

        positions[doc.id] = { x: newX, y: newY };

        newNodes.push({
          id: doc.id,
          position: { x: newX, y: newY },
          data: { label: doc.text, category: doc.category },
          type: 'customNode'
        });

        if (highestSim > 0.70) {
          newEdges.push({
            id: `e-${doc.id}-${bestMatchId}`,
            source: doc.id,
            target: bestMatchId,
            animated: true,
            style: { stroke: 'rgba(255,255,255,0.15)' }
          });
        }
      }

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAndCluster();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || isAdding) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: [newNote] }),
      });
      const data = await res.json();
      
      const db = await openDB('second-brain-db', 1);
      const tx = db.transaction('documents', 'readwrite');
      data.documents.forEach((doc: any) => tx.store.add(doc));
      await tx.done;

      setNewNote("");
      await loadAndCluster();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return <div className="w-full h-[600px] flex items-center justify-center text-white/50">Projecting embeddings to 2D canvas...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Panel: Explanation & Quick Add */}
      <div className="flex flex-col md:flex-row gap-6 items-start w-full">
        <div className="glass-panel p-6 rounded-3xl flex-1 flex items-start gap-4 h-full">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Map className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">Spatial Visual Canvas</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">
              A dynamic, zoomable sticky-note canvas that replaces overwhelming text lists. 
              The system uses vector embeddings to automatically cluster related notes and minimize visual noise.
            </p>
          </div>
        </div>

        {/* Quick Add Sticky Note */}
        <div className="glass-panel p-6 rounded-3xl w-full md:w-80 shrink-0">
          <h4 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-400" />
            Drop a Note
          </h4>
          <form onSubmit={handleAddNote} className="flex flex-col gap-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 resize-none h-20"
            />
            <button
              type="submit"
              disabled={isAdding || !newNote.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to Canvas"}
            </button>
          </form>
        </div>
      </div>

      <div className="w-full h-[600px] bg-black/40 rounded-[2rem] overflow-hidden border border-white/10 relative shadow-2xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          className="bg-transparent"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="rgba(255,255,255,0.1)" />
          <Controls className="bg-zinc-900 border-zinc-800 fill-white" />
        </ReactFlow>

        {/* Global Nudge */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 glass-pill px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-white/80">
            Zoom out to see the big picture. Let the clusters guide your next action.
          </span>
        </div>
      </div>
    </div>
  );
}
