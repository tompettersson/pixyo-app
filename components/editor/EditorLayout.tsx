'use client';

import { ReactNode } from 'react';

interface EditorLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
}

export function EditorLayout({ leftPanel, centerPanel, rightPanel }: EditorLayoutProps) {
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Left Panel - Prompt & Generation */}
      <aside className="w-80 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {leftPanel}
        </div>
      </aside>

      {/* Center Panel - Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        {centerPanel}
      </main>

      {/* Right Panel - Inspector */}
      <aside className="w-72 flex-shrink-0 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {rightPanel}
        </div>
      </aside>
    </div>
  );
}




