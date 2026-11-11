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
const { chat: assistantChat } = require('../controllers/api/assistantController');
const requireUser = require('../middlewares/requireUser');
const { createAssistantRateLimit } = require('../middlewares/assistantRateLimit');
const { sameUserParam, sameUserQuery, bodyOwner, ownsRow } = require('../middlewares/ownership');

// Every user route below needs a login, and only reaches the caller's own data.
const self = [requireUser, sameUserParam('userId')];

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
router.get('/users/:userId/profile', self, getUserProfile);
router.post("/login", login);

router.get('/users/:userId/completed-tasks', self, getCompletedTasksCount);
router.get('/users/:userId/tasks', self, getUserTasks);

router.post('/tasks', requireUser, bodyOwner, storeTask);
router.get('/tasks', requireUser, sameUserQuery('user_id'), getTasks);
router.get('/tasks/:id', requireUser, ownsRow('tasks'), getTaskById);
router.put('/tasks/:id', requireUser, ownsRow('tasks'), bodyOwner, updateTask);
router.patch('/tasks/:id', requireUser, ownsRow('tasks'), bodyOwner, partialTaskUpdate);
router.delete('/tasks/:id', requireUser, ownsRow('tasks'), deleteTask);

router.post('/categories', requireUser, bodyOwner, storeCategory);
router.get('/users/:userId/categories', self, getUserCategories);
router.delete('/categories/:id', requireUser, ownsRow('categories'), deleteCategory);

router.post('/recurring-tasks', requireUser, bodyOwner, storeRecurring_task);
router.get('/users/:userId/recurring-tasks', self, getUserRecurringTasks);
router.put('/recurring-tasks/:id', requireUser, ownsRow('recurring_tasks'), bodyOwner, updateRecurring_task);
router.delete('/recurring-tasks/:id', requireUser, ownsRow('recurring_tasks'), deleteRecurring_task);

// Planning assistant: logged-in users only, and rate-limited to protect the Gemini credits.
router.post('/assistant/chat', requireUser, createAssistantRateLimit(), assistantChat);

module.exports = router;
