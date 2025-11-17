/**
 * Notification Queue System
 * Handles async email notifications to prevent blocking API responses
 * Uses a simple in-memory queue approach (can be upgraded to Bull/Redis for production)
 */

import { sendEmail, sendBulkEmails } from './sendEmail.js';
import * as emailTemplates from './emailTemplates.js';

class NotificationQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.processingInterval = 1000; // Process every 1 second
  }

  /**
   * Add notification to queue
   * @param {Object} notification - Notification details
   */
  add(notification) {
    this.queue.push({
      ...notification,
      id: Date.now() + Math.random(),
      attempts: 0,
      addedAt: new Date(),
    });
    
    console.log(`📬 Notification queued: ${notification.type} (Queue size: ${this.queue.length})`);
    
    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }
  }

  /**
   * Add multiple notifications at once
   * @param {Array} notifications - Array of notification objects
   */
  addBulk(notifications) {
    const items = notifications.map(n => ({
      ...n,
      id: Date.now() + Math.random(),
      attempts: 0,
      addedAt: new Date(),
    }));
    
    this.queue.push(...items);
    console.log(`📬 ${items.length} notifications queued (Queue size: ${this.queue.length})`);
    
    if (!this.processing) {
      this.startProcessing();
    }
  }

  /**
   * Start processing queue
   */
  async startProcessing() {
    if (this.processing) return;
    
    this.processing = true;
    console.log('🔄 Notification queue processing started');

    while (this.queue.length > 0) {
      const notification = this.queue.shift();
      
      try {
        await this.processNotification(notification);
      } catch (error) {
        console.error('❌ Notification processing error:', error);
        
        // Retry logic
        if (notification.attempts < this.maxRetries) {
          notification.attempts++;
          this.queue.push(notification);
          console.log(`🔄 Retrying notification (attempt ${notification.attempts}/${this.maxRetries})`);
        } else {
          console.error('❌ Notification failed after max retries:', notification);
        }
      }

      // Wait before processing next item
      await new Promise(resolve => setTimeout(resolve, this.processingInterval));
    }

    this.processing = false;
    console.log('✅ Notification queue processing completed');
  }

  /**
   * Process individual notification
   * @param {Object} notification - Notification to process
   */
  async processNotification(notification) {
    const { type, data } = notification;

    let emailData;

    switch (type) {
      case 'complaint_assigned':
        emailData = emailTemplates.complaintAssignedEmail(data.vendor, data.complaint);
        return await sendEmail({
          to: data.vendor.email,
          ...emailData,
        });

      case 'complaint_status_changed':
        emailData = emailTemplates.complaintStatusChangedEmail(data.user, data.complaint, data.newStatus);
        return await sendEmail({
          to: data.user.email,
          ...emailData,
        });

      case 'new_comment':
        emailData = emailTemplates.newCommentEmail(data.user, data.complaint, data.comment);
        return await sendEmail({
          to: data.user.email,
          ...emailData,
        });

      case 'booking_approved':
        emailData = emailTemplates.bookingApprovedEmail(data.user.name, {
          facilityName: data.facility.name,
          startTime: data.booking.startTime,
          endTime: data.booking.endTime,
        });
        return await sendEmail({
          to: data.user.email,
          ...emailData,
        });

      case 'booking_rejected':
        emailData = emailTemplates.bookingRejectedEmail(data.user.name, {
          facilityName: data.facility.name,
          startTime: data.booking.startTime,
          endTime: data.booking.endTime,
          reason: data.booking.rejectionReason,
        });
        return await sendEmail({
          to: data.user.email,
          ...emailData,
        });

      case 'booking_reminder':
        emailData = emailTemplates.bookingReminderEmail(data.user, data.booking, data.facility);
        return await sendEmail({
          to: data.user.email,
          ...emailData,
        });

      default:
        console.warn(`⚠️ Unknown notification type: ${type}`);
        return { skipped: true, reason: 'Unknown type' };
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueSize: this.queue.length,
      processing: this.processing,
      oldestItem: this.queue[0]?.addedAt,
    };
  }

  /**
   * Clear all pending notifications (use with caution)
   */
  clear() {
    const cleared = this.queue.length;
    this.queue = [];
    console.log(`🗑️ Cleared ${cleared} pending notifications`);
    return cleared;
  }
}

// Singleton instance
const notificationQueue = new NotificationQueue();

// Helper functions for easy access
export const queueNotification = (notification) => notificationQueue.add(notification);
export const queueBulkNotifications = (notifications) => notificationQueue.addBulk(notifications);
export const getQueueStatus = () => notificationQueue.getStatus();
export const clearQueue = () => notificationQueue.clear();

export default notificationQueue;
