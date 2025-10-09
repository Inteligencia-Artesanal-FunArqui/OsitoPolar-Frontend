/**
 * @class Notification
 * @description Domain entity for a user notification.
 */
export class Notification {
    constructor({
                    id = '',
                    title = '',
                    description = '',
                    status = 'unread',
                    timestamp = '',
                    userId = '',
                    equipmentId = '',
                    type = 'alert'
                }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.timestamp = timestamp;
        this.userId = userId;
        this.equipmentId = equipmentId;
        this.type = type;
    }

    /** Mark this notification as read */
    markAsRead() {
        this.status = 'read';
    }

    /** Check if this notification is unread */
    isUnread() {
        return this.status === 'unread';
    }
}
