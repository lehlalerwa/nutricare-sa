document.addEventListener("DOMContentLoaded", () => {
  console.log("NutriCare SA JS working ✅");

// Robust CSV parser
function parseCSV(text) {
  const rows = [];
  let row = [];
  let col = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
      continue;
    } else if (char === '"' && inQuotes) {
      if (nextChar === '"') { // escaped quote
        col += '"';
        i++;
      } else {
        inQuotes = false;
        continue;
      }
    }

    if (char === "," && !inQuotes) {
      row.push(col);
      col = "";
    } else if (char === "\n" && !inQuotes) {
      row.push(col);
      rows.push(row);
      row = [];
      col = "";
    } else {
      col += char;
    }
  }

  // push last column/row if file does not end with newline
  if (col.length || row.length) {
    row.push(col);
    rows.push(row);
  }

  return rows;
}


  // ----- BUILD CARDS -----
  function buildCardsFromCSV(csvText, containerId) {
    const rows = parseCSV(csvText);
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    // Skip header row (first row)
    rows.slice(1).forEach(row => {
     const disease = (row[0] || "").trim();
const energy  = (row[2] || "").trim();
const protein = (row[3] || "").trim();
const carbs   = (row[4] || "").trim();
const fats    = (row[5] || "").trim();
const notes   = (row[6] || "").trim();

      if (!disease) return; // skip empty rows

      const card = document.createElement("div");
      card.className = "card";
      card.dataset.disease = disease.toUpperCase();

      card.innerHTML = `
        <button class="collapsible">${disease}</button>
        <div class="content">
          <p><strong>Energy:</strong> ${energy || ""}</p>
          <p><strong>Protein:</strong> ${protein || ""}</p>
          <p><strong>Carbohydrates:</strong> ${carbs || ""}</p>
          <p><strong>Fats:</strong> ${fats || ""}</p>
          <p><em>${notes || ""}</em></p>
        </div>
      `;

      container.appendChild(card);
    });
  }

  // ----- COLLAPSIBLE SETUP -----
  function setupCollapsibles(containerId) {
    const container = document.getElementById(containerId);
    container.addEventListener("click", function (e) {
      if (e.target && e.target.classList.contains("collapsible")) {
        const content = e.target.nextElementSibling;
        content.style.display =
          content.style.display === "block" ? "none" : "block";
      }
    });
  }
  // ----- SEARCH SETUP -----
function setupSearch(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);

  if (!input || !container) return;

  input.addEventListener("input", () => {
    const filter = input.value.toUpperCase();
    const cards = container.querySelectorAll(".card");

    cards.forEach(card => {
      const disease = card.dataset.disease || "";
      card.style.display = disease.includes(filter) ? "" : "none";
    });
  });
}

function loadVersionInfo(csvText) {
  const rows = parseCSV(csvText);

  let version = "";
  let updated = "";

  rows.slice(1).forEach(row => {
    const key = (row[0] || "").trim();
    const value = (row[1] || "").trim();

    if (key === "app_version") version = value;
    if (key === "last_updated") updated = value;
  });

  const el = document.getElementById("versionInfo");
  if (el) {
    el.innerHTML = `
      NutriCare SA v${version}<br>
      <small>Recommendations last updated: ${updated}</small>
    `;
  }
}

  // ----- CSV LINKS -----
  const adultCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQG1Q3SV22JE3A54kFrIrNIXA4W1ah8zxSNFn-nR3OsNIevSG6ybpIJV_d2_zlbP1FwzhCyCs2JN8x0/pub?gid=1989255355&single=true&output=csv";
  const paediatricCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8jGwgvVsgAefxBFcXEhWsqNbnU6trUosFe-FLvr-E_IvZH44txGhH8g5FQDcDy2NbgRqAx_6eJdnO/pub?gid=2024151986&single=true&output=csv";

  // ----- LOAD ADULT -----
  fetch(adultCSV)
    .then(res => res.text())
    .then(text => buildCardsFromCSV(text, "adultContainer"))
    .catch(err => console.error("Adult CSV load error:", err));

  // ----- LOAD PAEDIATRIC -----
  fetch(paediatricCSV)
    .then(res => res.text())
    .then(text => buildCardsFromCSV(text, "paediatricContainer"))
    .catch(err => console.error("Paediatric CSV load error:", err));

    const versionCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTysJgBs-JnGgjMqTE8ifEixLZIwl38ykLjB6tnk4aXUhtw0EqoAxh5iRPhqEuIIuWXbrfRqyfaKgBx/pub?gid=0&single=true&output=csv";

fetch(versionCSV)
  .then(res => res.text())
  .then(text => loadVersionInfo(text))
  .catch(err => console.error("Version load error:", err));


  // ----- SETUP COLLAPSIBLES -----
  setupCollapsibles("adultContainer");
  setupCollapsibles("paediatricContainer");

  setupSearch("adultSearch", "adultContainer");
setupSearch("paediatricSearch", "paediatricContainer");

// ----- SERVICE WORKER REGISTRATION (PWA STEP 3) -----
if ("serviceWorker" in navigator) {
   navigator.serviceWorker.register("./service-worker.js");
}
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("NutriCare SA PWA ready ✅"))
      .catch(err => console.error("Service Worker failed:", err));
  });
}

});


