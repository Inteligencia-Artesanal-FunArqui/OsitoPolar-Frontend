/**
 * @class User
 * @description Entity class representing a user, aligned with the backend model.
 */
export class User {
    /**
     * @param {Object} [data={}] - Raw data object from the API response
     * @param {number} [data.id=0] - Unique identifier
     * @param {string} [data.username=''] - Username
     * @param {string} [data.createdAt=null] - Creation timestamp
     * @param {string} [data.updatedAt=null] - Last update timestamp
     */
    constructor({
                    id = 0,
                    username = '',
                    createdAt = null,
                    updatedAt = null
                } = {}) {
        this.id = id;
        this.username = username;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}