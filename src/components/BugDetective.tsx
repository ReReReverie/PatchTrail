import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal, Check, Copy, FileCode, AlertCircle, RefreshCw } from 'lucide-react';
import type { Task } from './TaskBoard';

interface BugDetectiveProps {
  task?: Task;
  onApplyFix: (taskId: string) => void;
}

export const BugDetective: React.FC<BugDetectiveProps> = ({ task, onApplyFix }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [copiedTest, setCopiedTest] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  // Reset states when task changes
  useEffect(() => {
    setAnalyzing(false);
    setAnalysisPhase('');
    setShowResults(false);
    setCopiedTest(false);
    setApplying(false);
    setApplied(false);
  }, [task?.id]);

  if (!task) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-text-secondary border border-border-color rounded-2xl glass-panel">
        <ShieldAlert className="w-12 h-12 text-text-muted mb-3" />
        <p className="text-base font-semibold">Bug Detective Idle</p>
        <p className="text-sm text-text-muted mt-1 max-w-xs">
          Select an actionable task from the board to inspect codebase and formulate a patch.
        </p>
      </div>
    );
  }

  const handleStartAnalysis = () => {
    setAnalyzing(true);
    setShowResults(false);

    const phases = [
      'Scanning local file structures...',
      'Analyzing AST of reference files...',
      'Tracing execution paths from meeting context...',
      'Validating syntax & compiling patches...',
    ];

    let currentPhase = 0;
    setAnalysisPhase(phases[0]);

    const interval = setInterval(() => {
      currentPhase++;
      if (currentPhase < phases.length) {
        setAnalysisPhase(phases[currentPhase]);
      } else {
        clearInterval(interval);
        setAnalyzing(false);
        setShowResults(true);
      }
    }, 800);
  };

  const handleCopyTests = () => {
    if (!task.regressionTests) return;
    navigator.clipboard.writeText(task.regressionTests.join('\n'));
    setCopiedTest(true);
    setTimeout(() => setCopiedTest(false), 2000);
  };

  const handleApplyFix = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
      onApplyFix(task.id);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      {/* Top Overview panel */}
      <div className="glass-panel p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-indigo-glow border border-accent-indigo flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-accent-indigo" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text-primary uppercase tracking-wider">
                Bug Detective
              </h3>
              <p className="text-xs text-text-secondary mt-0.5 font-medium">
                Scope: {task.fileContext}
              </p>
            </div>
          </div>

          {!showResults && !analyzing && (
            <button
              onClick={handleStartAnalysis}
              className="bg-accent-indigo text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-95 shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 animate-spin-hover" />
              Analyze Bug
            </button>
          )}
        </div>

        {/* Phase Loader */}
        {analyzing && (
          <div className="flex flex-col gap-2.5 py-4 border border-dashed border-accent-indigo-glow rounded-lg bg-bg-primary bg-opacity-40 p-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-accent-indigo flex items-center gap-1">
                AI Trace Engine Active
                <span className="loading-dots">
                  <span></span><span></span><span></span>
                </span>
              </span>
              <span className="text-[11px] text-text-muted font-mono">AST Engine v1.0.4</span>
            </div>
            <p className="text-xs text-text-secondary font-mono bg-bg-secondary p-2.5 rounded border border-border-color">
              &gt; {analysisPhase}
            </p>
          </div>
        )}

        {/* Initial Empty state */}
        {!analyzing && !showResults && (
          <div className="border border-dashed border-border-color rounded-xl p-6 text-center text-text-secondary">
            <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm font-semibold">Awaiting Codebase Tracing</p>
            <p className="text-xs text-text-muted mt-1">
              Click 'Analyze Bug' to start the tracing workflow.
            </p>
          </div>
        )}

        {/* Result Header Info */}
        {showResults && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-bg-tertiary p-3 rounded-lg border border-border-color">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block font-bold">
                Confidence Rating
              </span>
              <span className="text-xl font-extrabold text-accent-teal block mt-1">
                {task.priority === 'high' ? '86%' : '94%'}
              </span>
            </div>
            <div className="bg-bg-tertiary p-3 rounded-lg border border-border-color col-span-2">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block font-bold">
                Root Cause Identified
              </span>
              <span className="text-xs text-text-primary block mt-1 font-medium truncate">
                {task.priority === 'high'
                  ? 'Session cleared directly after DB save.'
                  : 'Webhooks lock due to unhandled wait state.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Code Editor Panel */}
      {showResults && (
        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* File view diff */}
          <div className="glass-panel p-4 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-text-muted" />
                <span className="text-xs font-mono text-text-secondary">{task.fileContext}</span>
              </div>
              <span className="text-[10px] bg-accent-rose-glow text-accent-rose px-2 py-0.5 rounded font-bold uppercase border border-accent-rose">
                Proposed Fix
              </span>
            </div>

            {/* Diffs */}
            <div className="flex-1 overflow-auto bg-bg-primary rounded-lg border border-border-color p-3 font-mono text-[12px] leading-relaxed select-text">
              {task.codeContext && (
                <div className="mb-4">
                  <div className="text-text-muted border-b border-border-color pb-1.5 mb-1.5 uppercase font-bold text-[10px] tracking-wider">
                    Current Code
                  </div>
                  <pre className="text-text-secondary bg-transparent border-none p-0">
                    {task.codeContext}
                  </pre>
                </div>
              )}

              {task.suggestedFix && (
                <div>
                  <div className="text-accent-indigo border-b border-accent-indigo-glow pb-1.5 mb-1.5 uppercase font-bold text-[10px] tracking-wider">
                    Proposed Code Changes
                  </div>
                  <pre className="text-text-primary bg-bg-secondary p-3 rounded border border-border-color">
                    {task.suggestedFix}
                  </pre>
                </div>
              )}

              {task.diffSnippet && (
                <div className="mt-4">
                  <div className="text-text-muted border-b border-border-color pb-1.5 mb-1.5 uppercase font-bold text-[10px] tracking-wider">
                    Unified Diff
                  </div>
                  <pre className="text-text-secondary bg-bg-secondary border-none p-2 flex flex-col">
                    {task.diffSnippet.split('\n').map((line, idx) => {
                      let colorClass = 'text-text-muted';
                      if (line.startsWith('+')) colorClass = 'text-accent-teal bg-accent-teal-glow px-1 rounded';
                      if (line.startsWith('-')) colorClass = 'text-accent-rose bg-accent-rose-glow px-1 rounded';
                      return (
                        <code key={idx} className={`${colorClass} block`}>
                          {line}
                        </code>
                      );
                    })}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Tests Block */}
          {task.regressionTests && (
            <div className="glass-panel p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent-indigo" />
                  Auto-Generated Regression Tests
                </span>
                <button
                  onClick={handleCopyTests}
                  className="text-xs bg-bg-tertiary hover:bg-bg-primary text-text-secondary hover:text-text-primary border border-border-color hover:border-accent-indigo px-2 py-1 rounded flex items-center gap-1"
                >
                  {copiedTest ? (
                    <>
                      <Check className="w-3 h-3 text-accent-teal" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Tests
                    </>
                  )}
                </button>
              </div>

              <pre className="text-xs bg-bg-primary border border-border-color p-3 text-text-secondary leading-relaxed">
                {task.regressionTests.join('\n')}
              </pre>
            </div>
          )}

          {/* Apply Button */}
          <div className="flex gap-3">
            <button
              onClick={handleApplyFix}
              disabled={applying || applied}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300 ${
                applied
                  ? 'bg-accent-teal text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                  : 'bg-accent-indigo hover:bg-opacity-95 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              }`}
            >
              {applying ? (
                <span className="flex items-center justify-center gap-2">
                  Applying Patch...
                  <span className="loading-dots">
                    <span></span><span></span><span></span>
                  </span>
                </span>
              ) : applied ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> Patch Applied Successfully
                </span>
              ) : (
                'Apply Proposed Fix'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
