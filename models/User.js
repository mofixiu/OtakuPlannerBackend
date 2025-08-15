const Model = require('./Model');

class User extends Model {
  
      get name() {
        return (this.first_name + ' ' + this.last_name + ' ' + (this.other_name || '')).trim();
    }

    toString(){
        return this.name
    }
    //   static async findByEmail(email) {
    //     const sql =  "SELECT * FROM users WHERE email = ?";
    //     const rows = await this.query(sql, [email]);
    //     if (rows.length === 0) {
    //         return null;
    //     }
    //     return this.fill(rows[0]);
    // }
    static tableName = 'users';
    
    static fillable = [
        'username',
        'email',
        'password',
        'fullName',          
        'profile_image',
        'created_at',
        'updated_at'
    ];

    static async findByEmail(email) {
        try {
            console.log('Looking for user with email:', email);
            const sql = "SELECT * FROM users WHERE email = ?";
            const rows = await this.query(sql, [email]);
            console.log('Database query result:', rows.length > 0 ? 'Found user' : 'No user found');
            
            if (rows.length === 0) {
                return null;
            }
            
            const user = new this();
            Object.assign(user, rows[0]);
            return user;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }
    static async findById(id) {
        try {
            console.log('Looking for user with ID:', id);
            const sql = "SELECT * FROM users WHERE id = ?";
            const rows = await this.query(sql, [id]);
            console.log('Database query result:', rows.length > 0 ? 'Found user' : 'No user found');
            if (rows.length === 0) {
                return null;
            }
            const user = new this();
            Object.assign(user, rows[0]);
            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    // Add this method to your User model
    static async getCompletedTasksCount(userId) {
      try {
        const query = `
          SELECT COUNT(*) as completed_count 
          FROM tasks 
          WHERE user_id = ? AND completed = 1
        `;
        
        const db = require('../models/Connection');
        const [results] = await db.execute(query, [userId]);
        
        console.log(`Completed tasks count for user ${userId}:`, results[0].completed_count);
        return results[0].completed_count;
      } catch (error) {
        console.error('Error getting completed tasks count:', error);
        throw error;
      }
    }

    // Alternative: Get user statistics (completed tasks + other stats)
    static async getUserStatistics(userId) {
      try {
        const queries = {
          completedTasks: `
            SELECT COUNT(*) as completed_count 
            FROM tasks 
            WHERE user_id = ? AND completed = 1
          `,
          totalTasks: `
            SELECT COUNT(*) as total_count 
            FROM tasks 
            WHERE user_id = ?
          `,
          topCategory: `
            SELECT category, COUNT(*) as category_count 
            FROM tasks 
            WHERE user_id = ? AND completed = 1 
            GROUP BY category 
            ORDER BY category_count DESC 
            LIMIT 1
          `
        };
        
        const db = require('../models/Connection');
        
        // Execute all queries
        const [completedResult] = await db.execute(queries.completedTasks, [userId]);
        const [totalResult] = await db.execute(queries.totalTasks, [userId]);
        const [topCategoryResult] = await db.execute(queries.topCategory, [userId]);
        
        const statistics = {
          completedTasks: completedResult[0].completed_count,
          totalTasks: totalResult[0].total_count,
          topCategory: topCategoryResult.length > 0 ? topCategoryResult[0].category : 'No tasks completed',
          completionRate: totalResult[0].total_count > 0 
            ? Math.round((completedResult[0].completed_count / totalResult[0].total_count) * 100)
            : 0
        };
        
        console.log(`User ${userId} statistics:`, statistics);
        return statistics;
      } catch (error) {
        console.error('Error getting user statistics:', error);
        throw error;
      }
    }
}

module.exports = User;
