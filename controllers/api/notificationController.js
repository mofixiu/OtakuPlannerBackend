const Notification = require('../../models/Notification');
const storeNotification = async (req, res) => {
    let { user_id, task_id, recurring_task_id, type, title, message, scheduled_time, sent_at, status, metadata } = req.body;
    const notification = Notification.fill({ user_id, task_id, recurring_task_id, type, title, message, scheduled_time, sent_at, status, metadata });
    if (req.files?.photo) {
        const { photo } = req.files;
        const fileName = `${Date.now()}-${photo.name}`;
        const filePath = `uploads/notifications/${fileName}`;
        await photo.mv(filePath);
        notification.photo = filePath;
    }
    await notification.save()
    res.json(
        {
            status: 'success',
            message: 'Notification added successfully',
            data: notification
        }
    )
}

const getNotifications = async (req, res) => {
    const notifications = await Notification.fetch();
    res.json(
        {
            status: 'success',
            message: 'Notifications fetched successfully',
            data: notifications
        }
    )
}

const getNotificationById = async (req, res) => {
    let { id } = req.params;
    const notification = await Notification.find(id);
    if (!notification) {
        return res.status(404).json(
            {
                status: 'error',
                message: 'Notification not found'
            }
        )
    }
    res.json(
        {
            status: 'success',
            message: 'Notification fetched successfully',
            data: notification
        }
    )
}

// const updateNotification = async (req, res) => {
//     let { id } = req.params;
//     let { name, description, tuition } = req.body;
//     const notification = await Notification.find(id);
//     if (!notification) {
//         return res.status(404).json(
//             {
//                 status: 'error',
//                 message: 'Notification not found'
//             }
//         )
//     }
//     notification.fill({ name, description, tuition });

//     await notification.update();

//     res.json(
//         {
//             status: 'success',
//             message: 'Notification updated successfully',
//             data: notification
//         }
//     )
// }

const partialNotificationUpdate = async (req, res) => {
    let { id } = req.params;
    const notification = await Notification.find(id);
    if (!notification) {
        return res.status(404).json(
            {
                status: 'error',
                message: 'Notification not found'
            }
        )
    }
    notification.fill(req.body);

    await notification.update();

    res.json(
        {
            status: 'success',
            message: 'Notification updated successfully',
            data: notification
        }
    )
}

const deleteNotification = async (req, res) => {
    let { id } = req.params;
    const deleted = await Notification.delete(id);
    if (!deleted) {
        return res.status(404).json(
            {
                status: 'error',
                message: 'Failed to delete notification'
            }
        )
    }

    res.json(
        {
            status: 'success',
            message: 'Notification deleted successfully',
        }
    )
}

module.exports = {
    storeNotification,
    getNotifications,
    getNotificationById,
    // updateNotification,
    partialNotificationUpdate,
    deleteNotification,
}