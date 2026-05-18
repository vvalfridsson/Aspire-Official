// Variabler
let valtDatum = new Date(); 
let habitDagar = {
  traning: [] 
};

// Håller kåll på månaderna
const MANADER = [
  "Januari", "Februari", "Mars", "April", "Maj", "Juni", 
  "Juli", "Augusti", "September", "Oktober", "November", "December"
];

// Drag and drop grejer
let hallerNerMusen = false;
let skaMarkeras = true; 

// Sluta rita
document.addEventListener("mouseup", function() {
  hallerNerMusen = false;
});

// Byt flik
function bytAktFlik(klickadKnapp, vyId) {
  let knappar = document.querySelectorAll('.akt-flik');
  for (let i = 0; i < knappar.length; i++) {
    knappar[i].classList.remove('aktiv');
  }
  klickadKnapp.classList.add('aktiv');

  let vyer = document.querySelectorAll('.akt-vy');
  for (let i = 0; i < vyer.length; i++) {
    vyer[i].classList.add('dold');
  }
  document.getElementById(vyId).classList.remove('dold');
}

// Rita ut själva kalendern
function ritaKalender() {
  let rutorContainer = document.getElementById("kal-rutor");
  let manadText = document.getElementById("kal-manad-text");

  if (!rutorContainer || !manadText) return;

  let ar = valtDatum.getFullYear();
  let manad = valtDatum.getMonth();

  manadText.textContent = MANADER[manad] + " " + ar;
  rutorContainer.innerHTML = "";

  let forstaDagen = new Date(ar, manad, 1).getDay();
  let tommaRutor = (forstaDagen === 0) ? 6 : forstaDagen - 1;
  let antalDagar = new Date(ar, manad + 1, 0).getDate();
  let idag = new Date();

  // Lägg till tomma rutor först
  for (let i = 0; i < tommaRutor; i++) {
    let tomDiv = document.createElement("div");
    tomDiv.className = "kal-ruta tom";
    rutorContainer.appendChild(tomDiv);
  }

  // Rita alla riktiga dagar
  for (let dag = 1; dag <= antalDagar; dag++) {
    let ruta = document.createElement("div");
    ruta.className = "kal-ruta";
    ruta.textContent = dag; 

    // Fixa rätt datum format
    let datumStrang = ar + "-" + String(manad + 1).padStart(2, '0') + "-" + String(dag).padStart(2, '0');

    if (habitDagar.traning.includes(datumStrang)) {
      ruta.classList.add("aktiv"); 
    }

    if (ar === idag.getFullYear() && manad === idag.getMonth() && dag === idag.getDate()) {
      ruta.classList.add("idag"); 
    }

    // Klicka och dra
    ruta.addEventListener("mousedown", function(event) {
      event.preventDefault(); 
      hallerNerMusen = true;
      skaMarkeras = !ruta.classList.contains("aktiv");
      klickaPaRuta(ruta, datumStrang);
    });

    ruta.addEventListener("mouseenter", function() {
      if (hallerNerMusen) {
        klickaPaRuta(ruta, datumStrang);
      }
    });

    rutorContainer.appendChild(ruta);
  }
}

// Fixa markeringen
function klickaPaRuta(ruta, datumStrang) {
  if (skaMarkeras) {
    ruta.classList.add("aktiv"); 
    if (!habitDagar.traning.includes(datumStrang)) {
      habitDagar.traning.push(datumStrang);
    }
  } else {
    ruta.classList.remove("aktiv"); 
    let index = habitDagar.traning.indexOf(datumStrang);
    if (index > -1) {
      habitDagar.traning.splice(index, 1);
    }
  }

  // Uppdaterar grferna direkt
  ritaStaplar();
  uppdateraSiffror();
}

// Staplarna för statistik
function ritaStaplar() {
  let staplarContainer = document.getElementById("statistik-staplar");
  let etiketterContainer = document.getElementById("statistik-staplar-etiketter");

  if (!staplarContainer || !etiketterContainer) return;

  staplarContainer.innerHTML = "";
  etiketterContainer.innerHTML = "";

  let dagensDatum = new Date();
  let aktuellManad = dagensDatum.getMonth();
  let aktuelltAr = dagensDatum.getFullYear();

  for (let m = 5; m >= 0; m--) {
    let loopManad = aktuellManad - m;
    let loopAr = aktuelltAr;

    if (loopManad < 0) {
      loopManad = loopManad + 12;
      loopAr = loopAr - 1;
    }

    let manadPrefix = loopAr + "-" + String(loopManad + 1).padStart(2, '0');
    let antalAktivaDagar = 0;

    for (let i = 0; i < habitDagar.traning.length; i++) {
      if (habitDagar.traning[i].startsWith(manadPrefix)) {
        antalAktivaDagar++;
      }
    }

    let hojdProcent = (antalAktivaDagar / 31) * 100;
    if (hojdProcent < 4) hojdProcent = 4; 
    
    let fargKlass = (m === 0) ? "nuvarande" : "aldre";
    let siffraText = (antalAktivaDagar > 0) ? antalAktivaDagar : "";

    staplarContainer.innerHTML += '<div class="statistik-stapel ' + fargKlass + '" style="height:' + hojdProcent + '%">' + siffraText + '</div>';
    
    let kortManadsNamn = MANADER[loopManad].substring(0, 3);
    etiketterContainer.innerHTML += '<span>' + kortManadsNamn + '</span>';
  }
}

// Matte för habit score
function uppdateraSiffror() {
  let antalDagar = habitDagar.traning.length;
  
  let habitScore = 0;
  if(antalDagar > 0) {
     habitScore = Math.min(100, Math.floor(antalDagar * 4.5)); 
  }
  
  let ringText = document.getElementById("statistik-ring-text");
  let ringFyll = document.getElementById("statistik-ring-fyll");
  
  if(ringText && ringFyll) {
     ringText.textContent = habitScore;
     let dashOffset = 377 - (377 * (habitScore / 100)); 
     ringFyll.style.strokeDashoffset = dashOffset;
  }

  let aktivaKort = document.getElementById("statistik-aktiva");
  let poangKort = document.getElementById("statistik-poang");
  
  if (aktivaKort) aktivaKort.textContent = antalDagar;
  if (poangKort) poangKort.textContent = antalDagar * 10;
}

// Starta upp allt
function uppdateraAllt() {
  ritaKalender();
  ritaStaplar();
  uppdateraSiffror();
}

// Event listeners för pilarna
document.addEventListener("DOMContentLoaded", function() {
  let bakutKnapp = document.getElementById("kal-bakut");
  let framatKnapp = document.getElementById("kal-framat");

  if (bakutKnapp) {
    bakutKnapp.addEventListener("click", function() {
      valtDatum.setMonth(valtDatum.getMonth() - 1);
      ritaKalender(); 
    });
  }

  if (framatKnapp) {
    framatKnapp.addEventListener("click", function() {
      valtDatum.setMonth(valtDatum.getMonth() + 1);
      ritaKalender(); 
    });
  }
  
  uppdateraAllt();
});

// Nollställ knapp
async function aterstallData() {
  let arDuSaker = confirm("Vill du verkligen nollställa dina streaks? Det går inte att ångra.");
  if (!arDuSaker) return;
  
  // 1. Töm listan med dagar direkt i webbläsaren
  habitDagar.traning = []; 
  
  // 2. Rita om hela kalendern, staplarna och poängen (all röd färg försvinner!)
  uppdateraAllt(); 
  
  // 3. Nollställ även de fasta textsiffrorna för streaks
  if (document.getElementById("statistik-streak")) {
    document.getElementById("statistik-streak").textContent = "0";
  }
  if (document.getElementById("statistik-langsta")) {
    document.getElementById("statistik-langsta").textContent = "0";
  }
  if (document.getElementById("kal-streak-siffra")) {
    document.getElementById("kal-streak-siffra").textContent = "0 DAGAR";
  }

  // 4. Skicka signalen till databasen i bakgrunden
  const anvandareId = localStorage.getItem("anvandare_id");
  if (!anvandareId) return;

  try {
      await fetch(`http://127.0.0.1:8001/streak/${anvandareId}/reset`, { method: 'POST' });
  } catch(fel) {
      console.log("Databasen kunde inte nås för reset:", fel);
  }
}