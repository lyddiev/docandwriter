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

  // Buttons that name a plan preselect it in the contact form.
  var pick = document.getElementById("f-type");
  if (pick) {
    document.querySelectorAll("[data-type]").forEach(function (a) {
      a.addEventListener("click", function () { pick.value = a.getAttribute("data-type"); });
    });
  }

  var printBtn = document.getElementById("print-cap");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
})();
