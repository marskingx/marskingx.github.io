document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');

  form.addEventListener('submit', function (event) {
    // 檢查所有必填欄位
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    for (const field of requiredFields) {
      if (!field.value.trim()) {
        isValid = false;
        alert(`請填寫 ${field.labels[0].textContent}`);
        field.focus();
        break;
      }
    }

    // 檢查所有 checkbox group
    const checkboxGroups = document.querySelectorAll('.space-y-2');
    for (const group of checkboxGroups) {
      const checkboxes = group.querySelectorAll('input[type="checkbox"]');
      let isGroupChecked = false;
      for (const checkbox of checkboxes) {
        if (checkbox.checked) {
          isGroupChecked = true;
          break;
        }
      }
      if (!isGroupChecked) {
        isValid = false;
        alert(`請至少勾選一個 ${group.previousElementSibling.textContent.trim()}`);
        break;
      }
    }

    if (!isValid) {
      event.preventDefault();
    }
  });
});
