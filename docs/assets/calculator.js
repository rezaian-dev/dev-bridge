(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PriceCalc = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function calculatePricing(input) {
    const values = [
      input.targetNetMonthly,
      input.monthlyOverhead,
      input.monthlyReserve,
      input.feePercent,
      input.riskBufferPercent,
      input.billableHours,
      input.projectHours,
      input.contingencyPercent
    ].map(Number);
    if (values.some((n) => !Number.isFinite(n) || n < 0)) {
      throw new Error("همه‌ی مقدارها باید عدد نامنفی باشند.");
    }
    const [net, overhead, reserve, fees, buffer, billableHours, projectHours, contingency] = values;
    if (billableHours <= 0) throw new Error("ساعت قابل‌صورتحساب باید بیشتر از صفر باشد.");
    if (projectHours <= 0) throw new Error("ساعت تخمینی پروژه باید بیشتر از صفر باشد.");
    const deduction = (fees + buffer) / 100;
    if (deduction >= 1) throw new Error("جمع کارمزد و ذخیره‌ی ریسک باید کمتر از ۱۰۰٪ باشد.");

    const grossMonthlyNeeded = (net + overhead + reserve) / (1 - deduction);
    const floorHourlyRate = grossMonthlyNeeded / billableHours;
    const suggestedProjectQuote = projectHours * floorHourlyRate * (1 + contingency / 100);
    return {
      grossMonthlyNeeded,
      floorHourlyRate,
      suggestedProjectQuote,
      billableHours,
      projectHours,
      contingencyPercent: contingency
    };
  }

  return { calculatePricing };
});
