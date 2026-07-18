import React, { useState, useEffect } from 'react';
import { GitBranch, Terminal, Copy, Check, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
  files: string[];
}

interface GitStatusFile {
  status: string;
  path: string;
}

export const TimeMachine: React.FC = () => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [gitStatus, setGitStatus] = useState<GitStatusFile[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  const fetchGitData = async () => {
    setLoading(true);
    try {
      const logRes = await fetch('/api/git/log');
      const logData = await logRes.json();
      
      if (logData.success && logData.commits && logData.commits.length > 0) {
        setCommits(logData.commits);
        setFallbackMode(false);
      } else {
        // Use Mock data fallback
        setCommits(MOCK_COMMITS);
        setFallbackMode(true);
      }

      const statusRes = await fetch('/api/git/status');
      const statusData = await statusRes.json();
      if (statusData.success && statusData.files) {
        setGitStatus(statusData.files);
      } else {
        setGitStatus([
          { status: 'M', path: 'src/App.tsx' },
          { status: '??', path: 'src/components/TimeMachine.tsx' }
        ]);
      }
    } catch (e) {
      setCommits(MOCK_COMMITS);
      setGitStatus([
        { status: 'M', path: 'src/App.tsx' },
        { status: '??', path: 'src/components/TimeMachine.tsx' }
      ]);
      setFallbackMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getShortHash = (hash: string) => hash.substring(0, 7);

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      {/* Top Header Controls */}
      <div className="glass-panel p-5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-accent-teal" />
            <h3 className="font-semibold text-sm text-text-primary uppercase tracking-wider">
              Codebase Time Machine
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {fallbackMode && (
              <span className="text-[10px] bg-accent-amber-glow text-accent-amber px-2 py-0.5 rounded font-bold border border-accent-amber">
                SIMULATED
              </span>
            )}
            <button
              onClick={fetchGitData}
              disabled={loading}
              className="p-1.5 rounded bg-bg-tertiary border border-border-color hover:border-accent-teal text-text-secondary hover:text-text-primary transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Current status display */}
        <div className="bg-bg-primary rounded-lg border border-border-color p-3">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1.5">
            Working Directory Status
          </span>
          {gitStatus.length === 0 ? (
            <span className="text-xs text-accent-teal font-medium flex items-center gap-1.5">
              ● Working directory clean (synced with main)
            </span>
          ) : (
            <div className="max-h-[60px] overflow-y-auto flex flex-col gap-1 pr-1">
              {gitStatus.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-mono">
                  <span className="text-text-secondary truncate pr-2">{file.path}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    file.status === 'M' ? 'bg-accent-amber-glow text-accent-amber' : 'bg-accent-indigo-glow text-accent-indigo'
                  }`}>
                    {file.status === 'M' ? 'Modified' : 'Untracked'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main timeline + drawer layout */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* Left Timeline Scroll */}
        <div className="flex-1 glass-panel p-4 flex flex-col min-h-0 overflow-y-auto">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-4 px-1">
            Commit History Log
          </span>
          
          <div className="relative pl-6 border-l border-border-color ml-2 flex flex-col gap-6">
            {commits.map((commit) => {
              const isSelected = selectedCommit?.hash === commit.hash;
              return (
                <div
                  key={commit.hash}
                  onClick={() => setSelectedCommit(commit)}
                  className={`group relative cursor-pointer p-3 rounded-lg border transition-all duration-300 ${
                    isSelected
                      ? 'bg-bg-tertiary border-accent-teal shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                      : 'border-transparent hover:bg-bg-secondary hover:border-border-color'
                  }`}
                >
                  {/* Timeline indicator node */}
                  <div className={`absolute -left-[31px] top-4 w-4 h-4 rounded-full border-4 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-accent-teal border-bg-primary shadow-[0_0_8px_var(--accent-teal)]' 
                      : 'bg-bg-primary border-border-color group-hover:border-text-muted'
                  }`} />

                  <div className="flex justify-between items-baseline gap-2 mb-1">
                    <span className="text-xs font-bold text-text-primary line-clamp-1">
                      {commit.message}
                    </span>
                    <span className="text-[10px] font-mono text-accent-teal bg-bg-primary px-1.5 py-0.5 rounded border border-border-color">
                      {getShortHash(commit.hash)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-text-muted mt-1">
                    <span>by {commit.author}</span>
                    <span>{commit.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Drawer Info */}
        {selectedCommit && (
          <div className="w-[300px] flex flex-col gap-4 animate-slide-in">
            {/* Commit card info */}
            <div className="glass-panel p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-accent-teal font-mono uppercase font-bold tracking-wider">
                  Selected Commit Detail
                </span>
                <button
                  onClick={() => setSelectedCommit(null)}
                  className="text-xs text-text-muted hover:text-text-primary font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="bg-bg-primary p-3 rounded border border-border-color flex flex-col gap-1.5">
                <h4 className="text-xs font-semibold text-text-primary leading-snug">
                  {selectedCommit.message}
                </h4>
                <div className="text-[10px] text-text-muted font-mono leading-relaxed mt-1 flex flex-col gap-0.5">
                  <span className="truncate">Hash: {selectedCommit.hash}</span>
                  <span>Author: {selectedCommit.author}</span>
                  <span>Date: {selectedCommit.date}</span>
                </div>
              </div>

              {/* Modified Files */}
              {selectedCommit.files.length > 0 && (
                <div className="mt-1">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold block mb-1">
                    Affected Files
                  </span>
                  <div className="max-h-[80px] overflow-y-auto flex flex-col gap-1 pr-1">
                    {selectedCommit.files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <FileText className="w-3.5 h-3.5 text-text-muted" />
                        <span className="font-mono truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Git Command Helper Box */}
            <div className="glass-panel p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-accent-teal" />
                Git Recovery Console
              </span>

              {/* Safe action: detached head */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-text-secondary font-bold">1. Safe Exploration</span>
                <span className="text-[10px] text-text-muted leading-snug">
                  Detaches HEAD to view files without overwriting changes:
                </span>
                <div className="bg-bg-primary p-2 rounded border border-border-color flex items-center justify-between font-mono text-[11px] mt-1">
                  <span className="text-text-primary truncate">git switch --detach {getShortHash(selectedCommit.hash)}</span>
                  <button
                    onClick={() => handleCopy(`git switch --detach ${selectedCommit.hash}`, 'explore')}
                    className="p-1 text-text-secondary hover:text-text-primary bg-bg-secondary hover:bg-bg-tertiary rounded transition-colors"
                  >
                    {copiedText === 'explore' ? <Check className="w-3 h-3 text-accent-teal" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Recommended action: create branch */}
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[10px] text-accent-teal font-bold flex items-center gap-1">
                  2. Branch Recovery (Recommended)
                </span>
                <span className="text-[10px] text-text-muted leading-snug">
                  Creates a safe branch from history to safeguard workspace changes:
                </span>
                <div className="bg-bg-primary p-2 rounded border border-border-color flex items-center justify-between font-mono text-[11px] mt-1">
                  <span className="text-text-primary truncate">git switch -c recovery/{getShortHash(selectedCommit.hash)} {getShortHash(selectedCommit.hash)}</span>
                  <button
                    onClick={() => handleCopy(`git switch -c recovery/${getShortHash(selectedCommit.hash)} ${selectedCommit.hash}`, 'branch')}
                    className="p-1 text-text-secondary hover:text-text-primary bg-bg-secondary hover:bg-bg-tertiary rounded transition-colors"
                  >
                    {copiedText === 'branch' ? <Check className="w-3 h-3 text-accent-teal" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* File restore */}
              {selectedCommit.files.length > 0 && (
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[10px] text-text-secondary font-bold">3. Restore Specific File</span>
                  <span className="text-[10px] text-text-muted leading-snug">
                    Overwrites only selected file back to commit state:
                  </span>
                  <div className="bg-bg-primary p-2 rounded border border-border-color flex items-center justify-between font-mono text-[11px] mt-1">
                    <span className="text-text-primary truncate">git restore --source={getShortHash(selectedCommit.hash)} -- {selectedCommit.files[0]}</span>
                    <button
                      onClick={() => handleCopy(`git restore --source=${selectedCommit.hash} -- ${selectedCommit.files[0]}`, 'file')}
                      className="p-1 text-text-secondary hover:text-text-primary bg-bg-secondary hover:bg-bg-tertiary rounded transition-colors"
                    >
                      {copiedText === 'file' ? <Check className="w-3 h-3 text-accent-teal" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Destructive Warning */}
              <div className="border border-accent-rose-glow bg-accent-rose-glow bg-opacity-20 p-3 rounded-lg mt-2 flex flex-col gap-1.5">
                <span className="text-[10px] text-accent-rose font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Destructive Action Warning
                </span>
                <span className="text-[9px] text-text-secondary leading-snug">
                  Forces current branch to match this historical state. All uncommitted changes will be irreversibly deleted.
                </span>
                <div className="bg-bg-primary p-2 rounded border border-accent-rose flex items-center justify-between font-mono text-[11px] mt-1 select-all">
                  <span className="text-accent-rose truncate">git reset --hard {getShortHash(selectedCommit.hash)}</span>
                  <button
                    onClick={() => handleCopy(`git reset --hard ${selectedCommit.hash}`, 'reset')}
                    className="p-1 text-text-secondary hover:text-text-primary bg-bg-secondary hover:bg-bg-tertiary rounded transition-colors"
                  >
                    {copiedText === 'reset' ? <Check className="w-3 h-3 text-accent-teal" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MOCK_COMMITS: Commit[] = [
  {
    hash: '5a4d9e2fc9d699f937378f267663249062148ce8',
    author: 'ReReReverie',
    date: '2026-07-18 12:28',
    message: 'Sync remote changes, merge index.css template setup',
    files: ['src/index.css', 'package.json']
  },
  {
    hash: '249062148ce80a2522c5c9d699f937378f267663',
    author: 'ReReReverie',
    date: '2026-07-18 12:28',
    message: 'Initial commit with LICENSE template',
    files: ['LICENSE']
  },
  {
    hash: 'e3f5a2b16df89c20a10df768f5c9e2b102bc34ae',
    author: 'Sarah Jenkins',
    date: '2026-07-17 18:45',
    message: 'chore: configure typescript tsconfig options for react modules',
    files: ['tsconfig.json', 'tsconfig.app.json']
  },
  {
    hash: 'a12bc8df95c2de52f9b8c0a87641d8b24ef09cf1',
    author: 'Alex Carter',
    date: '2026-07-16 11:20',
    message: 'fix: patch session token validation middleware in router',
    files: ['src/auth/session.ts']
  }
];
