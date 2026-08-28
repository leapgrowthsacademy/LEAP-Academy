(function() {
  function getPathname(urlBase) {
    var a = document.createElement('a');
    a.href = urlBase;
    return a.pathname.replace(/\/$/, '') || '/';
  }

  function matchesCurrent(href) {
    if (!href || href === '#' || href.startsWith('javascript:')) return false;

    var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    var linkPath = getPathname(href);

    // Exact match
    if (currentPath === linkPath) return true;

    // Static export match (e.g. current is /about.html, link is /about or /about/)
    var currentStripped = currentPath.replace(/\.html$/, '');
    var linkStripped = linkPath.replace(/\.html$/, '');
    if (currentStripped === linkStripped) return true;

    // Index match
    if (currentStripped + '/index' === linkStripped) return true;
    if (linkStripped + '/index' === currentStripped) return true;

    return false;
  }

  function applyActiveState(el) {
    // Standard generic class
    el.classList.add('active', 'current', 'w--current');
    el.setAttribute('aria-current', 'page');
    
    // Framer Active / Hover Mocking
    // Some Framer sites use opacity for nav unselected, we force opacity 1.
    if (el.closest('[data-framer-name]')) {
      el.style.opacity = '1';
      // Attempt to find an internal text node and embolden it if that's a common pattern, 
      // though opacity is the safest cross-site Framer fallback if variants aren't loaded.
      var innerSpan = el.querySelector('span');
      if (innerSpan) {
        innerSpan.style.opacity = '1';
      }
    }
  }

  window.addEventListener('DOMContentLoaded', function() {
    var navLinks = document.querySelectorAll('nav a, header a, [role="navigation"] a, .nav a, .navbar a');
    var foundActive = false;

    navLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (matchesCurrent(href)) {
        applyActiveState(link);
        foundActive = true;
      }
    });

    // If no direct 'a' match found, check for parents (like li) wrap
    if (!foundActive) {
      document.querySelectorAll('nav li, header li, .nav-item').forEach(function(li) {
        var a = li.querySelector('a');
        if (a && matchesCurrent(a.getAttribute('href'))) {
          applyActiveState(li);
          applyActiveState(a);
        }
      });
    }
  });
})();
