/**
 * Nav Scroll Polyfill — Structural Detection Algorithm
 *
 * Adds scroll-based background transition for fixed navigation headers.
 * Frameworks like Framer Motion normally drive this via variant animations on scroll.
 *
 * ALGORITHM:
 *   1. PRE-TAGGED: Check for [data-nce-nav-scroll] (set by page-processor.ts
 *      during the Cheerio phase, which can inspect CSS rules for position:fixed).
 *   2. SELF-DETECT: If no pre-tagged elements found, scan for elements matching
 *      the fixed-transparent-nav heuristic:
 *        a. computedStyle position is "fixed" or "sticky"
 *        b. computedStyle top ≤ 5px (pinned to top)
 *        c. Background is transparent (rgba alpha ≈ 0, or "transparent")
 *        d. Contains ≥ 1 anchor link (navigation heuristic)
 *   3. SCROLL HANDLER: On scroll > 50px → apply dark bg + backdrop blur.
 *      On scroll ≤ 10px → revert. Hysteresis gap prevents flicker.
 *   4. TARGET BG: Read from data-nce-nav-scroll-bg if pre-tagged, else default
 *      to rgba(0,0,0,0.8).
 */
(function() {
    // ─── Detection ─────────────────────────────────────────────

    /** Check if a background-color string is transparent */
    function isTransparentBg(bg) {
        if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return true;
        var m = bg.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,?\s*([\d.]+)?\s*\)/);
        if (m && m[1] !== undefined) return parseFloat(m[1]) < 0.05;
        return false;
    }

    /** Pick a scroll background that contrasts with the nav's text color */
    function inferScrollBg(el) {
        var link = el.querySelector('a');
        var textColor = link ? getComputedStyle(link).color : getComputedStyle(el).color;
        var m = textColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (m) {
            // Relative luminance approximation
            var lum = (parseInt(m[1]) * 299 + parseInt(m[2]) * 587 + parseInt(m[3]) * 114) / 1000;
            // Light text → dark bg, dark text → light bg
            if (lum > 140) return 'rgba(0,0,0,0.8)';
            return 'rgba(255,255,255,0.85)';
        }
        return 'rgba(0,0,0,0.8)';
    }

    /** Find nav elements that should get scroll behavior.
     *  Returns Array<{ el: Element, targetBg: string }> */
    function findNavs() {
        var results = [];

        // 1. Pre-tagged by page-processor
        document.querySelectorAll('[data-nce-nav-scroll]').forEach(function(el) {
            results.push({
                el: el,
                targetBg: el.getAttribute('data-nce-nav-scroll-bg') || inferScrollBg(el)
            });
        });

        if (results.length > 0) return results;

        // 2. Self-detect: scan <nav> and header-like elements
        var candidates = document.querySelectorAll('nav, header, [role="navigation"]');
        candidates.forEach(function(el) {
            var cs = getComputedStyle(el);

            // Also check the parent (Framer wraps nav in a -container div that
            // holds position:fixed while the <nav> itself has the bg color)
            var parent = el.parentElement;
            var pcs = parent ? getComputedStyle(parent) : null;

            var isFixed = cs.position === 'fixed' || cs.position === 'sticky'
                || (pcs && (pcs.position === 'fixed' || pcs.position === 'sticky'));
            var isTop = parseFloat(cs.top) <= 5
                || (pcs && parseFloat(pcs.top) <= 5);

            if (!isFixed || !isTop) return;
            if (!isTransparentBg(cs.backgroundColor)) return;
            if (el.querySelectorAll('a').length === 0) return;

            results.push({ el: el, targetBg: inferScrollBg(el) });
        });

        return results;
    }

    // ─── Scroll Handler ────────────────────────────────────────

    var navs = findNavs();
    if (!navs.length) return;

    navs.forEach(function(nav) {
        var el = nav.el;
        var targetBg = nav.targetBg;
        var originalBg = el.style.backgroundColor || getComputedStyle(el).backgroundColor;
        var originalBackdrop = el.style.backdropFilter || 'none';

        el.style.transition = 'background-color 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease';

        var scrolled = false;
        var ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function() {
                var y = window.pageYOffset || document.documentElement.scrollTop;
                if (y > 50 && !scrolled) {
                    scrolled = true;
                    el.style.backgroundColor = targetBg;
                    el.style.backdropFilter = 'blur(5px)';
                    el.style.webkitBackdropFilter = 'blur(5px)';
                } else if (y <= 10 && scrolled) {
                    scrolled = false;
                    el.style.backgroundColor = originalBg;
                    el.style.backdropFilter = originalBackdrop;
                    el.style.webkitBackdropFilter = originalBackdrop;
                }
                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    });
})();
