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
    case "planning": return "text-blue-600 bg-blue-100";
    case "finance": return "text-emerald-600 bg-emerald-100";
    case "experience": return "text-purple-600 bg-purple-100";
    case "food": return "text-orange-600 bg-orange-100";
    case "sightseeing": return "text-pink-600 bg-pink-100";
    case "personal": return "text-cyan-600 bg-cyan-100";
    default: return "text-gray-600 bg-gray-100";
  }
};

export function TodoCard({ todos = defaultTodos, loading, locality, onToggle, onGenerateSuggestions }: TodoCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center">
            <ListTodo className="w-4 h-4 text-pink-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Things To Do</span>
            {locality && (
              <p className="text-xs text-gray-400">Suggestions for {locality}</p>
            )}
          </div>
        </div>
        {onGenerateSuggestions && (
          <button
            onClick={onGenerateSuggestions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            AI Suggest
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-pink-400/30 border-t-pink-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading suggestions...</span>
        </div>
      )}

      {!loading && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {todos.map((todo) => (
            <div
              key={todo.id}
              onClick={() => onToggle?.(todo.id)}
              className={`flex items-center gap-3 bg-gray-100 rounded-xl p-3 cursor-pointer hover:bg-gray-200 transition-all ${
                todo.completed ? "opacity-50" : ""
              }`}
            >
              {todo.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 shrink-0" />
              )}
              <span className={`text-sm flex-1 text-gray-900 ${todo.completed ? "line-through text-gray-400" : ""}`}>
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
