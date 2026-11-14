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
});