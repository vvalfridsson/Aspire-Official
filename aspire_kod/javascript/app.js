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
    body: JSON.stringify({
    epost: epost,
    losenord: losenord
})
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

function loggarUt() {
  localStorage.removeItem("aspire_inloggad");
  localStorage.removeItem("anvandare");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function startaVakna(button) {
  if (!button) return;
  button.textContent = "Aktivitet startad";
  button.disabled = true;
}


/*funktionen visar klockan istället för en placeholder*/

function uppdateraStatusradKlocka() {

  var tidElement = document.querySelector('.statusrad-tid');

  if (!tidElement) {
    return;
  }

  var nu = new Date();

  var timmar = nu.getHours();
  var minuter = nu.getMinutes();

  /*lägg till ledande nolla på minuter*/
  if (minuter < 10) {
    minuter = '0' + minuter;
  }

  tidElement.textContent = timmar + ':' + minuter;
}

/*startar om och kör direkt när programmet startas om*/
uppdateraStatusradKlocka();

/*uppdatera varje sekund*/
setInterval(uppdateraStatusradKlocka, 1000);

async function hamtaNotiser() { /*funktion som hämtar notiser som är kopplade till användarens id genom localstorage*/
  const anvandareId = localStorage.getItem("anvandare_id");
  if (!anvandareId) return;

  const res = await fetch(`http://127.0.0.1:8001/notiser/${anvandareId}`); /*koppla upp sig till sidan och fetcha värdet*/
  const data = await res.json();

  const badge = document.getElementById("notis-badge");
  if (!badge) return;

  if (data.antal > 0) { /*om värdet är större än 0 ska det visas i navigationsbaren och visa antalet*/
    badge.textContent = data.antal;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none"; /*annars ska den inte visa något*/
  }
}

document.addEventListener("DOMContentLoaded", hamtaNotiser); /*när DOM är fylld ska den visa notiserna*/

async function hamtaProfil() { // funktionen hämtar all profilinformation från backend och fyller profilsidans mall
//hämtar användarens id som sparades vid inloggningen, det används för att veta vilken användare som datan ska hömats från
  const anvandareId = localStorage.getItem("anvandare_id");
  if (!anvandareId) return; //om det inte finns ett id, dvs ingen är inloggad så avbryts funktioenn

  const res = await fetch(`http://127.0.0.1:8001/profil/${anvandareId}`); //förfrågan skickas till API:et för att hämta användarens profildata
  const data = await res.json(); //gör om json texten till ett javascript objekt

  //Profilinfo
  document.getElementById("profil-namn").textContent = data.namn; //användarens namn
  document.getElementById("profil-medsedan").textContent = "Medlem sedan " + data.medsedan; //hämtar datumet som kontot registrerades och kopplar det till det id som sköter den rubriken
  document.getElementById("profil-bild").src = data.bild; //sätter profilbildens källa som bilden som finns i databasen (om det finns en)

  //Statistik
  document.getElementById("profil-streak").textContent = data.streak; //visar den inloggade personens streak
  document.getElementById("profil-utmaningar").textContent = data.utmaningar; //visar antalet startade utmaningar
  document.getElementById("profil-genomfort").textContent = data.genomfort + "%"; //visar hur många procent av de totala aktiviteterna som slutförts

  //Aktiv utmaning
  document.getElementById("aktiv-titel").textContent = data.aktiv.titel; //visar den aktivitet som är igpng just nu
  document.getElementById("aktiv-dag").textContent = `Dag ${data.aktiv.dag} av ${data.aktiv.total}`; //visar vilken dag i utmaningen användaren är på
  document.getElementById("aktiv-progress").style.width = data.aktiv.procent + "%"; //fyler progressbaren baserat på procenten
  document.getElementById("aktiv-procent").textContent = data.aktiv.procent + "%"; //visar procentvärdet som text bredvid baren

  // Veckostatistik
  document.getElementById("vecka-traning").textContent = data.vecka.traning; //visar hur många träningspass som gjorts denna veckan
  document.getElementById("vecka-kalorier").textContent = data.vecka.kalorier; //visar antalet brända kalorier 
  document.getElementById("vecka-forbattring").textContent = data.vecka.forbattring;//jämför förbättringen i procent jämfört med förra veckan.
}
//när sidan laddas klart körs funktionen automatiskt
document.addEventListener("DOMContentLoaded", hamtaProfil);

/* =====================================================
   HÄMTA ATLETER FRÅN DATABASEN TILL SÖK-SIDAN
   ===================================================== */

var ASPIRE_API_BASE_URL = "http://127.0.0.1:8001";

function skapaInitialerFranNamn(namn) {
  if (!namn) return "?";

  var delar = namn.trim().split(" ");

  if (delar.length === 1) {
    return delar[0].substring(0, 2).toUpperCase();
  }

  return (delar[0][0] + delar[delar.length - 1][0]).toUpperCase();
}

function skapaAtletRadFranDatabas(atlet) {
  var id = atlet.id;
  var namn = atlet.namn || "Okänd atlet";
  var sport = atlet.sport || "Okänd sport";
  var initialer = atlet.initialer || skapaInitialerFranNamn(namn);

  var kalorier = atlet.kcal_per_dag
    ? atlet.kcal_per_dag + " kcal/dag"
    : "Kalorier saknas";

  var traning = atlet.traningstid_timmar
    ? atlet.traningstid_timmar + "h träning"
    : "Träning saknas";

  return `
    <a href="atletprofil.html?id=${id}" class="atlet-rad" data-atlet-id="${id}" data-sport="${sport}">
      <div class="atlet-avatar">${initialer}</div>

      <div class="atlet-info">
        <div class="atlet-namn">${namn}</div>
        <div class="atlet-sport">${sport}</div>
      </div>

      <div class="atlet-meta">
        <div class="atlet-kcal">${kalorier}</div>
        <div class="atlet-traning">${traning}</div>
      </div>
    </a>
  `;
}

async function laddaAtleterFranDatabasTillSok() {
  var filnamn = window.location.pathname.split("/").pop();

  if (filnamn !== "sok.html") return;

  var lista = document.getElementById("atletlista");
  if (!lista) return;

  lista.innerHTML = `
    <div style="padding:20px; color:#777; font-size:14px;">
      Laddar atleter från databasen...
    </div>
  `;

  try {
    var svar = await fetch(ASPIRE_API_BASE_URL + "/atleter");

    if (!svar.ok) {
      throw new Error("Backend svarade inte korrekt.");
    }

    var atleter = await svar.json();

    if (!atleter || atleter.length === 0) {
      lista.innerHTML = `
        <div style="padding:20px; color:#777; font-size:14px;">
          Inga atleter hittades i databasen.
        </div>
      `;
      return;
    }

    lista.innerHTML = atleter.map(skapaAtletRadFranDatabas).join("");

  } catch (error) {
    console.error("Kunde inte hämta atleter:", error);

    lista.innerHTML = `
      <div style="padding:20px; color:red; font-size:14px;">
        Kunde inte hämta atleter från databasen. Kontrollera att backend körs på port 8001.
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", laddaAtleterFranDatabasTillSok);
window.addEventListener("pageshow", laddaAtleterFranDatabasTillSok);