(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Native details/summary keeps navigation usable even when JavaScript is disabled.
  const mobileMenu = $(".mobile-menu");
  if (mobileMenu) {
    const summary = $("summary", mobileMenu);
    mobileMenu.addEventListener("click", (event) => {
      if (event.target.closest(".mobile-menu-panel a")) mobileMenu.open = false;
    });
    document.addEventListener("click", (event) => {
      if (mobileMenu.open && !mobileMenu.contains(event.target)) mobileMenu.open = false;
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileMenu.open) {
        mobileMenu.open = false;
        if (summary) summary.focus();
      }
    });
    const desktop = window.matchMedia("(min-width: 801px)");
    desktop.addEventListener("change", () => { if (desktop.matches) mobileMenu.open = false; });
  }

  // Filter chapter cards without a network request.
  const search = $("#chapter-search");
  if (search) {
    const cards = $$(".chapter-card");
    const status = $("#search-status");
    const empty = $("#no-results");
    const filter = () => {
      const query = search.value.trim().toLocaleLowerCase("fa-IR");
      let visible = 0;
      cards.forEach((card) => {
        const haystack = (card.dataset.search || card.textContent).toLocaleLowerCase("fa-IR");
        const matches = !query || haystack.includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      if (status) status.textContent = query ? `${visible} فصل پیدا شد` : `${cards.length} فصل`;
      if (empty) empty.style.display = visible ? "none" : "block";
    };
    search.addEventListener("input", filter);
    filter();
  }

  // Build an in-page table of contents from authored headings.
  const toc = $("#chapter-toc");
  const prose = $(".prose");
  if (toc && prose) {
    const headings = $$("h2, h3", prose);
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const li = document.createElement("li");
      if (heading.tagName === "H3") li.style.marginInlineStart = ".65rem";
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      li.appendChild(link);
      toc.appendChild(li);
    });
    if (headings.length === 0) toc.closest(".reader-sidebar")?.setAttribute("hidden", "");
  }

  const printButton = $("[data-print]");
  if (printButton) printButton.addEventListener("click", () => window.print());

  // A small planning aid: all percentages and reserves are user-entered.
  const form = $("#pricing-form");
  if (form && window.PriceCalc) {
    const inputs = $$('input[type="number"]', form);
    const hourly = $("#hourly-result");
    const quote = $("#quote-result");
    const error = $("#calc-error");
    const money = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    });
    const refresh = () => {
      try {
        const values = {};
        inputs.forEach((input) => { values[input.name] = input.value; });
        const result = window.PriceCalc.calculatePricing(values);
        hourly.textContent = money.format(result.floorHourlyRate);
        quote.textContent = money.format(result.suggestedProjectQuote);
        error.textContent = "";
      } catch (err) {
        if (hourly) hourly.textContent = "—";
        if (quote) quote.textContent = "—";
        if (error) error.textContent = err.message || "ورودی‌ها را بررسی کنید.";
      }
    };
    inputs.forEach((input) => input.addEventListener("input", refresh));
    form.addEventListener("submit", (event) => event.preventDefault());
    refresh();
  }
})();
