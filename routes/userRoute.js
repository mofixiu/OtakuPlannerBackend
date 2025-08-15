const { Router } = require("express");
const { resolve } = require("path");
const router = Router();
const { storeTask, getTasks, getTaskById, partialTaskUpdate, deleteTask,getUserTasks, updateTask } = require('../controllers/api/taskController');
const {storeCategory,getUserCategories,deleteCategory} = require('../controllers/api/categoryController');

const { query, validationResult } = require("express-validator");
const {
  
  login,
  profile,
} = require("../controllers/api/adminController");
const { apiLogin, userLogin } = require("../controllers/api/userController");
const { storeUser,getCompletedTasksCount,getUserProfile } = require("../controllers/api/userController");
const recurringTaskController = require('../controllers/api/recurring_taskController');

router.get("/", (req, res) => {
  res.render("home");
}); // ssr
router.get(
  "/hello",
  query("url").contains("www.").withMessage("Url must contain www."),
  (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    res.send(`Hello ${req.query.person}`);
  }
); // ssr

router.get("/api/login", (req, res) => {
  res.render("admin/dashboard");
}); // ssr
router.get("/login", (req, res) => {
  res.render("login");
}); // ssr

router.post("/auth/login", userLogin); // api

router.post("/auth/register", storeUser);
router.get("/api/admin/profile", profile); // api
router.get('/users/:userId/profile', getUserProfile);

router.post("/login", login); // ssr
//tasks
router.get('/users/:userId/completed-tasks', getCompletedTasksCount);

router.post('/tasks', storeTask);
router.get('/tasks', getTasks);
router.get('/tasks/:id', getTaskById);
router.get('/tasks/user/:userId', getUserTasks);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

router.post('/categories', storeCategory);
router.get('/users/:userId/categories', getUserCategories);
router.delete('/categories/:id', deleteCategory);

// recurring tasks
router.post('/recurring-tasks', recurringTaskController.storeRecurring_task);
router.get('/recurring-tasks', recurringTaskController.getRecurring_tasks);
router.get('/users/:userId/recurring-tasks', recurringTaskController.getUserRecurringTasks);
router.get('/recurring-tasks/:id', recurringTaskController.getRecurring_taskById);
router.put('/recurring-tasks/:id', recurringTaskController.updateRecurring_task);
router.patch('/recurring-tasks/:id', recurringTaskController.updateRecurring_task);
router.delete('/recurring-tasks/:id', recurringTaskController.deleteRecurring_task);

router.get("/health", (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

router.get("/users/:userId/tasks", getUserTasks); // This is the missing route!

module.exports = router;
