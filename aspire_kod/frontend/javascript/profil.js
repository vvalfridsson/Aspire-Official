

const PROFIL_API = 'http://127.0.0.1:8002';

/* ─────────────────────────────────────────────────────
   HJÄLPFUNKTION — sätt text på element
───────────────────────────────────────────────────── */
function sattText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ─────────────────────────────────────────────────────
   AVATAR — initialer från namn
───────────────────────────────────────────────────── */
function skapaInitialer(namn) {
  if (!namn) return '?';
  const delar = namn.trim().split(' ');
  return delar.length === 1
    ? delar[0].substring(0, 2).toUpperCase()
    : (delar[0][0] + delar[delar.length - 1][0]).toUpperCase();
}

/* ─────────────────────────────────────────────────────
   HÄMTA VALD ATLET
───────────────────────────────────────────────────── */
async function laddaValdAtlet(anvandareId) {
  try {
    const svar = await fetch(`${PROFIL_API}/anvandare/${anvandareId}/vald-atlet`, {
      headers: { 'X-Anvandare-Id': anvandareId }
    });
    if (svar.status === 404) {
      sattText('profil-atlet-namn', 'Ingen atlet vald');
      sattText('profil-atlet-sport', 'Gå till sök för att välja en');
      sattText('profil-atlet-avatar', '?');
      return;
    }
    const atlet = await svar.json();
    sattText('profil-atlet-namn', atlet.namn);
    sattText('profil-atlet-sport', atlet.sport);
    sattText('profil-atlet-avatar', skapaInitialer(atlet.namn));
  } catch (fel) {
    sattText('profil-atlet-namn', 'Kunde inte hämta atlet');
    sattText('profil-atlet-sport', '');
  }
}

/* ─────────────────────────────────────────────────────
   HÄMTA TRÄNINGSHISTORIK
───────────────────────────────────────────────────── */
async function laddaTraningsHistorik(anvandareId) {
  const lista = document.getElementById('historik-lista');
  if (!lista) return;

  try {
    const svar = await fetch(`${PROFIL_API}/anvandare/${anvandareId}/traning/pass`, {
      headers: { 'X-Anvandare-Id': anvandareId }
    });
    const pass = await svar.json();

    if (!pass || pass.length === 0) {
      lista.innerHTML = '<div class="historik-laddning">Inga träningspass loggade än.</div>';
      return;
    }

    lista.innerHTML = pass.slice(0, 5).map(function (p) {
      const ovningarHtml = p.ovningar.length
        ? p.ovningar.map(function (o) {
            return '<div class="historik-ovning">' +
              '<span class="historik-ovning-namn">' + o.ovning + '</span>' +
              '<span class="historik-ovning-detalj">' + o.set_antal + ' set × ' + o.reps + ' reps · ' + o.vikt_kg + ' kg</span>' +
            '</div>';
          }).join('')
        : '<div class="historik-laddning">Inga övningar loggade.</div>';

      return '<div class="traning-kort">' +
        '<div class="traning-kort-header">' +
          '<div class="traning-kort-namn">' + p.namn + '</div>' +
          '<div class="traning-kort-datum">' + p.datum + '</div>' +
        '</div>' +
        ovningarHtml +
      '</div>';
    }).join('');

  } catch (fel) {
    lista.innerHTML = '<div class="historik-laddning">Kunde inte ladda historik.</div>';
  }
}

/* ─────────────────────────────────────────────────────
   HÄMTA PROFILDATA
───────────────────────────────────────────────────── */
async function laddaProfil() {
  const user = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) { window.location.href = 'index.html'; return; }

  const anvandareId = user.id;

  try {
    const svar = await fetch(`${PROFIL_API}/profil/${anvandareId}`);
    const data = await svar.json();

    /* — Användarinfo — */
    sattText('profil-namn', data.namn);
    sattText('profil-medsedan', 'Medlem sedan ' + data.medsedan);

    const profilBild = document.getElementById('profil-bild');
    if (profilBild) profilBild.textContent = skapaInitialer(data.namn);

    /* — Statistikkort — */
    sattText('profil-streak', data.streak);
    sattText('profil-utmaningar', data.utmaningar);
    sattText('profil-genomfort', data.genomfort + '%');

    /* — Aktiv utmaning — */
    if (data.aktiv && data.aktiv.titel) {
      sattText('aktiv-titel', data.aktiv.titel);
      sattText('aktiv-dag', 'Dag ' + data.aktiv.dag + ' av ' + data.aktiv.total);
      const progress = document.getElementById('aktiv-progress');
      if (progress) progress.style.width = data.aktiv.procent + '%';
      sattText('aktiv-procent', data.aktiv.procent + '%');
    } else {
      sattText('aktiv-titel', 'Ingen aktiv utmaning');
      sattText('aktiv-dag', 'Välj en utmaning för att komma igång');
      const progress = document.getElementById('aktiv-progress');
      if (progress) progress.style.width = '0%';
      sattText('aktiv-procent', '0%');
    }

    /* — Veckans sammanfattning — */
    sattText('vecka-traning', data.vecka.traning + ' pass');
    sattText('vecka-kalorier', (data.vecka.kalorier_dagar ?? 0) + '/7 dagar');

    const forb = data.vecka.forbattring;
    const forbEl = document.getElementById('vecka-forbattring');
    if (forbEl) {
      if (forb > 0) {
        forbEl.textContent = '+' + forb + '%';
        forbEl.style.color = '#22C55E';
      } else if (forb < 0) {
        forbEl.textContent = forb + '%';
        forbEl.style.color = '#EF4444';
      } else {
        forbEl.textContent = '—';
        forbEl.style.color = '#ADADAD';
      }
    }

  } catch (fel) {
    console.log('Kunde inte hämta profildata:', fel);
  }

  await laddaValdAtlet(anvandareId);
  await laddaTraningsHistorik(anvandareId);

  const harAktiv = !!(data && data.aktiv && data.aktiv.titel);

  const avslutaKnapp = document.getElementById('avsluta-utmaning-knapp');
  if (avslutaKnapp) {
    if (harAktiv) {
      avslutaKnapp.classList.remove('dold');
      avslutaKnapp.onclick = function () { avslutaUtmaning(anvandareId); };
    } else {
      avslutaKnapp.classList.add('dold');
    }
  }

  const utmaningKort = document.getElementById('utmaning-kort');
  if (utmaningKort) {
    utmaningKort.onclick = function () { oppnaUtmaningPanel(anvandareId, harAktiv); };
  }
}

/* ─────────────────────────────────────────────────────
   UTMANINGAR
───────────────────────────────────────────────────── */
let utmaningPanelOppen = false;

async function laddaUtmaningar(anvandareId, harAktiv) {
  const lista = document.getElementById('utmaning-lista');
  if (!lista) return;

  try {
    const svar = await fetch(`${PROFIL_API}/utmaningar`);
    const utmaningar = await svar.json();

    if (!utmaningar || utmaningar.length === 0) {
      lista.innerHTML = '<div class="historik-laddning">Inga utmaningar tillgängliga.</div>';
      return;
    }

    lista.innerHTML = utmaningar.map(function (u) {
      const knappText = harAktiv ? 'Avsluta pågående först' : 'Starta';
      const knappKlass = harAktiv ? 'utmaning-starta-knapp utmaning-starta-knapp--inaktiv' : 'utmaning-starta-knapp';
      const disabled = harAktiv ? 'disabled' : '';

      return '<div class="utmaning-rad">' +
        '<div class="utmaning-rad-info">' +
          '<div class="utmaning-rad-namn">' + u.namn + '</div>' +
          '<div class="utmaning-rad-beskrivning">' + u.beskrivning + '</div>' +
          '<div class="utmaning-rad-dagar">' + u.krav_dagar + ' dagar</div>' +
        '</div>' +
        '<button class="' + knappKlass + '" ' + disabled + ' onclick="startaUtmaning(' + anvandareId + ', ' + u.id + ')">' + knappText + '</button>' +
      '</div>';
    }).join('');

  } catch (fel) {
    lista.innerHTML = '<div class="historik-laddning">Kunde inte ladda utmaningar.</div>';
  }
}

async function startaUtmaning(anvandareId, milstolpeId) {
  try {
    await fetch(`${PROFIL_API}/anvandare/${anvandareId}/utmaning/starta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milstolpe_id: milstolpeId })
    });
    stangUtmaningPanel();
    await laddaProfil();
  } catch (fel) {
    console.log('Kunde inte starta utmaning:', fel);
  }
}

async function avslutaUtmaning(anvandareId) {
  if (!confirm('Vill du avsluta utmaningen?')) return;
  try {
    await fetch(`${PROFIL_API}/anvandare/${anvandareId}/utmaning/avsluta`, {
      method: 'DELETE'
    });
    await laddaProfil();
  } catch (fel) {
    console.log('Kunde inte avsluta utmaning:', fel);
  }
}

function oppnaUtmaningPanel(anvandareId, harAktiv) {
  const panel = document.getElementById('utmaning-panel');
  if (!panel) return;

  if (utmaningPanelOppen) {
    stangUtmaningPanel();
    return;
  }

  panel.classList.remove('dold');
  utmaningPanelOppen = true;
  laddaUtmaningar(anvandareId, harAktiv);
}

function stangUtmaningPanel() {
  const panel = document.getElementById('utmaning-panel');
  if (panel) panel.classList.add('dold');
  utmaningPanelOppen = false;
}

/* ─────────────────────────────────────────────────────
startar och laddar in sidan
───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', laddaProfil);