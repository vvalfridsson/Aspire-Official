document.addEventListener('DOMContentLoaded', function () {

  const skapaPassKnapp = document.getElementById('skapa-pass-knapp');
  if (skapaPassKnapp) {
    skapaPassKnapp.addEventListener('click', skapaPass);
  }

  const loggaOvningKnapp = document.getElementById('logga-ovning-knapp');
  if (loggaOvningKnapp) {
    loggaOvningKnapp.addEventListener('click', loggaOvning);
  }

});