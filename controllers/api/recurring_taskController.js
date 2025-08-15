const Recurring_task = require('../../models/Recurring_task');

const storeRecurring_task = async (req, res) => {
    try {
        let { user_id, title, date, category, time, frequency, completed, completed_instances, excluded_dates, recurrence_end, custom_pattern } = req.body;
        
        console.log('Creating recurring task:', req.body);
        
        const recurring_task = Recurring_task.fill({ 
            user_id, 
            title, 
            date, 
            category, 
            time, 
            frequency: frequency || 'weekly',
            completed: completed || false,
            completed_instances,
            excluded_dates,
            recurrence_end,
            custom_pattern
        });
        
        await recurring_task.insert();
        
        res.json({
            status: 'success',
            message: 'Recurring task added successfully',
            data: recurring_task
        });
    } catch (error) {
        console.error('Error creating recurring task:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create recurring task'
        });
    }
};

const getRecurring_tasks = async (req, res) => {
    try {
        const recurring_tasks = await Recurring_task.fetch();
        res.json({
            status: 'success',
            message: 'Recurring tasks fetched successfully',
            data: recurring_tasks
        });
    } catch (error) {
        console.error('Error fetching recurring tasks:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch recurring tasks'
        });
    }
};

const getUserRecurringTasks = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching recurring tasks for user:', userId);
        
        const recurring_tasks = await Recurring_task.findByUserId(userId);
        
        res.json({
            status: 'success',
            message: 'User recurring tasks fetched successfully',
            data: recurring_tasks
        });
    } catch (error) {
        console.error('Error fetching user recurring tasks:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user recurring tasks'
        });
    }
};

const getRecurring_taskById = async (req, res) => {
    try {
        let { id } = req.params;
        const recurring_task = await Recurring_task.find(id);
        
        if (!recurring_task) {
            return res.status(404).json({
                status: 'error',
                message: 'Recurring task not found'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Recurring task fetched successfully',
            data: recurring_task
        });
    } catch (error) {
        console.error('Error fetching recurring task by ID:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch recurring task'
        });
    }
};

const updateRecurring_task = async (req, res) => {
    try {
        let { id } = req.params;
        console.log('Updating recurring task with ID:', id);
        console.log('Update data:', req.body);
        
        const recurring_task = await Recurring_task.find(id);
        if (!recurring_task) {
            return res.status(404).json({
                status: 'error',
                message: 'Recurring task not found'
            });
        }
        
        recurring_task.fill({
            ...req.body,
            updated_at: new Date().toISOString()
        });

        await recurring_task.update();

        res.json({
            status: 'success',
            message: 'Recurring task updated successfully',
            data: recurring_task
        });
    } catch (error) {
        console.error('Error updating recurring task:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update recurring task'
        });
    }
};

const deleteRecurring_task = async (req, res) => {
    try {
        let { id } = req.params;
        const deleted = await Recurring_task.delete(id);
        
        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: 'Failed to delete recurring task'
            });
        }

        res.json({
            status: 'success',
            message: 'Recurring task deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting recurring task:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete recurring task'
        });
    }
};

module.exports = {
    storeRecurring_task,
    getRecurring_tasks,
    getUserRecurringTasks,
    getRecurring_taskById,
    updateRecurring_task,
    partialRecurring_taskUpdate: updateRecurring_task, // Alias for backward compatibility
    deleteRecurring_task
};