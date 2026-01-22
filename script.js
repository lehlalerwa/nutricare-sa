document.addEventListener("DOMContentLoaded", () => {
  console.log("NutriCare SA JS working ✅");

  /* ===============================
     ROBUST CSV PARSER
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
     HEADER → INDEX MAPPER
     =============================== */
  function mapHeaders(headers) {
    const map = {};

    headers.forEach((h, i) => {
      const key = h.toLowerCase();

      if (key.includes("disease") || key.includes("condition")) map.disease = i;
      if (key.includes("age")) map.age = i;
      if (key.includes("energy")) map.energy = i;
      if (key.includes("protein")) map.protein = i;
      if (key.includes("fat") || key.includes("lipid")) map.fats = i;
      if (key.includes("carbohydrate")) map.carbs = i;
      if (key.includes("note")) map.notes = i;
    });

    return map;
  }

  /* ===============================
     CARD BUILDER
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
      const energy = row[map.energy] || "";
      const protein = row[map.protein] || "";
      const carbs = row[map.carbs] || "";
      const fats = row[map.fats] || "";
      const notes = row[map.notes] || "";

      const card = document.createElement("div");
      card.className = "card";
      card.dataset.disease = disease.toUpperCase();

      card.innerHTML = `
        <button class="collapsible">${disease}</button>
        <div class="content" style="display:none">
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
     COLLAPSIBLES
     =============================== */
  function setupCollapsibles(containerId) {
    const container = document.getElementById(containerId);
    container.addEventListener("click", e => {
      if (e.target.classList.contains("collapsible")) {
        const content = e.target.nextElementSibling;
        content.style.display =
          content.style.display === "block" ? "none" : "block";
      }
    });
  }

  /* ===============================
     SEARCH
     =============================== */
  function setupSearch(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);

    input.addEventListener("input", () => {
      const term = input.value.toUpperCase();
      container.querySelectorAll(".card").forEach(card => {
        card.style.display =
          card.dataset.disease.includes(term) ? "" : "none";
      });
    });
  }

  /* ===============================
     LOAD CSV (OFFLINE SAFE)
     =============================== */
  fetch("./adult.csv")
    .then(r => r.text())
    .then(t => buildCards(t, "adultContainer", false));

  fetch("./paediatric.csv")
    .then(r => r.text())
    .then(t => buildCards(t, "paediatricContainer", true));

  setupCollapsibles("adultContainer");
  setupCollapsibles("paediatricContainer");

  setupSearch("adultSearch", "adultContainer");
  setupSearch("paediatricSearch", "paediatricContainer");

  /* ===============================
     PWA
     =============================== */
 if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/nutricare-sa/service-worker.js", { scope: "/nutricare-sa/" })
      .then(() => console.log("NutriCare SA PWA ready ✅"))
      .catch(err => console.error("Service Worker failed:", err));
  });
}
});
