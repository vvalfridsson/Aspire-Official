
  const API = "http://127.0.0.1:8002";

  function visaFab() {
    const fab = document.getElementById('fab-traning');
    if (fab) fab.classList.add('synlig');
  }

  function doljFab() {
    const fab = document.getElementById('fab-traning');
    if (fab) fab.classList.remove('synlig');
  }

  function visaValjAtlet() {
    doljFab();
    document.getElementById("huvudinnehall").innerHTML = `
      <div class="valj-atlet-skarm">
        <div class="valj-atlet-titel">Välj en atlet</div>
        <div class="valj-atlet-beskrivning">Gå till sök-sidan och välj en atlet vars schema du vill följa idag.</div>
        <a href="sok.html" class="valj-atlet-knapp">Hitta en atlet</a>
      </div>
    `;
  }

  function renderaSchema(atlet, aktiviteter) {
    const initialer = (atlet.namn || "??").trim().split(" ").map(d => d[0]).join("").substring(0, 2).toUpperCase();
    const totalt = aktiviteter.length;
    const avbockade = aktiviteter.filter(a => a.avbockad).length;
    const procent = totalt > 0 ? Math.round((avbockade / totalt) * 100) : 0;

    const aktivitetHtml = aktiviteter.map((akt, i) => {
      const tid = akt.tid_start && akt.tid_slut ? `${akt.tid_start}–${akt.tid_slut}` : akt.tid_start || "";
      return `
        <div class="aktivitet-rad ${akt.avbockad ? "avbockad" : ""}" id="rad-${akt.id}">
          <div class="aktivitet-prick ${i < Math.ceil(totalt / 2) ? "rod" : "gra"}"></div>
          <div class="aktivitet-ikon">
  ${(() => {
    const typIkon = {
      'träning':      'icons/traning.svg',
      'mat':          'icons/mat.svg',
      'återhämtning': 'icons/aterhamtning.svg',
      'sömn':         'icons/somn.svg',
      'rutin':        'icons/rutin.svg',
      'mental':       'icons/mental.svg'
    };
    const ikonSrc = typIkon[akt.typ];
    return ikonSrc
      ? `<img src="${ikonSrc}" width="20" height="20" class="aktivitet-ikon-bild">`
      : `<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
  })()}
</div>
          <div class="aktivitet-kropp">
            ${tid ? `<div class="aktivitet-tid">${tid}</div>` : ""}
            <div class="aktivitet-namn">${akt.namn}</div>
            ${akt.beskrivning ? `<div class="aktivitet-beskrivning">${akt.beskrivning}</div>` : ""}
          </div>
          <button class="bocka-knapp ${akt.avbockad ? "klar" : ""}" onclick="bockaAv(${akt.id}, this)">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
      `;
    }).join("");

    document.getElementById("huvudinnehall").innerHTML = `
      <div class="schema-header">
        <div class="schema-fortitel">Idag tränar du som</div>
        <div class="schema-namnrad">
          <div class="schema-namn-stor">${atlet.namn || "Atleten"}</div>
          <div class="schema-avatar">${initialer}<div class="schema-badge">${atlet.id}</div></div>
        </div>
        <div class="etikett-pill">Aktiviteter</div>
      </div>
      <div class="progress-omslag">
        <div class="progress-info">
          <span class="progress-text">${avbockade} av ${totalt} klara</span>
          <span class="progress-procent">${procent}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${procent}%"></div></div>
      </div>
      ${aktivitetHtml}
      <a href="sok.html" class="byt-atlet-rad">
        <span>Byt atlet</span>
        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </a>
      <div class="botten-mellanrum"></div>
    `;
    visaFab();
  }

  async function bockaAv(aktivitetId, knapp) {
    const user = JSON.parse(localStorage.getItem("aspire_inloggad"));
    if (!user) return;
    const radEl = document.getElementById(`rad-${aktivitetId}`);
    const arKlar = knapp.classList.contains("klar");
    knapp.classList.toggle("klar", !arKlar);
    radEl.classList.toggle("avbockad", !arKlar);
    try {
      await fetch(`${API}/anvandare/${user.id}/schema/${aktivitetId}/bocka-av`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avbockad: !arKlar })
      });
      await laddaHem();
    } catch (e) {
      knapp.classList.toggle("klar", arKlar);
      radEl.classList.toggle("avbockad", arKlar);
    }
  }

  async function laddaHem() {
    const user = JSON.parse(localStorage.getItem("aspire_inloggad"));
    if (!user) { window.location.href = "index.html"; return; }
    try {
      const [atletSvar, schemaSvar] = await Promise.all([
        fetch(`${API}/anvandare/${user.id}/vald-atlet`),
        fetch(`${API}/anvandare/${user.id}/schema/idag`)
      ]);
      if (atletSvar.status === 404) { visaValjAtlet(); return; }
      const atlet = await atletSvar.json();
      const schema = await schemaSvar.json();
      renderaSchema(atlet, schema);
    } catch (e) {
      visaValjAtlet();
    }
  }

  document.addEventListener("DOMContentLoaded", laddaHem);
