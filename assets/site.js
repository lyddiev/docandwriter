// Doc & Writer. Plain JavaScript, no build step.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Light or dark. Follows the system until someone picks one.
  var themeBtn = document.getElementById("theme");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark" ||
        (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("dw-theme", next); } catch (e) {}
    });
  }

  // Header turns solid once the page scrolls.
  var mast = document.querySelector(".mast");
  if (mast) {
    var onScroll = function () { mast.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu closes after a choice.
  document.querySelectorAll(".menu nav a").forEach(function (a) {
    a.addEventListener("click", function () { a.closest("details").removeAttribute("open"); });
  });

  // Tabs, following the ARIA tabs pattern (arrow keys move between tabs).
  var selectTab = function (tab) {
    var list = tab.closest("[role=tablist]");
    list.querySelectorAll("[role=tab]").forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  };
  document.querySelectorAll("[role=tablist]").forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll("[role=tab]"));
    var vertical = list.getAttribute("aria-orientation") === "vertical";
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { selectTab(tab); });
      tab.addEventListener("keydown", function (e) {
        var fwd = vertical ? "ArrowDown" : "ArrowRight", back = vertical ? "ArrowUp" : "ArrowLeft";
        var next = e.key === fwd ? tabs[(i + 1) % tabs.length] : e.key === back ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
        if (next) { e.preventDefault(); selectTab(next); next.focus(); }
      });
    });
  });

  // Links that open a specific tab, and preselect a plan in the form.
  var pick = document.getElementById("f-type");
  document.querySelectorAll("[data-tab-target]").forEach(function (a) {
    a.addEventListener("click", function () {
      var tab = document.getElementById(a.getAttribute("data-tab-target"));
      if (tab) selectTab(tab);
      if (pick && a.getAttribute("data-type")) pick.value = a.getAttribute("data-type");
    });
  });

  // Mobile switchers: show one step or plan at a time. Tap a label or swipe.
  document.querySelectorAll(".mtabs").forEach(function (bar) {
    var group = document.getElementById(bar.getAttribute("data-for"));
    if (!group) return;
    group.setAttribute("data-mgroup", "");
    var btns = Array.prototype.slice.call(bar.querySelectorAll("button"));
    var items = Array.prototype.slice.call(group.querySelectorAll(":scope > .m-item"));
    var show = function (n) {
      btns.forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === n)); });
      items.forEach(function (it, i) { it.classList.toggle("m-on", i === n); });
    };
    var current = function () { return Math.max(0, btns.findIndex(function (b) { return b.getAttribute("aria-pressed") === "true"; })); };
    btns.forEach(function (b, i) { b.addEventListener("click", function () { show(i); }); });
    var x0 = null, y0 = null;
    group.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    group.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        var n = current() + (dx < 0 ? 1 : -1);
        if (n >= 0 && n < items.length) show(n);
      }
    }, { passive: true });
  });

  // /#book opens the booking tab, from this page or from another page.
  var openBook = function () {
    if (location.hash !== "#book") return;
    var t = document.getElementById("tab-book"), c = document.getElementById("contact");
    if (t) selectTab(t);
    if (c) c.scrollIntoView();
  };
  window.addEventListener("hashchange", openBook);
  openBook();

  // Soft light that follows the pointer across tiles.
  document.querySelectorAll(".tile").forEach(function (t) {
    t.addEventListener("pointermove", function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", (e.clientX - r.left) + "px");
      t.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  // Cost calculator, written as a sentence.
  var calc = document.getElementById("cost-calc");
  if (calc) {
    var money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    var whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
    var num = function (id) {
      var v = parseFloat(String(document.getElementById(id).value).replace(/[^0-9.]/g, ""));
      return isFinite(v) && v >= 0 ? v : 0;
    };
    var update = function () {
      var tickets = num("c-volume") * Math.min(num("c-wrong"), 100) / 100 * Math.min(num("c-escalate"), 100) / 100;
      document.getElementById("o-yearly").textContent = money.format(tickets * num("c-cost") * 12);
      document.getElementById("o-tickets").textContent = whole.format(tickets);
      var conv = num("c-volume"), wrongN = conv * Math.min(num("c-wrong"), 100) / 100;
      var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = whole.format(v); };
      set("f-conv", conv); set("f-wrong", wrongN); set("f-tix", tickets);
      var bar = function (id, v) { var el = document.getElementById(id); if (el) el.style.setProperty("--w", (conv ? Math.min(100, v / conv * 100) : 0) + "%"); };
      bar("f-wrong-bar", wrongN); bar("f-tix-bar", tickets);
    };
    calc.addEventListener("input", update);
    update();
  }

  // The hero demo: question, wrong answer, traced to the article, redlined, right answer.
  var demo = document.getElementById("demo");
  if (demo) {
    var $ = function (s) { return demo.querySelector(s); };
    var user = $("#d-user"), typing = $("#d-typing"), wrong = $("#d-wrong"), right = $("#d-right");
    var doc = $("#d-doc"), hl = $("#d-hl"), note = $("#d-note"), pillBad = $("#d-pill-bad"), pillGood = $("#d-pill-good");
    var steps = demo.querySelectorAll(".steps-bar span");
    var timers = [], visible = true, running = false;
    var on = function (el, v) { el.classList.toggle("on", v); };
    var step = function (n) { steps.forEach(function (s, i) { s.classList.toggle("on", i < n); }); };
    var reset = function () {
      [user, typing, wrong, right, note].forEach(function (el) { on(el, false); });
      typing.hidden = false; wrong.hidden = true;
      doc.classList.remove("fixed"); hl.classList.remove("flag");
      pillBad.hidden = false; pillGood.hidden = true; step(0);
    };
    var final = function () {
      [user, wrong, right].forEach(function (el) { on(el, true); });
      typing.hidden = true; wrong.hidden = false;
      doc.classList.add("fixed"); pillBad.hidden = true; pillGood.hidden = false; step(4);
    };
    var plan = [
      [300, function () { on(user, true); step(1); }],
      [1200, function () { on(typing, true); }],
      [2500, function () { typing.hidden = true; wrong.hidden = false; on(wrong, true); step(2); }],
      [4200, function () { hl.classList.add("flag"); on(note, true); step(3); }],
      [6600, function () { on(note, false); hl.classList.remove("flag"); doc.classList.add("fixed"); pillBad.hidden = true; pillGood.hidden = false; step(4); }],
      [7700, function () { on(right, true); }],
      [14000, function () { run(); }]
    ];
    var run = function () {
      timers.forEach(clearTimeout); timers = [];
      if (!visible) { running = false; return; }
      running = true; reset();
      plan.forEach(function (p) { timers.push(setTimeout(p[1], p[0])); });
    };
    if (reduce) { final(); }
    else {
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          visible = es[0].isIntersecting;
          if (visible && !running) run();
        }, { threshold: .25 }).observe(demo);
      }
      run();
    }
    var replay = document.getElementById("d-replay");
    if (replay) replay.addEventListener("click", function () { if (reduce) { reset(); setTimeout(final, 50); } else run(); });
  }

  var printBtn = document.getElementById("print-cap");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
})();
