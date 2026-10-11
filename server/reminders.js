const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Plant = require('./models/Plant');

const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
}) : null;

async function sendReminders() {
  const due = await Plant.find({ nextWatering: { $lte: new Date() } }).populate('user');
  const byUser = {};
  due.forEach(p => (byUser[p.user._id] ||= { user: p.user, plants: [] }).plants.push(p.name));
  for (const { user, plants } of Object.values(byUser)) {
    const text = `Hi ${user.name}, time to water: ${plants.join(', ')} 🌿`;
    if (transporter) await transporter.sendMail({ from: process.env.SMTP_USER, to: user.email, subject: 'PlantNest reminder', text });
    else console.log(`[reminder -> ${user.email}] ${text}`);
  }
}
exports.startReminders = () => cron.schedule('0 8 * * *', sendReminders); // daily 8 AM
