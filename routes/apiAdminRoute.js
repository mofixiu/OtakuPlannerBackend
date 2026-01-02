const { Router } = require('express');
const { resolve } = require('path');
const { storeAdmin, getAdmins, getAdminById, updateAdmin, partialAdminUpdate, deleteAdmin } = require('../controllers/api/adminController');
const { storeNotification, getNotifications, getNotificationById, partialNotificationUpdate, deleteNotification } = require('../controllers/api/notificationController');
const { storeRecurring_task, getRecurring_tasks, getRecurring_taskById, partialRecurring_taskUpdate, deleteRecurring_task } = require('../controllers/api/recurring_taskController');
const { storeUser, getUsers, getUserById, partialUserUpdate, deleteUser } = require('../controllers/api/userController');
const { storeSequelizemeta, getSequelizemetas, getSequelizemetaById, partialSequelizemetaUpdate, deleteSequelizemeta } = require('../controllers/api/sequelizemetaController');
const { storeTask, getTasks, getTaskById, partialTaskUpdate, deleteTask } = require('../controllers/api/taskController');
const userValidator = require('../validators/userValidator');
const {profile} = require('../controllers/api/adminController');
const router = Router();

router.get('/', (req, res) => {
    res.sendFile(resolve('views', 'admin', 'dashboard.html'));
});


router.post('/admins', storeAdmin);
router.get('/admins', getAdmins);
router.get('/admins/:id', getAdminById);
router.patch('/admins/:id', partialAdminUpdate);
router.delete('/admins/:id', deleteAdmin);

router.post('/notifications', storeNotification);
router.get('/notifications', getNotifications);
router.get('/notifications/:id', getNotificationById);
router.patch('/notifications/:id', partialNotificationUpdate);
router.delete('/notifications/:id', deleteNotification);

router.route('/recurring_tasks').post(storeRecurring_task).get(getRecurring_tasks);
router.route('/recurring_tasks/:id').get(getRecurring_taskById).patch(partialRecurring_taskUpdate).delete(deleteRecurring_task);


router.post('/users', userValidator, storeUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', partialUserUpdate);
router.delete('/users/:id', deleteUser);


router.post('/sequelizemetas', storeSequelizemeta);
router.get('/sequelizemetas', getSequelizemetas);
router.get('/sequelizemetas/:id', getSequelizemetaById);
router.patch('/sequelizemetas/:id', partialSequelizemetaUpdate);
router.delete('/sequelizemetas/:id', deleteSequelizemeta);

router.post('/tasks', storeTask);
router.get('/tasks', getTasks);
router.get('/tasks/:id', getTaskById);
router.patch('/tasks/:id', partialTaskUpdate);
router.delete('/tasks/:id', deleteTask);

module.exports = router;