// Ravi Ranjan · portfolio: theme, menu, typing role, split headings, scroll reveal,
// nav pill, pointer effects (spotlight, tilt, magnetic), hero parallax, copy email.
(function () {
  "use strict";
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motion = !reduced && finePointer;

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
      if (!deleting && i === word.length) { deleting = true; wait = 1700; }
      else if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; wait = 350; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 1600);
  }

  // split headings into masked words; an inline element (like the gradient surname) counts as one word
  document.querySelectorAll("[data-split]").forEach((el) => {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const words = [];
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (part) words.push(/^\s+$/.test(part) ? document.createTextNode(" ") : part);
        });
      } else {
        words.push(node);
      }
    });
    el.textContent = "";
    let n = 0;
    words.forEach((w) => {
      if (w instanceof Text) { el.appendChild(w); return; }
      const outer = document.createElement("span");
      const inner = document.createElement("span");
      outer.className = "w";
      outer.setAttribute("aria-hidden", "true");
      inner.className = "wi";
      inner.style.setProperty("--i", n++);
      inner.append(w);
      outer.appendChild(inner);
      el.appendChild(outer);
    });
  });

  // number stagger children so they arrive one after another
  document.querySelectorAll(".stagger").forEach((list) => {
    [...list.children].forEach((child, k) => child.style.setProperty("--k", k));
  });

  // eyebrow labels decode from random glyphs
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/*+";
  const scramble = (el) => {
    const text = el.dataset.text || (el.dataset.text = el.textContent);
    let frame = 0;
    const step = () => {
      let out = "";
      let done = true;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " " || frame >= 8 + i * 2) { out += text[i]; }
        else { out += glyphs[(Math.random() * glyphs.length) | 0]; done = false; }
      }
      el.textContent = out;
      frame++;
      if (!done) requestAnimationFrame(step);
    };
    step();
  };

  // scroll reveal (everything shows at once if the browser lacks IntersectionObserver)
  const revealed = document.querySelectorAll(".reveal, [data-split]");
  const show = (el) => {
    el.classList.add("in-view");
    if (!reduced) el.querySelectorAll(".eyebrow .label").forEach(scramble);
  };
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

  // nav background, progress bar, active section, hero parallax
  const nav = document.querySelector(".nav");
  const bar = document.querySelector(".progress span");
  const heroInner = document.querySelector(".hero-inner");
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    nav.classList.toggle("scrolled", y > 10);
    const max = document.documentElement.scrollHeight - vh;
    bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * 0.4) current = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === current));
    activeLink = links[current] || null;
    if (!hovering) movePill(activeLink);
    if (!reduced && y < vh) {
      heroInner.style.transform = `translateY(${y * 0.22}px)`;
      heroInner.style.opacity = String(Math.max(0, 1 - y / (vh * 0.85)));
    }
  };
  const requestScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);
  onScroll();

  if (motion) {
    // spotlight: the glow follows the pointer inside each card
    document.querySelectorAll(".spot").forEach((el) => el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }));

    // 3D tilt, with a glare position for project media
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const maxDeg = Number(el.dataset.tilt) || 8;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add("tilting");
        el.style.transform = `perspective(1000px) rotateX(${(-y * maxDeg).toFixed(2)}deg) rotateY(${(x * maxDeg).toFixed(2)}deg)`;
        el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
        el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("tilting");
        el.style.transform = "";
      });
    });

    // magnetic buttons lean toward the pointer
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
      el.addEventListener("pointerleave", () => { el.style.translate = ""; });
    });

    // hero: light follows the pointer, orbs drift the other way
    const hero = document.querySelector(".hero");
    const orbs = hero.querySelectorAll(".orb");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--hx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--hy", `${e.clientY - r.top}px`);
      const dx = (e.clientX / r.width - 0.5) * -40;
      const dy = ((e.clientY - r.top) / r.height - 0.5) * -40;
      orbs.forEach((o, i) => { o.style.translate = `${dx * (i + 1)}px ${dy * (i + 1)}px`; });
    });
  }

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
