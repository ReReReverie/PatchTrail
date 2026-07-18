import { useState, useEffect } from 'react';
import { TaskBoard } from './components/TaskBoard';
import type { Task } from './components/TaskBoard';
import { BugDetective } from './components/BugDetective';
import { TimeMachine } from './components/TimeMachine';
import { Layers, Activity, GitBranch, ArrowRight } from 'lucide-react';
import './App.css';

interface ActivityLog {
  time: string;
  event: string;
  type: 'info' | 'success' | 'warn' | 'ai';
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Add event log helper
  const addLog = (event: string, type: ActivityLog['type'] = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityLogs(prev => [{ time, event, type }, ...prev].slice(0, 15));
  };

  // Log initial load
  useEffect(() => {
    addLog('Workspace PatchTrail active. Awaiting inputs.', 'info');
  }, []);

  // Sync log on task changes
  useEffect(() => {
    if (tasks.length > 0) {
      addLog(`Extracted ${tasks.length} actionable tasks from transcript.`, 'ai');
    }
  }, [tasks.length]);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    addLog(`Switched focus to task: "${task.title}"`, 'info');
  };

  const handleApplyFix = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: 'completed' as const } : t))
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: 'completed' as const } : undefined);
    }
    
    const matchedTask = tasks.find(t => t.id === taskId);
    addLog(`Applied AI proposed patch to ${matchedTask?.fileContext || 'codebase'}.`, 'success');
    addLog(`Task "${matchedTask?.title}" status updated to [Completed].`, 'success');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080b11] text-text-primary p-6 gap-6">
      {/* Top Navbar */}
      <header className="glass-panel px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-indigo to-accent-teal flex items-center justify-center shadow-lg">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              PatchTrail
            </h1>
            <p className="text-xs text-text-secondary font-medium">
              Autonomous Engineering Workspace & Safe Git recovery
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border-color">
            <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-text-secondary">Workspace:</span>
            <span className="font-mono text-text-primary">charming-oppenheimer</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-border-color">
            <GitBranch className="w-3.5 h-3.5 text-accent-indigo" />
            <span className="text-text-secondary">Branch:</span>
            <span className="font-mono text-text-primary">main</span>
          </div>
        </div>
      </header>

      {/* Main Grid Panels */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[28fr_42fr_30fr] gap-6 min-h-[580px] lg:h-[calc(100vh-250px)]">
        {/* Panel 1: Meeting & Tasks */}
        <section className="min-h-0">
          <TaskBoard
            onSelectTask={handleSelectTask}
            selectedTaskId={selectedTask?.id}
            tasks={tasks}
            setTasks={setTasks}
          />
        </section>

        {/* Panel 2: Bug Detective */}
        <section className="min-h-0">
          <BugDetective
            task={selectedTask}
            onApplyFix={handleApplyFix}
          />
        </section>

        {/* Panel 3: Time Machine */}
        <section className="min-h-0">
          <TimeMachine />
        </section>
      </main>

      {/* Bottom Activity Timeline Ledger */}
      <footer className="glass-panel p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="flex items-center gap-2 border-r border-border-color pr-4 text-xs font-semibold text-text-primary uppercase tracking-wider shrink-0">
          <Activity className="w-4 h-4 text-accent-indigo" />
          Workspace Activity
        </div>

        <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-6 py-1 select-text">
          {activityLogs.length === 0 ? (
            <span className="text-xs text-text-muted">Awaiting workspace changes...</span>
          ) : (
            activityLogs.map((log, idx) => {
              let tagColor = 'text-text-secondary bg-bg-tertiary';
              if (log.type === 'success') tagColor = 'text-accent-teal bg-accent-teal-glow border border-accent-teal';
              if (log.type === 'ai') tagColor = 'text-accent-indigo bg-accent-indigo-glow border border-accent-indigo';
              if (log.type === 'warn') tagColor = 'text-accent-rose bg-accent-rose-glow border border-accent-rose';

              return (
                <div key={idx} className="flex items-center gap-2 text-xs animate-slide-in">
                  <span className="text-text-muted font-mono">[{log.time}]</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tagColor}`}>
                    {log.type}
                  </span>
                  <span className="text-text-primary font-medium">{log.event}</span>
                  {idx < activityLogs.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-text-muted ml-2 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
