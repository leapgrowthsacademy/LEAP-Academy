(function () {
  const GOOGLE_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function byName(form, name) {
    return form.elements.namedItem(name);
  }

  function valueOf(form, name) {
    var field = byName(form, name);
    return field && typeof field.value === "string" ? field.value.trim() : "";
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute("hidden", "");
    else el.removeAttribute("hidden");
  }

  function showSuccess(form) {
    var success = form.querySelector("#enquiry-success");
    var error = form.querySelector("#enquiry-error");
    setHidden(error, true);
    if (error) error.textContent = "";
    setHidden(success, false);
  }

  function showError(form, message) {
    var success = form.querySelector("#enquiry-success");
    var error = form.querySelector("#enquiry-error");
    setHidden(success, true);
    if (error) {
      error.textContent = message;
      setHidden(error, false);
    }
  }

  function hideMessages(form) {
    var success = form.querySelector("#enquiry-success");
    var error = form.querySelector("#enquiry-error");
    setHidden(success, true);
    setHidden(error, true);
    if (error) error.textContent = "";
  }

  function validate(form) {
    var name = valueOf(form, "name");
    var organisation = valueOf(form, "organisation");
    var email = valueOf(form, "email");
    var phone = valueOf(form, "phone");
    var groupSize = valueOf(form, "groupSize");
    var improvement = valueOf(form, "message") || valueOf(form, "improvement");

    if (!name) return "Please enter your name.";
    if (!organisation) return "Please enter your organisation.";
    if (!email) return "Please enter your work email.";
    if (!EMAIL_PATTERN.test(email)) return "Please enter a valid work email.";
    if (!phone) return "Please enter your phone number.";
    if (!groupSize) return "Please enter the estimated group size.";
    if (!improvement) return "Please tell us what you would like to improve.";
    return "";
  }

  function collect(form) {
    return {
      name: valueOf(form, "name"),
      organisation: valueOf(form, "organisation"),
      email: valueOf(form, "email"),
      phone: valueOf(form, "phone"),
      groupSize: valueOf(form, "groupSize"),
      improvement: valueOf(form, "message") || valueOf(form, "improvement")
    };
  }

  function isConfigured() {
    return (
      GOOGLE_SCRIPT_URL &&
      GOOGLE_SCRIPT_URL.indexOf("PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") === -1
    );
  }

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target;
      if (!form || !form.classList || !form.classList.contains("enquiry-form")) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (form.getAttribute("data-submitting") === "true") return;

      hideMessages(form);

      var validationMessage = validate(form);
      if (validationMessage) {
        showError(form, validationMessage);
        return;
      }

      if (!isConfigured()) {
        showError(form, "Something went wrong. Please try again.");
        return;
      }

      var submitButton = form.querySelector('[type="submit"]');
      form.setAttribute("data-submitting", "true");
      if (submitButton) submitButton.disabled = true;

      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(collect(form))
      })
        .then(function (response) {
          return response.text().then(function (text) {
            var payload = {};
            try {
              payload = text ? JSON.parse(text) : {};
            } catch (err) {
              payload = {};
            }
            if (!response.ok || payload.result === "error") {
              throw new Error("submit-failed");
            }
          });
        })
        .then(function () {
          showSuccess(form);
          form.reset();
        })
        .catch(function () {
          showError(form, "Something went wrong. Please try again.");
        })
        .then(function () {
          form.removeAttribute("data-submitting");
          if (submitButton) submitButton.disabled = false;
        });
    },
    true
  );
})();
