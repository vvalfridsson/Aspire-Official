document.addEventListener('DOMContentLoaded', function () {
  try {
    const id = new URLSearchParams(window.location.search).get("id") || "1";
    const sparade = JSON.parse(localStorage.getItem('aspire_alla_atleter')) || [];
    const atlet = sparade.find(a => a.id == id);
    if (atlet) {
      const delar = atlet.namn ? atlet.namn.trim().split(" ") : [];
      const init = delar.length === 1 ? delar[0].substring(0, 2) : (delar[0][0] + delar[delar.length - 1][0]);

      document.getElementById("profil-avatar").textContent = atlet.initialer || init.toUpperCase();
      document.getElementById("profil-namn").textContent = atlet.namn || "";
      document.getElementById("profil-sport").textContent = atlet.sport || "";
      document.getElementById("profil-kalorier").textContent = atlet.kcal_per_dag ? atlet.kcal_per_dag + " kcal" : "Saknas";
      document.getElementById("profil-traning").textContent = atlet.traningstid_timmar ? atlet.traningstid_timmar + "h/dag" : "Saknas";
      document.getElementById("profil-citat").textContent = atlet.citat || "Ingen motivationstext finns ännu.";
      document.title = "Aspire — " + (atlet.namn || "Profil");

      const joints = document.querySelectorAll(".atlet-stat-siffra");
      const statVarden = [
        atlet.kcal_per_dag || "-",
        atlet.traningstid_timmar ? atlet.traningstid_timmar + "h" : "-",
        atlet.sport || "-",
        atlet.id || "-"
      ];
      joints.forEach((el, i) => { if (el) el.textContent = statVarden[i]; });
    }
  } catch (e) { console.error(e); }
});

document.querySelectorAll('.flik').forEach(function (knapp) {
  knapp.addEventListener('click', function () {
    const vy = knapp.textContent.trim().toLowerCase()
      .replace('schema', 'schema')
      .replace('kost', 'kost')
      .replace('träning', 'traning');
    byttFlik(knapp, vy);
  });
});