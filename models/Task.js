const Model = require('./Model');

class Task extends Model {
    static tableName = 'tasks';
    
    static fillable = [
        'user_id',
        'title',
        'date',
        'category',
        'time',
        'completed',
        'created_at',
        'updated_at'
    ];
    
    // Add static method for filtering by user_id
    static async findByUserId(userId) {
        try {
            console.log('Task.findByUserId called with userId:', userId);
            
            // Test connection first
            const db = require('./Connection');
            
            // Simple connection test
            await db.execute('SELECT 1');
            console.log('Database connection successful');
            
            const query = `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY created_at DESC`;
            const [results] = await db.execute(query, [userId]);
            
            console.log('Raw query results:', results);
            
            // Convert and fix date formats
            const convertedResults = results.map(task => {
                let fixedDate = task.date;
                
                // Fix trailing dot issue
                if (typeof fixedDate === 'string' && fixedDate.endsWith('.')) {
                    fixedDate = fixedDate.substring(0, fixedDate.length - 1) + '.000Z';
                }
                
                // Fix time format - IMPROVED LOGIC
                let fixedTime = task.time ? task.time.trim() : task.time;
                if (fixedTime && !fixedTime.toLowerCase().includes('am') && !fixedTime.toLowerCase().includes('pm')) {
                    console.log('Converting time from database:', fixedTime);
                    
                    try {
                        // Handle different time formats
                        if (fixedTime.includes(':')) {
                            // Format like "10:56" or "22:56"
                            const timeParts = fixedTime.split(':');
                            let hour = parseInt(timeParts[0]);
                            const minute = timeParts[1].replace(/[^0-9]/g, '');
                            
                            // Determine if this is 24-hour format or 12-hour format without AM/PM
                            if (hour >= 0 && hour <= 23) {
                                // Treat as 24-hour format
                                let period = hour >= 12 ? 'PM' : 'AM';
                                
                                // Convert to 12-hour format
                                if (hour === 0) {
                                    hour = 12; // 00:xx becomes 12:xx AM
                                } else if (hour > 12) {
                                    hour = hour - 12; // 13:xx becomes 1:xx PM, 22:xx becomes 10:xx PM
                                }
                                // hour 1-11 stay the same for AM
                                // hour 12 stays 12 for PM
                                
                                fixedTime = `${hour}:${minute.padStart(2, '0')} ${period}`;
                            } else {
                                // Invalid hour, default to AM
                                fixedTime = `${hour}:${minute.padStart(2, '0')} AM`;
                            }
                        } else {
                            // Just a number like "10" or "22"
                            let hour = parseInt(fixedTime);
                            
                            if (hour >= 0 && hour <= 23) {
                                // Treat as 24-hour format
                                let period = hour >= 12 ? 'PM' : 'AM';
                                
                                if (hour === 0) {
                                    hour = 12;
                                } else if (hour > 12) {
                                    hour = hour - 12;
                                }
                                
                                fixedTime = `${hour}:00 ${period}`;
                            } else {
                                fixedTime = `${hour}:00 AM`;
                            }
                        }
                        
                        console.log('Converted time to:', fixedTime);
                    } catch (e) {
                        console.log('Could not parse time:', fixedTime, 'Error:', e);
                        // Default fallback - assume it's AM if conversion fails
                        fixedTime = fixedTime + ' AM';
                    }
                }
                
                return {
                    ...task,
                    completed: Boolean(task.completed), // Convert 0/1 to false/true
                    date: fixedDate,
                    time: fixedTime // Now consistently formatted with AM/PM
                };
            });
            
            console.log('Tasks after conversion:', convertedResults);
            return convertedResults;
        } catch (error) {
            console.error('Error in findByUserId:', error);
            
            // More specific error handling
            if (error.code === 'ECONNREFUSED') {
                console.error('Database connection refused. Please check if MySQL server is running.');
                throw new Error('Database server is not accessible. Please ensure MySQL is running.');
            } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                console.error('Database access denied. Please check credentials.');
                throw new Error('Database access denied. Please check your credentials.');
            } else if (error.code === 'ER_BAD_DB_ERROR') {
                console.error('Database does not exist.');
                throw new Error('Database does not exist. Please check your database name.');
            }
            
            throw error;
        }
    }
}

module.exports = Task;