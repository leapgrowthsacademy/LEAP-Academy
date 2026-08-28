(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  var HEADING = "h1, h2, .section-tag, .label-kicker, .enquiry-form h3, .pathway-content h3, .pathway-content h4, .capability h3, .method-steps strong, .about-image > span, .outcome-callout strong";
  var DESCRIPTION = "p, .hero-subtitle, .form-intro, .method-quote, .about-lead, .about-signature, .capability p, .method-steps p, .outcome-list p";
  var ACTION = ".hero-actions, .enquiry-actions, .final-cta .button, .card-link, .enquiry-form > .button";

  function delayClass(el) {
    if (el.matches(ACTION)) return "swipe-delay-2";
    if (el.matches(DESCRIPTION) && !el.matches(HEADING)) return "swipe-delay-1";
    return "";
  }

  function shouldSkip(el) {
    if (!el || el.nodeType !== 1) return true;
    if (el.closest("header")) return true;
    if (el.closest(".faq-list")) return true;
    if (el.closest(".top-nav")) return true;
    if (el.closest(".footer-links")) return true;
    if (el.closest(".hero-proof")) return true;
    if (el.closest(".hero-stat")) return true;
    if (el.closest(".hero-image-note")) return true;
    if (el.closest(".card-number")) return true;
    if (el.closest(".capability") && el.matches("span") && !el.matches("p, h3")) return true;
    if (el.matches(".leap-footer > small")) return true;
    if (el.matches("label")) return true;
    if (el.closest("[hidden]")) return true;
    if (el.closest(".form-success, .form-error")) return true;
    return false;
  }

  var selector = [HEADING, DESCRIPTION, ACTION].join(", ");
  var nodes = Array.prototype.slice.call(document.querySelectorAll(selector)).filter(function (el) {
    return !shouldSkip(el);
  });

  if (!nodes.length || !("IntersectionObserver" in window)) {
    return;
  }

  nodes.forEach(function (el) {
    el.classList.add("swipe-up");
    var delay = delayClass(el);
    if (delay) el.classList.add(delay);
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-inview");
        observer.unobserve(el);
        el.addEventListener("animationend", function onEnd(event) {
          if (event.animationName && event.animationName !== "leap-swipe-up") return;
          el.classList.remove("swipe-up", "is-inview", "swipe-delay-1", "swipe-delay-2");
          el.removeEventListener("animationend", onEnd);
        });
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  nodes.forEach(function (el) {
    observer.observe(el);
  });
})();
