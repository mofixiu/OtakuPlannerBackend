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
router.get('/users/:userId/profile', getUserProfile);
router.post("/login", login);

router.get('/users/:userId/completed-tasks', getCompletedTasksCount);
router.get('/users/:userId/tasks', getUserTasks);

router.post('/tasks', storeTask);
router.get('/tasks', getTasks);
router.get('/tasks/:id', getTaskById);
router.put('/tasks/:id', updateTask);
router.patch('/tasks/:id', partialTaskUpdate);
router.delete('/tasks/:id', deleteTask);

router.post('/categories', storeCategory);
router.get('/users/:userId/categories', getUserCategories);
router.delete('/categories/:id', deleteCategory);

router.post('/recurring-tasks', storeRecurring_task);
router.get('/users/:userId/recurring-tasks',getUserRecurringTasks);
router.put('/recurring-tasks/:id', updateRecurring_task);
router.delete('/recurring-tasks/:id', deleteRecurring_task);

module.exports = router;
