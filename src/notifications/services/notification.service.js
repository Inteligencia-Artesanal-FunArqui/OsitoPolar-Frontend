import httpInstance from "../../shared/http.instance.js";
import { Notification } from "../models/notification.entity.js";

/**
 * @class NotificationService
 * @description HTTP operations for notifications.
 */
export class NotificationService {
    /**
     * Fetch all notifications for a user, newest first.
     * @param {string|number} userId
     * @returns {Promise<Notification[]>}
     */
    async getAllForUser(userId) {
        const res = await httpInstance.get(
            `/notifications?userId=${userId}&_sort=timestamp&_order=desc`
        );
        return res.data.map(item => new Notification(item));
    }

    /**
     * Mark a notification as read on the server.
     * @param {string|number} notificationId
     * @returns {Promise<Notification>}
     */
    async markAsRead(notificationId) {
        const res = await httpInstance.patch(
            `/notifications/${notificationId}`,
            { status: 'read' }
        );
        return new Notification(res.data);
    }
}
