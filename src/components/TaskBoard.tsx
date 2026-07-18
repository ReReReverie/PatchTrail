import React, { useState } from 'react';
import { User, ClipboardList, CheckCircle2, Play } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  fileContext: string;
  suggestedFix?: string;
  codeContext?: string;
  diffSnippet?: string;
  regressionTests?: string[];
}

interface TaskBoardProps {
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TRANSCRIPT_TEMPLATES = {
  authBug: `Alex: We are seeing an issue where users get logged out immediately after they successfully update their emails.
Sarah: Yes, I noticed that too. It happens on the profile page. It seems to clear the session context.
Alex: Let's investigate this. We need to check the session handler in src/auth/session.ts before Friday.
Sarah: I can help review the code once we identify the root cause. We should also add regression tests to make sure this doesn't happen again.`,
  paymentBug: `David: Users are reporting payment timeouts when they checkout.
Marcus: The webhook in src/payments/checkout.ts doesn't seem to verify the state properly, which causes the promise to hang.
David: We need a fix for checkout.ts. Let's set up a mock payment gateway regression test and resolve this priority issue today.`,
};

export const TaskBoard: React.FC<TaskBoardProps> = ({
  onSelectTask,
  selectedTaskId,
  tasks,
  setTasks,
}) => {
  const [transcriptInput, setTranscriptInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const loadTemplate = (key: 'authBug' | 'paymentBug') => {
    setTranscriptInput(TRANSCRIPT_TEMPLATES[key]);
  };

  const handleExtractTasks = () => {
    if (!transcriptInput.trim()) return;

    setIsExtracting(true);
    // Simulate AI extraction with steps
    setTimeout(() => {
      let newTasks: Task[] = [];
      if (transcriptInput.includes('session.ts') || transcriptInput.includes('emails')) {
        newTasks = [
          {
            id: 'task-1',
            title: 'Fix Session Logouts on Email Update',
            description: 'Investigate logout issue in session.ts triggered after user email changes.',
            priority: 'high',
            assignee: 'Alex',
            status: 'pending',
            fileContext: 'src/auth/session.ts',
            codeContext: `export function updateUserProfile(userId: string, data: Partial<User>) {
  const user = database.findById(userId);
  if (!user) throw new Error("User not found");
  
  database.update(userId, data);
  
  if (data.email) {
    // Clear security session tokens for safety
    sessionManager.destroyAllSessions(userId);
  }
  
  return { success: true };
}`,
            suggestedFix: `export function updateUserProfile(userId: string, data: Partial<User>) {
  const user = database.findById(userId);
  if (!user) throw new Error("User not found");
  
  database.update(userId, data);
  
  if (data.email) {
    // FIX: Instead of destroying the current session, update the session token mapping 
    // to preserve authentication for the current browser, while invalidating other devices.
    sessionManager.rotateSessionToken(userId, currentSessionToken());
  }
  
  return { success: true };
}`,
            diffSnippet: `@@ -8,3 +8,3 @@
   if (data.email) {
-    // Clear security session tokens for safety
-    sessionManager.destroyAllSessions(userId);
+    // FIX: Rotate current session token instead of dropping all sessions
+    sessionManager.rotateSessionToken(userId, currentSessionToken());
   }`,
            regressionTests: [
              'describe("updateUserProfile auth", () => {',
              '  it("should preserve current session state when email updates", async () => {',
              '    const result = await updateUserProfile(testUser.id, { email: "new@test.com" });',
              '    expect(result.success).toBe(true);',
              '    expect(sessionManager.isValid(currentSessionToken())).toBe(true);',
              '  });',
              '});'
            ]
          },
          {
            id: 'task-2',
            title: 'Add Session Regression Tests',
            description: 'Write automated regression tests confirming sessions persist after email rotates.',
            priority: 'medium',
            assignee: 'Sarah',
            status: 'pending',
            fileContext: 'tests/auth.test.ts',
          }
        ];
      } else {
        newTasks = [
          {
            id: 'task-3',
            title: 'Resolve Payment checkout.ts Timeout',
            description: 'Fix hanging state validation on payment webhooks in checkout.ts.',
            priority: 'critical',
            assignee: 'Marcus',
            status: 'pending',
            fileContext: 'src/payments/checkout.ts',
            codeContext: `export async function verifyPaymentWebhook(payload: WebhookPayload) {
  const transaction = await gateway.getTransaction(payload.id);
  
  while (transaction.status === 'processing') {
    // Wait for gateway processing status update
    await sleep(1000);
  }
  
  return transaction.status === 'success';
}`,
            suggestedFix: `export async function verifyPaymentWebhook(payload: WebhookPayload) {
  const transaction = await gateway.getTransaction(payload.id);
  
  // FIX: Added timeout bounds (max 5 retries) to prevent request hanging indefinitely
  let retries = 0;
  while (transaction.status === 'processing' && retries < 5) {
    await sleep(1000);
    retries++;
  }
  
  if (transaction.status === 'processing') {
    throw new Error("Transaction verification timed out");
  }
  
  return transaction.status === 'success';
}`,
            diffSnippet: `@@ -4,4 +4,7 @@
-  while (transaction.status === 'processing') {
-    // Wait for gateway processing status update
-    await sleep(1000);
-  }
+  let retries = 0;
+  while (transaction.status === 'processing' && retries < 5) {
+    await sleep(1000);
+    retries++;
+  }
+  if (transaction.status === 'processing') {
+    throw new Error("Transaction verification timed out");
+  }`,
            regressionTests: [
              'describe("verifyPaymentWebhook timeouts", () => {',
              '  it("should throw error if payment gateway hangs processing", async () => {',
              '    await expect(verifyPaymentWebhook({ id: "hang_tx" })).rejects.toThrow();',
              '  });',
              '});'
            ]
          }
        ];
      }
      setTasks(newTasks);
      setIsExtracting(false);
      // Auto-select first task
      if (newTasks.length > 0) {
        onSelectTask(newTasks[0]);
      }
    }, 1500);
  };

  const handleUpdatePriority = (taskId: string, priority: Task['priority']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));
  };

  const handleUpdateAssignee = (taskId: string, assignee: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignee } : t));
  };

  const handleUpdateStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Transcript Input Box */}
      <div className="glass-panel p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-accent-indigo" />
            1. Meeting & Issue Context
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => loadTemplate('authBug')}
              className="text-xs bg-bg-tertiary border border-border-color hover:border-accent-indigo px-2.5 py-1.5 rounded text-text-secondary hover:text-text-primary"
            >
              Auth Bug
            </button>
            <button
              onClick={() => loadTemplate('paymentBug')}
              className="text-xs bg-bg-tertiary border border-border-color hover:border-accent-indigo px-2.5 py-1.5 rounded text-text-secondary hover:text-text-primary"
            >
              Payments Bug
            </button>
          </div>
        </div>

        <textarea
          value={transcriptInput}
          onChange={(e) => setTranscriptInput(e.target.value)}
          placeholder="Paste meeting logs, transcript discussion, or bug reports here..."
          className="w-full min-h-[120px] max-h-[160px] bg-bg-primary text-text-primary p-3 rounded-lg border border-border-color focus:border-accent-indigo resize-none text-sm placeholder:text-text-muted"
        />

        <button
          onClick={handleExtractTasks}
          disabled={isExtracting || !transcriptInput.trim()}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
            isExtracting || !transcriptInput.trim()
              ? 'bg-bg-tertiary text-text-muted cursor-not-allowed border border-border-color'
              : 'bg-accent-indigo text-white hover:bg-opacity-90 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
          }`}
        >
          {isExtracting ? (
            <span className="flex items-center gap-1">
              Extracting Tasks
              <span className="loading-dots">
                <span></span><span></span><span></span>
              </span>
            </span>
          ) : (
            <>
              <Play className="w-4 h-4" /> Extract Tasks (AI Parser)
            </>
          )}
        </button>
      </div>

      {/* Task Board Column */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <h3 className="font-semibold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2 px-1">
          <CheckCircle2 className="w-4 h-4 text-accent-teal" />
          2. Actionable Tasks ({tasks.length})
        </h3>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
          {tasks.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center border border-dashed border-border-color rounded-xl p-6 text-text-secondary">
              <ClipboardList className="w-8 h-8 text-text-muted mb-2" />
              <p className="text-sm font-medium">No tasks extracted yet</p>
              <p className="text-xs text-text-muted mt-1">Paste a log above to generate tasks</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isSelected = selectedTaskId === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`glass-panel p-4 flex flex-col gap-3 cursor-pointer relative overflow-hidden transition-all duration-300 ${
                    isSelected
                      ? 'border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.1)] bg-bg-tertiary'
                      : 'hover:border-glass-border-hover'
                  }`}
                  style={{
                    animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-indigo" />
                  )}
                  
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm font-semibold transition-colors ${isSelected ? 'text-accent-indigo' : 'text-text-primary'}`}>
                      {task.title}
                    </h4>
                    <span className={`badge badge-${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2">
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-text-muted border-t border-border-color pt-2 mt-1">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <input
                        type="text"
                        value={task.assignee}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleUpdateAssignee(task.id, e.target.value)}
                        className="bg-transparent border-none p-0 text-[11px] text-text-secondary w-16 focus:bg-bg-primary focus:px-1 rounded"
                      />
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.priority}
                        onChange={(e) => handleUpdatePriority(task.id, e.target.value as Task['priority'])}
                        className="bg-transparent border-none text-[11px] text-text-secondary p-0 cursor-pointer focus:bg-bg-primary focus:px-1 rounded"
                      >
                        <option value="low" className="bg-bg-secondary">Low</option>
                        <option value="medium" className="bg-bg-secondary">Medium</option>
                        <option value="high" className="bg-bg-secondary">High</option>
                        <option value="critical" className="bg-bg-secondary">Critical</option>
                      </select>

                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as Task['status'])}
                        className={`bg-transparent border-none text-[11px] font-semibold p-0 cursor-pointer focus:bg-bg-primary focus:px-1 rounded ${
                          task.status === 'completed' ? 'text-accent-teal' : task.status === 'in-progress' ? 'text-accent-indigo' : 'text-text-muted'
                        }`}
                      >
                        <option value="pending" className="bg-bg-secondary text-text-primary">Pending</option>
                        <option value="in-progress" className="bg-bg-secondary text-text-primary">Active</option>
                        <option value="completed" className="bg-bg-secondary text-text-primary">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
