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
                    type = 'alert',
                    // real backend shape: `message` + `isRead` instead of `description` + `status`
                    message = '',
                    isRead = undefined
                } = {}) {
        this.id = id;
        this.title = title;
        this.description = description || message;
        this.status = isRead === true ? 'read' : isRead === false ? 'unread' : status;
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
