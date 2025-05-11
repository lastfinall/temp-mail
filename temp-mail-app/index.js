require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const EmailSchema = new mongoose.Schema({
  address: String,
  messages: [
    {
      from: String,
      subject: String,
      body: String,
      receivedAt: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

const Mailbox = mongoose.model('Mailbox', EmailSchema);

function generateRandomEmail() {
  const prefix = crypto.randomBytes(5).toString('hex');
  return `${prefix}@tempmail.dev`;
}

app.post('/api/new-mailbox', async (req, res) => {
  const address = generateRandomEmail();
  const mailbox = new Mailbox({ address, messages: [] });
  await mailbox.save();
  res.json({ address });
});

// Simulated inbox for testing
app.post('/api/send', async (req, res) => {
  const { to, subject, body, from } = req.body;
  const mailbox = await Mailbox.findOne({ address: to });
  if (mailbox) {
    mailbox.messages.push({
      from: from || 'someone@example.com',
      subject,
      body,
      receivedAt: new Date(),
    });
    await mailbox.save();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Mailbox not found' });
  }
});

app.get('/api/inbox/:address', async (req, res) => {
  const mailbox = await Mailbox.findOne({ address: req.params.address });
  if (mailbox) {
    const timeLeft = Math.max(
      0,
      600 - Math.floor((Date.now() - mailbox.createdAt.getTime()) / 1000)
    );
    res.json({ messages: mailbox.messages, timeLeft });
  } else {
    res.status(404).json({ error: 'Mailbox expired or not found' });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Backend running on port ${process.env.PORT}`)
);
