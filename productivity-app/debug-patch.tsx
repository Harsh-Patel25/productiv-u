// DEBUG PATCH - Add these console.log statements to your components temporarily

// 1. ADD TO src/hooks/useHabits.ts - toggleHabitCompletion function (line 86)
const toggleHabitCompletion = useCallback((habitId: string, date?: Date) => {
  console.log("🎯 HABIT TOGGLE START", { habitId, date, timestamp: Date.now() });
  
  const targetDate = date || new Date();
  const dateString = format(targetDate, 'yyyy-MM-dd');
  
  console.log("📅 Date processed", { dateString, targetDate });
  
  const existingEntry = habitEntries.find(
    entry => entry.habitId === habitId && entry.date === dateString
  );

  console.log("🔍 Existing entry search", { existingEntry, habitEntriesCount: habitEntries.length });

  let updatedEntries: HabitEntry[];

  if (existingEntry) {
    console.log("🔄 TOGGLING existing entry", existingEntry);
    updatedEntries = habitEntries.map(entry =>
      entry.id === existingEntry.id
        ? { ...entry, completed: !entry.completed }
        : entry
    );
  } else {
    const newEntryId = generateId();
    console.log("✅ CREATING new entry", { newEntryId, habitId });
    
    const newEntry: HabitEntry = {
      id: newEntryId,
      habitId,
      date: dateString,
      completed: true,
      createdAt: new Date(),
    };
    updatedEntries = [...habitEntries, newEntry];
  }

  console.log("💾 SAVING habit entries", { 
    oldCount: habitEntries.length, 
    newCount: updatedEntries.length 
  });

  saveHabitEntries(updatedEntries);
  
  console.log("✅ HABIT TOGGLE COMPLETE");
}, [habitEntries, saveHabitEntries]);

// 2. ADD TO src/hooks/useTasks.ts - deleteTask function (line 64)
const deleteTask = useCallback((id: string) => {
  console.log("🗑️ TASK DELETE START", { taskId: id, timestamp: Date.now() });
  console.log("📋 Tasks before delete", { 
    count: tasks.length, 
    taskIds: tasks.map(t => t.id),
    targetId: id 
  });
  
  const updatedTasks = tasks.filter(task => task.id !== id);
  
  console.log("📋 Tasks after filter", { 
    oldCount: tasks.length, 
    newCount: updatedTasks.length,
    deletedTask: tasks.find(t => t.id === id)
  });
  
  saveTasks(updatedTasks);
  console.log("✅ TASK DELETE COMPLETE");
}, [tasks, saveTasks]);

// 3. ADD TO src/utils/helpers.ts - generateId function (line 11)
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2);
  const id = timestamp + random;
  
  console.log("🆔 ID GENERATED", { id, timestamp: Date.now() });
  
  return id;
}

// 4. ADD TO src/components/Habits.tsx - HabitItem component (line 132)
function HabitItem({ habit, completed, streak, onToggleComplete }: HabitItemProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            console.log("🖱️ HABIT BUTTON CLICKED", { 
              habitId: habit.id, 
              currentlyCompleted: completed,
              timestamp: Date.now() 
            });
            onToggleComplete();
          }}
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors tap-target',
            completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
          )}
        >
          {completed && <Check className="w-4 h-4" />}
        </button>
        
        {/* ... rest of component */}
      </div>
    </div>
  );
}

// 5. ADD TO src/utils/storage.ts - saveTasks method (line 228)
saveTasks(tasks: Task[]): void {
  console.log("💾 STORAGE: Saving tasks", { 
    count: tasks.length, 
    taskIds: tasks.map(t => t.id),
    timestamp: Date.now()
  });
  
  const serializedTasks = tasks.map(task => ({
    ...task,
    dueDate: serializeDate(task.dueDate),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: serializeDate(task.completedAt),
    reminder: serializeDate(task.reminder),
  }));
  
  this.adapter.setItem(STORAGE_KEYS.TASKS, JSON.stringify(serializedTasks));
  console.log("✅ STORAGE: Tasks saved successfully");
}

// 6. IMPROVED ID GENERATION - Replace the existing generateId function
export function generateId(): string {
  // Use crypto.randomUUID if available, otherwise fallback to enhanced method
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Enhanced fallback with microsecond precision
  const now = performance.now().toString(36);
  const random = Math.random().toString(36).substr(2);
  const counter = (Date.now() % 1000000).toString(36);
  
  return `${now}-${random}-${counter}`;
}
