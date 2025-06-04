import nodemailer from 'nodemailer'
import { emailTemplates } from '../utils/email.templates.js'

// Create transporter with Gmail configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    /* // Uncomment for development
    tls: {
      rejectUnauthorized: false
    }
    */
  })
}


// Send email function
export const sendEmail = async (to, template, ...args) => {
  try {
    const transporter = createTransporter()
    const emailContent = emailTemplates[template](...args)

    const mailOptions = {
      from: {
        name: 'Muxic Inc',
        address: process.env.SMTP_USER
      },
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

// Test email connection
export const testEmailConnection = async () => {

  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log('SMTP connection verified successfully')
    return true
  } catch (error) {
    console.error('SMTP connection failed:', error)
    return false
  }
}

// testEmailConnection()