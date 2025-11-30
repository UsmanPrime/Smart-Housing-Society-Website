import AuditLog from '../models/AuditLog.js';

/**
 * Log an action to the audit log system
 * @param {Object} options - Logging options
 * @param {String} options.userId - User ID performing the action
 * @param {String} options.userName - User name
 * @param {String} options.userRole - User role (admin, resident, vendor)
 * @param {String} options.action - Action type (e.g., 'CHARGE_CREATED')
 * @param {String} options.resourceType - Resource type (e.g., 'charge', 'payment')
 * @param {String} options.resourceId - ID of the affected resource
 * @param {Object} options.details - Additional details about the action
 * @param {Object} options.req - Express request object (optional, for IP address)
 * @returns {Promise<Object>} Created audit log entry
 */
export async function logAction({
  userId,
  userName,
  userRole,
  action,
  resourceType,
  resourceId,
  details = {},
  req = null
}) {
  try {
    // Get IP address from request if available
    let ipAddress = null;
    if (req) {
      ipAddress = req.ip || 
                  req.headers['x-forwarded-for'] || 
                  req.connection?.remoteAddress || 
                  req.socket?.remoteAddress ||
                  null;
    }

    // Create audit log entry
    const auditLog = new AuditLog({
      userId,
      userName,
      userRole,
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : null,
      details,
      ipAddress
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    // Log error but don't throw - audit logging should not break the application
    console.error('Audit logging failed:', error.message);
    return null;
  }
}

/**
 * Get audit logs with filters
 * @param {Object} filters - Filter options
 * @param {String} filters.userId - Filter by user ID
 * @param {String} filters.action - Filter by action type
 * @param {String} filters.resourceType - Filter by resource type
 * @param {Date} filters.from - Start date
 * @param {Date} filters.to - End date
 * @param {Number} filters.page - Page number (default: 1)
 * @param {Number} filters.limit - Items per page (default: 50)
 * @returns {Promise<Object>} Paginated audit logs
 */
export async function getAuditLogs(filters = {}) {
  try {
    const {
      userId,
      action,
      resourceType,
      from,
      to,
      page = 1,
      limit = 50
    } = filters;

    // Build query
    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    
    // Date range filter
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error.message);
    throw error;
  }
}

export default {
  logAction,
  getAuditLogs
};
