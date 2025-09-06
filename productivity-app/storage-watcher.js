// Real-time storage watcher - Add this to your React app temporarily
// Insert into your main App.tsx or index.tsx

console.log("🔍 Storage Watcher Activated");

// Store original localStorage methods
const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;

// Track storage changes
let storageLog = [];

// Override localStorage.setItem
localStorage.setItem = function(key, value) {
    const timestamp = new Date().toISOString();
    
    // Log storage changes
    if (key.includes('productivity_')) {
        const oldValue = localStorage.getItem(key);
        const changeType = oldValue ? 'UPDATE' : 'CREATE';
        
        storageLog.push({
            timestamp,
            type: changeType,
            key,
            oldLength: oldValue ? JSON.parse(oldValue).length : 0,
            newLength: JSON.parse(value).length,
            stackTrace: new Error().stack
        });
        
        console.log(`📝 STORAGE ${changeType}:`, {
            key,
            timestamp,
            oldLength: oldValue ? JSON.parse(oldValue).length : 0,
            newLength: JSON.parse(value).length
        });
        
        // Alert on suspicious changes
        if (key === 'productivity_tasks' && oldValue) {
            const oldTasks = JSON.parse(oldValue);
            const newTasks = JSON.parse(value);
            
            if (newTasks.length < oldTasks.length) {
                console.error("🚨 TASK DELETION DETECTED!", {
                    before: oldTasks.length,
                    after: newTasks.length,
                    deletedTasks: oldTasks.filter(t => !newTasks.find(nt => nt.id === t.id)),
                    stackTrace: new Error().stack.split('\n').slice(1, 5)
                });
            }
        }
    }
    
    return originalSetItem.apply(this, arguments);
};

// Override localStorage.removeItem
localStorage.removeItem = function(key) {
    if (key.includes('productivity_')) {
        console.log(`🗑️ STORAGE DELETE:`, key, new Date().toISOString());
    }
    return originalRemoveItem.apply(this, arguments);
};

// Export log for inspection
window.getStorageLog = () => storageLog;
window.clearStorageLog = () => storageLog = [];

console.log("💡 Use getStorageLog() in console to see all changes");
