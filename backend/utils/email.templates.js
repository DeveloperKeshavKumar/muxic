export const emailTemplates = {
  verification: (otp, username) => ({
    subject: 'Verify Your Account - OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome ${username}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for registering with our music platform. To complete your registration, please use the OTP code below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 3px;">
              ${otp}
            </div>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">
            This code will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `
  }),

  resetPassword: (resetToken, username) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Reset Your Password</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hello ${username},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to reset it:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" 
               style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" style="color: #007bff; word-break: break-all;">
              ${process.env.CLIENT_URL}/reset-password?token=${resetToken}
            </a>
          </p>
          <p style="color: #666; font-size: 14px; text-align: center;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `
  }),

  welcome: (username) => ({
    subject: 'Welcome to Our Music Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">🎵 Welcome ${username}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Congratulations! Your account has been successfully verified and you're now part of our music community.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You can now:
          </p>
          <ul style="color: #666; font-size: 16px; line-height: 1.8; margin-left: 20px;">
            <li>Create and join music rooms</li>
            <li>Share your favorite tracks</li>
            <li>Connect with other music lovers</li>
            <li>Discover new music</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" 
               style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Get Started
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `
  })
}