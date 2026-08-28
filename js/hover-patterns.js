/**
 * Hover Patterns Polyfill — Structural Detection (cross-platform)
 *
 * Adds hover effects to structurally-tagged elements:
 * - [data-nce-hover-nav]: nav links get opacity transition
 * - [data-nce-hover-card] + [data-nce-hover-card-img]: card links get
 *   image darkening overlay + arrow indicator on hover
 *
 * Tagged by page-processor.ts step 8d using structural detection
 * (nav containers, links with image+heading children).
 */
(function() {
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

    var cssRules = [];

    // 1. Nav link hover — opacity transition
    if (document.querySelector('[data-nce-hover-nav]')) {
        cssRules.push(
            '[data-nce-hover-nav] {',
            '  transition: opacity 0.2s ease;',
            '}',
            '[data-nce-hover-nav]:hover {',
            '  opacity: 0.65;',
            '}'
        );
    }

    // 2. Card image hover — darken + arrow
    if (document.querySelector('[data-nce-hover-card]')) {
        cssRules.push(
            '[data-nce-hover-card-img] {',
            '  overflow: hidden;',
            '}',
            '[data-nce-hover-card-img]::before {',
            '  content: "";',
            '  position: absolute;',
            '  inset: 0;',
            '  background: rgba(0,0,0,0);',
            '  transition: background 0.3s ease;',
            '  border-radius: inherit;',
            '  pointer-events: none;',
            '  z-index: 2;',
            '}',
            '[data-nce-hover-card]:hover [data-nce-hover-card-img]::before {',
            '  background: rgba(0,0,0,0.18);',
            '}',
            '[data-nce-hover-card-img]::after {',
            '  content: "\\2192";',
            '  position: absolute;',
            '  top: 50%;',
            '  left: 50%;',
            '  transform: translate(-50%, -50%) scale(0.8);',
            '  font-size: 28px;',
            '  color: white;',
            '  opacity: 0;',
            '  transition: opacity 0.3s ease, transform 0.3s ease;',
            '  z-index: 3;',
            '  pointer-events: none;',
            '  width: 48px;',
            '  height: 48px;',
            '  line-height: 48px;',
            '  text-align: center;',
            '  border-radius: 50%;',
            '  background: rgba(0,0,0,0.4);',
            '}',
            '[data-nce-hover-card]:hover [data-nce-hover-card-img]::after {',
            '  opacity: 1;',
            '  transform: translate(-50%, -50%) scale(1);',
            '}',
            '[data-nce-hover-card] {',
            '  cursor: pointer;',
            '}'
        );
    }

    if (cssRules.length > 0) {
        var style = document.createElement('style');
        style.setAttribute('data-nce-hover-patterns', '');
        style.textContent = '@media (hover: hover) {\n' + cssRules.join('\n') + '\n}';
        document.head.appendChild(style);
    }
})();
