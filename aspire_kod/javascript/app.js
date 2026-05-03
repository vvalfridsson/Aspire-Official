/* =====================================================
   ASPIRE APP — DELAD JAVASCRIPT
   Används av alla HTML-sidor i appen.
   ===================================================== */


/* ─────────────────────────────────────────────────────
   FILTRERA ATLETER PÅ SPORT (sok.html)
   Klick på en sport-pill visar bara den sportens atleter.
───────────────────────────────────────────────────── */

function filterSport(klickadPill, sport) {

  /* Steg 1: Markera rätt pill som aktiv */
  var allaPills = document.querySelectorAll('.filter-pill');
  for (var i = 0; i < allaPills.length; i++) {
    allaPills[i].classList.remove('aktiv');
    allaPills[i].classList.add('inaktiv');
  }
  klickadPill.classList.add('aktiv');
  klickadPill.classList.remove('inaktiv');

  /* Steg 2: Visa/dölj atletrader baserat på sport */
  var alleRader = document.querySelectorAll('.atlet-rad');
  for (var j = 0; j < alleRader.length; j++) {
    if (sport === 'alla' || alleRader[j].dataset.sport === sport) {
      alleRader[j].style.display = 'flex';
    } else {
      alleRader[j].style.display = 'none';
    }
  }
}


/* ─────────────────────────────────────────────────────
   SÖK ATLETER I REALTID (sok.html)
   Filtrerar listan medan användaren skriver.
───────────────────────────────────────────────────── */

function sokAtleter(text) {

  /* Gör söktexten till gemener för enklare jämförelse */
  var soktext = text.toLowerCase();

  var rader = document.querySelectorAll('.atlet-rad');
  for (var i = 0; i < rader.length; i++) {

    var namn  = rader[i].querySelector('.atlet-namn').textContent.toLowerCase();
    var sport = rader[i].querySelector('.atlet-sport').textContent.toLowerCase();

    /* Visa raden om namn eller sport matchar söktexten */
    if (namn.includes(soktext) || sport.includes(soktext)) {
      rader[i].style.display = 'flex';
    } else {
      rader[i].style.display = 'none';
    }
  }
}


/* ─────────────────────────────────────────────────────
   BYTA FLIK (atletprofil.html)
   Schema / Kost / Träning
───────────────────────────────────────────────────── */

function byttFlik(klickadFlik) {

  /* Ta bort 'aktiv' från alla flikar i samma rad */
  var allaflikar = klickadFlik.closest('.flik-rad').querySelectorAll('.flik');
  for (var i = 0; i < allaflikar.length; i++) {
    allaflikar[i].classList.remove('aktiv');
  }

  /* Sätt 'aktiv' på den klickade fliken */
  klickadFlik.classList.add('aktiv');
}


/* ─────────────────────────────────────────────────────
   BYTA MÅLTIDSFLIK (kalorier.html)
   Frukost / Lunch / Middag / Mellanmål
───────────────────────────────────────────────────── */

function byttMaltid(klickad) {

  /* Ta bort 'aktiv' från alla måltidsflikar */
  var alla = klickad.closest('.maltids-flikar').querySelectorAll('.maltids-flik');
  for (var i = 0; i < alla.length; i++) {
    alla[i].classList.remove('aktiv');
    alla[i].classList.add('inaktiv');
  }

  /* Sätt 'aktiv' på den klickade */
  klickad.classList.add('aktiv');
  klickad.classList.remove('inaktiv');
}


/* ─────────────────────────────────────────────────────
   SPARA KALORI-INMATNING (kalorier.html)
   Lägger till en ny rad i "Dagens måltider".
───────────────────────────────────────────────────── */

function sparaKalorier() {

  /* Hämta värden från formuläret */
  var inmatning = document.getElementById('kalori-input');
  var kcal = inmatning.value;

  var aktivFlik = document.querySelector('.maltids-flik.aktiv');
  var maltidstyp = aktivFlik ? aktivFlik.textContent : 'Okänd';

  /* Validera att något är inmatat */
  if (!kcal || kcal <= 0) {
    alert('Ange ett giltigt kalorival!');
    return;
  }

  /* Skapa ny rad i listan */
  var lista = document.getElementById('maltider-lista');

  var nyRad = document.createElement('div');
  nyRad.className = 'maltid-post';
  nyRad.innerHTML =
    '<div class="maltid-bild">' +
      '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>' +
    '</div>' +
    '<div class="maltid-info">' +
      '<div class="maltid-namn">' + maltidstyp + '</div>' +
      '<div class="maltid-tid">' + nuvarandeTid() + '</div>' +
    '</div>' +
    '<div class="maltid-kcal">' + kcal + ' kcal</div>';

  lista.appendChild(nyRad);

  /* Nollställ inmatningsfältet */
  inmatning.value = '';
}


/* Hjälpfunktion: hämtar aktuell tid som "HH:MM" */
function nuvarandeTid() {
  var nu = new Date();
  var timmar  = String(nu.getHours()).padStart(2, '0');
  var minuter = String(nu.getMinutes()).padStart(2, '0');
  return timmar + ':' + minuter;
}


/* Visar ett felmeddelande under ett fält */
function visaFelmeddelande(elementId, meddelande) {
  var element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = meddelande;
  element.style.display = 'block';
}

/* Döljer ett felmeddelande */
function dolFelmeddelande(elementId) {
  var element = document.getElementById(elementId);
  if (element) element.style.display = 'none';
}


/* ─────────────────────────────────────────────────────
   INLOGGNING (index.html)
───────────────────────────────────────────────────── */

/* Hanterar klick på Logga in-knappen */
function hanteraInloggning() {
  var epost    = document.getElementById('inlogg-epost').value.trim();
  var losenord = document.getElementById('inlogg-losenord').value;

  dolFelmeddelande('fel-epost');
  dolFelmeddelande('fel-losenord');
  dolFelmeddelande('inlogg-fel');

  if (!epost) {
    visaFelmeddelande('fel-epost', 'E-postfältet är obligatoriskt.');
    return;
  }

  if (!losenord) {
    visaFelmeddelande('fel-losenord', 'Lösenordsfältet är obligatoriskt.');
    return;
  }

  fetch('http://127.0.0.1:8001/logga-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ epost: epost, losenord: losenord })
  })
  .then(function(svar) { return svar.json(); })
  .then(function(data) {
    if (data.detail) {
      visaFelmeddelande('inlogg-fel', data.detail);
      return;
    }
    localStorage.setItem('aspire_inloggad', JSON.stringify(data));
    window.location.href = 'hem.html';
  })
  .catch(function() {
    visaFelmeddelande('inlogg-fel', 'Kunde inte ansluta till servern.');
  });
}


/* ─────────────────────────────────────────────────────
   REGISTRERING (registrera.html)
───────────────────────────────────────────────────── */

/* Hanterar klick på Skapa konto-knappen */
function hanteraRegistrering() {
  var namn     = document.getElementById('reg-namn').value.trim();
  var epost    = document.getElementById('reg-epost').value.trim();
  var losenord = document.getElementById('reg-losenord').value;
  var bekrafta = document.getElementById('reg-bekrafta').value;

  ['fel-reg-namn','fel-reg-epost','fel-reg-losenord','fel-reg-bekrafta','reg-fel']
    .forEach(dolFelmeddelande);

  if (!namn) {
    visaFelmeddelande('fel-reg-namn', 'Namn är obligatoriskt.');
    return;
  }

  if (!epost) {
    visaFelmeddelande('fel-reg-epost', 'E-post är obligatoriskt.');
    return;
  }

  if (!losenord || losenord.length < 8) {
    visaFelmeddelande('fel-reg-losenord', 'Lösenordet måste ha minst 8 tecken.');
    return;
  }

  if (losenord !== bekrafta) {
    visaFelmeddelande('fel-reg-bekrafta', 'Lösenorden matchar inte.');
    return;
  }

  fetch('http://127.0.0.1:8001/registrera', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ namn: namn, epost: epost, losenord: losenord })
  })
  .then(function(svar) { return svar.json(); })
  .then(function(data) {
    if (data.detail) {
      visaFelmeddelande('reg-fel', data.detail);
      return;
    }
    localStorage.setItem('aspire_inloggad', JSON.stringify(data));
    window.location.href = 'hem.html';
  })
  .catch(function() {
    visaFelmeddelande('reg-fel', 'Kunde inte ansluta till servern.');
  });
}