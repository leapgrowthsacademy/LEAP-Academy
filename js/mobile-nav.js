(function () {
  var button = document.querySelector(".menu-button");
  var nav = document.querySelector(".top-nav");

  if (!button || !nav) return;

  button.setAttribute("aria-expanded", "false");

  button.addEventListener("click", function () {
    var open = nav.classList.toggle("top-nav--open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });

  Array.prototype.forEach.call(nav.querySelectorAll("a"), function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("top-nav--open");
      button.setAttribute("aria-expanded", "false");
    });
  });
})();
