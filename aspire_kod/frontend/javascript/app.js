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
    headers: { 'Content-Type': 'application/json' },
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
  const radAttTaBort = knapp.closest('.maltid-post');
  if (!radAttTaBort) return;

  const kaloriId = radAttTaBort.dataset.id;

  if (kaloriId) {
    fetch(`${ASPIRE_API_BASE_URL}/kalorier/${kaloriId}/ta-bort`, {
      method: 'DELETE'
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
    headers: { 'Content-Type': 'application/json' },
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
  var namn = document.getElementById('reg-namn').value.trim();
  var epost = document.getElementById('reg-epost').value.trim();
  var losenord = document.getElementById('reg-losenord').value;
  var bekrafta = document.getElementById('reg-bekrafta').value;
  var gdpr = document.getElementById('gdpr-godkann').checked;

  ['fel-reg-namn',
   'fel-reg-epost',
   'fel-reg-losenord',
   'fel-reg-bekrafta',
   'fel-gdpr',
   'reg-fel']
  .forEach(dolFelmeddelande);

  if (!namn) {
    visaFelmeddelande('fel-reg-namn', 'Namn är obligatoriskt.');
    return;
  }

  if (!epost.includes('@')) {
    visaFelmeddelande('fel-reg-epost', 'Ogiltig e-postadress.');
    return;
  }
  if (losenord.length < 8) {
    visaFelmeddelande('fel-reg-losenord', 'Minst 8 tecken krävs.');
    return;
  }

  if (losenord !== bekrafta) {
    visaFelmeddelande('fel-reg-bekrafta', 'Lösenorden matchar inte.');
    return;
  }

  if (!gdpr) {
    visaFelmeddelande('fel-gdpr', 'Du måste godkänna integritetspolicyn.');
    return;
  }
  visaLaddning();

  fetch('http://127.0.0.1:8002/registrera', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      namn: namn,
      epost: epost,
      losenord: losenord,
      gdpr_godkand: gdpr
    })
  })
  .then(function(svar) {
    return svar.json();
  })
  .then(function(data) {
    doljLaddning();

    if (data.detail) {
      visaFelmeddelande('reg-fel', data.detail);
      return;
    }
    localStorage.setItem('aspire_inloggad', JSON.stringify(data));
    window.location.href = 'hem.html';
  })
  .catch(function() {
    doljLaddning();
    visaFelmeddelande('reg-fel', 'Serverfel.');
  });
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

function startaRealtidsvalidering() {

  const namn = document.getElementById('reg-namn');
  const epost = document.getElementById('reg-epost');
  const losenord = document.getElementById('reg-losenord');
  const bekrafta = document.getElementById('reg-bekrafta');

  if (!namn) return;

  namn.addEventListener('input', function() {
    if (namn.value.trim().length < 2) {
      visaFelmeddelande('fel-reg-namn', 'Minst 2 bokstäver krävs.');
    } else {
      dolFelmeddelande('fel-reg-namn');
    }
  });

  epost.addEventListener('input', function() {
    if (!epost.value.includes('@')) {
      visaFelmeddelande('fel-reg-epost', 'Ogiltig e-post.');
    } else {
      dolFelmeddelande('fel-reg-epost');
    }
  });
  losenord.addEventListener('input', function() {
    if (losenord.value.length < 8) {
      visaFelmeddelande('fel-reg-losenord', 'Minst 8 tecken krävs.');
    } else {
      dolFelmeddelande('fel-reg-losenord');
    }
  });

  bekrafta.addEventListener('input', function() {
    if (bekrafta.value !== losenord.value) {
      visaFelmeddelande('fel-reg-bekrafta', 'Lösenorden matchar inte.');
    } else {
      dolFelmeddelande('fel-reg-bekrafta');
    }
  });
}
document.addEventListener('DOMContentLoaded', startaRealtidsvalidering);

function visaLaddning() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'flex';
  }
}

function doljLaddning() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'none';
  }
}