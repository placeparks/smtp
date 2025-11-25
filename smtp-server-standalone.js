// Standalone SMTP Server for Railway/Render Deployment
// This file can be deployed separately from your main Heroku app

require('dotenv').config();
const connectDB = require('./db');
const startSMTPServer = require('./smtp');

// Connect to MongoDB (same database as your Heroku app)
connectDB()
    .then(() => {
        console.log('MongoDB connected for SMTP server');
        
        // Start SMTP server
        const SMTP_PORT = process.env.PORT || process.env.SMTP_PORT || 2525;
        console.log(`Starting SMTP server on port ${SMTP_PORT}...`);
        
        // The startSMTPServer function will handle the actual server startup
        // We just need to make sure the port is set correctly
        process.env.SMTP_PORT = SMTP_PORT.toString();
        
        try {
            startSMTPServer();
            console.log(`✅ SMTP Server is running and ready to receive emails`);
            console.log(`📧 Listening on port ${SMTP_PORT}`);
        } catch (error) {
            console.error('❌ Failed to start SMTP server:', error.message);
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });

// Keep the process alive
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

