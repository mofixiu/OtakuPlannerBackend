// const Task = require('../../models/Task');
// const { query } = require('../../models/Model');

// const storeTask = async (req, res) => {
//     // In your taskController.js storeTask function, add this at the very beginning:
// console.log('=== STORE TASK CALLED ===');
// console.log('Request body:', req.body);
// console.log('Request headers:', req.headers);
//     try {
//         const { user_id, title, date, category, time, completed } = req.body;
        
//         console.log('Received task data:', { user_id, title, date, category, time, completed });
        
//         // Validate required fields
//         if (!user_id || !title || !date || !category || !time) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'All task fields are required'
//             });
//         }
        
//         // Insert task into database using direct SQL
//         const sql = `
//             INSERT INTO tasks (user_id, title, date, category, time, completed, created_at, updated_at)
//             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
//         `;
        
//         const result = await query(sql, [
//             user_id, 
//             title, 
//             date, 
//             category, 
//             time, 
//             completed || false
//         ]);
        
//         console.log('Task inserted with ID:', result.insertId);
        
//         res.json({
//             status: 'success',
//             message: 'Task created successfully',
//             data: {
//                 id: result.insertId,
//                 user_id,
//                 title,
//                 date,
//                 category,
//                 time,
//                 completed: completed || false,
//                 created_at: new Date().toISOString(),
//                 updated_at: new Date().toISOString()
//             }
//         });
//     } catch (error) {
//         console.error('Error creating task:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to create task',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };
// // const storeTask = async (req, res) => {
// //     // let {user_id,title,date,category,time,completed } = req.body;
// //     // const task = Task.fill({ user_id,title,date,category,time,completed });
// //     // await task.insert()
// //     // res.json(
// //     //     {
// //     //         status: 'success',
// //     //         message: 'Task added successfully',
// //     //         data: task
// //     //     }
// //     // )
// //     try {
// //     const { user_id, title, date, category, time, completed } = req.body;
    
// //     // Validate required fields
// //     if (!user_id || !title || !date || !category || !time) {
// //       return res.status(400).json({
// //         status: 'error',
// //         message: 'All task fields are required'
// //       });
// //     }
    
// //     // Insert task into database
// //     const query = `
// //       INSERT INTO tasks (user_id, title, date, category, time, completed, created_at, updated_at)
// //       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
// //     `;
    
// //     const result = await db.execute(query, [
// //       user_id, 
// //       title, 
// //       date, 
// //       category, 
// //       time, 
// //       completed || false
// //     ]);
    
// //     res.json({
// //       status: 'success',
// //       message: 'Task created successfully',
// //       data: {
// //         id: result.insertId,
// //         user_id,
// //         title,
// //         date,
// //         category,
// //         time,
// //         completed: completed || false,
// //         created_at: new Date().toISOString(),
// //         updated_at: new Date().toISOString()
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Error creating task:', error);
// //     res.status(500).json({
// //       status: 'error',
// //       message: 'Failed to create task'
// //     });
// //   }
// // }



// const getTasks = async (req, res) => {
//     const tasks = await Task.fetch();
//     res.json(
//         {
//             status: 'success',
//             message: 'Tasks fetched successfully',
//             data: tasks
//         }
//     )
// }

// const getTaskById = async (req, res) => {
//     let { id } = req.params;
//     const task = await Task.find(id);
//     if (!task) {
//         return res.status(404).json(
//             {
//                 status: 'error',
//                 message: 'Task not found'
//             }
//         )
//     }
//     res.json(
//         {
//             status: 'success',
//             message: 'Task fetched successfully',
//             data: task
//         }
//     )
// }

// // const updateTask = async (req, res) => {
// //     let { id } = req.params;
// //     let { name, description, duration } = req.body;
// //     const task = await Task.find(id);
// //     if (!task) {
// //         return res.status(404).json(
// //             {
// //                 status: 'error',
// //                 message: 'Task not found'
// //             }
// //         )
// //     }
// //     task.fill({ name, description, duration });

// //     await task.update();

// //     res.json(
// //         {
// //             status: 'success',
// //             message: 'Task updated successfully',
// //             data: task
// //         }
// //     )
// // }

// const partialTaskUpdate = async (req, res) => {
//     let { id } = req.params;
//     const task = await Task.find(id);
//     if (!task) {
//         return res.status(404).json(
//             {
//                 status: 'error',
//                 message: 'Task not found'
//             }
//         )
//     }
//     task.fill(req.body);

//     await task.update();

//     res.json(
//         {
// //             status: 'success',
// //             message: 'Task updated successfully',
// //             data: task
// //         }
// //     )
// // }

// const deleteTask = async (req, res) => {
//     let { id } = req.params;
//     const deleted = await Task.delete(id);
//     if (!deleted) {
//         return res.status(404).json(
//             {
//                 status: 'error',
//                 message: 'Failed to delete task'
//             }
//         )
//     }

//     res.json(
//         {
//             status: 'success',
//             message: 'Task deleted successfully',
//         }
//     )
// }


// module.exports = {
//     storeTask,
//     getTasks,
//     getTaskById,
//     // updateTask,
//     partialTaskUpdate,
//     deleteTask,
    
// }
const Task = require('../../models/Task');

const storeTask = async (req, res) => {
    console.log('=== STORE TASK CALLED ===');
    console.log('Request body:', req.body);
    
    try {
        const { user_id, title, date, category, time, completed } = req.body;
        
        console.log('Received task data:', { user_id, title, date, category, time, completed });
        
        // Validate required fields
        if (!user_id || !title || !date || !category || !time) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({
                status: 'error',
                message: 'All task fields are required',
                missing: {
                    user_id: !user_id,
                    title: !title,
                    date: !date,
                    category: !category,
                    time: !time
                }
            });
        }
        
        // Fix date format
        let formattedDate = date;
        try {
            if (date.includes('T')) {
                const dateOnly = date.split('T')[0];
                formattedDate = `${dateOnly}T00:00:00.000Z`;
                console.log('Converted date from', date, 'to', formattedDate);
            } else {
                const parsedDate = new Date(date + 'T00:00:00');
                if (!isNaN(parsedDate.getTime())) {
                    const year = parsedDate.getFullYear();
                    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(parsedDate.getDate()).padStart(2, '0');
                    formattedDate = `${year}-${month}-${day}T00:00:00.000Z`;
                }
            }
        } catch (dateError) {
            console.log('Date parsing error:', dateError);
            if (typeof date === 'string' && date.endsWith('.')) {
                formattedDate = date.substring(0, date.length - 1) + '.000Z';
            }
        }
        
        const cleanTime = time.trim();
        console.log('Final formatted date:', formattedDate);
        
        // Create timestamp strings
        const now = new Date();
        const timestamp = now.toISOString();
        
        console.log('Creating task with timestamp:', timestamp);
        
        // Create task with explicit timestamps
        const task = Task.fill({
            user_id,
            title,
            date: formattedDate,
            category,
            time: cleanTime,
            completed: completed || false,
            created_at: timestamp,  // Add explicit timestamp
            updated_at: timestamp   // Add explicit timestamp
        });
        
        console.log('Attempting to save task with formatted data...');
        await task.save();
        console.log('Task saved successfully with ID:', task.id);
        
        res.json({
            status: 'success',
            message: 'Task created successfully',
            data: {
                id: task.id,
                user_id: task.user_id,
                title: task.title,
                date: task.date,
                category: task.category,
                time: task.time,
                completed: task.completed,
                created_at: task.created_at,
                updated_at: task.updated_at
            }
        });
    } catch (error) {
        console.error('Error creating task:', error);
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to create task',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};


const getUserTasks = async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log('=== GET USER TASKS ===');
        console.log('User ID from params:', userId);
        
        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: 'User ID is required'
            });
        }
        
        const userIdNum = parseInt(userId);
        if (isNaN(userIdNum)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid User ID format'
            });
        }
        
        console.log('Fetching tasks for user ID:', userIdNum);
        
        // Use the new findByUserId method
        const tasks = await Task.findByUserId(userIdNum);
        
        console.log(`Found ${tasks.length} tasks for user ${userIdNum}`);
        
        res.json({
            status: 'success',
            message: 'Tasks fetched successfully',
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        console.error('Full error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user tasks',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update the existing getTasks method to support user filtering
const getTasks = async (req, res) => {
    try {
        const { user_id } = req.query;
        
        let tasks;
        if (user_id) {
            console.log('Fetching tasks for user ID:', user_id);
            tasks = await Task.where('user_id', user_id).fetch();
        } else {
            tasks = await Task.fetch();
        }
        
        console.log(`Found ${tasks.length} tasks`);
        
        res.json({
            status: 'success',
            message: 'Tasks fetched successfully',
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tasks'
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        let { id } = req.params;
        const task = await Task.find(id);
        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Task fetched successfully',
            data: task
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch task'
        });
    }
};

const updateTask = async (req, res) => {
    try {
        let { id } = req.params;
        console.log('Updating task with ID:', id);
        console.log('Update data:', req.body);
        
        const task = await Task.find(id);
        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found'
            });
        }
        
        // Fill the task with new data (timestamp will be handled by Model.update())
        task.fill({
            title: req.body.title,
            category: req.body.category,
            time: req.body.time,
            date: req.body.date,
            completed: req.body.completed
            // No need to manually set updated_at - Model.update() handles it
        });

        await task.update();

        console.log('Task updated successfully:', task);

        res.json({
            status: 'success',
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update task'
        });
    }
};
const partialTaskUpdate = async (req, res) => {
    try {
        let { id } = req.params;
        const task = await Task.find(id);
        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found'
            });
        }
        task.fill(req.body);
        await task.update();

        res.json({
            status: 'success',
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update task'
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        let { id } = req.params;
        const deleted = await Task.delete(id);
        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: 'Failed to delete task'
            });
        }

        res.json({
            status: 'success',
            message: 'Task deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete task'
        });
    }
};

module.exports = {
    storeTask,
    getTasks,
    getTaskById,
    getUserTasks,
    partialTaskUpdate,
    deleteTask,
    updateTask
};