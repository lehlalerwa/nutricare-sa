document.addEventListener("DOMContentLoaded", () => {
  console.log("NutriCare SA running ✅");

  /* ===============================
     CSV PARSER
     =============================== */
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let col = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && !inQuotes) {
        inQuotes = true;
        continue;
      }

      if (char === '"' && inQuotes) {
        if (next === '"') {
          col += '"';
          i++;
        } else {
          inQuotes = false;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        row.push(col.trim());
        col = "";
      } else if (char === "\n" && !inQuotes) {
        row.push(col.trim());
        rows.push(row);
        row = [];
        col = "";
      } else {
        col += char;
      }
    }

    if (col || row.length) {
      row.push(col.trim());
      rows.push(row);
    }

    return rows;
  }

  /* ===============================
     HEADER MAPPING
     =============================== */
  function mapHeaders(headers) {
    const map = {};

    headers.forEach((h, i) => {
      const key = h.toLowerCase();

      if (key.includes("disease") || key.includes("condition")) map.disease = i;
      if (key.includes("age")) map.age = i;
      if (key.includes("energy")) map.energy = i;
      if (key.includes("protein")) map.protein = i;
      if (key.includes("carb")) map.carbs = i;
      if (key.includes("fat") || key.includes("lipid")) map.fats = i;
      if (key.includes("note")) map.notes = i;
    });

    return map;
  }

  /* ===============================
     BUILD CARDS
     =============================== */
  function buildCards(csvText, containerId, showAge) {
    const rows = parseCSV(csvText);
    const headers = rows[0];
    const map = mapHeaders(headers);

    const container = document.getElementById(containerId);
    container.innerHTML = "";

    rows.slice(1).forEach(row => {
      const disease = row[map.disease]?.trim();
      if (!disease) return;

      const age = map.age !== undefined ? row[map.age] : "";
      const energy = row[map.energy] || "-";
      const protein = row[map.protein] || "-";
      const carbs = row[map.carbs] || "-";
      const fats = row[map.fats] || "-";
      const notes = row[map.notes] || "";

      const card = document.createElement("div");
      card.className = "card";
      card.dataset.disease = disease.toUpperCase();

      card.innerHTML = `
        <button class="collapsible">${disease}</button>
        <div class="content">
          ${showAge && age ? `<p><strong>Age group:</strong> ${age}</p>` : ""}
          <p><strong>Energy:</strong> ${energy}</p>
          <p><strong>Protein:</strong> ${protein}</p>
          <p><strong>Carbohydrates:</strong> ${carbs}</p>
          <p><strong>Fats:</strong> ${fats}</p>
          ${notes ? `<p><em>${notes}</em></p>` : ""}
        </div>
      `;

      container.appendChild(card);
    });
  }

  /* ===============================
     ACCORDION COLLAPSIBLE
     =============================== */
  function setupCollapsibles(containerId) {
    const container = document.getElementById(containerId);

    container.addEventListener("click", e => {
      if (!e.target.classList.contains("collapsible")) return;

      // Close all open cards first
      container.querySelectorAll(".content").forEach(c => {
        if (c !== e.target.nextElementSibling) c.style.display = "none";
      });

      // Toggle selected card
      const content = e.target.nextElementSibling;
      content.style.display =
        content.style.display === "block" ? "none" : "block";
    });
  }

  /* ===============================
     SEARCH FILTER
     =============================== */
  function setupSearch(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);

    input.addEventListener("input", () => {
      const term = input.value.toUpperCase();

      container.querySelectorAll(".card").forEach(card => {
        card.style.display = card.dataset.disease.includes(term)
          ? ""
          : "none";
      });
    });
  }

  /* ===============================
     LOAD CSV SAFELY
     =============================== */
  function loadCSV(file, containerId, showAge) {
    fetch(file)
      .then(r => {
        if (!r.ok) throw new Error("CSV not found: " + file);
        return r.text();
      })
      .then(text => buildCards(text, containerId, showAge))
      .catch(err => {
        console.error(err);
        document.getElementById(containerId).innerHTML =
          "<p>⚠️ Unable to load recommendations.</p>";
      });
  }

  loadCSV("./adult.csv", "adultContainer", false);
  loadCSV("./paediatric.csv", "paediatricContainer", true);

  setupCollapsibles("adultContainer");
  setupCollapsibles("paediatricContainer");

  setupSearch("adultSearch", "adultContainer");
  setupSearch("paediatricSearch", "paediatricContainer");

  /* ===============================
     INSTALL PROMPT (Android Only)
     =============================== */
  let deferredPrompt;
  const installBtn = document.getElementById("installBtn");

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    deferredPrompt = null;
    installBtn.hidden = true;
  });

  /* ===============================
     SERVICE WORKER (Universal Safe)
     =============================== */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("PWA Offline Ready ✅"))
      .catch(err => console.error("SW Error:", err));
  }

  /* ===============================
     FOOTER LAST UPDATED
     =============================== */
  const lastUpdatedElement = document.getElementById("lastUpdated");
  if (lastUpdatedElement) {
    lastUpdatedElement.textContent = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }
});