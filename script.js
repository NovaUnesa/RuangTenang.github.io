(function () {
  'use strict';

  // ===== Pengaturan: ganti sesuai kebutuhan =====
  var WA_NUMBER = '6282135888462'; // format internasional tanpa + atau 0 di depan
  var BRAND = 'RuangTenang';

  function waLink(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  // Tahun di footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Tombol WhatsApp melayang
  document.getElementById('waFloat').href = waLink('Halo ' + BRAND + ', saya ingin bertanya tentang konsultasi psikolog online.');

  // ===== Header: bayangan saat scroll =====
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Menu mobile =====
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  // ===== Form booking -> WhatsApp =====
  var form = document.getElementById('booking');
  var nama = document.getElementById('nama');
  var error = document.getElementById('error');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nama.value.trim();
    if (!name) {
      form.classList.add('invalid');
      error.hidden = false;
      nama.focus();
      return;
    }
    form.classList.remove('invalid');
    error.hidden = true;

    var pesan =
      'Halo ' + BRAND + ', saya ' + name + '.\n' +
      'Topik: ' + form.topik.value + '\n' +
      'Paket: ' + form.paket.value + '\n' +
      'Waktu: ' + form.waktu.value + '\n' +
      'Mohon dibantu jadwalnya, terima kasih.';
    window.open(waLink(pesan), '_blank', 'noopener');
  });

  nama.addEventListener('input', function () {
    if (nama.value.trim()) {
      form.classList.remove('invalid');
      error.hidden = true;
    }
  });

  // ===== Tombol "Pilih paket" mengisi form =====
  document.querySelectorAll('[data-paket]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      form.paket.value = btn.getAttribute('data-paket');
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'center' });
      nama.focus({ preventScroll: true });
    });
  });

  // ===== FAQ accordion =====
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var willOpen = !item.classList.contains('open');
      items.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ===== Hitung angka statistik saat terlihat =====
  var counters = document.querySelectorAll('[data-count]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function format(n) {
    return n.toLocaleString('id-ID');
  }
  function run(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = format(target) + suffix; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(run);
  }
})();