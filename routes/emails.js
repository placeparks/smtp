const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Email = require('../models/Email');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create reusable transporter object using environment variables or defaults
// For production (Heroku), use external SMTP service like Gmail, SendGrid, or Mailgun
const getTransporter = () => {
    // SendGrid (Heroku addon automatically sets SENDGRID_USERNAME and SENDGRID_PASSWORD)
    if (process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }
    
    // SendGrid via username/password (alternative method)
    if (process.env.SENDGRID_USERNAME && process.env.SENDGRID_PASSWORD) {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
            }
        });
    }
    
    // Mailgun SMTP
    if (process.env.MAILGUN_SMTP_SERVER && process.env.MAILGUN_SMTP_LOGIN && process.env.MAILGUN_SMTP_PASSWORD) {
        return nodemailer.createTransport({
            host: process.env.MAILGUN_SMTP_SERVER,
            port: parseInt(process.env.MAILGUN_SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.MAILGUN_SMTP_LOGIN,
                pass: process.env.MAILGUN_SMTP_PASSWORD
            }
        });
    }
    
    // Custom SMTP credentials
    if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            } : undefined,
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    
    // Gmail SMTP (common free option)
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });
    }
    
    // Fallback to localhost for local development only
    // This will fail on Heroku - you MUST configure an external SMTP service
    if (process.env.NODE_ENV === 'production') {
        throw new Error('No SMTP service configured. Please set up SendGrid, Mailgun, Gmail, or custom SMTP credentials.');
    }
    
    return nodemailer.createTransport({
        host: 'localhost',
        port: 2525,
        secure: false,
        tls: {
            rejectUnauthorized: false
        }
    });
};

// @route   POST api/emails/send
// @desc    Send an email
// @access  Private
router.post('/send', auth, async (req, res) => {
    const { to, subject, text, html } = req.body;

    try {
        const user = await User.findById(req.user.id);
        const from = user.email;
        const fromName = user.name;

        // Always save email to database first (even if sending fails)
        const sentEmail = new Email({
            from,
            fromName,
            to,
            subject,
            text,
            html,
            folder: 'sent',
            isRead: true
        });
        await sentEmail.save();

        // Try to send email via SMTP
        try {
            const transporter = getTransporter();
            const info = await transporter.sendMail({
                from: `"${fromName}" <${from}>`, // sender address with name
                to: to, // list of receivers
                subject: subject, // Subject line
                text: text, // plain text body
                html: html, // html body
            });

            console.log('Message sent: %s', info.messageId);
            res.json({ msg: 'Email sent', messageId: info.messageId });
        } catch (smtpError) {
            // If SMTP fails (e.g., no SMTP configured), still return success
            // because email is saved in database
            console.warn('SMTP send failed (email saved to database):', smtpError.message);
            res.json({ 
                msg: 'Email saved (SMTP not configured)', 
                warning: 'Email was saved to your sent folder but not delivered. Configure SMTP settings to send emails.',
                messageId: sentEmail._id 
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// @route   GET api/emails/inbox
// @desc    Get inbox emails
// @access  Private
router.get('/inbox', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        // Find emails where 'to' is the user's email and folder is 'inbox' (default)
        // Note: Our SMTP server saves incoming emails with folder 'inbox'
        const emails = await Email.find({ to: user.email, folder: 'inbox' }).sort({ createdAt: -1 });
        res.json(emails);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/emails/sent
// @desc    Get sent emails
// @access  Private
router.get('/sent', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const emails = await Email.find({ from: user.email, folder: 'sent' }).sort({ createdAt: -1 });
        res.json(emails);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
