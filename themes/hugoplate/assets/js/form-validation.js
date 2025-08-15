document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');

  // Helper to create and show an error message
  const showError = (field, message) => {
    let error = field.parentElement.querySelector('.error-message');
    if (!error) {
      error = document.createElement('p');
      error.className = 'error-message text-red-500 text-sm mt-1';
      field.parentElement.appendChild(error);
    }
    error.textContent = message;
  };

  // Helper to clear error messages
  const clearErrors = () => {
    form.querySelectorAll('.error-message').forEach(e => e.remove());
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearErrors();
    let isValid = true;

    // Check all required text/email/textarea fields
    const requiredFields = form.querySelectorAll('[required]');
    for (const field of requiredFields) {
      if (!field.value.trim()) {
        isValid = false;
        showError(field, `請填寫 ${field.labels[0].textContent.replace('*', '').trim()}`);
        field.focus();
        return; // Stop on first error
      }
    }

    // If all checks pass, submit the form
    if (isValid) {
      form.submit();
    }
  });
});
