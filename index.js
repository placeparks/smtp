const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.get('/', (req, res) => res.send('Email Service API Running'));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const startSMTPServer = require('./smtp');

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    // Note: SMTP server on custom port (2525) won't work on Heroku
    // Heroku only allows HTTP traffic on the PORT env variable
    // For Heroku, use external SMTP services (SendGrid, Mailgun) instead
    if (!process.env.DISABLE_SMTP && process.env.SMTP_PORT) {
        try {
            startSMTPServer();
        } catch (error) {
            console.warn('SMTP server failed to start (this is normal on Heroku):', error.message);
        }
    } else {
        console.log('SMTP server disabled (use external service like SendGrid/Mailgun on Heroku)');
    }
});
