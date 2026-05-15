// filen ser till att alla klockslag och batterinivån följer enheten som används

function initStatusBar() {
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
