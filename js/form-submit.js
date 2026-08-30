(function () {

  function scriptUrl() {
    var config = window.LEAP_CONFIG || {};
    return config.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzQjYxaPJ9hg0SnCEmDU3WkcxzV9LH8cig1GdjwXIbJBEETlXOQnDfxIG5OgryOO2IB/exec";
  }

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function byName(form, name) {
    return form.elements.namedItem(name);
  }

  function valueOf(form, name) {
    const field = byName(form, name);

    return field && typeof field.value === "string"
      ? field.value.trim()
      : "";
  }

  function setHidden(element, hidden) {
    if (!element) return;

    if (hidden) {
      element.setAttribute("hidden", "");
    } else {
      element.removeAttribute("hidden");
    }
  }

  function showSuccess(form) {
    const success = form.querySelector("#enquiry-success");
    const error = form.querySelector("#enquiry-error");

    setHidden(error, true);

    if (error) {
      error.textContent = "";
    }

    setHidden(success, false);
  }

  function showError(form, message) {
    const success = form.querySelector("#enquiry-success");
    const error = form.querySelector("#enquiry-error");

    setHidden(success, true);

    if (error) {
      error.textContent = message;
      setHidden(error, false);
    }
  }

  function hideMessages(form) {
    const success = form.querySelector("#enquiry-success");
    const error = form.querySelector("#enquiry-error");

    setHidden(success, true);
    setHidden(error, true);

    if (error) {
      error.textContent = "";
    }
  }

  function validate(form) {
    const name = valueOf(form, "name");
    const organisation = valueOf(form, "organisation");
    const email = valueOf(form, "email");
    const phone = valueOf(form, "phone");
    const groupSize = valueOf(form, "groupSize");

    const collegeChallenges = checkedValues(form, "collegeChallenges");
    const hrChallenges = checkedValues(form, "hrChallenges");

    if (!name) {
      return "Please enter your name.";
    }

    if (!organisation) {
      return "Please enter your organisation.";
    }

    if (!email) {
      return "Please enter your work email.";
    }

    if (!EMAIL_PATTERN.test(email)) {
      return "Please enter a valid work email.";
    }

    if (!phone) {
      return "Please enter your phone number.";
    }

    if (!groupSize) {
      return "Please enter the estimated group size.";
    }

    if (!collegeChallenges && !hrChallenges) {
      return "Please select at least one challenge.";
    }

    return "";
  }

  function checkedValues(form, name) {
    const nodes = form.querySelectorAll(
      'input[type="checkbox"][name="' + name + '"]:checked'
    );

    return Array.prototype.map
      .call(nodes, function (input) {
        return input.value;
      })
      .join(", ");
  }

  function collect(form) {
    return {
      name: valueOf(form, "name"),
      organisation: valueOf(form, "organisation"),
      email: valueOf(form, "email"),
      phone: valueOf(form, "phone"),
      groupSize: valueOf(form, "groupSize"),
      collegeChallenges: checkedValues(form, "collegeChallenges"),
      hrChallenges: checkedValues(form, "hrChallenges")
    };
  }

  function isConfigured() {
    const GOOGLE_SCRIPT_URL = scriptUrl();

    return (
      GOOGLE_SCRIPT_URL &&
      !GOOGLE_SCRIPT_URL.includes(
        "https://script.google.com/macros/s/AKfycbzQjYxaPJ9hg0SnCEmDU3WkcxzV9LH8cig1GdjwXIbJBEETlXOQnDfxIG5OgryOO2IB/exec"
      )
    );
  }

  document.addEventListener(
    "submit",
    function (event) {

      const form = event.target;

      if (
        !form ||
        !form.classList ||
        !form.classList.contains("enquiry-form")
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (
        form.getAttribute("data-submitting") === "true"
      ) {
        return;
      }

      hideMessages(form);

      const validationMessage = validate(form);

      if (validationMessage) {
        showError(form, validationMessage);
        return;
      }

      if (!isConfigured()) {
        showError(
          form,
          "Something went wrong. Please try again."
        );
        return;
      }

      const submitButton =
        form.querySelector('[type="submit"]');

      form.setAttribute(
        "data-submitting",
        "true"
      );

      if (submitButton) {
        submitButton.disabled = true;
      }

      fetch(scriptUrl(), {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(
          collect(form)
        )
      })
        .then(function (response) {

          return response.text().then(function (text) {

            let payload = {};

            try {
              payload = text
                ? JSON.parse(text)
                : {};
            } catch (error) {
              payload = {};
            }

            if (
              !response.ok ||
              payload.result === "error"
            ) {
              throw new Error(
                "submit-failed"
              );
            }

          });

        })

        .then(function () {

          showSuccess(form);

          form.reset();

        })

        .catch(function () {

          showError(
            form,
            "Something went wrong. Please try again."
          );

        })

        .finally(function () {

          form.removeAttribute(
            "data-submitting"
          );

          if (submitButton) {
            submitButton.disabled = false;
          }

        });

    },
    true
  );

})();
