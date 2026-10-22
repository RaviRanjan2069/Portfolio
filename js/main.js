// Ravi Ranjan · portfolio: theme, menu, fade-in on scroll, nav pill, image pop on touch, copy email, footer clock.
(function () {
  "use strict";
  const root = document.documentElement;

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

  // scroll reveal (everything shows at once if the browser lacks IntersectionObserver)
  const revealed = document.querySelectorAll(".reveal");
  const show = (el) => el.classList.add("in-view");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        show(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealed.forEach((el) => io.observe(el));
  } else {
    revealed.forEach(show);
  }

  // nav: sliding pill under the hovered or active link
  const pill = menu.querySelector(".nav-pill");
  const links = [...menu.querySelectorAll("a")];
  let activeLink = null;
  let hovering = false;
  const movePill = (a) => {
    if (!a) { pill.style.opacity = "0"; return; }
    pill.style.left = `${a.offsetLeft}px`;
    pill.style.width = `${a.offsetWidth}px`;
    pill.style.opacity = "1";
  };
  links.forEach((a) => a.addEventListener("mouseenter", () => { hovering = true; movePill(a); }));
  menu.addEventListener("mouseleave", () => { hovering = false; movePill(activeLink); });

  // nav background and the active section
  const nav = document.querySelector(".nav");
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 10);
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) current = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === current));
    activeLink = links[current] || null;
    if (!hovering) movePill(activeLink);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // touch: images pop up while a finger is on them
  document.querySelectorAll(".hero-photo, .work-media").forEach((el) => {
    el.addEventListener("touchstart", () => el.classList.add("pop"), { passive: true });
    ["touchend", "touchcancel"].forEach((t) => el.addEventListener(t, () => el.classList.remove("pop")));
  });

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

  // footer: local time in India
  const clock = document.querySelector(".clock");
  try {
    const fmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
    const tickClock = () => { clock.textContent = `${fmt.format(new Date()).toUpperCase()} IST`; };
    tickClock();
    setInterval(tickClock, 30000);
  } catch (e) { /* no time zone support: the clock stays hidden */ }
})();
