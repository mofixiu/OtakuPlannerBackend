const Model = require('./Model');

class Recurring_Task extends Model {
    static tableName = 'recurring_tasks';
    
    static fillable = [
        'user_id',
        'title',
        'date',
        'category',
        'time',
        'frequency',
        'completed',
        'completed_instances',
        'excluded_dates',
        'recurrence_end',
        'custom_pattern',
        'created_at',
        'updated_at'
    ];
    
    // Add static method for filtering by user_id
    static async findByUserId(userId) {
        try {
            console.log('Recurring_Task.findByUserId called with userId:', userId);
            
            const db = require('./Connection');
            await db.execute('SELECT 1');
            console.log('Database connection successful');
            
            const query = `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY created_at DESC`;
            const [results] = await db.execute(query, [userId]);
            
            console.log('Raw recurring task query results:', results);
            
            // Convert and fix date formats similar to regular tasks
            const convertedResults = results.map(task => {
                let fixedDate = task.date;
                
                if (typeof fixedDate === 'string' && fixedDate.endsWith('.')) {
                    fixedDate = fixedDate.substring(0, fixedDate.length - 1) + '.000Z';
                }
                
                // Fix time format for recurring tasks
                let fixedTime = task.time ? task.time.trim() : task.time;
                if (fixedTime && !fixedTime.toLowerCase().includes('am') && !fixedTime.toLowerCase().includes('pm')) {
                    try {
                        if (fixedTime.includes(':')) {
                            const timeParts = fixedTime.split(':');
                            let hour = parseInt(timeParts[0]);
                            const minute = timeParts[1].replace(/[^0-9]/g, '');
                            
                            if (hour >= 0 && hour <= 23) {
                                let period = hour >= 12 ? 'PM' : 'AM';
                                
                                if (hour === 0) {
                                    hour = 12;
                                } else if (hour > 12) {
                                    hour = hour - 12;
                                }
                                
                                fixedTime = `${hour}:${minute.padStart(2, '0')} ${period}`;
                            } else {
                                fixedTime = `${hour}:${minute.padStart(2, '0')} AM`;
                            }
                        } else {
                            let hour = parseInt(fixedTime);
                            
                            if (hour >= 0 && hour <= 23) {
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
                    } catch (e) {
                        console.log('Could not parse recurring task time:', fixedTime);
                        fixedTime = fixedTime + ' AM';
                    }
                }
                
                return {
                    ...task,
                    completed: Boolean(task.completed),
                    date: fixedDate,
                    time: fixedTime
                };
            });
            
            console.log('Recurring tasks after conversion:', convertedResults);
            return convertedResults;
        } catch (error) {
            console.error('Error in Recurring_Task.findByUserId:', error);
            throw error;
        }
    }
}

module.exports = Recurring_Task;