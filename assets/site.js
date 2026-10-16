// Doc & Writer. Plain JavaScript, no build step.
(function () {
  var root = document.documentElement;

  // Theme switch. Follows the system until someone picks a side.
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
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { show("after"); }
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

  // Service request number on the contact form.
  var srNo = document.getElementById("sr-no");
  if (srNo) {
    var d = new Date();
    var id = "SR-" + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(Math.floor(1000 + Math.random() * 9000));
    srNo.textContent = id;
    var field = document.getElementById("sr-field");
    if (field) field.value = id;
  }

  var printBtn = document.getElementById("print-cap");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
})();
