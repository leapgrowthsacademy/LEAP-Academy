(function () {
  function setOpen(item, open) {
    var button = item.querySelector("button");
    var answer = item.querySelector("[role='region']");
    var heading = item.querySelector("h3");
    var state = open ? "open" : "closed";

    item.setAttribute("data-state", state);

    if (heading) {
      heading.setAttribute("data-state", state);
    }

    if (button) {
      button.setAttribute("data-state", state);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    }

    if (answer) {
      answer.setAttribute("data-state", state);
      if (open) {
        answer.removeAttribute("hidden");
      } else {
        answer.setAttribute("hidden", "");
      }
    }
  }

  function init() {
    var items = document.querySelectorAll(".faq-list > [data-testid^='faq-item']");

    Array.prototype.forEach.call(items, function (item) {
      var button = item.querySelector("button");
      if (!button) return;

      button.addEventListener("click", function () {
        var isOpen = item.getAttribute("data-state") === "open";
        setOpen(item, !isOpen);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
