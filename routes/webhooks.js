const express = require('express');
const router = express.Router();
const Email = require('../models/Email');

// @route   POST api/webhooks/mailgun
// @desc    Receive emails from Mailgun webhook
// @access  Public (but should be secured with webhook signature verification)
router.post('/mailgun', async (req, res) => {
    try {
        const { from, to, subject, 'body-plain': text, 'body-html': html, sender } = req.body;
        
        // Extract name from "Name <email@example.com>" format
        let fromEmail = from;
        let fromName = null;
        
        if (from && from.includes('<')) {
            const match = from.match(/^(.+?)\s*<(.+?)>$/);
            if (match) {
                fromName = match[1].trim().replace(/"/g, '');
                fromEmail = match[2].trim();
            }
        }
        
        // Save email to database
        const newEmail = new Email({
            from: fromEmail,
            fromName: fromName,
            to: to,
            subject: subject || '(No Subject)',
            text: text || '',
            html: html || '',
            folder: 'inbox',
            isRead: false
        });
        
        await newEmail.save();
        console.log('Email received via Mailgun webhook:', fromEmail, 'to', to);
        
        res.status(200).json({ msg: 'Email received' });
    } catch (err) {
        console.error('Error processing Mailgun webhook:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

