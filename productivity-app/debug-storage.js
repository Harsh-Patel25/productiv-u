// Debug script to test storage operations manually
// Run this in browser console to simulate the bug

console.log("=== STORAGE DEBUG SCRIPT ===");

// 1. Check current tasks and habits
const tasks = JSON.parse(localStorage.getItem('productivity_tasks') || '[]');
const habits = JSON.parse(localStorage.getItem('productivity_habits') || '[]');
const habitEntries = JSON.parse(localStorage.getItem('productivity_habit_entries') || '[]');

console.log("Current Tasks:", tasks);
console.log("Current Habits:", habits);
console.log("Current Habit Entries:", habitEntries);

// 2. Simulate habit completion
function simulateHabitCompletion(habitId) {
    console.log(`\n=== SIMULATING HABIT ${habitId} COMPLETION ===`);
    
    // Log before
    const tasksBefore = JSON.parse(localStorage.getItem('productivity_tasks') || '[]');
    const entriesBefore = JSON.parse(localStorage.getItem('productivity_habit_entries') || '[]');
    
    console.log("Tasks before:", tasksBefore.length);
    console.log("Habit entries before:", entriesBefore.length);
    
    // Create habit entry (simulate completion)
    const newEntry = {
        id: 'debug_' + Date.now(),
        habitId: habitId,
        date: new Date().toISOString().split('T')[0],
        completed: true,
        createdAt: new Date().toISOString()
    };
    
    const updatedEntries = [...entriesBefore, newEntry];
    localStorage.setItem('productivity_habit_entries', JSON.stringify(updatedEntries));
    
    // Log after
    const tasksAfter = JSON.parse(localStorage.getItem('productivity_tasks') || '[]');
    const entriesAfter = JSON.parse(localStorage.getItem('productivity_habit_entries') || '[]');
    
    console.log("Tasks after:", tasksAfter.length);
    console.log("Habit entries after:", entriesAfter.length);
    
    // Check for task deletion
    if (tasksBefore.length !== tasksAfter.length) {
        console.error("🚨 TASK COUNT CHANGED!");
        console.log("Deleted tasks:", tasksBefore.filter(t => !tasksAfter.find(ta => ta.id === t.id)));
    }
}

// 3. Test with first habit
if (habits.length > 0) {
    simulateHabitCompletion(habits[0].id);
} else {
    console.log("No habits found to test");
}

// 4. Check for shared IDs
console.log("\n=== ID COLLISION CHECK ===");
const taskIds = tasks.map(t => t.id);
const habitIds = habits.map(h => h.id);
const entryIds = habitEntries.map(e => e.id);

const allIds = [...taskIds, ...habitIds, ...entryIds];
const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);

if (duplicateIds.length > 0) {
    console.error("🚨 DUPLICATE IDS FOUND:", duplicateIds);
} else {
    console.log("✅ No duplicate IDs found");
}

console.log("=== END DEBUG ===");
