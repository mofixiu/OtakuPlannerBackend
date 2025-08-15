const Model = require('./Model');

class Category extends Model {
    static tableName = 'categories';
    
    static fillable = [
        'user_id',
        'name',
        'created_at',
        'updated_at'
    ];
    
    static async findByUserId(userId) {
        try {
            console.log('Category.findByUserId called with userId:', userId);
            
            const db = require('./Connection');
            await db.execute('SELECT 1');
            console.log('Database connection successful');
            
            const query = `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY name ASC`;
            const [results] = await db.execute(query, [userId]);
            
            console.log('Categories query results:', results);
            return results;
        } catch (error) {
            console.error('Error in Category.findByUserId:', error);
            throw error;
        }
    }
    
    static async findByUserAndName(userId, name) {
        try {
            const db = require('./Connection');
            const query = `SELECT * FROM ${this.tableName} WHERE user_id = ? AND name = ? LIMIT 1`;
            const [results] = await db.execute(query, [userId, name]);
            
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('Error in Category.findByUserAndName:', error);
            throw error;
        }
    }
}

module.exports = Category;