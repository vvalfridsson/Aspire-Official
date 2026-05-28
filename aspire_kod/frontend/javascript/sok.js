async function valjAtlet(atletId, knapp) {
  const user = JSON.parse(localStorage.getItem("aspire_inloggad"));
  if (!user) return;
  knapp.textContent = "Väljer...";
  knapp.classList.add("laddning");
  try {
    await fetch(`${ASPIRE_API_BASE_URL}/anvandare/${user.id}/valj-atlet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atlet_id: atletId })
    });
    knapp.textContent = "Vald ✓";
    knapp.classList.remove("laddning");
    knapp.classList.add("vald");
    setTimeout(() => { window.location.href = "hem.html"; }, 600);
  } catch (e) {
    knapp.textContent = "Välj";
    knapp.classList.remove("laddning");
  }
}

document.addEventListener('DOMContentLoaded', function () {

  const sokFalt = document.getElementById('sok-falt');
  if (sokFalt) {
    sokFalt.addEventListener('input', function () {
      sokAtleter(sokFalt.value);
    });
  }

  document.querySelectorAll('.filter-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      filterSport(pill, pill.dataset.sport);
    });
  });

});