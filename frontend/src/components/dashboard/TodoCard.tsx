import { CheckCircle2, Circle, ListTodo, Sparkles } from "lucide-react";
import React from "react";

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
}

interface TodoCardProps {
  todos?: TodoItem[];
  loading?: boolean;
  locality?: string;
  onToggle?: (id: string) => void;
  onGenerateSuggestions?: () => void;
}

const defaultTodos: TodoItem[] = [
  { id: "1", title: "Check local weather forecast", completed: false, category: "planning" },
  { id: "2", title: "Exchange currency", completed: false, category: "finance" },
  { id: "3", title: "Try local cuisine", completed: false, category: "experience" },
  { id: "4", title: "Visit top attractions", completed: false, category: "sightseeing" },
  { id: "5", title: "Take photos for memories", completed: false, category: "personal" },
];

const getCategoryColor = (category?: string) => {
  switch (category) {
    case "planning": return "text-blue-400 bg-blue-500/10";
    case "finance": return "text-emerald-400 bg-emerald-500/10";
    case "experience": return "text-purple-400 bg-purple-500/10";
    case "food": return "text-orange-400 bg-orange-500/10";
    case "sightseeing": return "text-pink-400 bg-pink-500/10";
    case "personal": return "text-cyan-400 bg-cyan-500/10";
    default: return "text-slate-400 bg-slate-500/10";
  }
};

export function TodoCard({ todos = defaultTodos, loading, locality, onToggle, onGenerateSuggestions }: TodoCardProps) {
  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center">
            <ListTodo className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-400">Things To Do</span>
            {locality && (
              <p className="text-xs text-slate-500">Suggestions for {locality}</p>
            )}
          </div>
        </div>
        {onGenerateSuggestions && (
          <button
            onClick={onGenerateSuggestions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            AI Suggest
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading suggestions...</span>
        </div>
      )}

      {!loading && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {todos.map((todo) => (
            <div
              key={todo.id}
              onClick={() => onToggle?.(todo.id)}
              className={`flex items-center gap-3 bg-slate-800/50 rounded-xl p-3 cursor-pointer hover:bg-slate-800/70 transition-all ${
                todo.completed ? "opacity-50" : ""
              }`}
            >
              {todo.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <span className={`text-sm flex-1 text-white ${todo.completed ? "line-through text-slate-400" : ""}`}>
                {todo.title}
              </span>
              {todo.category && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(todo.category)}`}>
                  {todo.category}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
