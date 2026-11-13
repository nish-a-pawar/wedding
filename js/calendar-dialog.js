(() => {
  const calendarButton = document.getElementById('openCalendarBtn');
  const dialog = document.getElementById('calendarDialog');
  const closeButton = dialog?.querySelector('.calendar-dialog-close');
  const googleButton = document.getElementById('gcalBtn');
  const appleButton = document.getElementById('icalBtn');

  if (!calendarButton || !dialog || !closeButton) return;

  calendarButton.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal();
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  googleButton?.addEventListener('click', () => dialog.close());
  appleButton?.addEventListener('click', () => dialog.close());
})();
