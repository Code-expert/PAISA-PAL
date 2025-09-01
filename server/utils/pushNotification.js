import Notification from '../models/Notification.js';
import User from '../models/User.js';
import sendEmail from './sendEmail.js';

const pushNotification = async (userId, title, message = '', type = 'info', actionLink = '') => {
  const notif = await Notification.create({ user: userId, title, message, type, actionLink });
  if (process.env.EMAIL_NOTIF === 'true') {
    const user = await User.findById(userId);
    if (user && user.email) {
      await sendEmail({
        to: user.email,
        subject: `[PaisaPal] ${title}`,
        text: message || title,
        html: `<p>${message || title}</p>${actionLink ? `<a href='${actionLink}'>View</a>` : ''}`,
      });
    }
  }
  return notif;
};

export default pushNotification; 