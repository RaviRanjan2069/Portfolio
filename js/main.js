// Ravi Ranjan · portfolio: theme, menu, typing role, scroll reveal, counters, active link, copy email.
(function () {
  "use strict";
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // theme: system by default, remembered when chosen
  document.querySelector(".theme-toggle").addEventListener("click", () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : !window.matchMedia("(prefers-color-scheme: light)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) { /* not saved */ }
  });

  // mobile menu
  const menu = document.getElementById("menu");
  const menuBtn = document.querySelector(".menu-toggle");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close the menu" : "Open the menu");
  };
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // typing role
  const roles = ["full-stack web apps.", "AI-powered tools.", "clean REST APIs.", "with Java & Spring Boot.", "with Python & FastAPI."];
  const typed = document.querySelector(".typed");
  if (reduced) {
    typed.textContent = roles[0];
  } else {
    let r = 0;
    let i = 0;
    let deleting = false;
    const tick = () => {
      const word = roles[r];
      i += deleting ? -1 : 1;
      typed.textContent = word.slice(0, i);
      let wait = deleting ? 35 : 70;
      if (!deleting && i === word.length) { deleting = true; wait = 1600; }
      else if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; wait = 350; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 600);
  }

  // counters
  const count = (el) => {
    const to = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduced) { el.textContent = to + suffix; return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(to * (1 - (1 - k) ** 3)) + (k === 1 ? suffix : "");
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // scroll reveal (everything shows at once if the browser lacks IntersectionObserver)
  const revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in-view");
        e.target.querySelectorAll("[data-count]").forEach(count);
        if (e.target.matches("[data-count]")) count(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealed.forEach((el) => io.observe(el));
  } else {
    revealed.forEach((el) => el.classList.add("in-view"));
    document.querySelectorAll("[data-count]").forEach(count);
  }

  // nav background, progress bar, active section
  const nav = document.querySelector(".nav");
  const bar = document.querySelector(".progress span");
  const links = [...menu.querySelectorAll("a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 10);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) current = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === current));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // copy email
  const toast = document.querySelector(".toast");
  let toastTimer = 0;
  const say = (text) => {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  };
  document.querySelectorAll("[data-copy]").forEach((btn) => btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      say("Email address copied");
    } catch (e) {
      say(btn.dataset.copy);
    }
  }));

  document.getElementById("year").textContent = new Date().getFullYear();
})();
