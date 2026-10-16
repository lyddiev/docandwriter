// Doc & Writer: cost calculator and print button. Plain JavaScript, no build step.
(function () {
  var calc = document.getElementById("cost-calc");
  if (calc) {
    var money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    var whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

    function num(id) {
      var v = parseFloat(String(document.getElementById(id).value).replace(/[^0-9.]/g, ""));
      return isFinite(v) && v >= 0 ? v : 0;
    }
    function set(id, text) { document.getElementById(id).textContent = text; }

    function update() {
      var conversations = num("c-volume");
      var wrongRate = Math.min(num("c-wrong"), 100) / 100;
      var escalateRate = Math.min(num("c-escalate"), 100) / 100;
      var costPerContact = num("c-cost");

      var wrong = conversations * wrongRate;
      var escalated = wrong * escalateRate;
      var leftWithWrong = wrong - escalated;
      var monthly = escalated * costPerContact;

      set("o-wrong", whole.format(wrong));
      set("o-escalated", whole.format(escalated));
      set("o-left", whole.format(leftWithWrong));
      set("o-monthly", money.format(monthly));
      set("o-yearly", money.format(monthly * 12));
    }

    calc.addEventListener("input", update);
    update();
  }

  var printBtn = document.getElementById("print-cap");
  if (printBtn) {
    printBtn.addEventListener("click", function () { window.print(); });
  }
})();
