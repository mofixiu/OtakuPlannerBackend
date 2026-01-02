const { Router } = require("express");
const { resolve } = require("path");
const router = Router();
const { storeTask, getTasks, getTaskById, partialTaskUpdate, deleteTask, getUserTasks, updateTask } = require('../controllers/api/taskController');
const { storeCategory, getUserCategories, deleteCategory } = require('../controllers/api/categoryController');
const {storeRecurring_task, getRecurring_tasks,getRecurring_taskById,getUserRecurringTasks,updateRecurring_task,deleteRecurring_task} = require('../controllers/api/recurring_taskController');

const { query, validationResult } = require("express-validator");
const {
  login,
  profile,
} = require("../controllers/api/adminController");
const { apiLogin, userLogin } = require("../controllers/api/userController");
const { storeUser, getCompletedTasksCount, getUserProfile } = require("../controllers/api/userController");

router.get("/", (req, res) => {
  res.render("home");
});

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
);

router.get("/api/login", (req, res) => {
  res.render("admin/dashboard");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/auth/login", userLogin);
router.post("/auth/register", storeUser);
router.get("/api/admin/profile", profile);
router.get('/api/users/:userId/profile', getUserProfile);
router.post("/login", login);

router.get('/api/users/:userId/completed-tasks', getCompletedTasksCount);
router.get('/api/users/:userId/tasks', getUserTasks);

router.post('/api/tasks', storeTask);
router.get('/api/tasks', getTasks);
router.get('/api/tasks/:id', getTaskById);
router.put('/api/tasks/:id', updateTask);
router.patch('/api/tasks/:id', partialTaskUpdate);
router.delete('/api/tasks/:id', deleteTask);

router.post('/api/categories', storeCategory);
router.get('/api/users/:userId/categories', getUserCategories);
router.delete('/api/categories/:id', deleteCategory);

router.post('/api/recurring-tasks', storeRecurring_task);
router.get('/api/users/:userId/recurring-tasks',getUserRecurringTasks);
router.put('/api/recurring-tasks/:id', updateRecurring_task);
router.delete('/api/recurring-tasks/:id', deleteRecurring_task);

module.exports = router;
