/* The Himalayan Rooftop: site behaviour (no dependencies) */
(function () {
  'use strict';
  var WA_NUMBER = '919315799283';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header: solid after scrolling; mobile action bar after the hero */
  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.action-bar');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('solid', y > 40 || doc.classList.contains('nav-open'));
    if (bar) bar.classList.toggle('show', y > window.innerHeight * 0.6 && !doc.classList.contains('nav-open'));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile nav */
  var toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = doc.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
      onScroll();
    });
    document.querySelectorAll('.mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        doc.classList.remove('nav-open');
        document.body.style.overflow = '';
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && doc.classList.contains('nav-open')) toggle.click();
    });
  }

  /* reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* reels: load + play only while on screen */
  var vids = document.querySelectorAll('.reel video');
  if (vids.length && 'IntersectionObserver' in window) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.src) { v.src = v.dataset.src; }
          if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { vo.observe(v); });
  }

  /* menu page: highlight the current section in the sticky nav */
  var menuLinks = document.querySelectorAll('.menu-nav a');
  if (menuLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    menuLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          menuLinks.forEach(function (a) { a.classList.remove('on'); });
          var a = byId[en.target.id];
          if (a) {
            a.classList.add('on');
            var nav = a.parentNode;
            nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
          }
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('.menu-cat').forEach(function (s) { mo.observe(s); });
  }

  /* booking form -> WhatsApp */
  var form = document.getElementById('book-form');
  if (form) {
    var err = document.getElementById('form-err');
    var dateIn = form.elements.date;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var now = new Date();
    var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    dateIn.min = today;
    if (!dateIn.value) dateIn.value = today;

    function niceDate(iso) {
      var p = iso.split('-');
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    function niceTime(t) {
      var p = t.split(':'); var h = +p[0]; var m = p[1];
      var ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
      return h + ':' + m + ' ' + ap;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var name = f.name.value.trim();
      var problems = [];
      if (!name) problems.push('your name');
      if (!f.date.value) problems.push('a date');
      else if (f.date.value < today) problems.push('a date from today onwards');
      if (!f.time.value) problems.push('a time');
      if (problems.length) {
        err.textContent = 'Please add ' + problems.join(', ') + '.';
        var first = !name ? f.name : (!f.date.value || f.date.value < today) ? f.date : f.time;
        first.focus();
        return;
      }
      err.textContent = '';
      var seating = form.querySelector('input[name="seating"]:checked');
      var lines = [
        'Hello The Himalayan Rooftop! I would like to book a table.',
        '',
        'Name: ' + name,
        'Date: ' + niceDate(f.date.value),
        'Time: ' + niceTime(f.time.value),
        'Guests: ' + f.guests.value,
        'Seating: ' + (seating ? seating.value : 'No preference')
      ];
      if (f.occasion.value) lines.push('Occasion: ' + f.occasion.value);
      if (f.note.value.trim()) lines.push('Note: ' + f.note.value.trim());
      lines.push('', '(Sent from your website)');
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }
})();
