// Michelle's Cycle Tracker — Service Worker
// Handles scheduled period reminder notifications

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'SCHEDULE_PERIOD_REMINDERS') return;

  const { reminders } = e.data;
  // reminders = [{ fireAt: timestamp, daysUntil: n }, ...]

  reminders.forEach(r => {
    const delay = r.fireAt - Date.now();
    if (delay <= 0) return;

    setTimeout(() => {
      let body;
      if (r.daysUntil === 0) {
        body = 'Period is expected today.';
      } else if (r.daysUntil === 1) {
        body = 'Reminder: Period tomorrow.';
      } else {
        body = 'Reminder: Period in ' + r.daysUntil + ' days.';
      }

      self.registration.showNotification('My Cycle', {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'period-reminder-' + r.daysUntil,
        renotify: true
      });
    }, delay);
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});
