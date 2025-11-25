const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const Email = require('./models/Email');
// const User = require('./models/User'); // Will use for auth later

const server = new SMTPServer({
    authOptional: true, // Allow connection without auth for receiving from outside (in theory)
    // For local dev, we might want auth to prevent spam, but for now open is easier for testing

    onData(stream, session, callback) {
        simpleParser(stream, async (err, parsed) => {
            if (err) {
                console.error('Error parsing email:', err);
                return callback(err);
            }

            console.log('Email received from:', parsed.from.text);
            console.log('Subject:', parsed.subject);

            // Save to DB
            try {
                // parsed.to is an object or array. We need to handle it.
                // For MVP, just take the text representation
                const toAddress = parsed.to ? parsed.to.text : 'unknown';
                
                // Extract email and name from parsed.from
                let fromEmail = parsed.from.text;
                let fromName = null;
                
                // parsed.from.value is an array of address objects
                if (parsed.from && parsed.from.value && parsed.from.value.length > 0) {
                    const fromAddr = parsed.from.value[0];
                    fromEmail = fromAddr.address || parsed.from.text;
                    fromName = fromAddr.name || null;
                }

                const newEmail = new Email({
                    from: fromEmail,
                    fromName: fromName,
                    to: toAddress,
                    subject: parsed.subject,
                    text: parsed.text,
                    html: parsed.html,
                    folder: 'inbox',
                });
                await newEmail.save();
                console.log('Email saved to MongoDB');
            } catch (dbErr) {
                console.error('Error saving email to DB:', dbErr);
            }

            callback();
        });
    },
});

const startSMTPServer = () => {
    // Use port 587 (standard SMTP submission port) or 2525 for local dev
    // Port 25 is often blocked, 587 is recommended for production
    const SMTP_PORT = process.env.SMTP_PORT || 587;
    server.listen(SMTP_PORT, '0.0.0.0', () => {
        console.log(`SMTP Server running on 0.0.0.0:${SMTP_PORT}`);
        console.log(`Note: This requires a platform that supports custom ports (not Heroku)`);
    });
};

module.exports = startSMTPServer;
