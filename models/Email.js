const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
    from: { type: String, required: true },
    fromName: { type: String }, // Sender's name
    to: { type: String, required: true },
    toName: { type: String }, // Recipient's name (for future use)
    subject: { type: String, default: '(No Subject)' },
    text: { type: String },
    html: { type: String },
    isRead: { type: Boolean, default: false },
    folder: { type: String, enum: ['inbox', 'sent', 'trash'], default: 'inbox' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Email', EmailSchema);
