/**
 * @class WorkOrder
 * @description Entity class representing a work order record
 */
export class WorkOrder {
    /**
     * @constructor
     * @param {Object} params - The initialization object for the work order
     * @param {string} [params.id=''] - Unique identifier of the work order
     * @param {string} [params.workOrderNumber=''] - The order number for the work order
     * @param {string|null} [params.serviceRequestId=null] - ID of the associated service request
     * @param {string} [params.title=''] - Title of the work order
     * @param {string} [params.description=''] - Description of the work order
     * @param {string} [params.issueDetails=''] - Details about the issue
     * @param {string|null} [params.creationTime=null] - The timestamp when the work order was created
     * @param {string} [params.status='created'] - Current status of the work order
     * @param {string} [params.priority='medium'] - Priority level of the work order
     * @param {string|null} [params.assignedTechnicianId=null] - ID of the assigned technician
     * @param {string|null} [params.scheduledDate=null] - Scheduled date for the service
     * @param {string} [params.timeSlot=''] - Preferred time slot for the service
     * @param {string} [params.serviceAddress=''] - Address where the service is needed
     * @param {string|null} [params.desiredCompletionDate=null] - Desired completion date
     * @param {string|null} [params.actualCompletionDate=null] - Actual completion date
     * @param {string} [params.resolutionDetails=''] - Resolution details of the work
     * @param {string} [params.technicianNotes=''] - Notes from the technician
     * @param {number|null} [params.cost=null] - Cost of the service
     * @param {number|null} [params.customerFeedbackRating=null] - Customer feedback rating (1-5)
     * @param {string|null} [params.feedbackSubmissionDate=null] - Date of feedback submission
     * @param {string} [params.equipmentId=''] - ID of the equipment involved
     * @param {string} [params.serviceType=''] - Type of service performed
     */
    constructor({
                    id = '',
                    workOrderNumber = '',
                    serviceRequestId = null,
                    title = '',
                    description = '',
                    issueDetails = '',
                    creationTime = null,
                    status = 'created',
                    priority = 'medium',
                    assignedTechnicianId = null,
                    scheduledDate = null,
                    timeSlot = '',
                    serviceAddress = '',
                    desiredCompletionDate = null,
                    actualCompletionDate = null,
                    resolutionDetails = '',
                    technicianNotes = '',
                    cost = null,
                    customerFeedbackRating = null,
                    feedbackSubmissionDate = null,
                    equipmentId = '',
                    serviceType = ''
                } = {}) {
        this.id = id;
        this.workOrderNumber = workOrderNumber;
        this.serviceRequestId = serviceRequestId;
        this.title = title;
        this.description = description;
        this.issueDetails = issueDetails;
        this.creationTime = creationTime;
        this.status = status;
        this.priority = priority;
        this.assignedTechnicianId = assignedTechnicianId;
        this.scheduledDate = scheduledDate;
        this.timeSlot = timeSlot;
        this.serviceAddress = serviceAddress;
        this.desiredCompletionDate = desiredCompletionDate;
        this.actualCompletionDate = actualCompletionDate;
        this.resolutionDetails = resolutionDetails;
        this.technicianNotes = technicianNotes;
        this.cost = cost;
        this.customerFeedbackRating = customerFeedbackRating;
        this.feedbackSubmissionDate = feedbackSubmissionDate;
        this.equipmentId = equipmentId;
        this.serviceType = serviceType;
    }

    /**
     * Checks whether a technician has been assigned to the work order.
     * @returns {boolean} True if a technician is assigned, false otherwise.
     */
    hasAssignedTechnician() {
        return this.assignedTechnicianId !== null;
    }

    /**
     * Returns a formatted summary string of the work order.
     * @returns {string} A summary containing work order number, title, and status.
     */
    getSummary() {
        return `[#${this.workOrderNumber}] ${this.title} (${this.status})`;
    }

    /**
     * Formats the creation timestamp to a readable date-time string.
     * @returns {string} A formatted creation time, or 'Not recorded' if unavailable.
     */
    getFormattedCreationTime() {
        return this.creationTime
            ? new Date(this.creationTime).toLocaleString()
            : 'Not recorded';
    }

    /**
     * Returns the corresponding CSS class name for the current status.
     * @returns {string} A CSS class based on the status.
     */
    getStatusBadgeClass() {
        switch (this.status) {
            case "created": return "status-created";
            case "assigned": return "status-assigned";
            case "in_progress": return "status-in-progress";
            case "on_hold": return "status-on-hold";
            case "resolved": return "status-resolved";
            case "completed": return "status-completed";
            case "cancelled": return "status-cancelled";
            default: return "";
        }
    }
}