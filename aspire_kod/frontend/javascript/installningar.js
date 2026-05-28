 
/* ═══════════════════════════════════════════════════════
   INSTÄLLNINGAR — JAVASCRIPT
═══════════════════════════════════════════════════════ */
 
let aktivtFalt = null;
 
/* ── LADDA ANVÄNDARINFO VID SIDLADDNING ── */
window.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
 
  // Fyll i avatar och basinfo direkt från localStorage
  fyllInInfo(user);
 
  // Hämta och fyll med data från backend (inkl. kroppsdata)
  try {
    const [anvRes, kroppRes] = await Promise.allSettled([
      fetch(`${ASPIRE_API_BASE_URL}/anvandare/${user.id}`),
      fetch(`${ASPIRE_API_BASE_URL}/anvandare/${user.id}/kropp`)
    ]);
 
    if (anvRes.status === 'fulfilled' && anvRes.value.ok) {
      const anv = await anvRes.value.json();
      // Uppdatera localStorage med senaste data
      const uppdaterad = { ...user, namn: anv.namn, epost: anv.epost };
      localStorage.setItem('aspire_inloggad', JSON.stringify(uppdaterad));
      fyllInInfo(anv);
    }
 
    if (kroppRes.status === 'fulfilled' && kroppRes.value.ok) {
      const kropp = await kroppRes.value.json();
      if (kropp.langd) document.getElementById('langd-input').value = kropp.langd;
      if (kropp.vikt)  document.getElementById('vikt-input').value  = kropp.vikt;
      if (kropp.langd && kropp.vikt) raknaUtBmi();
    }
  } catch (e) {
    console.warn('Kunde inte hämta data från backend:', e);
  }
});
 
function fyllInInfo(data) {
  const namn = data.namn || '';
  const epost = data.epost || '';
 
  document.getElementById('stor-avatar').textContent = namn.substring(0, 2).toUpperCase() || '??';
  document.getElementById('vis-namn').textContent = namn;
  document.getElementById('vis-epost').textContent = epost;
  document.getElementById('vis-namn-rad').textContent = namn || '—';
  document.getElementById('vis-epost-rad').textContent = epost || '—';
}
 
/* ── BMI RÄKNARE ── */
function raknaUtBmi() {
  const langd  = parseFloat(document.getElementById('langd-input').value);
  const vikt   = parseFloat(document.getElementById('vikt-input').value);
  const knapp  = document.getElementById('spara-bmi-knapp');
 
  if (!langd || !vikt || langd < 50 || langd > 250 || vikt < 20 || vikt > 300) {
    document.getElementById('bmi-siffra').textContent   = '—';
    document.getElementById('bmi-kategori').textContent = 'Fyll i längd & vikt';
    document.getElementById('bmi-kategori').style.color = '#ADADAD';
    document.getElementById('bmi-pil').style.opacity   = '0';
    knapp.disabled = true;
    return;
  }
 
  const bmi = vikt / ((langd / 100) ** 2);
  const avrundad = bmi.toFixed(1);
 
  document.getElementById('bmi-siffra').textContent = avrundad;
 
  // Kategori och färg
  let kategori, farg, pilPos;
  if (bmi < 18.5) {
    kategori = '🔵 Undervikt';
    farg     = '#3B82F6';
    pilPos   = Math.max(2, ((bmi - 10) / 8.5) * 28);
  } else if (bmi < 25) {
    kategori = '🟢 Normalvikt';
    farg     = '#22C55E';
    pilPos   = 28 + ((bmi - 18.5) / 6.5) * 35;
  } else if (bmi < 30) {
    kategori = '🟡 Övervikt';
    farg     = '#F59E0B';
    pilPos   = 63 + ((bmi - 25) / 5) * 22;
  } else {
    kategori = '🔴 Fetma';
    farg     = '#EF4444';
    pilPos   = Math.min(96, 85 + ((bmi - 30) / 10) * 11);
  }
 
  document.getElementById('bmi-kategori').textContent = kategori;
  document.getElementById('bmi-kategori').style.color  = farg;
 
  const pil = document.getElementById('bmi-pil');
  pil.style.left    = `${pilPos}%`;
  pil.style.opacity = '1';
  pil.style.borderColor = farg;
 
  knapp.disabled = false;
}
 
/* ── SPARA KROPPSDATA TILL BACKEND ── */
async function sparaKroppsdata() {
  const user   = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) return;
 
  const langd = parseFloat(document.getElementById('langd-input').value);
  const vikt  = parseFloat(document.getElementById('vikt-input').value);
  const knapp = document.getElementById('spara-bmi-knapp');
 
  knapp.disabled = true;
  knapp.innerHTML = '<span class="laddnings-spinner"></span> Sparar…';
 
  try {
    const svar = await fetch(`${ASPIRE_API_BASE_URL}/anvandare/${user.id}/kropp`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' , 'X-Anvandare-Id': user.id},
      body: JSON.stringify({ langd, vikt })
    });
 
    if (!svar.ok) throw new Error('Serverfel');
 
    visaToast('✓ Kroppsdata sparad!');
  } catch {
    visaToast('Kunde inte spara till servern.');
  } finally {
    knapp.disabled = false;
    knapp.textContent = 'Spara kroppsdata';
  }
}
 
/* ══ MODAL ══ */
 
const MODAL_KONFIGURATION = {
  namn: {
    titel: 'Ändra namn',
    falt: [
      { id: 'nytt-namn', etikett: 'Nytt namn', typ: 'text', placeholder: 'Ditt namn', required: true }
    ],
    forVal: () => {
      const v = document.getElementById('vis-namn-rad').textContent;
      return { 'nytt-namn': v === '—' ? '' : v };
    }
  },
  epost: {
    titel: 'Ändra e-postadress',
    falt: [
      { id: 'nytt-epost', etikett: 'Ny e-postadress', typ: 'email', placeholder: 'namn@exempel.se', required: true }
    ],
    forVal: () => {
      const v = document.getElementById('vis-epost-rad').textContent;
      return { 'nytt-epost': v === '—' ? '' : v };
    }
  },
  losenord: {
    titel: 'Ändra lösenord',
    falt: [
      { id: 'nuv-losenord',  etikett: 'Nuvarande lösenord',   typ: 'password', placeholder: '••••••••', required: true },
      { id: 'nytt-losenord', etikett: 'Nytt lösenord (min. 8 tecken)', typ: 'password', placeholder: '••••••••', required: true },
      { id: 'bek-losenord',  etikett: 'Bekräfta nytt lösenord', typ: 'password', placeholder: '••••••••', required: true }
    ],
    forVal: () => ({})
  }
};
 
function oppnaModal(falt) {
  aktivtFalt = falt;
  const konf  = MODAL_KONFIGURATION[falt];
  const forval = konf.forVal();
 
  document.getElementById('modal-titel').textContent = konf.titel;
  document.getElementById('modal-fel').style.display = 'none';
 
  const innehall = konf.falt.map(f => `
    <div class="modal-falt">
      <label for="${f.id}">${f.etikett}</label>
      <input id="${f.id}" type="${f.typ}" placeholder="${f.placeholder}"
             value="${forval[f.id] || ''}" autocomplete="off">
    </div>
  `).join('');
 
  document.getElementById('modal-innehall').innerHTML = innehall;
  document.getElementById('modal-spara-knapp').disabled = false;
  document.getElementById('modal-overlay').classList.add('oppen');
 
  // Fokusera första fältet
  setTimeout(() => {
    const forsta = document.querySelector('.modal-falt input');
    if (forsta) forsta.focus();
  }, 300);
}
 
function stangModal(event) {
  if (event && event.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.remove('oppen');
  aktivtFalt = null;
}
 
async function sparaModal() {
  if (!aktivtFalt) return;
 
  const user   = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) return;
 
  const felDiv = document.getElementById('modal-fel');
  const knapp  = document.getElementById('modal-spara-knapp');
  felDiv.style.display = 'none';
  knapp.disabled = true;
  knapp.innerHTML = '<span class="laddnings-spinner"></span> Sparar…';
 
  try {
    let kropp = {};
 
    if (aktivtFalt === 'namn') {
      const nyttNamn = document.getElementById('nytt-namn').value.trim();
      if (!nyttNamn) { visaModalFel('Namn kan inte vara tomt.'); return; }
      kropp = { namn: nyttNamn };
 
    } else if (aktivtFalt === 'epost') {
      const nyttEpost = document.getElementById('nytt-epost').value.trim();
      if (!nyttEpost || !nyttEpost.includes('@')) { visaModalFel('Ange en giltig e-postadress.'); return; }
      kropp = { epost: nyttEpost };
 
    } else if (aktivtFalt === 'losenord') {
      const nuvLos  = document.getElementById('nuv-losenord').value;
      const nyttLos = document.getElementById('nytt-losenord').value;
      const bekLos  = document.getElementById('bek-losenord').value;
 
      if (!nuvLos)             { visaModalFel('Ange ditt nuvarande lösenord.'); return; }
      if (nyttLos.length < 8)  { visaModalFel('Nytt lösenord måste ha minst 8 tecken.'); return; }
      if (nyttLos !== bekLos)  { visaModalFel('Lösenorden matchar inte.'); return; }
 
      kropp = { nuvarande_losenord: nuvLos, nytt_losenord: nyttLos };
    }
 
    const svar = await fetch(`${ASPIRE_API_BASE_URL}/anvandare/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kropp)
    });
 
    const data = await svar.json();
 
    if (!svar.ok) {
      visaModalFel(data.detail || 'Något gick fel.');
      return;
    }
 
    // Uppdatera localStorage och visningsinfo
    const uppdaterad = { ...user };
    if (kropp.namn)  uppdaterad.namn  = kropp.namn;
    if (kropp.epost) uppdaterad.epost = kropp.epost;
    localStorage.setItem('aspire_inloggad', JSON.stringify(uppdaterad));
 
    fyllInInfo(uppdaterad);
 
    document.getElementById('modal-overlay').classList.remove('oppen');
    visaToast('✓ Ändring sparad!');
 
  } catch {
    visaModalFel('Kunde inte ansluta till servern.');
  } finally {
    knapp.disabled = false;
    knapp.textContent = 'Spara';
  }
}
 
function visaModalFel(meddelande) {
  const felDiv = document.getElementById('modal-fel');
  felDiv.textContent = meddelande;
  felDiv.style.display = 'block';
  const knapp = document.getElementById('modal-spara-knapp');
  knapp.disabled = false;
  knapp.textContent = 'Spara';
}
 
/* ── TOAST ── */
let toastTimeout = null;
function visaToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('synlig');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('synlig'), 2500);
}
 
/* ── LOGGA UT ── */
function loggarUt() {
  if (!confirm('Vill du verkligen logga ut?')) return;
  ['aspire_inloggad', 'anvandare', 'user', 'aspire_alla_atleter'].forEach(k => localStorage.removeItem(k));
  window.location.href = 'index.html';
}

/* ── RADERA KONTO (K-SEC-1.1) ── */
function raderaKonto() {
  if (!confirm('Är du säker på att du vill radera ditt konto? All data tas bort permanent och kan inte återställas.')) return;
  var anvandare = JSON.parse(localStorage.getItem('aspire_inloggad') || 'null');
  if (!anvandare || !anvandare.id) {
    alert('Kunde inte hitta kontoinformation.');
    return;
  }
  fetch(ASPIRE_API_BASE_URL + '/anvandare/' + anvandare.id, {
    method: 'DELETE',
    headers: { 'X-Anvandare-Id': anvandare.id }
  })
  .then(function(svar) { return svar.json(); })
  .then(function() {
    ['aspire_inloggad', 'anvandare', 'user', 'aspire_alla_atleter'].forEach(function(k) {
      localStorage.removeItem(k);
    });
    window.location.href = 'index.html';
  })
  .catch(function() {
    alert('Något gick fel. Försök igen.');
  });
}

document.addEventListener('DOMContentLoaded', function () {

  // BMI-inputs
  const langdInput = document.getElementById('langd-input');
  const viktInput = document.getElementById('vikt-input');
  if (langdInput) langdInput.addEventListener('input', raknaUtBmi);
  if (viktInput) viktInput.addEventListener('input', raknaUtBmi);

  // Spara kroppsdata
  const sparaBmiKnapp = document.getElementById('spara-bmi-knapp');
  if (sparaBmiKnapp) sparaBmiKnapp.addEventListener('click', sparaKroppsdata);

  // Öppna modaler
  const namnKnapp = document.querySelector('[title="Ändra namn"]');
  const epostKnapp = document.querySelector('[title="Ändra e-post"]');
  const losenordKnapp = document.querySelector('[title="Ändra lösenord"]');
  if (namnKnapp) namnKnapp.addEventListener('click', () => oppnaModal('namn'));
  if (epostKnapp) epostKnapp.addEventListener('click', () => oppnaModal('epost'));
  if (losenordKnapp) losenordKnapp.addEventListener('click', () => oppnaModal('losenord'));

  // Modal-knappar
  const avbrytKnapp = document.querySelector('.modal-avbryt');
  const sparaKnapp = document.getElementById('modal-spara-knapp');
  if (avbrytKnapp) avbrytKnapp.addEventListener('click', () => stangModal(null));
  if (sparaKnapp) sparaKnapp.addEventListener('click', sparaModal);

  // Logga ut / radera
  const loggaUtKnapp = document.querySelector('.logga-ut-knapp');
  const raderaKnapp = document.querySelector('.radera-konto-knapp');
  if (loggaUtKnapp) loggaUtKnapp.addEventListener('click', loggarUt);
  if (raderaKnapp) raderaKnapp.addEventListener('click', raderaKonto);

});