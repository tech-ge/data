(function () {
  'use strict';
  var DRAFT_KEY = 'techgeo_draft_id';
  var draftId = localStorage.getItem(DRAFT_KEY);
  if (!draftId || !/^[0-9a-f-]{36}$/i.test(draftId)) {
    draftId = crypto.randomUUID();
    localStorage.setItem(DRAFT_KEY, draftId);
  }
  var DEADLINE = new Date('2026-11-04T23:59:59+03:00').getTime();
  var form = document.getElementById('regForm');
  var submitBtn = document.getElementById('submitBtn');
  var alertBox = document.getElementById('alertBox');
  var countdownEl = document.getElementById('countdown');
  var countrySearch = document.getElementById('countrySearch');
  var countryList = document.getElementById('countryList');
  var flagPreview = document.getElementById('flagPreview');
  var countryCode = document.getElementById('countryCode');
  var countryName = document.getElementById('countryName');
  var phoneCode = document.getElementById('phoneCode');
  var phoneNumber = document.getElementById('phoneNumber');
  var studyLevel = document.getElementById('studyLevel');
  var fieldGroup = document.getElementById('fieldGroup');
  var courseGroup = document.getElementById('courseGroup');
  var agreed = document.getElementById('agreedToTerms');
  var COUNTRIES = [];
  var submitting = false;
  var closed = false;

  fetch('/data/countries.json').then(function(r){return r.json();}).then(function(l){COUNTRIES = l || [];}).catch(function(){});

  function tick() {
    var diff = DEADLINE - Date.now();
    if (diff <= 0) {
      countdownEl.textContent = 'Submission window has closed.';
      closed = true;
      var els = form.querySelectorAll('input,select,button');
      for (var i=0;i<els.length;i++) els[i].disabled = true;
      return;
    }
    var s = Math.floor(diff/1000);
    var d = Math.floor(s/86400);
    var h = Math.floor((s%86400)/3600);
    var m = Math.floor((s%3600)/60);
    var sec = s%60;
    countdownEl.textContent = 'Time left to submit: ' + d + 'd ' + h + 'h ' + m + 'm ' + sec + 's';
  }
  tick();
  setInterval(tick, 1000);

  function renderCountries(filter) {
    filter = filter || '';
    var q = filter.trim().toLowerCase();
    var list = COUNTRIES.filter(function(c){ return !q || c.name.toLowerCase().indexOf(q) !== -1 || c.dial.indexOf(q) !== -1; }).slice(0,60);
    var html = '';
    for (var i=0;i<list.length;i++) {
      var c = list[i];
      html += '<div class="country-item" data-code="' + c.code + '" data-name="' + c.name + '" data-dial="' + c.dial + '" data-currency="' + c.currency + '">' +
        '<span class="fi fi-' + c.code.toLowerCase() + '"></span>' +
        '<span>' + c.name + '</span>' +
        '<span class="dial">' + c.dial + '</span></div>';
    }
    countryList.innerHTML = html;
    countryList.classList.add('open');
  }
  countrySearch.addEventListener('focus', function(){ renderCountries(countrySearch.value); });
  countrySearch.addEventListener('input', function(){ renderCountries(countrySearch.value); });
  countryList.addEventListener('click', function(e){
    var item = e.target.closest('.country-item');
    if (!item) return;
    selectCountry(item.dataset);
    queueSave();
  });
  document.addEventListener('click', function(e){
    if (!e.target.closest('.country-select')) countryList.classList.remove('open');
  });

  function selectCountry(d) {
    countryCode.value = d.code;
    countryName.value = d.name;
    countrySearch.value = d.name;
    flagPreview.className = 'flag-preview fi fi-' + d.code.toLowerCase();
    phoneCode.value = d.dial;
    countryList.classList.remove('open');
    if (typeof getLocalFee === 'function') getLocalFee(d.currency);
  }

  phoneNumber.addEventListener('input', function(){
    var val = phoneNumber.value.trim();
    if (val.charAt(0) !== '+') return;
    var sorted = COUNTRIES.slice().sort(function(a,b){ return b.dial.length - a.dial.length; });
    for (var i=0;i<sorted.length;i++) {
      if (val.indexOf(sorted[i].dial) === 0) {
        selectCountry({ code: sorted[i].code, name: sorted[i].name, dial: sorted[i].dial, currency: sorted[i].currency });
        phoneNumber.value = val.slice(sorted[i].dial.length);
        return;
      }
    }
  });

  studyLevel.addEventListener('change', function(){
    var v = studyLevel.value;
    fieldGroup.style.display = v === 'continuing' ? 'block' : 'none';
    courseGroup.style.display = v === 'graduate' ? 'block' : 'none';
    queueSave();
  });
  agreed.addEventListener('change', function(){ updateSubmitState(); queueSave(); });

  function isFormComplete() {
    if (closed) return false;
    if (!form.fullName.value.trim()) return false;
    if (!countryCode.value) return false;
    if (!form.idNumber.value.trim()) return false;
    if (!form.email.value.trim()) return false;
    if (!phoneNumber.value.trim()) return false;
    if (!studyLevel.value) return false;
    if (studyLevel.value === 'continuing' && !form.fieldOfStudy.value.trim()) return false;
    if (studyLevel.value === 'graduate' && !form.completedCourse.value.trim()) return false;
    if (!form.guardianName.value.trim()) return false;
    if (!form.guardianPhone.value.trim()) return false;
    if (!agreed.checked) return false;
    return true;
  }
  function updateSubmitState() { submitBtn.disabled = !isFormComplete() || submitting; }

  form.addEventListener('input', function(){ updateSubmitState(); queueSave(); });
  form.addEventListener('change', function(){ updateSubmitState(); queueSave(); });

  function showAlert(msg, kind) {
    alertBox.textContent = msg;
    alertBox.className = 'alert ' + (kind||'error') + ' show';
    alertBox.scrollIntoView({ behavior:'smooth', block:'center' });
  }
  function hideAlert() { alertBox.className = 'alert'; alertBox.textContent = ''; }

  var saveTimer = null;
  function queueSave() {
    if (closed) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 900);
  }
  function collect() {
    return {
      fullName: form.fullName.value.trim(),
      country: countryCode.value,
      countryName: countryName.value,
      idNumber: form.idNumber.value.trim(),
      email: form.email.value.trim(),
      phone: phoneCode.value + phoneNumber.value.replace(/^0+/, '').trim(),
      studyLevel: studyLevel.value,
      fieldOfStudy: form.fieldOfStudy.value.trim(),
      completedCourse: form.completedCourse.value.trim(),
      guardianName: form.guardianName.value.trim(),
      guardianPhone: form.guardianPhone.value.trim(),
      agreedToTerms: agreed.checked,
      localFee: document.getElementById('localFeeInput').value
    };
  }
  async function saveDraft() {
    if (closed) return;
    var payload = collect();
    payload.draftId = draftId;
    try {
      await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
  }
  async function loadDraft() {
    try {
      var r = await fetch('/api/draft?id=' + draftId);
      var data = await r.json();
      if (!data.ok || !data.draft) return;
      var d = data.draft;
      if (d.fullName) form.fullName.value = d.fullName;
      if (d.idNumber) form.idNumber.value = d.idNumber;
      if (d.email) form.email.value = d.email;
      if (d.guardianName) form.guardianName.value = d.guardianName;
      if (d.guardianPhone) form.guardianPhone.value = d.guardianPhone;
      if (d.country && d.countryName) {
        flagPreview.className = 'flag-preview fi fi-' + d.country.toLowerCase();
        countryCode.value = d.country;
        countryName.value = d.countryName;
        countrySearch.value = d.countryName;
      }
      if (d.phone) {
        var c = null;
        for (var i=0;i<COUNTRIES.length;i++) {
          if (d.phone.indexOf(COUNTRIES[i].dial) === 0) { c = COUNTRIES[i]; break; }
        }
        if (c) {
          phoneCode.value = c.dial;
          phoneNumber.value = d.phone.slice(c.dial.length);
          if (!countryCode.value) {
            flagPreview.className = 'flag-preview fi fi-' + c.code.toLowerCase();
            countryCode.value = c.code;
            countryName.value = c.name;
            countrySearch.value = c.name;
            if (typeof getLocalFee === 'function') getLocalFee(c.currency);
          }
        } else {
          phoneNumber.value = d.phone;
        }
      }
      if (d.studyLevel) {
        studyLevel.value = d.studyLevel;
        studyLevel.dispatchEvent(new Event('change'));
      }
      if (d.fieldOfStudy) form.fieldOfStudy.value = d.fieldOfStudy;
      if (d.completedCourse) form.completedCourse.value = d.completedCourse;
      if (d.agreedToTerms) agreed.checked = true;
      if (d.localFee) document.getElementById('localFeeInput').value = d.localFee;
      updateSubmitState();
    } catch (e) {}
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if (closed || submitting) return;
    hideAlert();
    if (!isFormComplete()) { showAlert('Please fill all required fields correctly.', 'error'); return; }
    submitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    try {
      var payload = collect();
      payload.draftId = draftId;
      var r = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = await r.json().catch(function(){return {};});
      if (!r.ok || !data.ok) {
        showAlert(data.message || 'Submission failed. Please try again.', 'error');
        submitting = false;
        submitBtn.textContent = 'Submit Application';
        updateSubmitState();
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      window.location.href = data.redirect || '/thank-you';
    } catch (err) {
      showAlert('Network error. Please check your connection.', 'error');
      submitting = false;
      submitBtn.textContent = 'Submit Application';
      updateSubmitState();
    }
  });

  loadDraft().then(function(){ updateSubmitState(); queueSave(); });
})();
