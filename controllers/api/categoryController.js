const Category = require('../../models/Category');

const storeCategory = async (req, res) => {
    try {
        let { user_id, name } = req.body;
        
        console.log('Creating category:', req.body);
        
        // Check if category already exists for this user
        const existingCategory = await Category.findByUserAndName(user_id, name);
        if (existingCategory) {
            return res.status(400).json({
                status: 'error',
                message: 'Category already exists for this user'
            });
        }
        
        const category = Category.fill({ 
            user_id, 
            name: name.trim()
        });
        
        await category.insert();
        
        res.json({
            status: 'success',
            message: 'Category added successfully',
            data: category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create category'
        });
    }
};

const getUserCategories = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching categories for user:', userId);
        
        const categories = await Category.findByUserId(userId);
        
        res.json({
            status: 'success',
            message: 'User categories fetched successfully',
            data: categories
        });
    } catch (error) {
        console.error('Error fetching user categories:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user categories'
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        let { id } = req.params;
        const deleted = await Category.delete(id);
        
        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: 'Failed to delete category'
            });
        }

        res.json({
            status: 'success',
            message: 'Category deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete category'
        });
    }
};

module.exports = {
    storeCategory,
    getUserCategories,
    deleteCategory
};