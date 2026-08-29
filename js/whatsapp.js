(function () {
  var MESSAGE =
    "Hi Nikhil, I came across LEAP Growths Academy and I'd like to connect with you and know about how we can collaborate.";

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function whatsappUrl() {
    var config = window.LEAP_CONFIG || {};
    var phone = digitsOnly(config.WHATSAPP_PHONE_NUMBER);
    var message = config.WHATSAPP_MESSAGE || MESSAGE;
    var base = phone
      ? "https://wa.me/" + phone
      : "https://wa.me/";

    return base + "?text=" + encodeURIComponent(message);
  }

  function applyLinks() {
    var url = whatsappUrl();
    var nodes = document.querySelectorAll("[data-discovery-call='true']");

    Array.prototype.forEach.call(nodes, function (node) {
      if (node.tagName === "A") {
        node.setAttribute("href", url);
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
        return;
      }

      node.addEventListener("click", function (event) {
        event.preventDefault();
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLinks);
  } else {
    applyLinks();
  }
})();
