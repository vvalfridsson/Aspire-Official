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

const ATLET_PROFILER = {
  1: {
    avatar: "MJ",
    namn: "Michael Jordan",
    sport: "Basketball",
    kalorier: "5 000 kcal",
    traning: "5h/dag",
    statistik: ["6", "5", "14x", "32,292"],
    etiketter: ["Championships", "MVPs", "All-Star", "Career Pts"],
    citat: "\"I've missed more than 9000 shots in my career. I've lost almost 300 games.\""
  },
  2: {
    avatar: "LJ",
    namn: "LeBron James",
    sport: "Basketball",
    kalorier: "4 500 kcal",
    traning: "5h/dag",
    statistik: ["4", "4", "20x", "40,000+"],
    etiketter: ["Championships", "MVPs", "All-Star", "Career Pts"],
    citat: "\"You have to be able to accept failure to get better.\""
  },
  3: {
    avatar: "CR",
    namn: "Cristiano Ronaldo",
    sport: "Fotboll",
    kalorier: "3 200 kcal",
    traning: "4h/dag",
    statistik: ["5", "5", "850+", "200+"],
    etiketter: ["Champions League", "Ballon d'Or", "Goals", "Caps"],
    citat: "\"Your love makes me strong. Your hate makes me unstoppable.\""
  },
  4: {
    avatar: "SW",
    namn: "Serena Williams",
    sport: "Tennis",
    kalorier: "3 200 kcal",
    traning: "4h/dag",
    statistik: ["23", "4", "319", "73"],
    etiketter: ["Grand Slams", "Olympics", "Weeks #1", "Titles"],
    citat: "\"A champion is defined by how they recover.\""
  },
  5: {
    avatar: "UB",
    namn: "Usain Bolt",
    sport: "Sprint",
    kalorier: "5 500 kcal",
    traning: "4h/dag",
    statistik: ["8", "100m", "200m", "9.58s"],
    etiketter: ["Olympic Golds", "Record", "Record", "100m WR"],
    citat: "\"I trained four years to run nine seconds.\""
  },
  6: {
    avatar: "CM",
    namn: "Conor McGregor",
    sport: "MMA",
    kalorier: "4 000 kcal",
    traning: "6h/dag",
    statistik: ["2", "22", "19", "UFC"],
    etiketter: ["Divisions", "Wins", "KOs", "Champion"],
    citat: "\"There is no talent here. This is hard work.\""
  }
};

function laddaAtletProfil() {
  if (!window.location.pathname.includes("atletprofil.html")) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "1";
  const atlet = ATLET_PROFILER[id] || ATLET_PROFILER[1];

  const avatar = document.getElementById("profil-avatar");
  const namn = document.getElementById("profil-namn");
  const sport = document.getElementById("profil-sport");
  const kalorier = document.getElementById("profil-kalorier");
  const traning = document.getElementById("profil-traning");
  const citat = document.getElementById("profil-citat");

  if (avatar) avatar.textContent = atlet.avatar;
  if (namn) namn.textContent = atlet.namn;
  if (sport) sport.textContent = atlet.sport;
  if (kalorier) kalorier.textContent = atlet.kalorier;
  if (traning) traning.textContent = atlet.traning;
  if (citat) citat.textContent = atlet.citat;

  document.title = "Aspire — " + atlet.namn;

  const siffror = document.querySelectorAll(".atlet-stat-siffra");
  const etiketter = document.querySelectorAll(".atlet-stat-etikett");

  for (let i = 0; i < siffror.length; i++) {
    if (atlet.statistik[i]) siffror[i].textContent = atlet.statistik[i];
  }

  for (let i = 0; i < etiketter.length; i++) {
    if (atlet.etiketter[i]) etiketter[i].textContent = atlet.etiketter[i];
  }
}

function byttFlik(klickadFlik, flikNamn) {
  var allaflikar = klickadFlik.closest('.flik-rad').querySelectorAll('.flik');

  for (var i = 0; i < allaflikar.length; i++) {
    allaflikar[i].classList.remove('aktiv');
  }

  klickadFlik.classList.add('aktiv');

  var innehall = document.getElementById('profil-innehall');
  if (!innehall) return;

  if (flikNamn === 'schema') {
    innehall.innerHTML = `
      <div class="schema-post">
        <div class="schema-prick rod"></div>
        <div>
          <div class="schema-tid">06.00</div>
          <div class="schema-namn">Vakna!</div>
        </div>
      </div>

      <div class="schema-post">
        <div class="schema-prick rod"></div>
        <div>
          <div class="schema-tid">06.30–08.00</div>
          <div class="schema-namn">Gym</div>
        </div>
      </div>

      <div class="schema-post">
        <div class="schema-prick gra"></div>
        <div>
          <div class="schema-tid">08.30–09.00</div>
          <div class="schema-namn">Power Nap</div>
          <div class="schema-beskrivning">| Samla energi för dagen!</div>
        </div>
      </div>
    `;
  }

  if (flikNamn === 'kost') {
    innehall.innerHTML = `
      <div class="schema-post">
        <div class="schema-prick rod"></div>
        <div>
          <div class="schema-tid">08.00</div>
          <div class="schema-namn">Frukost</div>
          <div class="schema-beskrivning">Havregryn, ägg, frukt och vatten.</div>
        </div>
      </div>

      <div class="schema-post">
        <div class="schema-prick rod"></div>
        <div>
          <div class="schema-tid">12.00</div>
          <div class="schema-namn">Lunch</div>
          <div class="schema-beskrivning">Kyckling, ris och grönsaker.</div>
        </div>
      </div>

      <div class="schema-post">
        <div class="schema-prick gra"></div>
        <div>
          <div class="schema-tid">18.00</div>
          <div class="schema-namn">Middag</div>
          <div class="schema-beskrivning">Proteinrik måltid för återhämtning.</div>
        </div>
      </div>
    `;
  }

  if (flikNamn === 'traning') {
    innehall.innerHTML = `
      <div class="schema-post">
        <div class="schema-prick rod"></div>
        <div>
          <div class="schema-tid">06.30</div>
          <div class="schema-namn">Styrketräning</div>
          <div class="schema-beskrivning">Explosivitet, ben och core.</div>
        </div>
      </div>

      <div class="schema-post">
        <div class="schema-prick rod"></div>
        <div>
          <div class="schema-tid">14.00</div>
          <div class="schema-namn">Teknikpass</div>
          <div class="schema-beskrivning">Sport-specifik teknik och rörelsemönster.</div>
        </div>
      </div>

      <div class="schema-post">
        <div class="schema-prick gra"></div>
        <div>
          <div class="schema-tid">19.00</div>
          <div class="schema-namn">Stretching</div>
          <div class="schema-beskrivning">Rörlighet och återhämtning.</div>
        </div>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", laddaAtletProfil);

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
