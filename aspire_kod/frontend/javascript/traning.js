document.addEventListener('DOMContentLoaded', function () {

  const skapaPassKnapp = document.getElementById('skapa-pass-knapp');
  if (skapaPassKnapp) {
    skapaPassKnapp.addEventListener('click', skapaPass);
  }

  const loggaOvningKnapp = document.getElementById('logga-ovning-knapp');
  if (loggaOvningKnapp) {
    loggaOvningKnapp.addEventListener('click', loggaOvning);
  }

  const avslutaPassKnapp = document.getElementById('avsluta-pass-knapp');
  if (avslutaPassKnapp) {
    avslutaPassKnapp.addEventListener('click', function () {
      aktivtPassId = null;
      document.getElementById('ovning-sektion').classList.add('dold');
      document.getElementById('ovningar-lista').innerHTML = '';
      document.getElementById('aktivt-pass-rubrik').textContent = '—';
      laddaHistorik();
    });
  }

});