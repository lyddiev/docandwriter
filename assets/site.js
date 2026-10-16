// Doc & Writer. Plain JavaScript, no build step.
(function () {
  var root = document.documentElement;

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

  // Header rule appears once the page scrolls.
  var mast = document.querySelector(".mast");
  if (mast) {
    var onScroll = function () { mast.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Close the mobile menu after a link is chosen.
  document.querySelectorAll(".menu nav a").forEach(function (a) {
    a.addEventListener("click", function () { a.closest("details").removeAttribute("open"); });
  });

  // Hero article: before and after.
  var art = document.getElementById("article");
  if (art) {
    var buttons = art.querySelectorAll("[data-show]");
    var show = function (state) {
      art.setAttribute("data-state", state);
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-show") === state)); });
    };
    var touched = false;
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { touched = true; show(b.getAttribute("data-show")); });
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { show("after"); }
    else { setTimeout(function () { if (!touched) show("after"); }, 1800); }
  }

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
    };
    calc.addEventListener("input", update);
    update();
  }

  // Tabs. Arrow keys move between tabs, as the ARIA tabs pattern expects.
  var selectTab = function (tab) {
    var list = tab.closest("[role=tablist]");
    list.querySelectorAll("[role=tab]").forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  document.querySelectorAll("[role=tablist]").forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll("[role=tab]"));
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { selectTab(tab); });
      tab.addEventListener("keydown", function (e) {
        var next = e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length] : e.key === "ArrowLeft" ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
        if (next) { e.preventDefault(); selectTab(next); next.focus(); }
      });
    });
  });

  // Links that open a specific tab (Book a call, Get a free answer check), and preselect a plan in the form.
  var pick = document.getElementById("f-type");
  document.querySelectorAll("[data-tab-target]").forEach(function (a) {
    a.addEventListener("click", function () {
      var tab = document.getElementById(a.getAttribute("data-tab-target"));
      if (tab) selectTab(tab);
      if (pick && a.getAttribute("data-type")) pick.value = a.getAttribute("data-type");
    });
  });

  var printBtn = document.getElementById("print-cap");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
})();
