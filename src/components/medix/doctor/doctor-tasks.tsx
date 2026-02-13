"use client";

import { CheckCircle2, Clock, FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function DoctorTasks({ tasks = [] }: { tasks?: any[] }) {
  // Əgər backend və ya props yoxdursa, boş görünəcək

  if (!tasks.length) {
    return <div className="text-muted-foreground">No tasks for now.</div>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-start justify-between gap-4 flex-wrap rounded-lg border p-3 transition-all ${
            task.completed ? "bg-muted/50" : "hover:bg-accent"
          }`}
        >
          <div className="flex items-center flex-wrap gap-3">
            <Checkbox 
              id={`task-${task.id}`} 
              checked={task.completed}
              // onCheckedChange gələcəkdə yazıla bilər
            />
            <div>
              <label
                htmlFor={`task-${task.id}`}
                className={`font-medium block mb-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {task.title || "--"}
              </label>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {task.due || "--"}
                {task.priority && (
                  <span
                    className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {task.priority}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {task.completed ? (
              <Button size="icon" variant="ghost">
                <RotateCcw className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button size="icon" variant="ghost">
                  <FileText className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
