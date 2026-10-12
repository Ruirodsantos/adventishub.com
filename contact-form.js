/* Adventis contact form — no email addresses or secrets in this file.
   SCRIPT_URL points to the Google Apps Script relay; the destination inbox
   and reCAPTCHA secret are stored server-side in Script Properties. */
(function () {
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxIvXEGahUCJ4fA7sHMdU3QAH9jbv8Csx8jUWmyoKNfZMUYkNZBtdBCgpVI7LBNseV3/exec';
  var RECAPTCHA_SITE_KEY = '__RECAPTCHA_SITE_KEY__';

  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = form.querySelector('.cf-status');
  var button = form.querySelector('.cf-submit');
  var startedAt = Date.now();
  var hasCaptcha = RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY.indexOf('__') !== 0;

  if (hasCaptcha) {
    var s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(RECAPTCHA_SITE_KEY);
    s.async = true;
    document.head.appendChild(s);
  }

  // Pre-select topic from ?topic=filipino
  var params = new URLSearchParams(location.search);
  if (params.get('topic') === 'filipino') {
    form.topic.value = 'Filipino market campaign';
    if (!form.message.value) {
      form.message.value = 'Market or country:\nObjective:\nAudience:\nApproximate budget:\nTiming:\nServices needed:\nCompany and website:\n';
    }
  }

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = 'cf-status' + (kind ? ' is-' + kind : '');
  }

  function fieldError(el, bad) {
    el.setAttribute('aria-invalid', bad ? 'true' : 'false');
    el.closest('.cf-field').classList.toggle('has-error', !!bad);
  }

  function validate() {
    var ok = true;
    var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
    fieldError(form.name, name.length < 2); if (name.length < 2) ok = false;
    var emailOk = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i.test(email);
    fieldError(form.email, !emailOk); if (!emailOk) ok = false;
    fieldError(form.message, msg.length < 10); if (msg.length < 10) ok = false;
    return ok;
  }

  function getToken() {
    if (!hasCaptcha) return Promise.resolve('');
    return new Promise(function (resolve, reject) {
      var tries = 0;
      (function wait() {
        if (window.grecaptcha && grecaptcha.ready) {
          grecaptcha.ready(function () {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact' }).then(resolve, reject);
          });
        } else if (++tries > 50) {
          reject(new Error('captcha'));
        } else {
          setTimeout(wait, 100);
        }
      })();
    });
  }

  var MESSAGES = {
    validation: 'Please check the highlighted fields and try again.',
    spam: 'We couldn’t verify your submission. Please refresh the page and try again.',
    rate: 'We’ve received a lot of messages just now. Please try again in an hour.',
    server: 'Something went wrong on our side. Please try again in a few minutes.',
    network: 'We couldn’t reach our server. Check your connection and try again.'
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) { setStatus(MESSAGES.validation, 'error'); return; }
    button.disabled = true;
    setStatus('Sending…', 'pending');

    getToken().then(function (token) {
      var payload = {
        name: form.name.value, email: form.email.value, company: form.company.value,
        topic: form.topic.value, message: form.message.value,
        website: form.website.value, ts: startedAt, token: token
      };
      return fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight
        body: JSON.stringify(payload),
        redirect: 'follow'
      });
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res && res.ok) {
        form.reset();
        form.querySelectorAll('.has-error').forEach(function (el) { el.classList.remove('has-error'); });
        setStatus('Thank you — your message has been sent. We typically reply within 1 working day.', 'success');
        if (window.gtag) gtag('event', 'generate_lead', { form: 'contact' });
      } else {
        if (res && res.fields) res.fields.forEach(function (f) { if (form[f]) fieldError(form[f], true); });
        setStatus(MESSAGES[(res && res.error) || 'server'] || MESSAGES.server, 'error');
      }
    }).catch(function () {
      setStatus(MESSAGES.network, 'error');
    }).then(function () {
      button.disabled = false;
    });
  });
})();
