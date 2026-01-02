
router.post('/tasks', async (req, res) => {
  try {
    const { user_id, title, date, category, time, completed } = req.body;
    
    // Validate required fields
    if (!user_id || !title || !date || !category || !time) {
      return res.status(400).json({
        status: 'error',
        message: 'All task fields are required'
      });
    }
    
    // Insert task into database
    const query = `
      INSERT INTO tasks (user_id, title, date, category, time, completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await db.execute(query, [
      user_id, 
      title, 
      date, 
      category, 
      time, 
      completed || false
    ]);
    
    res.json({
      status: 'success',
      message: 'Task created successfully',
      data: {
        id: result.insertId,
        user_id,
        title,
        date,
        category,
        time,
        completed: completed || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create task'
    });
  }
});

// Update task route
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, category, time, completed } = req.body;
    
    const query = `
      UPDATE tasks 
      SET title = ?, date = ?, category = ?, time = ?, completed = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.execute(query, [title, date, category, time, completed, id]);
    
    res.json({
      status: 'success',
      message: 'Task updated successfully',
      data: {
        id,
        title,
        date,
        category,
        time,
        completed
      }
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update task'
    });
  }
});