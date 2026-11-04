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

  // ===== Booking: aturan layanan, kalender mini, dan permintaan WhatsApp =====
  // Jadwal ini mengikuti jam operasional pada footer, BUKAN data okupansi psikolog.
  // Atur hari libur dan slot aktual dari admin di sini atau melalui
  // window.RUANGTENANG_BOOKING_CONFIG sebelum script.js dimuat.
  // dateOverrides: { 'YYYY-MM-DD': ['09:00', '13:00'] }; [] menutup tanggal itu.
  // weeklyHours memakai nomor hari: 0 = Minggu, 1 = Senin, dst.; [] = tutup.
  var bookingConfig = Object.assign({
    timeZone: 'Asia/Jakarta',
    maxAdvanceDays: 60,
    weeklyHours: {
      0: [['08:00', '21:00']], 1: [['08:00', '21:00']],
      2: [['08:00', '21:00']], 3: [['08:00', '21:00']],
      4: [['08:00', '21:00']], 5: [['08:00', '21:00']],
      6: [['08:00', '21:00']]
    },
    closedDates: [],
    dateOverrides: {}
  }, window.RUANGTENANG_BOOKING_CONFIG || {});
  var form = document.getElementById('booking');
  var nama = document.getElementById('nama');
  var error = document.getElementById('error');
  var packageSelect = document.getElementById('paket');
  var dateInput = document.getElementById('tanggal');
  var timeInput = document.getElementById('waktu');
  var calendarDays = document.getElementById('calendarDays');
  var monthTitle = document.getElementById('calendarMonth');
  var previousMonth = document.getElementById('prevMonth');
  var nextMonth = document.getElementById('nextMonth');
  var slotList = document.getElementById('timeSlots');
  var dateLabel = document.getElementById('selectedDate');
  var continueButton = document.getElementById('continueBooking');
  var scheduleStep = document.getElementById('scheduleStep');
  var detailsStep = document.getElementById('detailsStep');
  var selectedDate = '';
  var selectedTime = '';
  var activeStep = 1;
  var fullDateFormat = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
  var monthFormat = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  var clockFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: bookingConfig.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });

  function pad(value) { return String(value).padStart(2, '0'); }
  function dateKey(date) {
    return date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate());
  }
  function fromKey(key) { return new Date(key + 'T12:00:00Z'); }
  function addDays(key, days) {
    var date = fromKey(key);
    date.setUTCDate(date.getUTCDate() + days);
    return dateKey(date);
  }
  function currentClock() {
    var parts = {};
    clockFormat.formatToParts(new Date()).forEach(function (part) { parts[part.type] = part.value; });
    return {
      date: parts.year + '-' + parts.month + '-' + parts.day,
      minutes: Number(parts.hour) * 60 + Number(parts.minute) + Number(parts.second) / 60
    };
  }
  function duration() { return packageSelect.value === 'Konseling pasangan' ? 90 : 60; }
  function minuteOf(time) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
    return Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  }
  function timeOf(minutes) { return pad(Math.floor(minutes / 60)) + ':' + pad(minutes % 60); }
  function displayTime(time) { return time.replace(':', '.'); }
  function timeRange() {
    return displayTime(selectedTime) + '–' + displayTime(timeOf(minuteOf(selectedTime) + duration())) + ' WIB';
  }
  function slotsFor(key, clock) {
    clock = clock || currentClock();
    if (key < clock.date || key > addDays(clock.date, bookingConfig.maxAdvanceDays) || bookingConfig.closedDates.includes(key)) return [];
    var hours = bookingConfig.weeklyHours[fromKey(key).getUTCDay()] || [];
    var candidates = [];
    hours.forEach(function (range) {
      for (var start = minuteOf(range[0]), end = minuteOf(range[1]); start + duration() <= end; start += duration()) {
        candidates.push(timeOf(start));
      }
    });
    if (Object.prototype.hasOwnProperty.call(bookingConfig.dateOverrides, key)) {
      // Chỉ giữ slot quản trị viên cung cấp nằm trong khung giờ và đủ thời lượng.
      candidates = bookingConfig.dateOverrides[key].filter(function (time) {
        var start = minuteOf(time);
        return hours.some(function (range) { return start >= minuteOf(range[0]) && start + duration() <= minuteOf(range[1]); });
      });
    }
    return Array.from(new Set(candidates)).sort().filter(function (time) {
      return key !== clock.date || minuteOf(time) > clock.minutes;
    });
  }

  var firstClock = currentClock();
  var viewMonth = fromKey(firstClock.date);
  viewMonth.setUTCDate(1);

  function renderCalendar(focusKey) {
    var clock = currentClock();
    var minMonth = clock.date.slice(0, 7);
    var maxMonth = addDays(clock.date, bookingConfig.maxAdvanceDays).slice(0, 7);
    var currentMonth = dateKey(viewMonth).slice(0, 7);
    // Siapkan bulan yang valid lagi bila halaman melewati tengah malam/bulan.
    if (currentMonth < minMonth || currentMonth > maxMonth) {
      viewMonth = fromKey(clock.date); viewMonth.setUTCDate(1);
      currentMonth = dateKey(viewMonth).slice(0, 7);
    }
    monthTitle.textContent = monthFormat.format(viewMonth);
    previousMonth.disabled = currentMonth <= minMonth;
    nextMonth.disabled = currentMonth >= maxMonth;
    calendarDays.replaceChildren();
    var leading = (viewMonth.getUTCDay() + 6) % 7;
    var totalDays = new Date(Date.UTC(viewMonth.getUTCFullYear(), viewMonth.getUTCMonth() + 1, 0)).getUTCDate();
    var row;
    var focusCandidate;
    for (var cell = 0; cell < Math.ceil((leading + totalDays) / 7) * 7; cell++) {
      if (cell % 7 === 0) { row = document.createElement('tr'); calendarDays.appendChild(row); }
      var td = document.createElement('td'); row.appendChild(td);
      var day = cell - leading + 1;
      if (day < 1 || day > totalDays) { td.setAttribute('aria-hidden', 'true'); continue; }
      var key = currentMonth + '-' + pad(day);
      var available = slotsFor(key, clock).length > 0;
      var button = document.createElement('button');
      button.type = 'button'; button.className = 'calendar-day';
      button.textContent = day; button.dataset.date = key;
      button.disabled = !available;
      button.setAttribute('aria-pressed', String(selectedDate === key));
      button.setAttribute('aria-label', fullDateFormat.format(fromKey(key)) + (available ? ', bisa dipilih' : ', tidak tersedia'));
      if (key === clock.date) button.setAttribute('aria-current', 'date');
      button.tabIndex = -1;
      if (available && (!focusCandidate || key === selectedDate || key === focusKey)) focusCandidate = button;
      td.appendChild(button);
    }
    if (focusCandidate) focusCandidate.tabIndex = 0;
    if (focusKey) {
      var target = calendarDays.querySelector('[data-date="' + focusKey + '"]:not(:disabled)');
      if (target) { if (focusCandidate) focusCandidate.tabIndex = -1; target.tabIndex = 0; target.focus(); }
    }
  }

  function updateSummary() {
    dateInput.value = selectedDate; timeInput.value = selectedTime;
    continueButton.disabled = !selectedDate || !selectedTime;
    document.getElementById('packageHint').textContent = packageSelect.value === 'Paket 4 sesi'
      ? 'Pilih jadwal sesi pertama. Tiga sesi berikutnya diatur bersama admin.'
      : 'Durasi sesi ' + duration() + ' menit.';
    if (selectedDate && selectedTime) {
      document.getElementById('summaryDate').textContent = fullDateFormat.format(fromKey(selectedDate));
      document.getElementById('summaryTime').textContent = timeRange();
      document.getElementById('summaryPackage').textContent = packageSelect.value;
    }
  }
  function renderSlots() {
    slotList.replaceChildren();
    dateLabel.textContent = selectedDate ? fullDateFormat.format(fromKey(selectedDate)) : 'Pilih tanggal di kalender terlebih dahulu.';
    var slots = selectedDate ? slotsFor(selectedDate) : [];
    if (!slots.includes(selectedTime)) selectedTime = '';
    if (selectedDate && !slots.length) {
      var empty = document.createElement('p'); empty.className = 'slots-empty';
      empty.textContent = 'Tidak ada jam tersedia. Silakan pilih tanggal lain.';
      slotList.appendChild(empty);
    }
    slots.forEach(function (time) {
      var button = document.createElement('button');
      button.type = 'button'; button.className = 'time-slot'; button.dataset.time = time;
      button.textContent = displayTime(time);
      button.setAttribute('aria-pressed', String(time === selectedTime));
      button.setAttribute('aria-label', displayTime(time) + ' sampai ' + displayTime(timeOf(minuteOf(time) + duration())) + ' WIB');
      slotList.appendChild(button);
    });
    updateSummary();
  }
  function setStep(step, focus) {
    activeStep = step;
    scheduleStep.hidden = step !== 1; detailsStep.hidden = step !== 2;
    var scheduleProgress = document.getElementById('progressSchedule');
    var detailsProgress = document.getElementById('progressDetails');
    scheduleProgress.classList.toggle('is-active', step === 1);
    scheduleProgress.classList.toggle('is-complete', step === 2);
    detailsProgress.classList.toggle('is-active', step === 2);
    scheduleProgress.removeAttribute('aria-current'); detailsProgress.removeAttribute('aria-current');
    (step === 1 ? scheduleProgress : detailsProgress).setAttribute('aria-current', 'step');
    if (focus) (step === 2 ? nama : continueButton).focus({ preventScroll: true });
  }
  function validateSchedule() {
    if (!selectedDate || !selectedTime || !slotsFor(selectedDate).includes(selectedTime)) {
      selectedTime = ''; renderCalendar(); renderSlots(); setStep(1, false);
      dateLabel.textContent = 'Pilih tanggal dan jam yang masih tersedia untuk melanjutkan.';
      (calendarDays.querySelector('button:not(:disabled)') || packageSelect).focus();
      return false;
    }
    return true;
  }
  function changeMonth(offset) {
    viewMonth.setUTCMonth(viewMonth.getUTCMonth() + offset);
    renderCalendar();
  }
  previousMonth.addEventListener('click', function () { changeMonth(-1); });
  nextMonth.addEventListener('click', function () { changeMonth(1); });
  calendarDays.addEventListener('click', function (event) {
    var button = event.target.closest('[data-date]');
    if (!button || button.disabled) return;
    if (!slotsFor(button.dataset.date).length) { renderCalendar(); return; }
    selectedDate = button.dataset.date; selectedTime = '';
    renderCalendar(selectedDate); renderSlots();
  });
  calendarDays.addEventListener('keydown', function (event) {
    var button = event.target.closest('[data-date]');
    if (!button) return;
    var offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    var key = button.dataset.date;
    if (Object.prototype.hasOwnProperty.call(offsets, event.key)) {
      event.preventDefault();
      key = addDays(key, offsets[event.key]);
      var clock = currentClock(), last = addDays(clock.date, bookingConfig.maxAdvanceDays);
      // Lewati tanggal nonaktif; tidak keluar dari jendela booking.
      var direction = offsets[event.key] < 0 ? -1 : 1;
      while (key >= clock.date && key <= last && !slotsFor(key, clock).length) key = addDays(key, direction);
      if (key < clock.date || key > last) return;
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      var buttons = Array.from(button.closest('tr').querySelectorAll('button:not(:disabled)'));
      key = buttons[event.key === 'Home' ? 0 : buttons.length - 1].dataset.date;
    } else { return; }
    viewMonth = fromKey(key); viewMonth.setUTCDate(1); renderCalendar(key);
  });
  slotList.addEventListener('click', function (event) {
    var button = event.target.closest('[data-time]');
    if (!button) return;
    if (!slotsFor(selectedDate).includes(button.dataset.time)) { renderCalendar(); renderSlots(); return; }
    selectedTime = button.dataset.time;
    slotList.querySelectorAll('button').forEach(function (slot) { slot.setAttribute('aria-pressed', String(slot === button)); });
    updateSummary();
  });
  packageSelect.addEventListener('change', function () { renderCalendar(); renderSlots(); });
  continueButton.addEventListener('click', function () {
    if (validateSchedule()) { updateSummary(); setStep(2, true); }
  });
  document.getElementById('backBooking').addEventListener('click', function () {
    renderCalendar(); renderSlots(); setStep(1, false); packageSelect.focus({ preventScroll: true });
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateSchedule()) return;
    if (activeStep === 1) { updateSummary(); setStep(2, true); return; }
    var name = nama.value.trim();
    if (!name) { error.hidden = false; nama.setAttribute('aria-invalid', 'true'); nama.focus(); return; }
    error.hidden = true; nama.removeAttribute('aria-invalid');
    var pesan = 'Halo ' + BRAND + ', saya ' + name + '.\n' +
      'Topik: ' + document.getElementById('topik').value + '\n' +
      'Paket: ' + packageSelect.value + '\n' +
      'Tanggal: ' + fullDateFormat.format(fromKey(selectedDate)) + '\n' +
      'Waktu: ' + timeRange() + '\n' +
      (packageSelect.value === 'Paket 4 sesi' ? 'Jadwal ini untuk sesi pertama.\n' : '') +
      'Mohon konfirmasi ketersediaan jadwal dan psikolognya, terima kasih.';
    window.open(waLink(pesan), '_blank', 'noopener,noreferrer');
  });
  nama.addEventListener('input', function () {
    if (nama.value.trim()) { error.hidden = true; nama.removeAttribute('aria-invalid'); }
  });
  document.querySelectorAll('[data-paket]').forEach(function (button) {
    button.addEventListener('click', function () {
      packageSelect.value = button.getAttribute('data-paket');
      renderCalendar(); renderSlots(); setStep(1, false);
      form.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      packageSelect.focus({ preventScroll: true });
    });
  });
  // Perbarui slot bila pengguna kembali setelah membiarkan tab terbuka.
  function refreshSchedule() {
    renderCalendar(); renderSlots();
    if (activeStep === 2 && !selectedTime) {
      setStep(1, false);
      dateLabel.textContent = 'Jadwal sebelumnya sudah tidak tersedia. Silakan pilih kembali.';
    }
  }
  window.addEventListener('focus', refreshSchedule);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refreshSchedule(); });
  renderCalendar(); renderSlots();

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