const ASPIRE_STREAK_API = 'http://127.0.0.1:8002';

let valtDatum = new Date();
let habitDagar = [];

const MANADER = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
];

/* ─────────────────────────────────────────────────────
   HÄMTA DATA FRÅN DATABASEN
───────────────────────────────────────────────────── */
async function laddaStreakData() {
  const user = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) return;

  try {
    const svar = await fetch(`${ASPIRE_STREAK_API}/streak/${user.id}`);
    const data = await svar.json();

    habitDagar = data.dagar || [];

    uppdateraStreakSiffror(data.aktuell || 0, data.langsta || 0);
    uppdateraAllt();
  } catch (fel) {
    console.log('Kunde inte hämta streak-data:', fel);
    uppdateraAllt();
  }
}

/* ─────────────────────────────────────────────────────
   UPPDATERA STREAK-SIFFROR
───────────────────────────────────────────────────── */
function uppdateraStreakSiffror(aktuell, langsta) {
  const streakSiffra = document.getElementById('kal-streak-siffra');
  const statistikStreak = document.getElementById('statistik-streak');
  const statistikLangsta = document.getElementById('statistik-langsta');

  if (streakSiffra) streakSiffra.textContent = aktuell + ' DAGAR';
  if (statistikStreak) statistikStreak.textContent = aktuell;
  if (statistikLangsta) statistikLangsta.textContent = langsta;
}

/* ─────────────────────────────────────────────────────
   BYTA FLIK
───────────────────────────────────────────────────── */
function bytAktFlik(klickadKnapp, vyId) {
  document.querySelectorAll('.akt-flik').forEach(function (k) {
    k.classList.remove('aktiv');
  });
  klickadKnapp.classList.add('aktiv');

  document.querySelectorAll('.akt-vy').forEach(function (v) {
    v.classList.add('dold');
  });
  document.getElementById(vyId).classList.remove('dold');
}

/* ─────────────────────────────────────────────────────
   RITA KALENDER
───────────────────────────────────────────────────── */
function ritaKalender() {
  const rutorContainer = document.getElementById('kal-rutor');
  const manadText = document.getElementById('kal-manad-text');
  if (!rutorContainer || !manadText) return;

  const ar = valtDatum.getFullYear();
  const manad = valtDatum.getMonth();

  manadText.textContent = MANADER[manad] + ' ' + ar;
  rutorContainer.innerHTML = '';

  const forstaDagen = new Date(ar, manad, 1).getDay();
  const tommaRutor = (forstaDagen === 0) ? 6 : forstaDagen - 1;
  const antalDagar = new Date(ar, manad + 1, 0).getDate();
  const idag = new Date();

  for (let i = 0; i < tommaRutor; i++) {
    const tomDiv = document.createElement('div');
    tomDiv.className = 'kal-ruta tom';
    rutorContainer.appendChild(tomDiv);
  }

  for (let dag = 1; dag <= antalDagar; dag++) {
    const ruta = document.createElement('div');
    ruta.className = 'kal-ruta';
    ruta.textContent = dag;

    const datumStrang = ar + '-' + String(manad + 1).padStart(2, '0') + '-' + String(dag).padStart(2, '0');

    if (habitDagar.includes(datumStrang)) {
      ruta.classList.add('aktiv');
    }

    if (ar === idag.getFullYear() && manad === idag.getMonth() && dag === idag.getDate()) {
      ruta.classList.add('idag');
    }

    rutorContainer.appendChild(ruta);
  }
}

/* ─────────────────────────────────────────────────────
   RITA STAPLAR
───────────────────────────────────────────────────── */
function ritaStaplar() {
  const staplarContainer = document.getElementById('statistik-staplar');
  const etiketterContainer = document.getElementById('statistik-staplar-etiketter');
  if (!staplarContainer || !etiketterContainer) return;

  staplarContainer.innerHTML = '';
  etiketterContainer.innerHTML = '';

  const dagensDatum = new Date();
  const aktuellManad = dagensDatum.getMonth();
  const aktuelltAr = dagensDatum.getFullYear();

  for (let m = 5; m >= 0; m--) {
    let loopManad = aktuellManad - m;
    let loopAr = aktuelltAr;

    if (loopManad < 0) {
      loopManad += 12;
      loopAr -= 1;
    }

    const manadPrefix = loopAr + '-' + String(loopManad + 1).padStart(2, '0');
    let antalAktivaDagar = 0;

    for (let i = 0; i < habitDagar.length; i++) {
      if (habitDagar[i].startsWith(manadPrefix)) antalAktivaDagar++;
    }

    let hojdProcent = (antalAktivaDagar / 31) * 100;
    if (hojdProcent < 4) hojdProcent = 4;

    const fargKlass = (m === 0) ? 'nuvarande' : 'aldre';
    const siffraText = (antalAktivaDagar > 0) ? antalAktivaDagar : '';

    staplarContainer.innerHTML += '<div class="statistik-stapel ' + fargKlass + '" style="height:' + hojdProcent + '%">' + siffraText + '</div>';
    etiketterContainer.innerHTML += '<span>' + MANADER[loopManad].substring(0, 3) + '</span>';
  }
}

/* ─────────────────────────────────────────────────────
   UPPDATERA HABIT SCORE, AKTIVA DAGAR, POÄNG
───────────────────────────────────────────────────── */
function uppdateraSiffror() {
  const antalDagar = habitDagar.length;
  const habitScore = antalDagar > 0 ? Math.min(100, Math.floor(antalDagar * 4.5)) : 0;

  const ringText = document.getElementById('statistik-ring-text');
  const ringFyll = document.getElementById('statistik-ring-fyll');

  if (ringText) ringText.textContent = habitScore;
  if (ringFyll) ringFyll.style.strokeDashoffset = 377 - (377 * (habitScore / 100));

  const aktivaKort = document.getElementById('statistik-aktiva');
  const poangKort = document.getElementById('statistik-poang');

  if (aktivaKort) aktivaKort.textContent = antalDagar;
  if (poangKort) poangKort.textContent = antalDagar * 10;
}

function uppdateraAllt() {
  ritaKalender();
  ritaStaplar();
  uppdateraSiffror();
}

/* ─────────────────────────────────────────────────────
   NOLLSTÄLL
───────────────────────────────────────────────────── */
async function aterstallData() {
  const arDuSaker = confirm('Vill du verkligen nollställa dina streaks? Det går inte att ångra.');
  if (!arDuSaker) return;

  const user = JSON.parse(localStorage.getItem('aspire_inloggad'));
  if (!user) return;

  habitDagar = [];
  uppdateraAllt();
  uppdateraStreakSiffror(0, 0);

  try {
    await fetch(`${ASPIRE_STREAK_API}/streak/${user.id}/reset`, { method: 'POST' });
  } catch (fel) {
    console.log('Databasen kunde inte nås för reset:', fel);
  }
}

/* ─────────────────────────────────────────────────────
   EVENT LISTENERS & UPPSTART
───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  const bakutKnapp = document.getElementById('kal-bakut');
  const framatKnapp = document.getElementById('kal-framat');

  if (bakutKnapp) {
    bakutKnapp.addEventListener('click', function () {
      valtDatum.setMonth(valtDatum.getMonth() - 1);
      ritaKalender();
    });
  }

  if (framatKnapp) {
    framatKnapp.addEventListener('click', function () {
      valtDatum.setMonth(valtDatum.getMonth() + 1);
      ritaKalender();
    });
  }

  document.querySelectorAll('.akt-flik').forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      bytAktFlik(knapp, knapp.dataset.vy);
    });
  });

  const resetKnapp = document.getElementById('reset-knapp');
  if (resetKnapp) {
    resetKnapp.addEventListener('click', aterstallData);
  }

  laddaStreakData();
});