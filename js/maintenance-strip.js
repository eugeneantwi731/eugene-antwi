/* ============================================================
   MAINTENANCE STRIP — JS

   Order of operations (this order is everything):
   1. Grab the track and measure its current width (one set only)
   2. Clone all children and append them (now two sets exist)
   3. Set --maint-dist as exact negative pixels (no % guessing)
   4. Set --maint-speed based on distance
   5. Add .maint-running — animation only starts HERE

   The CSS has zero animation on .maint-track by default.
   Nothing plays until step 5. No flash. No gap. Ever.
============================================================ */

(function () {
    'use strict';

    function getOffset() {
        var styles = getComputedStyle(document.documentElement);
        var h   = parseFloat(styles.getPropertyValue('--maint-h'))   || 30;
        var gap = parseFloat(styles.getPropertyValue('--maint-gap')) || 6;
        return Math.round(h + gap);
    }

    function applyOffset(navbar) {
        var offset = getOffset();
        if (navbar) navbar.style.top = offset + 'px';
        document.body.style.paddingTop = offset + 'px';
    }

    function initStrip() {
        var strip  = document.getElementById('maintStrip');
        var track  = document.getElementById('maintTrack');
        var navbar = document.querySelector('.site-header');

        if (!strip || !track) return;

        /* ── STEP 1: Measure BEFORE clone ─────────────────── */
        var oneSetWidth = track.scrollWidth;

        /* ── STEP 2: Clone and append ─────────────────────── */
        var originals = Array.prototype.slice.call(track.children);
        originals.forEach(function (child) {
            track.appendChild(child.cloneNode(true));
        });

        /* ── STEP 3: Set exact pixel distance ─────────────── */
        track.style.setProperty('--maint-dist', '-' + oneSetWidth + 'px');

        /* ── STEP 4: Set speed (60px/s feels natural) ──────── */
        var speed = Math.round(oneSetWidth / 60);
        track.style.setProperty('--maint-speed', speed + 's');

        /* ── STEP 5: NOW start the animation ──────────────── */
        track.classList.add('maint-running');

        /* ── NAVBAR OFFSET ────────────────────────────────── */
        applyOffset(navbar);
        window.addEventListener('resize', function () {
            applyOffset(navbar);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStrip);
    } else {
        initStrip();
    }

})();
