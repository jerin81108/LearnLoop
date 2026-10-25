import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Code2,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Layers,
  ArrowRight,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { CodingProblem, CodingSubmissionResult, CodingTestCase } from '../types';
import { runCodeSandboxApi, evaluateCodingApi } from '../services/api';

const sampleProblems: CodingProblem[] = [
  {
    id: 'prob-lru-cache',
    title: 'Least Recently Used (LRU) Cache Invalidation',
    domain: 'Systems & Data Structures',
    difficulty: 'Medium',
    description: `Implement an LRU Cache with capacity limit. When the cache exceeds capacity, invalidate the least recently used key before inserting a new key.
    
Write a function \`solution(input)\` that processes an array of operations:
- \`["get", key]\`: return the value of the key if key exists, otherwise return -1.
- \`["put", key, value]\`: update or insert the value. If number of keys exceeds capacity, evict the least recently used key.`,
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put',
      'Average time complexity: O(1) per operation',
    ],
    examples: [
      {
        input: '{"capacity": 2, "ops": [["put", 1, 1], ["put", 2, 2], ["get", 1], ["put", 3, 3], ["get", 2]]}',
        output: '[-1, 1, -1]',
        explanation: 'key 2 was evicted when key 3 was put because key 1 was accessed more recently.',
      },
    ],
    starterCode: {
      javascript: `/**
 * LRU Cache Solution
 * Input: { capacity: number, ops: Array<[string, number, number?]> }
 * Output: Array of results for "get" operations
 */
function solution(input) {
  const { capacity, ops } = input;
  const cache = new Map();
  const results = [];

  for (const op of ops) {
    const type = op[0];
    const key = op[1];

    if (type === "get") {
      if (!cache.has(key)) {
        results.push(-1);
      } else {
        const val = cache.get(key);
        // Refresh recency
        cache.delete(key);
        cache.set(key, val);
        results.push(val);
      }
    } else if (type === "put") {
      const val = op[2];
      if (cache.has(key)) {
        cache.delete(key);
      } else if (cache.size >= capacity) {
        // Evict least recently used (first key in Map)
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
      cache.set(key, val);
    }
  }

  return results;
}
`,
      python: `# LRU Cache Solution (Python syntax)
def solution(input_data):
    capacity = input_data.get('capacity', 2)
    ops = input_data.get('ops', [])
    from collections import OrderedDict
    cache = OrderedDict()
    results = []

    for op in ops:
        t = op[0]
        k = op[1]
        if t == "get":
            if k not in cache:
                results.append(-1)
            else:
                cache.move_to_end(k)
                results.append(cache[k])
        elif t == "put":
            v = op[2]
            if k in cache:
                cache.move_to_end(k)
            elif len(cache) >= capacity:
                cache.popitem(last=False)
            cache[k] = v

    return results
`,
    },
    tests: [
      {
        id: 1,
        input: {
          capacity: 2,
          ops: [
            ['put', 1, 10],
            ['put', 2, 20],
            ['get', 1],
            ['put', 3, 30],
            ['get', 2],
          ],
        },
        expected: [10, -1],
      },
      {
        id: 2,
        input: {
          capacity: 1,
          ops: [
            ['put', 5, 50],
            ['get', 5],
            ['put', 6, 60],
            ['get', 5],
          ],
        },
        expected: [50, -1],
      },
    ],
  },
  {
    id: 'prob-two-sum',
    title: 'Two Sum Target Pair Detection',
    domain: 'Arrays & Hash Maps',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.
    
You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
    ],
    starterCode: {
      javascript: `function solution(input) {
  const { nums, target } = input;
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}
`,
      python: `def solution(input_data):
    nums = input_data['nums']
    target = input_data['target']
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
`,
    },
    tests: [
      {
        id: 1,
        input: { nums: [2, 7, 11, 15], target: 9 },
        expected: [0, 1],
      },
      {
        id: 2,
        input: { nums: [3, 2, 4], target: 6 },
        expected: [1, 2],
      },
    ],
  },
];

export const CodingRoundView: React.FC = () => {
  const { saveCodingSubmission, addToast, navigateTo } = useApp();

  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(sampleProblems[0]);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState<string>(sampleProblems[0].starterCode.javascript);
  const [explanation, setExplanation] = useState('');

  // Execution test runner state
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<CodingTestCase[] | null>(null);

  // AI Evaluation result state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<CodingSubmissionResult | null>(null);

  const handleSelectProblem = (prob: CodingProblem) => {
    setSelectedProblem(prob);
    setCode(prob.starterCode[language] || prob.starterCode.javascript);
    setTestResults(null);
    setEvaluationResult(null);
  };

  const handleLanguageChange = (newLang: 'javascript' | 'python') => {
    setLanguage(newLang);
    setCode(selectedProblem.starterCode[newLang] || selectedProblem.starterCode.javascript);
    setTestResults(null);
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    setTestResults(null);

    try {
      const response = await runCodeSandboxApi(code, language, selectedProblem.tests);
      setTestResults(response.results);

      if (response.allPassed) {
        addToast('success', `All ${response.passedTests} test cases passed!`);
      } else {
        addToast('warning', `Passed ${response.passedTests}/${response.totalTests} tests.`);
      }
    } catch (err) {
      addToast('error', 'Execution runner error.');
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleSubmitRound = async () => {
    if (!testResults) {
      addToast('warning', 'Please run tests first to verify your implementation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await evaluateCodingApi(
        selectedProblem,
        code,
        language,
        testResults,
        explanation
      );
      setEvaluationResult(result);
      saveCodingSubmission(selectedProblem.id, result);
    } catch (err) {
      addToast('error', 'Failed to evaluate code submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-emerald text-xs">
              <Code2 className="w-3.5 h-3.5" /> Technical Coding Round
            </span>
            <span className="text-xs text-slate-400">
              Isolated Execution Sandbox (Zero Untrusted Host Execution)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">{selectedProblem.title}</h1>
        </div>

        {/* Problem Picker */}
        <div className="flex items-center gap-2">
          {sampleProblems.map((prob) => (
            <button
              key={prob.id}
              onClick={() => handleSelectProblem(prob)}
              className={`btn text-xs py-1.5 px-3 ${
                prob.id === selectedProblem.id ? 'btn-primary' : 'btn-secondary text-slate-400'
              }`}
            >
              {prob.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Coding Workspace: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Problem Statement & Constraints */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="badge badge-indigo text-[10px] font-mono">
                {selectedProblem.domain}
              </span>
              <span
                className={`badge ${
                  selectedProblem.difficulty === 'Easy'
                    ? 'badge-emerald'
                    : selectedProblem.difficulty === 'Medium'
                    ? 'badge-amber'
                    : 'badge-rose'
                } text-[10px] font-mono`}
              >
                {selectedProblem.difficulty}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Problem Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {selectedProblem.description}
              </p>
            </div>

            {/* Constraints */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Constraints & Invariants
              </h4>
              <ul className="text-xs text-slate-300 font-mono space-y-1 list-disc list-inside">
                {selectedProblem.constraints.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Example */}
            {selectedProblem.examples.map((ex, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1 text-xs"
              >
                <div className="font-semibold text-slate-300">Sample Test Case:</div>
                <div className="font-mono text-slate-400">Input: {ex.input}</div>
                <div className="font-mono text-emerald-400">Output: {ex.output}</div>
                {ex.explanation && (
                  <div className="text-[11px] text-slate-500 italic mt-1">
                    Explanation: {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reasoning & Explanation Input */}
          <div className="glass-card p-4 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Explain Your Approach & Complexity (STAR/Interview Style)
            </label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="e.g. Using a doubly-linked hash map for O(1) eviction and recency updates. Edge cases considered: empty cache and zero capacity..."
              className="form-textarea text-xs"
            />
            <span className="text-[10px] text-slate-500 block">
              Interviewers evaluate both your code and your ability to articulate trade-offs.
            </span>
          </div>
        </div>

        {/* Right Column (7 cols): Code Editor & Sandbox Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel overflow-hidden border-indigo-500/30">
            {/* Editor Top Bar */}
            <div className="bg-slate-900 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-semibold text-slate-300">solution.{language === 'javascript' ? 'js' : 'py'}</span>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLanguageChange('javascript')}
                  className={`text-xs px-2.5 py-1 rounded font-mono ${
                    language === 'javascript'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  JavaScript
                </button>
                <button
                  onClick={() => handleLanguageChange('python')}
                  className={`text-xs px-2.5 py-1 rounded font-mono ${
                    language === 'python'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Python
                </button>
              </div>
            </div>

            {/* Code Textarea Editor */}
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-[320px] bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm p-4 border-none focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Editor Action Bar */}
            <div className="bg-slate-900/90 px-4 py-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Isolated Worker Sandbox</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunTests}
                  disabled={isRunningTests}
                  className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
                  {isRunningTests ? 'Executing Sandbox...' : 'Run Sample Tests'}
                </button>

                <button
                  onClick={handleSubmitRound}
                  disabled={isSubmitting || !testResults}
                  className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Evaluating Code...' : 'Submit Solution'}
                </button>
              </div>
            </div>
          </div>

          {/* Test Runner Results Drawer */}
          {testResults && (
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                  Sandbox Test Execution Results
                </h4>
                <span className="font-mono text-xs text-emerald-400">
                  {testResults.filter((t) => t.passed).length} / {testResults.length} Passed
                </span>
              </div>

              <div className="space-y-2">
                {testResults.map((t) => (
                  <div
                    key={t.testId}
                    className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                      t.passed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        {t.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>Test Case #{t.testId}</span>
                        {t.executionTimeMs !== undefined && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({t.executionTimeMs}ms)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Input: {JSON.stringify(t.input)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Expected: {JSON.stringify(t.expected)} • Actual: {JSON.stringify(t.actual)}
                      </div>
                      {t.error && <div className="text-[11px] text-rose-400">{t.error}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluation Result Drawer */}
          {evaluationResult && (
            <div className="glass-panel p-5 space-y-4 border-indigo-500/40">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="badge badge-emerald text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Technical Evaluation Ready
                </span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  Score: {evaluationResult.overallScore}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                  <div className="text-slate-400">Correctness</div>
                  <div className="font-bold text-white font-mono mt-0.5">
                    {evaluationResult.correctnessScore}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                  <div className="text-slate-400">Time Complexity</div>
                  <div className="font-bold text-indigo-400 font-mono mt-0.5 truncate">
                    {evaluationResult.timeComplexity}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                  <div className="text-slate-400">Space Complexity</div>
                  <div className="font-bold text-indigo-400 font-mono mt-0.5 truncate">
                    {evaluationResult.spaceComplexity}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {evaluationResult.feedback}
              </p>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-300">Code Evidence Snippet:</div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-white/5 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {evaluationResult.codeEvidence}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-indigo-300">
                  Next Step: {evaluationResult.suggestedNextAction}
                </span>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  Update Skill Map <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
