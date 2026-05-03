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
