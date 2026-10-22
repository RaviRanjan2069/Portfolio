// Ravi Ranjan · portfolio: theme toggle, mobile menu, fade-in on scroll, active nav link, back-to-top button, copy email, footer clock.
(function () {
  "use strict";
  const root = document.documentElement;

  // theme: system by default, remembered when chosen
  document.querySelector(".theme-toggle").addEventListener("click", () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
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

  // fade sections in as they appear (everything shows at once without IntersectionObserver)
  const revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in-view");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    revealed.forEach((el) => io.observe(el));
  } else {
    revealed.forEach((el) => el.classList.add("in-view"));
  }

  // nav border once scrolled, and the link for the section in view
  const nav = document.querySelector(".nav");
  const toTop = document.querySelector(".to-top");
  const links = [...menu.querySelectorAll("a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 8);
    toTop.classList.toggle("show", window.scrollY > window.innerHeight);
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.35) current = i; });
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
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
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
    const fmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
    const tickClock = () => { clock.textContent = `${fmt.format(new Date())} IST`; };
    tickClock();
    setInterval(tickClock, 30000);
  } catch (e) { /* no time zone support: the clock stays hidden */ }
})();
