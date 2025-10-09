/**
 * @class ServiceRequest
 * @description Entity class representing a service request record
 * Aligned with API structure from backend
 */
export class ServiceRequest {
    /**
     * @constructor
     * @param {Object} params - The initialization object for the service request
     * @param {number} [params.id=0] - Unique identifier of the service request
     * @param {string} [params.orderNumber=''] - The order number for the request
     * @param {string} [params.title=''] - Title of the service request
     * @param {string} [params.description=''] - Description of the service request
     * @param {string} [params.issueDetails=''] - Detailed description of the issue
     * @param {number} [params.clientId=0] - ID of the client who made the request
     * @param {number} [params.companyId=0] - ID of the associated company
     * @param {number} [params.equipmentId=0] - ID of the equipment involved
     * @param {string|null} [params.requestTime=null] - The timestamp when the request was made
     * @param {string} [params.status='pending'] - Current status of the request
     * @param {string} [params.priority='medium'] - Priority level of the request
     * @param {string} [params.urgency='normal'] - Urgency level ('normal', 'high', 'critical')
     * @param {boolean} [params.isEmergency=false] - Whether the request requires immediate attention
     * @param {string} [params.serviceType=''] - Type of service requested
     * @param {string|null} [params.scheduledDate=null] - Scheduled date for the service
     * @param {string} [params.timeSlot=''] - Preferred time slot for the service
     * @param {string} [params.serviceAddress=''] - Address where the service is needed
     * @param {string|null} [params.desiredCompletionDate=null] - Desired completion date
     * @param {string|null} [params.actualCompletionDate=null] - Date the service was completed
     * @param {number|null} [params.customerFeedbackRating=null] - Rating given by the customer (1-5)
     * @param {number|null} [params.assignedTechnicianId=null] - ID of the assigned technician
     */
    constructor({
                    id = 0,
                    orderNumber = '',
                    title = '',
                    description = '',
                    issueDetails = '',
                    clientId = 0,
                    companyId = 0,
                    equipmentId = 0,
                    requestTime = null,
                    status = 'pending',
                    priority = 'medium',
                    urgency = 'normal',
                    isEmergency = false,
                    serviceType = '',
                    scheduledDate = null,
                    timeSlot = '',
                    serviceAddress = '',
                    desiredCompletionDate = null,
                    actualCompletionDate = null,
                    customerFeedbackRating = null,
                    assignedTechnicianId = null
                } = {}) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.title = title;
        this.description = description;
        this.issueDetails = issueDetails;
        this.clientId = clientId;
        this.companyId = companyId;
        this.equipmentId = equipmentId;
        this.requestTime = requestTime;
        this.status = status;
        this.priority = priority;
        this.urgency = urgency;
        this.isEmergency = isEmergency;
        this.serviceType = serviceType;
        this.scheduledDate = scheduledDate;
        this.timeSlot = timeSlot;
        this.serviceAddress = serviceAddress;
        this.desiredCompletionDate = desiredCompletionDate;
        this.actualCompletionDate = actualCompletionDate;
        this.customerFeedbackRating = customerFeedbackRating;
        this.assignedTechnicianId = assignedTechnicianId;
    }

    /**
     * Checks whether a technician has been assigned to the request
     * @returns {boolean} True if a technician is assigned, false otherwise
     */
    hasTechnician() {
        return this.assignedTechnicianId !== null;
    }

    /**
     * Returns a formatted summary string of the request
     * @returns {string} A summary containing order number, title, and priority
     */
    getSummary() {
        return `[#${this.orderNumber}] ${this.title || this.description} (${this.priority})`;
    }

    /**
     * Formats the request timestamp to a readable date-time string
     * @returns {string} A formatted request time, or 'Not recorded' if unavailable
     */
    getFormattedRequestTime() {
        return this.requestTime
            ? new Date(this.requestTime).toLocaleString()
            : 'Not recorded';
    }

    /**
     * Returns the corresponding CSS class name for the current status
     * @returns {string} A CSS class based on the status
     */
    getStatusBadgeClass() {
        switch (this.status) {
            case "pending": return "status-pending";
            case "accepted": return "status-accepted";
            case "in_progress": return "status-in-progress";
            case "resolved": return "status-resolved";
            case "rejected": return "status-rejected";
            case "completed": return "status-completed";
            case "cancelled": return "status-cancelled";
            default: return "";
        }
    }

    /**
     * Determines if the request can be rated
     * @returns {boolean} True if the request can be rated
     */
    canBeRated() {
        return this.status === 'resolved' && !this.customerFeedbackRating;
    }

    /**
     * Convert legacy 'asap' field to isEmergency for backward compatibility
     * @param {boolean} asap - The asap value
     */
    setAsap(asap) {
        this.isEmergency = asap;
    }

    /**
     * Get asap value from isEmergency for backward compatibility
     * @returns {boolean} The asap value
     */
    getAsap() {
        return this.isEmergency;
    }

    /**
     * For compatibility with existing code
     */
    get asap() {
        return this.isEmergency;
    }

    /**
     * For compatibility with existing code
     */
    set asap(value) {
        this.isEmergency = value;
    }

    /**
     * For compatibility with existing code
     */
    get technicianId() {
        return this.assignedTechnicianId;
    }

    /**
     * For compatibility with existing code
     */
    set technicianId(value) {
        this.assignedTechnicianId = value;
    }

    /**
     * For compatibility with existing code
     */
    get rating() {
        return this.customerFeedbackRating;
    }

    /**
     * For compatibility with existing code
     */
    set rating(value) {
        this.customerFeedbackRating = value;
    }

    /**
     * For compatibility with existing code
     */
    get completionDate() {
        return this.actualCompletionDate;
    }

    /**
     * For compatibility with existing code
     */
    set completionDate(value) {
        this.actualCompletionDate = value;
    }

    /**
     * Convert to API format for creating or updating
     * @returns {Object} API-compatible object
     */
    toApiFormat() {
        return {
            id: this.id || undefined,
            title: this.title || this.description.substring(0, 50),
            description: this.description,
            issueDetails: this.issueDetails,
            clientId: this.clientId,
            companyId: this.companyId,
            equipmentId: this.equipmentId,
            status: this.status,
            priority: this.priority,
            urgency: this.urgency,
            isEmergency: this.isEmergency,
            serviceType: this.serviceType,
            scheduledDate: this.scheduledDate,
            timeSlot: this.timeSlot,
            serviceAddress: this.serviceAddress
        };
    }
}