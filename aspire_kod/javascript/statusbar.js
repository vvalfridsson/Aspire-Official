function renderIcons() {
  const icons = document.querySelector(".statusrad-ikoner");
  if (!icons) return;

  icons.innerHTML = `
    <!-- Signal -->
    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M2 20h2M6 16h2M10 12h2M14 8h2M18 4h2"/>
    </svg>

    <!-- WiFi -->
    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M2 8c5-4 15-4 20 0"/>
      <path d="M5 12c3-3 11-3 14 0"/>
      <path d="M8 16c2-2 6-2 8 0"/>
      <circle cx="12" cy="20" r="1"/>
    </svg>

    <!-- Battery -->
    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
      <rect x="2" y="7" width="18" height="10" rx="2"/>
      <rect id="battery-fill" x="4" y="9" width="17" height="6" rx="1" fill="currentColor"/>
      <rect x="21" y="10" width="1" height="4" rx="1" fill="currentColor"/>
    </svg>
  `;
}

// filen ser till att alla klockslag och batterinivån följer enheten som används

function initStatusBar() {
  renderIcons();
  initTime();
  initBattery();
}

/*tiden, hämtas automatiskt och uppdateras kontinuerligt*/
function initTime() {
  const timeElement = document.querySelector(".statusrad-tid");
  if (!timeElement) return;

  function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    timeElement.textContent = `${hours}:${minutes}`;
  }

  updateTime();
  setInterval(updateTime, 10000);
}

/*batterinivån som visas i appen syncas upp med enhetens nivå, så vår pwa ser ut och fungerar som en riktig app*/
async function initBattery() {
  if (!navigator.getBattery) return;

  const battery = await navigator.getBattery();
  const batteryFill = document.getElementById("battery-fill");
  if (!batteryFill) return;

  function updateBattery() {
    const level = battery.level;
    const maxWidth = 17;
    const newWidth = Math.max(2, level * maxWidth);

    batteryFill.setAttribute("width", newWidth);

    if (battery.charging) {
      batteryFill.style.fill = "#34C759";
    } else if (level < 0.2) {
      batteryFill.style.fill = "#FF3B30";
    } else {
      batteryFill.style.fill = "currentColor";
    }
  }

  updateBattery();
  battery.addEventListener("levelchange", updateBattery);
  battery.addEventListener("chargingchange", updateBattery);
}

document.addEventListener("DOMContentLoaded", initStatusBar);
