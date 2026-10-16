// Doc & Writer: cost calculator and print button. Plain JavaScript, no build step.
(function () {
  var calc = document.getElementById("cost-calc");
  if (calc) {
    var money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    var whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
    var num = function (id) {
      var v = parseFloat(String(document.getElementById(id).value).replace(/[^0-9.]/g, ""));
      return isFinite(v) && v >= 0 ? v : 0;
    };
    var update = function () {
      var tickets = num("c-volume") * (Math.min(num("c-wrong"), 100) / 100) * (Math.min(num("c-escalate"), 100) / 100);
      document.getElementById("o-tickets").textContent = whole.format(tickets);
      document.getElementById("o-yearly").textContent = money.format(tickets * num("c-cost") * 12);
    };
    calc.addEventListener("input", update);
    update();
  }

  var printBtn = document.getElementById("print-cap");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
})();
