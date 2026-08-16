# Resonance AI

> A cognitive-first, multi-agent management platform designed to mitigate ADHD executive dysfunction through spatial task mapping, semantic clustering, and agentic micro-task breakdown.

Building software for neurodivergent minds requires moving beyond generic "to-do lists." Resonance AI acts as an interactive thinking partner and an external working memory buffer, utilizing advanced agent architectures and localized vector embeddings to minimize cognitive load and friction.

## Core Architectures & Features

### 1. Spatial Visual Canvas with Semantic Clustering
A dynamic, zoomable sticky-note canvas that replaces overwhelming nested text lists and browser tabs.
* **How it works:** The system uses vector embeddings to automatically cluster unformatted user thoughts (tasks, ideas, events) by semantic similarity. This "magnetic" clustering visually groups related contexts without requiring the user to create manual folders.
* **Tech Stack:** React, `@xyflow/react` (Infinite Canvas), local IndexedDB vector storage, cosine similarity algorithms.

### 2. Agentic "Micro-Step" Task Breakdown Engine
Standard productivity tools fail because generic sub-tasks trigger task paralysis. Resonance AI uses an NLP-powered Task Decomposer to transform vague, overwhelming goals into hyper-specific, actionable micro-tasks.
* **How it works:** Acts as a cognitive unblocker, breaking down large projects into atomic execution loops with predefined time estimates.
* **Tech Stack:** Next.js, LLM Task Decomposition pipelines, Framer Motion.

### 3. Real-Time Cognitive Load Guardrail (Second Brain)
Acts as an external working memory buffer. It captures active text, ideas, and context, allowing for conversational semantic retrieval when a user experiences a context-switching block.
* **How it works:** A local vector-based search pipeline allows users to query their past thoughts (e.g., *"Where did I write about that AI app idea?"*) using natural language, instantly re-establishing their exact previous working state.
* **Tech Stack:** Local vector embeddings, custom similarity search algorithms.

### 4. Focus Sentinel & Digital Reset
A dedicated space to clear digital noise and lock into deep work.
* **How it works:** Features a customizable Pomodoro timer specifically tuned for neurodivergent users, accompanied by a "Digital Reset Checklist" to audit notifications, clear browser tabs, and create physical focus barriers.

## Technical Stack
* **Frontend:** Next.js 14, React, TailwindCSS, Framer Motion
* **Canvas Engine:** `@xyflow/react`
* **Data & AI:** Local Vector Embeddings (IndexedDB), Cosine Similarity Semantic Search
* **Styling:** Custom dark-mode glassmorphism, fluid CSS animations, CSS 3D renderings

## Resume Highlights
* **Engineered a spatial task management platform** using React Flow and local vector embeddings, enabling real-time semantic clustering of unformatted user thoughts into organized visual sticky-note arrays.
* **Built an automated vector-search pipeline** to calculate real-time similarity scores in the browser, reducing user cognitive load by eliminating manual categorization overhead.
* **Designed a context-aware task decomposition engine** that parses overwhelming goals into high-specificity, low-friction micro-steps, drastically reducing task-initiation latency for neurodivergent users.

## Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
