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
  
  // HÄR LÄGGER VI TILL KRYSSKNAPPEN LÄNGST NER I HTML-STRÄNGEN
  nyRad.innerHTML =
    '<div class="maltid-bild">' +
      '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>' +
    '</div>' +
    '<div class="maltid-info">' +
      '<div class="maltid-namn">' + maltidstyp + '</div>' +
      '<div class="maltid-tid">' + nuvarandeTid() + '</div>' +
    '</div>' +
    '<div class="maltid-kcal">' + kcal + ' kcal</div>' +
    '<button class="ta-bort-knapp" onclick="taBortMaltid(this)">' +
      '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button>';

  lista.appendChild(nyRad);

  /* Nollställ inmatningsfältet */
  inmatning.value = '';

  /* HÄR: Uppdatera ringen och totalen! */
  uppdateraKalorier();
}

/* ─────────────────────────────────────────────────────
   TA BORT MÅLTID
   Letar upp måltiden man klickade på och raderar den.
───────────────────────────────────────────────────── */
function taBortMaltid(knapp) {
  // .closest() letar upp den närmaste föräldern med klassen 'maltid-post'
  var radAttTaBort = knapp.closest('.maltid-post');
  
  if (radAttTaBort) {
    radAttTaBort.remove(); // Raderar HTML-elementet från sidan

    /* HÄR: Uppdatera ringen och totalen när en måltid tagits bort! */
    uppdateraKalorier();
  }
}

/* ─────────────────────────────────────────────────────
   UPPDATERA KALORIER OCH CIRKEL
   Summerar alla inlagda måltider och uppdaterar UI:t
───────────────────────────────────────────────────── */
const DAGLIGT_MAL = 2500; // Ändra dagsmålet för kalorier här

function uppdateraKalorier() {
  // Inlagda kalorier i listan
  var allaMaltider = document.querySelectorAll('.maltid-kcal');
  var totalKcal = 0;
  
  // Loopar och adderar alla siffror ihop
  for (var i = 0; i < allaMaltider.length; i++) {
    var text = allaMaltider[i].textContent;
    // Plocka ut bara siffran från strängen (t.ex. "650 kcal" -> 650)
    var siffra = parseInt(text.replace(/\D/g, '')) || 0;
    totalKcal += siffra;
  }

  // Sedan uppdaterar denna stora siffran med "Dagens intag"
  var totalText = document.getElementById('kalori-total');
  if (totalText) totalText.textContent = totalKcal;

  // Räkna ut procent (max 100%)
  var procent = Math.min(100, Math.round((totalKcal / DAGLIGT_MAL) * 100));

  // Uppdatera SVG-cirkeln (138 är omkretsen, 0 är full cirkel, 138 är tom)
  var cirkel = document.getElementById('kalori-cirkel');
  if (cirkel) {
    var offset = 138 - (138 * (procent / 100));
    cirkel.style.strokeDashoffset = offset;
  }

  // Uppdatera texten i mitten av cirkeln
  var procentText = document.getElementById('kalori-procent-text');
  if (procentText) procentText.textContent = procent + '%';
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

  fetch('http://127.0.0.1:8002/logga-in', {
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
    localStorage.setItem('anvandare_id', data.id);
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

  fetch('http://127.0.0.1:8002/registrera', {
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
    localStorage.setItem("anvandare_id", data.id);
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

  const res = await fetch(`http://127.0.0.1:8002/notiser/${anvandareId}`); /*koppla upp sig till sidan och fetcha värdet*/
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
  const sparadData = localStorage.getItem("aspire_inloggad");
  if (!sparadData) return;
  const inloggadAnvandare = JSON.parse(sparadData);
  const anvandareId = inloggadAnvandare.id;

  const res = await fetch(`http://127.0.0.1:8002/profil/${anvandareId}`); //förfrågan skickas till API:et för att hämta användarens profildata
  const data = await res.json(); //gör om json texten till ett javascript objekt

  //Profilinfo
  document.getElementById("profil-namn").textContent = data.namn; //användarens namn
  document.getElementById("profil-medsedan").textContent = "Medlem sedan " + data.medsedan; //hämtar datumet som kontot registrerades och kopplar det till det id som sköter den rubriken
  const initialer = data.namn.substring(0, 2).toUpperCase(); 
  document.getElementById("profil-bild").textContent = initialer;

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

var ASPIRE_API_BASE_URL = "http://127.0.0.1:8002";

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
        Kunde inte hämta atleter från databasen. Kontrollera att backend körs på port 8002.
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", laddaAtleterFranDatabasTillSok);
window.addEventListener("pageshow", laddaAtleterFranDatabasTillSok);

/* =====================================================
   HÄMTA ATLETPROFIL FRÅN DATABASEN
   Gör så att atletprofil.html visar rätt atlet och rätt flikar.
   ===================================================== */

// Globala variabler för att spara datan vi hämtar
let aktuellAtlet = null;
let aktuellAktiviteter = [];
let aktuelltSchema = [];

// Hämtar atletens ID från webbadressen (t.ex. ?id=2), standard är 1
const hamtaAtletIdFranUrl = () => new URLSearchParams(window.location.search).get("id") || "1";

// Enkel hjälpfunktion för att hämta JSON-data från API:et
async function hamtaJsonFranApi(url) {
  const svar = await fetch(url);
  if (!svar.ok) throw new Error("Kunde inte hämta data från " + url);
  return await svar.json();
}

// Huvudfunktion: Laddar all data för atleten när sidan öppnas
async function laddaAtletProfilFranDatabas() {
  // Körs bara om vi är på atlet-sidan
  if (!window.location.pathname.endsWith("atletprofil.html")) return;

  const atletId = hamtaAtletIdFranUrl();

  try {
    // 1. Hämta grundinfo om atleten (krävs)
    aktuellAtlet = await hamtaJsonFranApi(`${ASPIRE_API_BASE_URL}/atleter/${atletId}`);

    // 2. Försök hämta aktiviteter (fånga felet tyst om listan är tom)
    try {
      aktuellAktiviteter = await hamtaJsonFranApi(`${ASPIRE_API_BASE_URL}/atleter/${atletId}/aktiviteter`);
    } catch { aktuellAktiviteter = []; }

    // 3. Försök hämta schemat (fånga felet tyst om listan är tom)
    try {
      aktuelltSchema = await hamtaJsonFranApi(`${ASPIRE_API_BASE_URL}/atleter/${atletId}/schema`);
    } catch { aktuelltSchema = []; }

    // Uppdatera HTML med datan och visa startfliken
    fyllAtletProfilFranDatabas();
    visaAtletFlik("schema");

  } catch (error) {
    console.error("Kunde inte hämta atletprofil:", error);
  }
}

// Fyller i atletens uppgifter (namn, sport, statistik) i HTML-koden
function fyllAtletProfilFranDatabas() {
  if (!aktuellAtlet) return;

  // Smidig hjälpfunktion för att byta text på ett element (om elementet finns)
  const sattText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const initialer = aktuellAtlet.initialer || skapaInitialerFranNamn(aktuellAtlet.namn);

  // Fyll i toppen av profilen
  sattText("profil-avatar", initialer);
  sattText("profil-namn", aktuellAtlet.namn || "Okänd atlet");
  sattText("profil-sport", aktuellAtlet.sport || "Okänd sport");
  sattText("profil-kalorier", aktuellAtlet.kcal_per_dag ? `${aktuellAtlet.kcal_per_dag} kcal` : "Saknas");
  sattText("profil-traning", aktuellAtlet.traningstid_timmar ? `${aktuellAtlet.traningstid_timmar}h/dag` : "Saknas");
  sattText("profil-citat", aktuellAtlet.citat || "Ingen motivationstext finns ännu.");

  document.title = "Aspire — " + (aktuellAtlet.namn || "Profil");

  // Fyll i de fyra statistik-rutorna dynamiskt
  const siffror = document.querySelectorAll(".atlet-stat-siffra");
  const etiketter = document.querySelectorAll(".atlet-stat-etikett");

  const statVarden = [
    aktuellAtlet.kcal_per_dag || "-",
    aktuellAtlet.traningstid_timmar ? `${aktuellAtlet.traningstid_timmar}h` : "-",
    aktuellAtlet.sport || "-",
    aktuellAtlet.id || "-"
  ];
  
  const statEtiketter = ["kcal/dag", "träning", "sport", "atlet-id"];

  // Loopa igenom rutorna och sätt in rätt värde och etikett
  siffror.forEach((el, i) => el.textContent = statVarden[i] || "-");
  etiketter.forEach((el, i) => el.textContent = statEtiketter[i] || "");
}

// Skapar HTML-koden för en enda rad i listan (t.ex. en specifik träning eller måltid)
const skapaProfilRad = (tid, namn, beskrivning, index) => `
  <div class="schema-post">
    <div class="schema-prick ${index < 2 ? "rod" : "gra"}"></div>
    <div>
      <div class="schema-tid">${tid}</div>
      <div class="schema-namn">${namn}</div>
      ${beskrivning ? `<div class="schema-beskrivning">${beskrivning}</div>` : ""}
    </div>
  </div>
`;

// Visar rätt innehåll baserat på vilken flik som är vald (Schema, Kost, Träning)
function visaAtletFlik(flikNamn) {
  const innehall = document.getElementById("profil-innehall");
  if (!innehall) return;

  let rader = [];

  if (flikNamn === "schema") {
    // Använd aktiviteter i första hand, annars schema-datan
    if (aktuellAktiviteter.length > 0) {
      rader = aktuellAktiviteter.map((akt, i) => 
        skapaProfilRad(`${akt.tid_start}–${akt.tid_slut}`, akt.namn, akt.beskrivning, i)
      );
    } else if (aktuelltSchema.length > 0) {
      rader = aktuelltSchema.map((rad, i) => 
        skapaProfilRad(rad.tid, rad.aktivitet, rad.veckodag, i)
      );
    }
  } 
  
  else if (flikNamn === "kost") {
    const kost = aktuellAktiviteter.filter(akt => akt.typ === "mat");
    if (kost.length > 0) {
      rader = kost.map((akt, i) => skapaProfilRad(`${akt.tid_start}–${akt.tid_slut}`, akt.namn, akt.beskrivning, i));
    } else {
      // Hårdkodade standardvärden ifall ingen kostdata finns i databasen
      rader = [
        skapaProfilRad("08.00", "Frukost", "Måltidsdata saknas för denna atlet.", 0),
        skapaProfilRad("12.00", "Lunch", "Lägg in kostschema i databasen för mer detaljer.", 1),
        skapaProfilRad("18.00", "Middag", "Standardvärde tills databasen har mer data.", 2)
      ];
    }
  } 
  
  else if (flikNamn === "traning") {
    const traning = aktuellAktiviteter.filter(akt => akt.typ === "träning");
    if (traning.length > 0) {
      rader = traning.map((akt, i) => skapaProfilRad(`${akt.tid_start}–${akt.tid_slut}`, akt.namn, akt.beskrivning, i));
    } else {
      // Hårdkodade standardvärden ifall ingen träningsdata finns i databasen
      rader = [
        skapaProfilRad("07.00", "Träning", "Träningsdata saknas för denna atlet.", 0),
        skapaProfilRad("16.00", "Teknikpass", "Lägg in träningsschema i databasen för mer detaljer.", 1),
        skapaProfilRad("18.00", "Återhämtning", "Standardvärde tills databasen har mer data.", 2)
      ];
    }
  }

  // Skriv ut HTML-raderna. Visar ett informationsmeddelande om listan är helt tom.
  innehall.innerHTML = rader.length > 0 
    ? rader.join("") 
    : `<div style="padding:20px; color:#777; font-size:14px;">Ingen data hittades för denna flik.</div>`;
}

// Byt flik när användaren klickar på knapparna i gränssnittet
function byttFlik(klickadFlik, flikNamn) {
  const rad = klickadFlik.closest(".flik-rad");

  // Avmarkera alla knappar
  if (rad) {
    rad.querySelectorAll(".flik").forEach(flik => flik.classList.remove("aktiv"));
  }

  // Markera den valda knappen som aktiv och uppdatera innehållet
  klickadFlik.classList.add("aktiv");
  visaAtletFlik(flikNamn);
}

/* =====================================================
   UPPSTARTS-LYSSNARE
   Ser till att datan laddas in direkt när sidan visas
   ===================================================== */

document.addEventListener("DOMContentLoaded", laddaAtletProfilFranDatabas);
window.addEventListener("pageshow", laddaAtletProfilFranDatabas);

document.addEventListener("DOMContentLoaded", () => {
  // Ladda ev. gamla funktioner (om de används för kompatibilitet)
  if (typeof laddaAtletProfil === "function") laddaAtletProfil();

  // Om profil-innehållet är tomt, forcera igång "schema"-fliken direkt
  const aktivFlik = document.querySelector(".flik.aktiv");
  if (aktivFlik && document.getElementById("profil-innehall")) {
    byttFlik(aktivFlik, "schema");
  }
});

// Kör uppdateringen direkt när kalorier-sidan har laddats klart
document.addEventListener("DOMContentLoaded", function() {
  if (document.getElementById('kalori-total')) {
    uppdateraKalorier();
  }
});

/* Denna funktion körs när sidan laddas och hämtar streak-data från backend */
document.addEventListener("DOMContentLoaded", hamtaStreak);
  
async function hamtaStreak() {
  const anvandareId = localStorage.getItem("anvandare_id");
  if (!anvandareId) return;

  try {
    const res = await fetch(`http://127.0.0.1:8001/streak/${anvandareId}`);
    const data = await res.json();

    // 1. Fyll i Streak-siffrorna i de nya statistikkorten
    if (document.getElementById("statistik-streak")) {
      document.getElementById("statistik-streak").textContent = data.aktuell;
    }
    if (document.getElementById("statistik-langsta")) {
      document.getElementById("statistik-langsta").textContent = data.langsta;
    }
    
    // 2. Fyll i streaken i kalendervyn
    if (document.getElementById("kal-streak-siffra")) {
      document.getElementById("kal-streak-siffra").textContent = data.aktuell + " DAGAR";
    }

    // 3. Räkna ut och fyll i totala dagar och poäng
    if (data.dagar && document.getElementById("statistik-aktiva")) {
      document.getElementById("statistik-aktiva").textContent = data.dagar.length;
      document.getElementById("statistik-poang").textContent = data.dagar.length * 10;
    }

    // 4. Skicka in databasens sparade datum till kalendern och rita om sidan
    if (typeof habitDagar !== 'undefined' && data.dagar) {
      habitDagar.traning = data.dagar; // Lägger in databasens datum i kalenderns minne
      uppdateraAllt(); // Ritar om kalendern, veckoremsan och graferna med rätt data!
    }

  } catch (error) {
    console.error("Kunde inte hämta data från databasen:", error);
  }
}