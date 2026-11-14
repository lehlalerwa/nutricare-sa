document.addEventListener("DOMContentLoaded", () => {
  const pages = [...document.querySelectorAll("[data-page-section]")];
  const links = [...document.querySelectorAll("[data-page]")];
  const nav = document.getElementById("mainNav");
  const menuToggle = document.getElementById("menuToggle");

  function showPage(pageName) {
    const target = pages.find(page => page.dataset.pageSection === pageName) || pages[0];
    pages.forEach(page => page.classList.toggle("active", page === target));
    links.forEach(link => {
      const active = link.dataset.page === target.dataset.pageSection;
      link.classList.toggle("active", active && link.classList.contains("nav-link"));
      if (link.classList.contains("nav-link")) {
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
    });
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  links.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const pageName = link.dataset.page;
      history.replaceState(null, "", "#" + pageName);
      showPage(pageName);
    });
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  showPage(location.hash.replace("#", "") || "home");

  // Adult recommendations are loaded from the separate NutriCare SA Supabase project.
  const adultList = document.getElementById("adultList");
  const adultStatus = document.getElementById("adultStatus");
  const adultSearch = document.getElementById("adultSearch");
  let adultRows = [];

  function safeText(value) {
    return value === null || value === undefined || String(value).trim() === "" ? "Not specified" : String(value);
  }

  function renderAdultRows() {
    const query = (adultSearch.value || "").trim().toLowerCase();
    const filtered = adultRows.filter(row =>
      [row.condition, row.description, row.notes, row.source_reference]
        .some(value => String(value || "").toLowerCase().includes(query))
    );

    adultList.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = adultRows.length ? "No matching conditions. Try another search." : "No adult recommendations are available yet.";
      adultList.append(empty);
      return;
    }

    filtered.forEach(row => {
      const card = document.createElement("details");
      card.className = "reference-card";
      const summary = document.createElement("summary");
      summary.textContent = safeText(row.condition);
      const body = document.createElement("div");
      body.className = "reference-card-body";

      if (row.description) {
        const description = document.createElement("p");
        description.className = "reference-description";
        description.textContent = row.description;
        body.append(description);
      }

      const metrics = document.createElement("div");
      metrics.className = "reference-metrics";
      [
        ["Energy", row.energy_kcal_kg_day, "kcal/kg/day"],
        ["Protein", row.protein_g_kg_day, "g/kg/day"],
        ["Fat", row.fat_percent_energy, "% of energy"],
        ["Carbohydrate", row.carbohydrate_percent_energy, "% of energy"]
      ].forEach(([label, value, unit]) => {
        const metric = document.createElement("div");
        metric.className = "metric";
        const small = document.createElement("small");
        small.textContent = label;
        const strong = document.createElement("strong");
        strong.textContent = value ? safeText(value) + (value === "Not specified" ? "" : " " + unit) : "Not specified";
        metric.append(small, strong);
        metrics.append(metric);
      });
      body.append(metrics);

      if (row.notes) {
        const notes = document.createElement("p");
        notes.className = "reference-notes";
        const label = document.createElement("strong");
        label.textContent = "Clinical notes: ";
        notes.append(label, document.createTextNode(row.notes));
        body.append(notes);
      }
      if (row.source_reference) {
        const source = document.createElement("p");
        source.className = "reference-source";
        source.textContent = "Listed source: " + row.source_reference;
        body.append(source);
      }
      card.append(summary, body);
      adultList.append(card);
    });
  }

  async function loadAdultRecommendations() {
    const config = window.NUTRICARE_SUPABASE || {};
    if (!config.url || !config.publishableKey || !window.supabase) {
      adultStatus.textContent = "Database connection details are not configured yet.";
      adultList.innerHTML = '<div class="empty-state">The adult reference database is not connected yet.</div>';
      return;
    }
    try {
      const client = window.supabase.createClient(config.url, config.publishableKey);
      const { data, error } = await client
        .from("adult_recommendations")
        .select("*")
        .eq("approval_status", "approved")
        .order("display_order", { ascending: true })
        .order("condition", { ascending: true });
      if (error) throw error;
      adultRows = data || [];
      adultStatus.textContent = adultRows.length
        ? adultRows.length + " reference entries loaded."
        : "Connected successfully. The adult recommendations table is currently empty.";
      renderAdultRows();
    } catch (error) {
      console.error("NutriCare adult reference loading error:", error);
      adultStatus.textContent = "Could not load the adult reference. Please check the database connection and table permissions.";
      adultList.innerHTML = '<div class="empty-state">The database could not be reached. Your other app sections are still available.</div>';
    }
  }

  adultSearch.addEventListener("input", renderAdultRows);
  loadAdultRecommendations();

  // Paediatric recommendations are loaded only after clinical approval.
  const paediatricList = document.getElementById("paediatricList");
  const paediatricStatus = document.getElementById("paediatricStatus");
  const paediatricSearch = document.getElementById("paediatricSearch");
  let paediatricRows = [];

  function renderPaediatricRows() {
    const query = (paediatricSearch.value || "").trim().toLowerCase();
    const filtered = paediatricRows.filter(row =>
      [row.condition, row.age_group, row.description, row.notes, row.source_reference]
        .some(value => String(value || "").toLowerCase().includes(query))
    );

    paediatricList.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = paediatricRows.length
        ? "No matching entries. Try another search."
        : "No approved paediatric recommendations are available yet. Draft entries remain hidden until reviewed.";
      paediatricList.append(empty);
      return;
    }

    filtered.forEach(row => {
      const card = document.createElement("details");
      card.className = "reference-card";
      const summary = document.createElement("summary");
      summary.textContent = safeText(row.condition);
      const body = document.createElement("div");
      body.className = "reference-card-body";

      const context = document.createElement("p");
      context.className = "reference-description";
      context.textContent = "Age group: " + safeText(row.age_group) +
        (row.description ? " • " + row.description : "");
      body.append(context);

      const metrics = document.createElement("div");
      metrics.className = "reference-metrics";
      [
        ["Energy", row.energy_requirement, "kcal/kg/day"],
        ["Protein", row.protein_requirement, "g/kg/day"],
        ["Fat", row.fat_requirement, "as listed"],
        ["Carbohydrate", row.carbohydrate_requirement, "g/kg/day"],
        ["Fluids", row.fluid_requirement, "mL/kg/day"]
      ].forEach(([label, value, unit]) => {
        const metric = document.createElement("div");
        metric.className = "metric";
        const small = document.createElement("small");
        small.textContent = label;
        const strong = document.createElement("strong");
        const display = safeText(value);
        strong.textContent = display === "Not specified" ? display : display + " " + unit;
        metric.append(small, strong);
        metrics.append(metric);
      });
      body.append(metrics);

      if (row.notes) {
        const notes = document.createElement("p");
        notes.className = "reference-notes";
        const label = document.createElement("strong");
        label.textContent = "Clinical notes: ";
        notes.append(label, document.createTextNode(row.notes));
        body.append(notes);
      }
      if (row.source_reference) {
        const source = document.createElement("p");
        source.className = "reference-source";
        source.textContent = "Listed source: " + row.source_reference;
        body.append(source);
      }
      card.append(summary, body);
      paediatricList.append(card);
    });
  }

  async function loadPaediatricRecommendations() {
    const config = window.NUTRICARE_SUPABASE || {};
    if (!config.url || !config.publishableKey || !window.supabase) {
      paediatricStatus.textContent = "Database connection details are not configured yet.";
      return;
    }
    try {
      const client = window.supabase.createClient(config.url, config.publishableKey);
      const { data, error } = await client
        .from("paediatric_recommendations")
        .select("*")
        .eq("approval_status", "approved")
        .order("display_order", { ascending: true })
        .order("condition", { ascending: true });
      if (error) throw error;
      paediatricRows = data || [];
      paediatricStatus.textContent = paediatricRows.length
        ? paediatricRows.length + " approved reference entries loaded."
        : "Connected successfully. No paediatric entries have been approved yet.";
      renderPaediatricRows();
    } catch (error) {
      console.error("NutriCare paediatric reference loading error:", error);
      paediatricStatus.textContent = "Could not load the paediatric reference. Please check the database connection and table permissions.";
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "The paediatric database could not be reached. Other app sections remain available.";
      paediatricList.replaceChildren(empty);
    }
  }

  paediatricSearch.addEventListener("input", renderPaediatricRows);
  loadPaediatricRecommendations();

  // Biochemical reference ranges are loaded only after clinical approval.
  const biochemistryList = document.getElementById("biochemistryList");
  const biochemistryStatus = document.getElementById("biochemistryStatus");
  const biochemistrySearch = document.getElementById("biochemistrySearch");
  let biochemistryRows = [];

  function renderBiochemistryRows() {
    const query = (biochemistrySearch.value || "").trim().toLowerCase();
    const filtered = biochemistryRows.filter(row =>
      [row.test_name, row.population_group, row.age_range, row.sex, row.specimen,
       row.unit, row.reference_range_text, row.notes, row.source_reference]
        .some(value => String(value || "").toLowerCase().includes(query))
    );

    biochemistryList.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = biochemistryRows.length
        ? "No matching laboratory tests. Try another search."
        : "No approved biochemical reference ranges are available yet. Draft entries remain hidden until reviewed.";
      biochemistryList.append(empty);
      return;
    }

    filtered.forEach(row => {
      const card = document.createElement("details");
      card.className = "reference-card";
      const summary = document.createElement("summary");
      summary.textContent = safeText(row.test_name);
      const body = document.createElement("div");
      body.className = "reference-card-body";

      const contextParts = [];
      if (row.population_group) contextParts.push(row.population_group);
      if (row.age_range) contextParts.push("Age: " + row.age_range);
      if (row.sex) contextParts.push("Sex: " + row.sex);
      if (row.specimen) contextParts.push("Specimen: " + row.specimen);
      if (contextParts.length) {
        const context = document.createElement("p");
        context.className = "reference-description";
        context.textContent = contextParts.join(" • ");
        body.append(context);
      }

      const metrics = document.createElement("div");
      metrics.className = "reference-metrics";
      const range = row.reference_range_text ||
        ((row.lower_limit !== null && row.lower_limit !== undefined) ||
         (row.upper_limit !== null && row.upper_limit !== undefined)
          ? (row.lower_limit ?? "No lower limit") + " – " + (row.upper_limit ?? "No upper limit")
          : "Not specified");
      [
        ["Reference range", range, ""],
        ["Unit", row.unit, ""]
      ].forEach(([label, value, unit]) => {
        const metric = document.createElement("div");
        metric.className = "metric";
        const small = document.createElement("small");
        small.textContent = label;
        const strong = document.createElement("strong");
        const display = safeText(value);
        strong.textContent = display === "Not specified" ? display : display + (unit ? " " + unit : "");
        metric.append(small, strong);
        metrics.append(metric);
      });
      body.append(metrics);

      if (row.notes) {
        const notes = document.createElement("p");
        notes.className = "reference-notes";
        const label = document.createElement("strong");
        label.textContent = "Notes: ";
        notes.append(label, document.createTextNode(row.notes));
        body.append(notes);
      }
      if (row.source_reference) {
        const source = document.createElement("p");
        source.className = "reference-source";
        source.textContent = "Listed source: " + row.source_reference;
        body.append(source);
      }
      card.append(summary, body);
      biochemistryList.append(card);
    });
  }

  async function loadBiochemistryReference() {
    const config = window.NUTRICARE_SUPABASE || {};
    if (!config.url || !config.publishableKey || !window.supabase) {
      biochemistryStatus.textContent = "Database connection details are not configured yet.";
      return;
    }
    try {
      const client = window.supabase.createClient(config.url, config.publishableKey);
      const { data, error } = await client
        .from("biochemical_reference_ranges")
        .select("*")
        .eq("approval_status", "approved")
        .order("test_name", { ascending: true })
        .order("population_group", { ascending: true });
      if (error) throw error;
      biochemistryRows = data || [];
      biochemistryStatus.textContent = biochemistryRows.length
        ? biochemistryRows.length + " approved laboratory reference entries loaded."
        : "Connected successfully. No biochemical reference ranges have been approved yet.";
      renderBiochemistryRows();
    } catch (error) {
      console.error("NutriCare biochemical reference loading error:", error);
      biochemistryStatus.textContent = "Could not load the biochemical reference. Please check the database connection and table permissions.";
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "The biochemical reference database could not be reached. Other app sections remain available.";
      biochemistryList.replaceChildren(empty);
    }
  }

  biochemistrySearch.addEventListener("input", renderBiochemistryRows);
  loadBiochemistryReference();

});