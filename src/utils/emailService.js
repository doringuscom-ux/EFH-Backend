import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dogdwdev@gmail.com';

/**
 * Send email via the deployed Google Apps Script Web App
 */
export const sendViaProxy = async (to, subject, htmlContent) => {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('[Email Service] GOOGLE_SCRIPT_URL is not set in .env');
    return { success: false, error: 'GOOGLE_SCRIPT_URL is not configured' };
  }

  try {
    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.append('to', to);
    url.searchParams.append('subject', subject);
    url.searchParams.append('message', htmlContent);

    const response = await fetch(url.toString(), {
      method: 'POST'
    });

    const data = await response.json();
    if (data && data.success) {
      return { success: true };
    }
    return { success: false, error: data?.error || 'Unknown proxy error' };
  } catch (err) {
    console.error('[Email Service] Error in sendViaProxy:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send notification to Admin when a new user registers
 */
export const sendAdminRegistrationNotification = async (user) => {
  const subject = `EFH: New User Registered (${user.username})`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
      <h2 style="color: #cba358; border-bottom: 2px solid #cba358; padding-bottom: 10px;">New Account Registration</h2>
      <p>Hello Admin,</p>
      <p>A new member has registered on the EFH Portal. Here are their registration details:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 30%;">Username</td>
          <td style="padding: 10px; border: 1px solid #eee;">${user.username || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Email</td>
          <td style="padding: 10px; border: 1px solid #eee;"><a href="mailto:${user.email}">${user.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Name</td>
          <td style="padding: 10px; border: 1px solid #eee;">${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Phone</td>
          <td style="padding: 10px; border: 1px solid #eee;">${user.contactInfo?.phone || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Registered At</td>
          <td style="padding: 10px; border: 1px solid #eee;">${new Date().toLocaleString()}</td>
        </tr>
      </table>
      
      <p style="font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
        Manage registrations inside your <a href="http://localhost:5173/admin/dashboard" style="color: #cba358;">EFH Admin Dashboard</a>.
      </p>
    </div>
  `;

  const result = await sendViaProxy(ADMIN_EMAIL, subject, htmlContent);
  if (result.success) {
    console.log(`[Email Service] Admin notified of registration for ${user.email}`);
  } else {
    console.error(`[Email Service] Admin registration notification failed:`, result.error);
  }
};

/**
 * Send notification to Admin when a new contact inquiry is submitted
 */
export const sendAdminContactNotification = async (message) => {
  const subject = `EFH Inquiry: ${message.subject}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
      <h2 style="color: #cba358; border-bottom: 2px solid #cba358; padding-bottom: 10px;">New Contact Form Submission</h2>
      <p>Hello Admin,</p>
      <p>A user has submitted an inquiry on the EFH website:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 30%;">Name</td>
          <td style="padding: 10px; border: 1px solid #eee;">${message.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Email</td>
          <td style="padding: 10px; border: 1px solid #eee;"><a href="mailto:${message.email}">${message.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Subject</td>
          <td style="padding: 10px; border: 1px solid #eee;">${message.subject}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Message</td>
          <td style="padding: 10px; border: 1px solid #eee; white-space: pre-wrap;">${message.message}</td>
        </tr>
        ${message.image ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Attachment</td>
          <td style="padding: 10px; border: 1px solid #eee;"><a href="${message.image}" target="_blank">View Attached Image</a></td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Submitted At</td>
          <td style="padding: 10px; border: 1px solid #eee;">${new Date().toLocaleString()}</td>
        </tr>
      </table>
      
      <p style="font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
        Manage messages inside your <a href="http://localhost:5173/admin/dashboard" style="color: #cba358;">EFH Admin Dashboard</a>.
      </p>
    </div>
  `;

  const result = await sendViaProxy(ADMIN_EMAIL, subject, htmlContent);
  if (result.success) {
    console.log(`[Email Service] Admin notified of contact inquiry from ${message.email}`);
  } else {
    console.error(`[Email Service] Admin contact notification failed:`, result.error);
  }
};

/**
 * Send notification to Admin and confirmation to user when an event registration succeeds
 */
export const sendEventRegistrationNotification = async (user, event, registration) => {
  const adminSubject = `EFH Event: New Registration for ${event.title}`;
  const userSubject = `EFH: Event Registration Confirmed - ${event.title}`;
  
  // Format for Admin
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
      <h2 style="color: #cba358; border-bottom: 2px solid #cba358; padding-bottom: 10px;">New Event Registration</h2>
      <p>Hello Admin,</p>
      <p>A member has registered for an event. Here are the details:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 30%;">Event</td>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">${event.title}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Member Name</td>
          <td style="padding: 10px; border: 1px solid #eee;">${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || user.username}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Email</td>
          <td style="padding: 10px; border: 1px solid #eee;"><a href="mailto:${user.email}">${user.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Participation Role</td>
          <td style="padding: 10px; border: 1px solid #eee; text-transform: uppercase;">${registration.role}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Amount Paid</td>
          <td style="padding: 10px; border: 1px solid #eee;">₹${registration.amount}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Payment Status</td>
          <td style="padding: 10px; border: 1px solid #eee; text-transform: uppercase; color: green; font-weight: bold;">${registration.status}</td>
        </tr>
      </table>
    </div>
  `;

  // Format for User
  const userHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
      <h2 style="color: #cba358; border-bottom: 2px solid #cba358; padding-bottom: 10px;">Event Registration Confirmed!</h2>
      <p>Dear ${user.personalInfo?.firstName || user.username},</p>
      <p>Your registration for the following event has been successfully confirmed. We look forward to seeing you there!</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fafafa;">
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; font-weight: bold; width: 30%;">Event</td>
          <td style="padding: 12px; border: 1px solid #eee; font-weight: bold; color: #333;">${event.title}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; font-weight: bold;">Date</td>
          <td style="padding: 12px; border: 1px solid #eee;">${new Date(event.date).toDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; font-weight: bold;">Location</td>
          <td style="padding: 12px; border: 1px solid #eee;">${event.location}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; font-weight: bold;">Registered As</td>
          <td style="padding: 12px; border: 1px solid #eee; text-transform: uppercase;">${registration.role}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; font-weight: bold;">Amount</td>
          <td style="padding: 12px; border: 1px solid #eee;">₹${registration.amount}</td>
        </tr>
      </table>
      
      <p>If you have any questions or require special arrangements, please contact the EFH Admin.</p>
      <p>Best regards,<br><strong>Equestrian Federation of Haryana (EFH)</strong></p>
    </div>
  `;

  // Send to Admin
  await sendViaProxy(ADMIN_EMAIL, adminSubject, adminHtml);
  // Send to User
  await sendViaProxy(user.email, userSubject, userHtml);
};

/**
 * Send OTP for Password Reset
 */
export const sendOtpEmail = async (email, otp) => {
  const subject = `EFH: Password Reset Verification Code`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
      <h2 style="color: #cba358; border-bottom: 2px solid #cba358; padding-bottom: 10px;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password for your EFH account.</p>
      <p>Your password reset OTP is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; color: #333; background: #fafafa; padding: 15px; border-radius: 5px;">
        ${otp}
      </div>
      <p>This OTP is valid for <strong>15 minutes</strong>. Do not share this code with anyone.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      
      <p style="font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
        Best regards,<br><strong>Equestrian Federation of Haryana (EFH)</strong>
      </p>
    </div>
  `;

  const result = await sendViaProxy(email, subject, htmlContent);
  if (result.success) {
    console.log(`[Email Service] OTP email sent to ${email}`);
  } else {
    console.error(`[Email Service] OTP email failed for ${email}:`, result.error);
  }
};
