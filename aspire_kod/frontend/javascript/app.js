/* =====================================================
   ASPIRE APP — DELAD JAVASCRIPT
   Används av alla HTML-sidor i appen.
   ===================================================== */

const ASPIRE_API_BASE_URL = "http://127.0.0.1:8002";

// Globala variabler för atletprofiler
let aktuellAtlet = null;
let aktuellAktiviteter = [];
let aktuelltSchema = [];
const DAGLIGT_MAL = 2500;

/* ─────────────────────────────────────────────────────
   FILTRERA ATLETER PÅ SPORT (sok.html)
───────────────────────────────────────────────────── */
function filterSport(klickadPill, sport) {
  const allaPills = document.querySelectorAll('.filter-pill');
  allaPills.forEach(pill => {
    pill.classList.remove('aktiv');
    pill.classList.add('inaktiv');
  });
  klickadPill.classList.add('aktiv');
  klickadPill.classList.remove('inaktiv');

  const alleRader = document.querySelectorAll('.atlet-rad');
  alleRader.forEach(rad => {
    if (sport === 'alla' || rad.dataset.sport === sport) {
      rad.style.display = 'flex';
    } else {
      rad.style.display = 'none';
    }
  });
}

/* ─────────────────────────────────────────────────────
   SÖK ATLETER I REALTID (sok.html)
───────────────────────────────────────────────────── */
function sokAtleter(text) {
  const soktext = text.toLowerCase();
  const rader = document.querySelectorAll('.atlet-rad');

  rader.forEach(rad => {
    const namn = rad.querySelector('.atlet-namn').textContent.toLowerCase();
    const sport = rad.querySelector('.atlet-sport').textContent.toLowerCase();

    if (namn.includes(soktext) || sport.includes(soktext)) {
      rad.style.display = 'flex';
    } else {
      rad.style.display = 'none';
    }
  });
}

/* ─────────────────────────────────────────────────────
   BYTA MÅLTIDSFLIK (kalorier.html)
───────────────────────────────────────────────────── */
function byttMaltid(klickad) {
  const alla = klickad.closest('.maltids-flikar').querySelectorAll('.maltids-flik');
  alla.forEach(flik => {
    flik.classList.remove('aktiv');
    flik.classList.add('inaktiv');
  });

  klickad.classList.add('aktiv');
  klickad.classList.remove('inaktiv');
}

/* ─────────────────────────────────────────────────────
   SPARA KALORI-INMATNING (kalorier.html)
───────────────────────────────────────────────────── */
function sparaKalorier() {
  const inmatning = document.getElementById('kalori-input');
  const felEl = document.getElementById('kalori-fel');
  const kcal = parseInt(inmatning.value);

  if (felEl) felEl.style.display = 'none';

  if (!kcal || kcal <= 0 || isNaN(kcal)) {
    if (felEl) {
      felEl.textContent = 'Ange ett heltal större än 0, t.ex. 450.';
      felEl.style.display = 'block';
    }
    return;
  }

  const aktivFlik = document.querySelector('.maltids-flik.aktiv');
  const maltidstyp = aktivFlik ? aktivFlik.textContent.trim() : 'Okänd';

  const user = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) {
    if (felEl) {
      felEl.textContent = 'Du måste vara inloggad.';
      felEl.style.display = 'block';
    }
    return;
  }

  fetch(`${ASPIRE_API_BASE_URL}/kalorier/${user.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Anvandare-Id': user.id },
    body: JSON.stringify({ maltid: maltidstyp, kalorier: kcal })
  })
  .then(svar => svar.json())
  .then(data => {
    laggTillMaltidRad(data.id, maltidstyp, kcal, nuvarandeTid());
    inmatning.value = '';
    uppdateraKalorier();
  })
  .catch(() => {
    if (felEl) {
      felEl.textContent = 'Kunde inte spara till databasen. Kontrollera anslutningen.';
      felEl.style.display = 'block';
    }
  });
}

/* ─────────────────────────────────────────────────────
   TA BORT MÅLTID
───────────────────────────────────────────────────── */
function taBortMaltid(knapp) {
  if (!confirm('Vill du ta bort denna måltid?')) return;

  const radAttTaBort = knapp.closest('.maltid-post');
  if (!radAttTaBort) return;

  const kaloriId = radAttTaBort.dataset.id;
  const user = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) return;

  if (kaloriId) {
    fetch(${ASPIRE_API_BASE_URL}/kalorier/${kaloriId}/ta-bort, {
      method: 'DELETE',
      headers: { 'X-Anvandare-Id': user.id }
    });
  }

  radAttTaBort.remove();
  uppdateraKalorier();
}


/* ─────────────────────────────────────────────────────
   LÄGG TILL EN MÅLTIDSRAD I LISTAN
───────────────────────────────────────────────────── */
function laggTillMaltidRad(id, maltidstyp, kcal, tid) {
  const lista = document.getElementById('maltider-lista');
  if (!lista) return;

  const nyRad = document.createElement('div');
  nyRad.className = 'maltid-post';
  nyRad.dataset.id = id;

  nyRad.innerHTML = `
    <div class="maltid-bild">
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
    </div>
    <div class="maltid-info">
      <div class="maltid-namn">${maltidstyp}</div>
      <div class="maltid-tid">${tid}</div>
    </div>
    <div class="maltid-kcal">${kcal} kcal</div>
    <button class="ta-bort-knapp" onclick="taBortMaltid(this)">
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  lista.appendChild(nyRad);
}

/* ─────────────────────────────────────────────────────
   LADDA SPARADE KALORIER FRÅN DATABASEN
───────────────────────────────────────────────────── */
function laddaKalorierFranDatabas() {
  const user = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) return;

  fetch(`${ASPIRE_API_BASE_URL}/kalorier/${user.id}`)
    .then(svar => svar.json())
    .then(data => {
      for (const post of data) {
        const tid = new Date(post.skapad).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
        laggTillMaltidRad(post.id, post.maltid, post.kalorier, tid);
      }
      uppdateraKalorier();
    });
}

/* ─────────────────────────────────────────────────────
   UPPDATERA KALORIER OCH CIRKEL
───────────────────────────────────────────────────── */
function uppdateraKalorier() {
  const allaMaltider = document.querySelectorAll('.maltid-kcal');
  let totalKcal = 0;
  
  allaMaltider.forEach(maltid => {
    const siffra = parseInt(maltid.textContent.replace(/\D/g, '')) || 0;
    totalKcal += siffra;
  });

  const totalText = document.getElementById('kalori-total');
  if (totalText) totalText.textContent = totalKcal;

  const procent = Math.min(100, Math.round((totalKcal / DAGLIGT_MAL) * 100));
  const cirkel = document.getElementById('kalori-cirkel');
  if (cirkel) {
    cirkel.style.strokeDashoffset = 138 - (138 * (procent / 100));
  }

  const procentText = document.getElementById('kalori-procent-text');
  if (procentText) procentText.textContent = `${procent}%`;
}

function nuvarandeTid() {
  const nu = new Date();
  return `${String(nu.getHours()).padStart(2, '0')}:${String(nu.getMinutes()).padStart(2, '0')}`;
}

function visaFelmeddelande(elementId, meddelande) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = meddelande;
  element.style.display = 'block';
}

function dolFelmeddelande(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.style.display = 'none';
}

/* ─────────────────────────────────────────────────────
   INLOGGNING & REGISTRERING
───────────────────────────────────────────────────── */
function hanteraInloggning() {
  const epost = document.getElementById('inlogg-epost').value.trim();
  const losenord = document.getElementById('inlogg-losenord').value;

  ['fel-epost', 'fel-losenord', 'inlogg-fel'].forEach(dolFelmeddelande);

  if (!epost) return visaFelmeddelande('fel-epost', 'E-postfältet är obligatoriskt.');
  if (!losenord) return visaFelmeddelande('fel-losenord', 'Lösenordsfältet är obligatoriskt.');

  fetch(`${ASPIRE_API_BASE_URL}/logga-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json','X-Anvandare-Id': user.id },
    body: JSON.stringify({ epost, losenord })
  })
  .then(svar => svar.json())
  .then(data => {
    if (data.detail) return visaFelmeddelande('inlogg-fel', data.detail);
    localStorage.setItem('aspire_inloggad', JSON.stringify(data));
    window.location.href = 'hem.html';
  })
  .catch(() => visaFelmeddelande('inlogg-fel', 'Kunde inte ansluta till servern.'));
}

function hanteraRegistrering() {
  const namn = document.getElementById('reg-namn').value.trim();
  const epost = document.getElementById('reg-epost').value.trim();
  const losenord = document.getElementById('reg-losenord').value;
  const bekrafta = document.getElementById('reg-bekrafta').value;

  ['fel-reg-namn','fel-reg-epost','fel-reg-losenord','fel-reg-bekrafta','reg-fel'].forEach(dolFelmeddelande);

  if (!namn) return visaFelmeddelande('fel-reg-namn', 'Namn är obligatoriskt.');
  if (!epost) return visaFelmeddelande('fel-reg-epost', 'E-post är obligatoriskt.');
  if (!losenord || losenord.length < 8) return visaFelmeddelande('fel-reg-losenord', 'Lösenordet måste ha minst 8 tecken.');
  if (losenord !== bekrafta) return visaFelmeddelande('fel-reg-bekrafta', 'Lösenorden matchar inte.');

  fetch(`${ASPIRE_API_BASE_URL}/registrera`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Anvandare-Id': user.id},
    body: JSON.stringify({ namn, epost, losenord })
  })
  .then(svar => svar.json())
  .then(data => {
    if (data.detail) return visaFelmeddelande('reg-fel', data.detail);
    localStorage.setItem('aspire_inloggad', JSON.stringify(data));
    window.location.href = 'hem.html';
  })
  .catch(() => visaFelmeddelande('reg-fel', 'Kunde inte ansluta till servern.'));
}

function loggarUt() {
  ['aspire_inloggad', 'anvandare', 'user'].forEach(k => localStorage.removeItem(k));
  window.location.href = "index.html";
}

function startaVakna(button) {
  if (!button) return;
  button.textContent = "Aktivitet startad";
  button.disabled = true;
}

function uppdateraStatusradKlocka() {
  const tidElement = document.querySelector('.statusrad-tid');
  if (!tidElement) return;

  const nu = new Date();
  tidElement.textContent = `${nu.getHours()}:${String(nu.getMinutes()).padStart(2, '0')}`;
}

uppdateraStatusradKlocka();
setInterval(uppdateraStatusradKlocka, 1000);

/* ─────────────────────────────────────────────────────
   NOTISER & PROFIL
───────────────────────────────────────────────────── */
async function hamtaNotiser() {
  const user = JSON.parse(localStorage.getItem("aspire_inloggad"));
  if (!user) return;

  const res = await fetch(`${ASPIRE_API_BASE_URL}/notiser/${user.id}`);
  const data = await res.json();
  const badge = document.getElementById("notis-badge");
  if (!badge) return;

  if (data.antal > 0) {
    badge.textContent = data.antal;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}
async function hamtaProfil() {
  const user = JSON.parse(localStorage.getItem("aspire_inloggad"));
  if (!user) return;

  const res = await fetch(`${ASPIRE_API_BASE_URL}/profil/${user.id}`);
  const data = await res.json();

  document.getElementById("profil-namn").textContent = data.namn;
  document.getElementById("profil-medsedan").textContent = `Medlem sedan ${data.medsedan}`;

  const initialer = data.namn.substring(0, 2).toUpperCase();
  document.getElementById("profil-bild").style.display = "none";
  document.getElementById("profil-bild").insertAdjacentHTML("afterend", `<div class="avatar-fyrkant">${initialer}</div>`);

  document.getElementById("profil-streak").textContent = data.streak;
  document.getElementById("profil-utmaningar").textContent = data.utmaningar;
  document.getElementById("profil-genomfort").textContent = `${data.genomfort}%`;

  renderaHistorik(data.historik);

  function renderaHistorik(historik) {
    const lista = document.getElementById("historik-lista");
    if (!lista) return;

    if (!historik || historik.length === 0) {
      lista.innerHTML = `<div style="padding:16px; color:#ADADAD; font-size:14px;">Ingen historik ännu – slutför ditt första träningspass!</div>`;
      return;
    }

    lista.innerHTML = historik.map((rad, i) => `
      <div style="
        display:flex; align-items:center; justify-content:space-between;
        padding:14px 16px;
        ${i > 0 ? 'border-top:1px solid #F0F0F0;' : ''}
      ">
        <div style="font-size:14px; font-weight:600; color:#0A0A0A;">Vecka fr. ${rad.vecka}</div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="
            height:8px; border-radius:4px; background:#0A0A0A;
            width:${Math.min(rad.pass * 14, 98)}px;
            min-width:4px;
            transition:width 0.4s ease;
          "></div>
          <div style="font-size:14px; font-weight:700; color:#0A0A0A; min-width:24px; text-align:right;">${rad.pass}</div>
        </div>
      </div>
    `).join("");
  }
  // Aktiv utmaning
  if (data.aktiv.titel) {
    document.getElementById("aktiv-titel").textContent = data.aktiv.titel;
    document.getElementById("aktiv-dag").textContent = `Dag ${data.aktiv.dag} av ${data.aktiv.total}`;
    document.getElementById("aktiv-progress").style.width = `${data.aktiv.procent}%`;
    document.getElementById("aktiv-procent").textContent = `${data.aktiv.procent}%`;
  } else {
    document.getElementById("aktiv-titel").textContent = "Ingen aktiv utmaning";
    document.getElementById("aktiv-dag").textContent = "Välj en utmaning för att komma igång";
    document.getElementById("aktiv-progress").style.width = "0%";
    document.getElementById("aktiv-procent").textContent = "0%";
  }

  // Veckans sammanfattning — rätt ID:n och formatering
  document.getElementById("vecka-traning").textContent = `${data.vecka.traning} pass`;
document.getElementById("vecka-kalorier").textContent = `${data.vecka.kalorier_dagar ?? 0}/7 dagar`;

  const forb = data.vecka.forbattring;
  const forbEl = document.getElementById("vecka-forbattring");
  if (forb > 0) {
    forbEl.textContent = `+${forb}%`;
    forbEl.style.color = "#22C55E";
  } else if (forb < 0) {
    forbEl.textContent = `${forb}%`;
    forbEl.style.color = "#EF4444";
  } else {
    forbEl.textContent = "—";
    forbEl.style.color = "#ADADAD";
  }
}


/* ─────────────────────────────────────────────────────
   HÄMTA ATLETER & ATLETPROFIL
───────────────────────────────────────────────────── */
function skapaInitialerFranNamn(namn) {
  if (!namn) return "?";
  const delar = namn.trim().split(" ");
  return delar.length === 1 ? delar[0].substring(0, 2).toUpperCase() : (delar[0][0] + delar[delar.length - 1][0]).toUpperCase();
}

function skapaAtletRadFranDatabas(atlet) {
  const id = atlet.id;
  const namn = atlet.namn || "Okänd atlet";
  const sport = atlet.sport || "Okänd sport";
  const initialer = atlet.initialer || skapaInitialerFranNamn(namn);
  const kalorier = atlet.kcal_per_dag ? `${atlet.kcal_per_dag} kcal/dag` : "Kalorier saknas";
  const traning = atlet.traningstid_timmar ? `${atlet.traningstid_timmar}h träning` : "Träning saknas";

  return `
  <div class="atlet-rad" data-atlet-id="${id}" data-sport="${sport}">
    <a href="atletprofil.html?id=${id}" class="atlet-rad-lank">
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
    <button class="valj-knapp" onclick="valjAtlet(${id}, this)">Välj</button>
  </div>
`;
}

async function laddaAtleterFranDatabasTillSok() {
  const lista = document.getElementById("atletlista");
  if (!lista) return;

  // Om vi har sparad data sen innan, visa den blixtsnabbt först
  const sparadeAtleter = JSON.parse(localStorage.getItem('aspire_alla_atleter'));
  if (sparadeAtleter && sparadeAtleter.length > 0) {
    lista.innerHTML = sparadeAtleter.map(skapaAtletRadFranDatabas).join("");
  } else {
    lista.innerHTML = `<div style="padding:20px; color:#777; font-size:14px;">Laddar atleter...</div>`;
  }

  try {
    const svar = await fetch(`${ASPIRE_API_BASE_URL}/atleter`);
    if (!svar.ok) throw new Error("Backend-fel");
    const atleter = await svar.json();

    if (!atleter || atleter.length === 0) {
      lista.innerHTML = `<div style="padding:20px; color:#777; font-size:14px;">Inga atleter hittades.</div>`;
      return;
    }
    
    // SPARA TILL MINNET FÖR BLIXTSNABB LADDNING SENARE
    localStorage.setItem('aspire_alla_atleter', JSON.stringify(atleter));
    
    // Uppdatera listan
    lista.innerHTML = atleter.map(skapaAtletRadFranDatabas).join("");
  } catch {
    if (!sparadeAtleter) {
      lista.innerHTML = `<div style="padding:20px; color:red; font-size:14px;">Kunde inte hämta atleter. Kontrollera servern.</div>`;
    }
  }
}

const hamtaAtletIdFranUrl = () => new URLSearchParams(window.location.search).get("id") || "1";

async function hamtaJsonFranApi(url) {
  const svar = await fetch(url);
  if (!svar.ok) throw new Error(`Fel vid hämtning av ${url}`);
  return await svar.json();
}

async function laddaAtletProfilFranDatabas() {
  const atletId = hamtaAtletIdFranUrl();
  
  // 1. OMEDELBAR LADDNING (0 millisekunder väntetid)
  // Vi kollar i minnet om atleten redan finns från sök-sidan.
  const sparadeAtleter = JSON.parse(localStorage.getItem('aspire_alla_atleter')) || [];
  const cacheAtlet = sparadeAtleter.find(a => a.id == atletId);
  
  if (cacheAtlet) {
    aktuellAtlet = cacheAtlet;
    fyllAtletProfilFranDatabas(); // Fyll i namn, bild och biometri direkt!
  }

  // 2. HÄMTA RESTEN I BAKGRUNDEN PARALLELLT (Mycket snabbare än en i taget)
  try {
    // Promise.allSettled skickar iväg alla tre förfrågningar på samma gång
    const [atletSvar, aktSvar, schemaSvar] = await Promise.allSettled([
      hamtaJsonFranApi(`${ASPIRE_API_BASE_URL}/atleter/${atletId}`),
      hamtaJsonFranApi(`${ASPIRE_API_BASE_URL}/atleter/${atletId}/aktiviteter`),
      hamtaJsonFranApi(`${ASPIRE_API_BASE_URL}/atleter/${atletId}/schema`)
    ]);

    // Uppdatera med den helt färska datan från servern
    if (atletSvar.status === "fulfilled") aktuellAtlet = atletSvar.value;
    aktuellAktiviteter = aktSvar.status === "fulfilled" ? aktSvar.value : [];
    aktuelltSchema = schemaSvar.status === "fulfilled" ? schemaSvar.value : [];

    // Fyll i allt på nytt och visa rätt schema-flik
    fyllAtletProfilFranDatabas();
    visaAtletFlik("schema");
    
  } catch (error) {
    console.error("Kunde inte hämta all atletdata:", error);
  }
}

function fyllAtletProfilFranDatabas() {
  if (!aktuellAtlet) return;
  const sattText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  const initialer = aktuellAtlet.initialer || skapaInitialerFranNamn(aktuellAtlet.namn);

  sattText("profil-avatar", initialer);
  sattText("profil-namn", aktuellAtlet.namn || "Okänd atlet");
  sattText("profil-sport", aktuellAtlet.sport || "Okänd sport");
  sattText("profil-kalorier", aktuellAtlet.kcal_per_dag ? `${aktuellAtlet.kcal_per_dag} kcal` : "Saknas");
  sattText("profil-traning", aktuellAtlet.traningstid_timmar ? `${aktuellAtlet.traningstid_timmar}h/dag` : "Saknas");
  sattText("profil-citat", aktuellAtlet.citat || "Ingen motivationstext finns ännu.");

  document.title = `Aspire — ${aktuellAtlet.namn || "Profil"}`;

  const statVarden = [
    aktuellAtlet.kcal_per_dag || "-",
    aktuellAtlet.traningstid_timmar ? `${aktuellAtlet.traningstid_timmar}h` : "-",
    aktuellAtlet.sport || "-",
    aktuellAtlet.id || "-"
  ];
  const statEtiketter = ["kcal/dag", "träning", "sport", "atlet-id"];

  document.querySelectorAll(".atlet-stat-siffra").forEach((el, i) => el.textContent = statVarden[i]);
  document.querySelectorAll(".atlet-stat-etikett").forEach((el, i) => el.textContent = statEtiketter[i]);
}

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

function visaAtletFlik(flikNamn) {
  const innehall = document.getElementById("profil-innehall");
  if (!innehall) return;

  let rader = [];

  if (flikNamn === "schema") {
    if (aktuellAktiviteter.length > 0) {
      rader = aktuellAktiviteter.map((akt, i) => skapaProfilRad(`${akt.tid_start}–${akt.tid_slut}`, akt.namn, akt.beskrivning, i));
    } else if (aktuelltSchema.length > 0) {
      rader = aktuelltSchema.map((rad, i) => skapaProfilRad(rad.tid, rad.aktivitet, rad.veckodag, i));
    }
  } else if (flikNamn === "kost") {
    const kost = aktuellAktiviteter.filter(akt => akt.typ === "mat");
    rader = kost.length > 0 ? kost.map((akt, i) => skapaProfilRad(`${akt.tid_start}–${akt.tid_slut}`, akt.namn, akt.beskrivning, i)) : [
      skapaProfilRad("08.00", "Frukost", "Måltidsdata saknas för denna atlet.", 0),
      skapaProfilRad("12.00", "Lunch", "Lägg in kostschema i databasen.", 1),
      skapaProfilRad("18.00", "Middag", "Standardvärde tills databasen har mer data.", 2)
    ];
  } else if (flikNamn === "traning") {
    const traning = aktuellAktiviteter.filter(akt => akt.typ === "träning");
    rader = traning.length > 0 ? traning.map((akt, i) => skapaProfilRad(`${akt.tid_start}–${akt.tid_slut}`, akt.namn, akt.beskrivning, i)) : [
      skapaProfilRad("07.00", "Träning", "Träningsdata saknas för denna atlet.", 0),
      skapaProfilRad("16.00", "Teknikpass", "Lägg in träningsschema i databasen.", 1),
      skapaProfilRad("18.00", "Återhämtning", "Standardvärde tills databasen har mer data.", 2)
    ];
  }

  innehall.innerHTML = rader.length > 0 ? rader.join("") : `<div style="padding:20px; color:#777; font-size:14px;">Ingen data hittades för denna flik.</div>`;
}

function byttFlik(klickadFlik, flikNamn) {
  const rad = klickadFlik.closest(".flik-rad");
  if (rad) rad.querySelectorAll(".flik").forEach(flik => flik.classList.remove("aktiv"));
  klickadFlik.classList.add("aktiv");
  visaAtletFlik(flikNamn);
}

/* ─────────────────────────────────────────────────────
   UPPSTARTS-KONTROLLER (Exekverar OMEDELBART för snabbhet)
───────────────────────────────────────────────────── */
const filnamn = window.location.pathname.split("/").pop();

if (filnamn === "sok.html") {
  laddaAtleterFranDatabasTillSok();
} 
else if (filnamn === "atletprofil.html") {
  laddaAtletProfilFranDatabas();
} 
else if (filnamn === "profil.html") {
  hamtaProfil();
} 
else if (filnamn === "kalorier.html") {
  laddaKalorierFranDatabas();
}

// Körs i bakgrunden utan att blockera databasen
document.addEventListener("DOMContentLoaded", () => {
  hamtaNotiser();
  if (filnamn === "atletprofil.html") {
    const aktivFlik = document.querySelector(".flik.aktiv");
    if (aktivFlik && document.getElementById("profil-innehall")) {
      byttFlik(aktivFlik, "schema");
    }
  }
});

const skyddadeSidor = ['hem.html', 'profil.html', 'streaks.html', 'kalorier.html', 'sok.html', 'installningar.html'];

if (skyddadeSidor.includes(filnamn) && !localStorage.getItem('aspire_inloggad')) {
  window.location.replace('index.html');
}

/* ─────────────────────────────────────────────────────
   TRÄNINGSDAGBOK (traning.html)
───────────────────────────────────────────────────── */

var aktivtPassId = null;

function skapaPass() {
  if (!document.getElementById('pass-namn')) return;

  var namn = document.getElementById('pass-namn').value.trim();
  if (!namn) { alert('Ange ett namn på passet.'); return; }

  var user = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) { window.location.href = 'index.html'; return; }

  var knapp = document.querySelector('#pass-namn + .spara-knapp');
  knapp.disabled = true;
  knapp.innerHTML = '<span class="laddnings-spinner"></span> Skapar…';

  fetch(ASPIRE_API_BASE_URL + '/anvandare/' + user.id + '/traning/pass', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Anvandare-Id': user.id},
    body: JSON.stringify({ namn: namn })
  })
  .then(function(svar) { return svar.json(); })
  .then(function(data) {
    aktivtPassId = data.id;
    document.getElementById('aktivt-pass-rubrik').textContent = 'Logga övning — ' + data.namn;
    document.getElementById('ovning-sektion').style.display = 'block';
    document.getElementById('pass-namn').value = '';
    laddaHistorik();
    knapp.disabled = false;
    knapp.innerHTML = '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Skapa pass';
  })
  .catch(function() {
    alert('Kunde inte skapa passet.');
    knapp.disabled = false;
    knapp.innerHTML = '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Skapa pass';
  });
}

function loggaOvning() {
  if (!aktivtPassId) { alert('Skapa ett pass först.'); return; }

  var ovning = document.getElementById('ovning-namn').value.trim();
  var set    = parseInt(document.getElementById('ovning-set').value);
  var reps   = parseInt(document.getElementById('ovning-reps').value);
  var vikt   = parseFloat(document.getElementById('ovning-vikt').value);
  var vila   = parseInt(document.getElementById('ovning-vila').value);

  if (!ovning || !set || !reps || !vikt || !vila) {
    alert('Fyll i alla fält.');
    return;
  }

  var user = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) return;

  var knapp = document.getElementById('logga-ovning-knapp');
  knapp.disabled = true;
  knapp.innerHTML = '<span class="laddnings-spinner"></span> Sparar…';

  fetch(ASPIRE_API_BASE_URL + '/anvandare/' + user.id + '/traning/ovning', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Anvandare-Id': user.id},
    body: JSON.stringify({
      pass_id: aktivtPassId,
      ovning: ovning,
      set_antal: set,
      reps: reps,
      vikt_kg: vikt,
      vilotid_sek: vila
    })
  })
  .then(function(svar) { return svar.json(); })
  .then(function(data) {
    laggTillOvningRad(data.id, ovning, set, reps, vikt, vila);
    document.getElementById('ovning-namn').value = '';
    document.getElementById('ovning-set').value = '';
    document.getElementById('ovning-reps').value = '';
    document.getElementById('ovning-vikt').value = '';
    document.getElementById('ovning-vila').value = '';
    knapp.disabled = false;
    knapp.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Lägg till övning';
  })
  .catch(function() {
    alert('Kunde inte logga övningen.');
    knapp.disabled = false;
    knapp.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Lägg till övning';
  });
}

function laggTillOvningRad(id, ovning, set, reps, vikt, vila) {
  var lista = document.getElementById('ovningar-lista');
  if (!lista) return;
  var rad = document.createElement('div');
  rad.className = 'ovning-rad';
  rad.dataset.id = id;
  rad.innerHTML =
    '<div class="ovning-info">' +
      '<div class="ovning-namn">' + ovning + '</div>' +
      '<div class="ovning-detaljer">' + set + ' set × ' + reps + ' reps · ' + vikt + ' kg · Vila ' + vila + 's</div>' +
    '</div>' +
    '<button class="ta-bort-knapp" onclick="taBortOvning(this)">' +
      '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button>';
  lista.appendChild(rad);
}

function taBortOvning(knapp) {
  if (!confirm('Ta bort övningen?')) return;
  var rad = knapp.closest('.ovning-rad');
  var id = rad.dataset.id;
fetch(ASPIRE_API_BASE_URL + '/traning/ovning/' + id, { method: 'DELETE', headers: { 'X-Anvandare-Id': user.id } })
  .then(function() { rad.remove(); })
  .catch(function() { alert('Kunde inte ta bort övningen.'); });
}

function laddaHistorik() {
  var lista = document.getElementById('historik-lista');
  if (!lista) return;

  var user = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) return;

  lista.innerHTML = '<div class="traning-tom">Laddar…</div>';

  fetch(ASPIRE_API_BASE_URL + '/anvandare/' + user.id + '/traning/pass', {headers: { 'X-Anvandare-Id': user.id }})
  .then(function(svar) { return svar.json(); })
  .then(function(pass) {
    if (!pass.length) {
      lista.innerHTML = '<div class="traning-tom">Inga pass loggade än.</div>';
      return;
    }
    lista.innerHTML = '';
    pass.forEach(function(p) {
      var kort = document.createElement('div');
      kort.className = 'traning-kort';
      var ovningarHtml = p.ovningar.length
        ? p.ovningar.map(function(o) {
            return '<div class="historik-ovning">' +
              '<span class="historik-ovning-namn">' + o.ovning + '</span>' +
              '<span class="historik-ovning-detalj">' + o.set_antal + ' set × ' + o.reps + ' reps · ' + o.vikt_kg + ' kg · Vila ' + o.vilotid_sek + 's</span>' +
            '</div>';
          }).join('')
        : '<div class="traning-tom">Inga övningar loggade.</div>';
      kort.innerHTML =
        '<div class="traning-kort-header">' +
          '<div class="traning-kort-namn">' + p.namn + '</div>' +
          '<div class="traning-kort-datum">' + p.datum + '</div>' +
        '</div>' +
        ovningarHtml;
      lista.appendChild(kort);
    });
  })
  .catch(function() {
    lista.innerHTML = '<div class="traning-tom">Kunde inte ladda historik.</div>';
  });
}

document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('historik-lista')) return;
  laddaHistorik();
});