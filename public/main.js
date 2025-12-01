document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  // DOM ELEMENTS
  // ==========================
  let currentCampgroundId = "";

  const campgroundForm = document.getElementById("campground-form");
  const cgNameInput = document.getElementById("cg-name");
  const cgCityInput = document.getElementById("cg-city");
  const cgStateInput = document.getElementById("cg-state");
  const cgDescriptionInput = document.getElementById("cg-description");
  const campgroundList = document.getElementById("campground-list");

  // Reports / accounting
  const reportsCampgroundSelect = document.getElementById("reports-campground-select");
  const reportsStartInput = document.getElementById("reports-start");
  const reportsEndInput = document.getElementById("reports-end");
  const reportsRunBtn = document.getElementById("reports-run-btn");
  const reportsStatus = document.getElementById("reports-status");
  const reportsTable = document.getElementById("reports-daily-table");

  // 👇 add this if you’ve created the dropdown in HTML:
  const globalCampgroundSelect = document.getElementById(
    "current-campground-select"
  );

  const siteForm = document.getElementById("site-form");
  const siteCampgroundSelect = document.getElementById("site-campground");
  const sitesCampgroundSelect = document.getElementById(
    "sites-campground-select"
  );
  const siteNameInput = document.getElementById("site-name");
  const siteKindSelect = document.getElementById("site-kind");
  const siteRateInput = document.getElementById("site-rate");
  const siteList = document.getElementById("site-list");

  const availabilityForm = document.getElementById("availability-form");
  const availabilityCampgroundSelect = document.getElementById(
    "availability-campground"
  );
  const availabilityStartInput = document.getElementById("availability-start");
  const availabilityEndInput = document.getElementById("availability-end");
  const availabilityResults = document.getElementById("availability-results");

  const reservationForm = document.getElementById("reservation-form");
  const reservationCampgroundSelect =
    document.getElementById("reservation-campground") ||
    document.getElementById("res-campground-select");
  const reservationSiteSelect =
    document.getElementById("reservation-site") ||
    document.getElementById("res-site-select");
  const reservationFirstInput = document.getElementById("reservation-first");
  const reservationLastInput = document.getElementById("reservation-last");
  const reservationEmailInput = document.getElementById("reservation-email");
  const reservationArrivalInput =
    document.getElementById("reservation-arrival");
  const reservationDepartureInput = document.getElementById(
    "reservation-departure"
  );
  const reservationList = document.getElementById("reservation-list");
  const reloadReservationsBtn = document.getElementById(
    "reload-reservations-btn"
  );

  // New: summary bar
  const reservationSummaryBar = document.getElementById("reservation-summary");
  // Accountant view elements
  const accountantForm = document.getElementById("accountant-form");
  const accountantStartInput = document.getElementById("acct-start");
  const accountantEndInput = document.getElementById("acct-end");
  const accountantModeSelect = document.getElementById("acct-mode");
  const accountantSummaryEl = document.getElementById("accountant-summary");
  const accountantTable = document.getElementById("accountant-table");

  // Cache of the last-loaded reservations for this view
  let reservationsCache = [];

  const prForm = document.getElementById("pricing-rule-form");
  const prCampgroundSelect = document.getElementById("pr-campground");
  const prTypeSelect = document.getElementById("pr-type");
  const prStartInput = document.getElementById("pr-start");
  const prEndInput = document.getElementById("pr-end");
  const prDowInput = document.getElementById("pr-dow");
  const prFlatInput = document.getElementById("pr-flat");
  const prPercentInput = document.getElementById("pr-percent");
  const prMinNightsInput = document.getElementById("pr-minnights");
  const prList = document.getElementById("pricing-rule-list");

  const statusBar = document.getElementById("status");

  // ==========================
  // UTILITIES
  // ==========================
  function setStatus(message, isError) {
    if (!statusBar) return;
    statusBar.textContent = message;
    if (isError) {
      statusBar.classList.add("status-error");
    } else {
      statusBar.classList.remove("status-error");
    }
  }
   function setReportsStatus(message, isError) {
    if (!reportsStatus) return;
    reportsStatus.textContent = message;
    if (isError) {
      reportsStatus.classList.add("status-error");
    } else {
      reportsStatus.classList.remove("status-error");
    }
  }

  async function fetchJSON(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return res.json();
    }
    return null;
  }

  function autoSetDeparture(fromInput, toInput, nights = 3) {
    if (!fromInput || !toInput) return;
    fromInput.addEventListener("change", () => {
      const val = fromInput.value;
      if (!val) return;
      const start = new Date(val + "T00:00:00");
      if (Number.isNaN(start.getTime())) return;

      const currentDepVal = toInput.value;
      let shouldUpdate = false;

      if (!currentDepVal) {
        shouldUpdate = true;
      } else {
        const currentDep = new Date(currentDepVal + "T00:00:00");
        if (currentDep <= start) {
          shouldUpdate = true;
        }
      }

      if (!shouldUpdate) return;

      const dep = new Date(start);
      dep.setDate(dep.getDate() + nights);

      const yyyy = dep.getFullYear();
      const mm = String(dep.getMonth() + 1).padStart(2, "0");
      const dd = String(dep.getDate()).padStart(2, "0");
      toInput.value = `${yyyy}-${mm}-${dd}`;
    });
  }

  // Auto 3-night default for reservation + availability
  autoSetDeparture(reservationArrivalInput, reservationDepartureInput, 3);
  autoSetDeparture(availabilityStartInput, availabilityEndInput, 3);

  // ==========================
  // CAMPGROUNDS
  // ==========================
  function renderCampgrounds(campgrounds) {
    if (!campgroundList) return;
    campgroundList.innerHTML = "";

    if (!campgrounds.length) {
      campgroundList.innerHTML = "<li>No campgrounds yet.</li>";
      return;
    }

    for (const cg of campgrounds) {
      const li = document.createElement("li");
      li.className = "item-row";

      const left = document.createElement("div");
      left.className = "item-main";

      const title = document.createElement("div");
      title.className = "item-title";
      title.textContent = `${cg.name} (${cg.city || ""}, ${cg.state || ""})`;

      const desc = document.createElement("div");
      desc.className = "item-sub";
      const statePercent = cg.stateTaxPercent ?? 0;
      const localPercent = cg.localTaxPercent ?? 0;
      const total = statePercent + localPercent;

      const descParts = [];
      if (cg.description) {
        const short =
          cg.description.length > 80
            ? cg.description.slice(0, 80) + "..."
            : cg.description;
        descParts.push(short);
      }
      if (cg.taxesEnabled) {
        descParts.push(
          `Tax: state ${statePercent.toFixed(3)}% + local ${localPercent.toFixed(
            3
          )}% = total ${total.toFixed(3)}%`
        );
      } else {
        descParts.push("Taxes disabled.");
      }
      desc.textContent = descParts.join(" • ");

      left.appendChild(title);
      left.appendChild(desc);

      li.appendChild(left);
      campgroundList.appendChild(li);
    }
  }

  function populateCampgroundSelects(campgrounds) {
    const options = campgrounds
      .map((cg) => {
        const suffix = cg.city ? ` (${cg.city}, ${cg.state})` : "";
        return `<option value="${cg.id}">${cg.name}${suffix}</option>`;
      })
      .join("");

    if (siteCampgroundSelect) {
      siteCampgroundSelect.innerHTML = options;
    }
    if (sitesCampgroundSelect) {
      sitesCampgroundSelect.innerHTML =
        `<option value="">All campgrounds</option>` + options;
    }
    if (availabilityCampgroundSelect) {
      availabilityCampgroundSelect.innerHTML = options;
    }
    if (reservationCampgroundSelect) {
      reservationCampgroundSelect.innerHTML = options;
    }
    if (prCampgroundSelect) {
      prCampgroundSelect.innerHTML = options;
    }
  }

async function loadCampgrounds() {
  try {
    setStatus("Loading campgrounds...");
    const campgrounds = await fetchJSON("/campgrounds");

    // --- 1. Render the list on the Campgrounds card ---
    const list = document.getElementById("campground-list");
    if (list) {
      list.innerHTML = "";
      if (!campgrounds.length) {
        list.innerHTML = "<li>No campgrounds yet.</li>";
      } else {
        for (const cg of campgrounds) {
          const li = document.createElement("li");
          li.className = "item-row";

          const main = document.createElement("div");
          main.className = "item-main";

          const title = document.createElement("div");
          title.className = "item-title";
          title.textContent = cg.name || "(no name)";

          const sub = document.createElement("div");
          sub.className = "item-sub";

          const cityState = [cg.city, cg.state].filter(Boolean).join(", ");
          const taxBits = [];
          if (typeof cg.stateTaxPercent === "number") {
            taxBits.push(`State tax ${cg.stateTaxPercent.toFixed(3)}%`);
          }
          if (typeof cg.localTaxPercent === "number") {
            taxBits.push(`Local tax ${cg.localTaxPercent.toFixed(3)}%`);
          }
    

          sub.textContent = [
            cityState || "No location set",
            taxBits.join(" • ")
          ]
            .filter(Boolean)
            .join(" — ");

          main.appendChild(title);
          main.appendChild(sub);
          li.appendChild(main);
          list.appendChild(li);
        }
      }
    }

    // --- 2. Build <option> elements for all campground selects ---
    const optionHtml =
      '<option value="">Select campground</option>' +
      campgrounds
        .map(
          (cg) =>
            `<option value="${cg.id}">${cg.name || "(no name)"}${
              cg.city || cg.state ? " – " : ""
            }${[cg.city, cg.state].filter(Boolean).join(", ")}</option>`
        )
        .join("");

    if (siteCampgroundSelect) {
      siteCampgroundSelect.innerHTML = optionHtml;
    }

    if (availabilityCampgroundSelect) {
      availabilityCampgroundSelect.innerHTML = optionHtml;
    }

    if (reservationCampgroundSelect) {
      reservationCampgroundSelect.innerHTML = optionHtml;
    }

    if (prCampgroundSelect) {
      prCampgroundSelect.innerHTML = optionHtml;
    }


    if (reportsCampgroundSelect) {
      const reportsHtml =
        '<option value="">All campgrounds</option>' +
        campgrounds
          .map(
            (cg) =>
              `<option value="${cg.id}">${cg.name || "(no name)"}${
                cg.city || cg.state ? " – " : ""
              }${[cg.city, cg.state].filter(Boolean).join(", ")}</option>`
          )
          .join("");
      reportsCampgroundSelect.innerHTML = reportsHtml;

      if (currentCampgroundId) {
        reportsCampgroundSelect.value = currentCampgroundId;
      }
    }


       // Filter dropdown uses "All campgrounds" as the first entry
    if (sitesCampgroundSelect) {
      const filterHtml =
        '<option value="">All campgrounds</option>' +
        campgrounds
          .map(
            (cg) =>
              `<option value="${cg.id}">${cg.name || "(no name)"}${
                cg.city || cg.state ? " – " : ""
              }${[cg.city, cg.state].filter(Boolean).join(", ")}</option>`
          )
          .join("");
      sitesCampgroundSelect.innerHTML = filterHtml;
    }

    // --- 3. Populate the new global selector ---
    if (globalCampgroundSelect) {
      const globalHtml =
        '<option value="">All campgrounds</option>' +
        campgrounds
          .map(
            (cg) =>
              `<option value="${cg.id}">${cg.name || "(no name)"}${
                cg.city || cg.state ? " – " : ""
              }${[cg.city, cg.state].filter(Boolean).join(", ")}</option>`
          )
          .join("");
      globalCampgroundSelect.innerHTML = globalHtml;

      // If we don't have a current selection yet, pick the first campground
      if (!currentCampgroundId && campgrounds.length > 0) {
        currentCampgroundId = campgrounds[0].id;
      }

      if (currentCampgroundId) {
        globalCampgroundSelect.value = currentCampgroundId;
      }
    }

    // --- 4. Keep other selects in sync with the global selection ---
    if (currentCampgroundId) {
      if (siteCampgroundSelect) {
        siteCampgroundSelect.value = currentCampgroundId;
      }
      if (availabilityCampgroundSelect) {
        availabilityCampgroundSelect.value = currentCampgroundId;
      }
      if (reservationCampgroundSelect) {
        reservationCampgroundSelect.value = currentCampgroundId;
      }
           if (prCampgroundSelect) {
        prCampgroundSelect.value = currentCampgroundId;
      }
      if (sitesCampgroundSelect) {
        sitesCampgroundSelect.value = currentCampgroundId;
      }
    }

        // --- 5. After campgrounds load, refresh the other panels ---
    if (typeof loadAllSites === "function") {
      await loadAllSites();
    }
    if (typeof loadReservations === "function") {
      await loadReservations();
    }
    if (typeof loadPricingRules === "function") {
      await loadPricingRules();
    }

    setStatus("Campgrounds loaded.");
  } catch (err) {
    console.error("Failed to load campgrounds", err);
    setStatus("Error loading campgrounds.", true);
  }
}
  async function handleCampgroundSubmit(e) {
    e.preventDefault();

    try {
      const name = cgNameInput.value.trim();
      const city = cgCityInput.value.trim();
      const state = cgStateInput.value.trim();
      const description = cgDescriptionInput.value.trim();

      if (!name) {
        setStatus("Campground name is required.", true);
        return;
      }

      await fetchJSON("/campgrounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          state,
          description
        })
      });

      // Clear the form
      cgNameInput.value = "";
      cgCityInput.value = "";
      cgStateInput.value = "";
      cgDescriptionInput.value = "";

      setStatus("Campground created.");
      await loadCampgrounds();
    } catch (err) {
      console.error("Error creating campground", err);
      setStatus("Error creating campground.", true);
    }
  }

  // ==========================
  // SITES
  // ==========================
  function renderSites(sites) {
    if (!siteList) return;
    siteList.innerHTML = "";

    if (!sites.length) {
      siteList.innerHTML = "<li>No sites yet.</li>";
      return;
    }

    for (const s of sites) {
      const li = document.createElement("li");
      li.className = "item-row";

      const left = document.createElement("div");
      left.className = "item-main";

      const title = document.createElement("div");
      title.className = "item-title";
      title.textContent = `${s.name} (${s.kind})`;

      const desc = document.createElement("div");
      desc.className = "item-sub";
      const rate = (s.nightlyRateCents ?? 0) / 100;
      desc.textContent = `Base rate $${rate.toFixed(2)} per night`;

      left.appendChild(title);
      left.appendChild(desc);
      li.appendChild(left);

      siteList.appendChild(li);
    }
  }

  async function loadAllSites() {
    try {
      const params = new URLSearchParams();
      if (sitesCampgroundSelect && sitesCampgroundSelect.value) {
        params.set("campgroundId", sitesCampgroundSelect.value);
      }
      const url = params.toString() ? `/sites?${params.toString()}` : "/sites";
      const sites = await fetchJSON(url);
      renderSites(sites || []);

      // Update reservation site list for current campground
      if (reservationCampgroundSelect && reservationSiteSelect) {
        const cgId = reservationCampgroundSelect.value;
        const cgSites = (sites || []).filter((s) =>
          cgId ? s.campgroundId === cgId : true
        );
        reservationSiteSelect.innerHTML = cgSites
          .map((s) => `<option value="${s.id}">${s.name}</option>`)
          .join("");
      }

      setStatus("Sites loaded.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load sites.", true);
    }
  }

  async function handleSiteSubmit(e) {
    e.preventDefault();
    try {
      const campgroundId = siteCampgroundSelect.value;
      const name = siteNameInput.value.trim();
      const kind = siteKindSelect.value;
      const nightlyRateCents = siteRateInput.value
        ? Math.round(Number(siteRateInput.value) * 100)
        : 0;

      if (!campgroundId || !name) {
        setStatus("Campground and name are required for site.", true);
        return;
      }

      await fetchJSON("/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campgroundId,
          name,
          kind,
          nightlyRateCents
        })
      });

      siteNameInput.value = "";
      siteRateInput.value = "";
      setStatus("Site created.");
      await loadAllSites();
    } catch (err) {
      console.error(err);
      setStatus("Error creating site.", true);
    }
  }

  // ==========================
  // AVAILABILITY
  // ==========================
  async function handleAvailabilitySearch(e) {
    e.preventDefault();
    if (!availabilityResults) return;

    try {
      const campgroundId = availabilityCampgroundSelect.value;
      const start = availabilityStartInput.value;
      const end = availabilityEndInput.value;

      if (!campgroundId || !start || !end) {
        setStatus("Campground, arrival, and departure are required.", true);
        return;
      }

      availabilityResults.textContent = "Loading...";

      const params = new URLSearchParams();
      params.set("campgroundId", campgroundId);
      params.set("startDate", start);
      params.set("endDate", end);

      const data = await fetchJSON(`/availability?${params.toString()}`);

      if (!data || !data.length) {
        availabilityResults.textContent = "No available sites for that range.";
        return;
      }

      const lines = data.map(
        (s) =>
          `${s.name} (${s.kind}) - base rate $${(
            (s.nightlyRateCents ?? 0) / 100
          ).toFixed(2)}`
      );
      availabilityResults.textContent = lines.join("\n");
      setStatus("Availability loaded.");

      // Mirror availability selection into reservation form
      if (reservationCampgroundSelect) {
        reservationCampgroundSelect.value = campgroundId;
      }
      if (reservationArrivalInput) {
        reservationArrivalInput.value = start;
      }
      if (reservationDepartureInput) {
        reservationDepartureInput.value = end;
      }
    } catch (err) {
      console.error(err);
      if (availabilityResults) {
        availabilityResults.textContent = "Error loading availability.";
      }
      setStatus("Error loading availability.", true);
    }
  }

  // ==========================
  // RESERVATIONS
  // ==========================
  function updateReservationSummary(reservations) {
    if (!reservationSummaryBar) return;

    if (!reservations || !reservations.length) {
      reservationSummaryBar.innerHTML =
        "<span>No reservations in this view.</span>";
      return;
    }

    let count = reservations.length;
    let totalNights = 0;
    let subtotalCents = 0;
    let taxCents = 0;
    let totalCents = 0;

    for (const r of reservations) {
      const nights = r.nights ?? 0;
      const sub = r.subtotalCents ?? 0;
      const tax = r.taxCents ?? 0;
      const total = r.totalCents ?? 0;

      totalNights += nights;
      subtotalCents += sub;
      taxCents += tax;
      totalCents += total;
    }

    const subtotal = subtotalCents / 100;
    const tax = taxCents / 100;
    const total = totalCents / 100;
    const adr = totalNights > 0 ? total / totalNights : total;

    reservationSummaryBar.innerHTML = `
      <span>
        ${count} reservation${count === 1 ? "" : "s"} •
        ${totalNights} night${totalNights === 1 ? "" : "s"} •
        Subtotal $${subtotal.toFixed(2)} •
        Tax $${tax.toFixed(2)} •
        Total $${total.toFixed(2)} •
        ADR $${adr.toFixed(2)}/night
      </span>
    `;
  }

  function renderReservations(reservations) {
    // Keep the summary bar in sync
    updateReservationSummary(reservations);

    if (!reservationList) return;
    reservationList.innerHTML = "";

    if (!reservations || !reservations.length) {
      reservationList.innerHTML = "<li>No reservations yet.</li>";
      return;
    }

    for (const r of reservations) {
      const li = document.createElement("li");
      li.className = "item-row";

      // Left side: main info block
      const left = document.createElement("div");
      left.className = "item-main";

      const titleEl = document.createElement("div");
      titleEl.className = "item-title";

      const guestName = `${r.guestFirstName || ""} ${
        r.guestLastName || ""
      }`.trim();
      const campgroundName = r.campground?.name || "";
      const siteName = r.site?.name || "";

      const whoParts = [];
      if (guestName) whoParts.push(guestName);
      if (campgroundName) whoParts.push(campgroundName);
      if (siteName) whoParts.push(`Site ${siteName}`);

      titleEl.textContent = whoParts.join(" • ") || "Reservation";

      const desc = document.createElement("div");
      desc.className = "item-sub";

      const arrival = r.arrivalDate
        ? new Date(r.arrivalDate).toLocaleDateString()
        : "?";
      const departure = r.departureDate
        ? new Date(r.departureDate).toLocaleDateString()
        : "?";

      const nights = r.nights ?? 0;
      const subtotal = (r.subtotalCents ?? 0) / 100;
      const tax = (r.taxCents ?? 0) / 100;
      const total = (r.totalCents ?? 0) / 100;
      const avgPerNight = nights > 0 ? total / nights : total;
      const status = r.status || "pending";

      const line1 = `${arrival} → ${departure} • ${nights} night(s) • Status: ${status}`;
      const line2 = `Subtotal $${subtotal.toFixed(
        2
      )} • Tax $${tax.toFixed(2)} • Total $${total.toFixed(
        2
      )} • Avg $${avgPerNight.toFixed(2)}/night`;

      desc.innerHTML = `
        <div>${line1}</div>
        <div>${line2}</div>
      `;

      left.appendChild(titleEl);
      left.appendChild(desc);

      // Right side: actions (delete)
      const actions = document.createElement("div");
      actions.className = "item-actions";

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "danger";
      deleteBtn.textContent = "Delete";

      deleteBtn.addEventListener("click", async () => {
        try {
          const ok = window.confirm(
            "Are you sure you want to delete this reservation?"
          );
          if (!ok) return;

          await fetchJSON(`/reservations/${r.id}`, {
            method: "DELETE"
          });

          setStatus("Reservation deleted.");
          await loadReservations();
        } catch (err) {
          console.error(err);
          setStatus("Error deleting reservation.", true);
        }
      });

      actions.appendChild(deleteBtn);

      li.appendChild(left);
      li.appendChild(actions);
      reservationList.appendChild(li);
    }
  }

  function updateAccountantView(reservations) {
    // Prefer explicit reservations if passed, otherwise use cache
    const data = reservations || reservationsCache || [];

    if (!accountantSummaryEl || !accountantTable) return;

    const tbody = accountantTable.querySelector("tbody");
    const tfootRow = accountantTable.querySelector("tfoot tr");

    if (!data.length) {
      accountantSummaryEl.textContent = "No reservations in this view.";
      if (tbody) tbody.innerHTML = "";
      if (tfootRow) {
        const cells = tfootRow.querySelectorAll("td");
        if (cells.length === 6) {
          cells[1].textContent = "0";
          cells[2].textContent = "0";
          cells[3].textContent = "$0.00";
          cells[4].textContent = "$0.00";
          cells[5].textContent = "$0.00";
        }
      }
      return;
    }

    const startVal = accountantStartInput?.value || "";
    const endVal = accountantEndInput?.value || "";

    const startDate = startVal ? new Date(startVal + "T00:00:00") : null;
    const endDate = endVal ? new Date(endVal + "T23:59:59") : null;

    const filtered = data.filter((r) => {
      if (!r.arrivalDate) return false;
      const arrival = new Date(r.arrivalDate);
      if (Number.isNaN(arrival.getTime())) return false;

      if (startDate && arrival < startDate) return false;
      if (endDate && arrival > endDate) return false;
      return true;
    });

    if (!filtered.length) {
      accountantSummaryEl.textContent = "No reservations in this date range.";
      if (tbody) tbody.innerHTML = "";
      if (tfootRow) {
        const cells = tfootRow.querySelectorAll("td");
        if (cells.length === 6) {
          cells[1].textContent = "0";
          cells[2].textContent = "0";
          cells[3].textContent = "$0.00";
          cells[4].textContent = "$0.00";
          cells[5].textContent = "$0.00";
        }
      }
      return;
    }

    const byDate = new Map();

    for (const r of filtered) {
      const arrival = r.arrivalDate ? new Date(r.arrivalDate) : null;
      if (!arrival) continue;
      const key = arrival.toISOString().slice(0, 10);

      const nights =
        r.nights ??
        (r.arrivalDate && r.departureDate
          ? Math.max(
              0,
              (new Date(r.departureDate).getTime() - arrival.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0);

      const sub = r.subtotalCents ?? 0;
      const tax = r.taxCents ?? 0;
      const total = r.totalCents ?? 0;

      if (!byDate.has(key)) {
        byDate.set(key, {
          date: key,
          reservations: 0,
          nights: 0,
          subtotalCents: 0,
          taxCents: 0,
          totalCents: 0
        });
      }

      const entry = byDate.get(key);
      entry.reservations += 1;
      entry.nights += nights;
      entry.subtotalCents += sub;
      entry.taxCents += tax;
      entry.totalCents += total;
    }

    const rows = Array.from(byDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    let totalReservations = 0;
    let totalNights = 0;
    let subtotalCents = 0;
    let taxCents = 0;
    let totalCents = 0;

    if (tbody) {
      tbody.innerHTML = "";
      for (const row of rows) {
        totalReservations += row.reservations;
        totalNights += row.nights;
        subtotalCents += row.subtotalCents;
        taxCents += row.taxCents;
        totalCents += row.totalCents;

        const tr = document.createElement("tr");
        const cells = [
          row.date,
          row.reservations,
          row.nights,
          `$${(row.subtotalCents / 100).toFixed(2)}`,
          `$${(row.taxCents / 100).toFixed(2)}`,
          `$${(row.totalCents / 100).toFixed(2)}`
        ];

        for (const value of cells) {
          const td = document.createElement("td");
          td.textContent = String(value);
          tr.appendChild(td);
        }

        tbody.appendChild(tr);
      }
    }

    const subtotal = subtotalCents / 100;
    const tax = taxCents / 100;
    const total = totalCents / 100;
    const adr = totalNights > 0 ? total / totalNights : total;

    accountantSummaryEl.textContent =
      `${totalReservations} reservation${totalReservations === 1 ? "" : "s"} • ` +
      `${totalNights} night${totalNights === 1 ? "" : "s"} • ` +
      `Subtotal $${subtotal.toFixed(2)} • ` +
      `Tax $${tax.toFixed(2)} • ` +
      `Total $${total.toFixed(2)} • ` +
      `ADR $${adr.toFixed(2)}/night`;

    if (tfootRow) {
      const cells = tfootRow.querySelectorAll("td");
      if (cells.length === 6) {
        cells[1].textContent = String(totalReservations);
        cells[2].textContent = String(totalNights);
        cells[3].textContent = `$${subtotal.toFixed(2)}`;
        cells[4].textContent = `$${tax.toFixed(2)}`;
        cells[5].textContent = `$${total.toFixed(2)}`;
      }
    }
  }

  async function loadReservations() {
    try {
      const params = new URLSearchParams();
      if (reservationCampgroundSelect && reservationCampgroundSelect.value) {
        params.set("campgroundId", reservationCampgroundSelect.value);
      }
      const url = params.toString()
        ? `/reservations?${params.toString()}`
        : "/reservations";

      const reservations = (await fetchJSON(url)) || [];

      // cache for accountant view
      reservationsCache = reservations;

      renderReservations(reservationsCache);
      updateAccountantView(reservationsCache);

      setStatus("Reservations loaded.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load reservations.", true);
    }
  }

  async function handleReservationSubmit(e) {
    e.preventDefault();
    try {
      const campgroundId = reservationCampgroundSelect.value;
      const siteId = reservationSiteSelect.value;
      const guestFirstName = reservationFirstInput.value.trim();
      const guestLastName = reservationLastInput.value.trim();
      const guestEmail = reservationEmailInput.value.trim();
      const arrivalDate = reservationArrivalInput.value;
      const departureDate = reservationDepartureInput.value;

      if (
        !campgroundId ||
        !siteId ||
        !guestFirstName ||
        !guestLastName ||
        !guestEmail ||
        !arrivalDate ||
        !departureDate
      ) {
        setStatus("All reservation fields are required.", true);
        return;
      }

      const reservation = await fetchJSON("/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campgroundId,
          siteId,
          guestFirstName,
          guestLastName,
          guestEmail,
          arrivalDate,
          departureDate
        })
      });

      // Expecting these from the backend:
      // nights, baseSubtotalCents, rulesDeltaCents, subtotalCents, taxCents, totalCents
      const nights = reservation.nights ?? 0;

      const baseSubtotal =
        (reservation.baseSubtotalCents ?? reservation.subtotalCents ?? 0) / 100;
      const rulesDelta = (reservation.rulesDeltaCents ?? 0) / 100;
      const subtotal = (reservation.subtotalCents ?? 0) / 100;
      const tax = (reservation.taxCents ?? 0) / 100;
      const total = (reservation.totalCents ?? 0) / 100;

      const avgPerNight = nights > 0 ? total / nights : total;

      const rulesLabel =
        rulesDelta >= 0
          ? `+ $${rulesDelta.toFixed(2)}`
          : `- $${Math.abs(rulesDelta).toFixed(2)}`;

      setStatus(
        `Reservation created. Base $${baseSubtotal.toFixed(
          2
        )} + rules ${rulesLabel} = subtotal $${subtotal.toFixed(
          2
        )}; tax $${tax.toFixed(2)}; total $${total.toFixed(
          2
        )} for ${nights} night(s), avg $${avgPerNight.toFixed(2)}/night.`,
        false
      );

      reservationFirstInput.value = "";
      reservationLastInput.value = "";
      reservationEmailInput.value = "";
      reservationArrivalInput.value = "";
      reservationDepartureInput.value = "";

      await loadReservations();
    } catch (err) {
      console.error(err);
      setStatus("Error creating reservation.", true);
    }
  }

  // ==========================
  // PRICING RULES
  // ==========================
  function renderPricingRules(rules) {
  if (!prList) return;
  prList.innerHTML = "";

  if (!rules.length) {
    prList.innerHTML = "<li>No pricing rules yet.</li>";
    return;
  }

  for (const r of rules) {
    const li = document.createElement("li");
    li.className = "item-row";

    // Left side
    const left = document.createElement("div");
    left.className = "item-main";

    const title = document.createElement("div");
    title.className = "item-title";

    const label = r.label || `${r.ruleType} rule`;
    title.textContent = `${label}${r.isActive ? "" : " (inactive)"}`;

    const desc = document.createElement("div");
    desc.className = "item-sub";

    const start = r.startDate
      ? new Date(r.startDate).toLocaleDateString()
      : "";
    const end = r.endDate
      ? new Date(r.endDate).toLocaleDateString()
      : "";
    const flat = r.flatAdjustCents
      ? (r.flatAdjustCents / 100).toFixed(2)
      : "0.00";
    const pct = r.percentAdjust
      ? (r.percentAdjust * 100).toFixed(1) + "%"
      : "0%";

    const parts = [];
    if (start || end) parts.push(`Range ${start || "?"} to ${end || "?"}`);
    if (r.dayOfWeek !== null && r.dayOfWeek !== undefined) {
      parts.push(`Day ${r.dayOfWeek}`);
    }
    parts.push(`Flat $${flat} per night`);
    parts.push(`Percent ${pct}`);
    if (r.minNights) parts.push(`Min nights ${r.minNights}`);

    desc.textContent = parts.join(" | ");

    left.appendChild(title);
    left.appendChild(desc);

    // Right side: actions (toggle + delete)
    const actions = document.createElement("div");
    actions.className = "item-actions";

    // Toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "secondary";
    toggleBtn.textContent = r.isActive ? "Disable" : "Enable";
    toggleBtn.addEventListener("click", async () => {
      try {
        await fetchJSON(`/pricing-rules/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !r.isActive })
        });
        setStatus("Rule updated.");
        await loadPricingRules();
      } catch (err) {
        console.error(err);
        setStatus("Error updating rule.", true);
      }
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      try {
        const ok = window.confirm(
          "Are you sure you want to delete this pricing rule?"
        );
        if (!ok) return;

        await fetchJSON(`/pricing-rules/${r.id}`, {
          method: "DELETE"
        });

        setStatus("Pricing rule deleted.");
        await loadPricingRules();
      } catch (err) {
        console.error(err);
        setStatus("Error deleting pricing rule.", true);
      }
    });

    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(actions);
    prList.appendChild(li);
  }
}

  async function handlePricingRuleSubmit(e) {
    e.preventDefault();
    try {
      const campgroundId = prCampgroundSelect.value;
      const ruleType = prTypeSelect.value;

      if (!campgroundId || !ruleType) {
        setStatus("Campground and rule type are required.", true);
        return;
      }

      const payload = { campgroundId, ruleType };

      const startDateVal = prStartInput.value.trim();
      if (startDateVal) payload.startDate = startDateVal;

      const endDateVal = prEndInput.value.trim();
      if (endDateVal) payload.endDate = endDateVal;

      const dowRaw = prDowInput.value.trim();
      if (dowRaw !== "") payload.dayOfWeek = Number(dowRaw);

      const flatRaw = prFlatInput.value.trim();
      if (flatRaw !== "") {
        payload.flatAdjustCents = Math.round(Number(flatRaw) * 100);
      }

      const percentRaw = prPercentInput.value.trim();
      if (percentRaw !== "") {
        payload.percentAdjust = Number(percentRaw);
      }

      const minNightsRaw = prMinNightsInput.value.trim();
      if (minNightsRaw !== "") {
        payload.minNights = Number(minNightsRaw);
      }

      await fetchJSON("/pricing-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      prStartInput.value = "";
      prEndInput.value = "";
      prDowInput.value = "";
      prFlatInput.value = "";
      prPercentInput.value = "";
      prMinNightsInput.value = "";

      setStatus("Pricing rule created.");
      await loadPricingRules();
    } catch (err) {
      console.error(err);
      setStatus("Error creating pricing rule.", true);
    }
  }

  async function loadPricingRules() {
    if (!prCampgroundSelect || !prCampgroundSelect.value) {
      if (prList) {
        prList.innerHTML = "<li>Select a campground to view rules.</li>";
      }
      return;
    }

    try {
      const cgId = prCampgroundSelect.value;
      const rules = await fetchJSON(`/pricing-rules?campgroundId=${cgId}`);
      renderPricingRules(rules || []);
      setStatus("Pricing rules loaded.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load pricing rules.", true);
    }
  }
  // ==========================
  // REPORTS / DAILY REVENUE
  // ==========================

  function renderDailyRevenue(rows) {
    if (!reportsTable) return;
    const tbody = reportsTable.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const totals = {
      reservations: 0,
      nights: 0,
      subtotalCents: 0,
      taxCents: 0,
      totalCents: 0
    };

    if (!rows || !rows.length) {
      tbody.innerHTML = "<tr><td colspan='7'>No data for this range.</td></tr>";
    } else {
      for (const row of rows) {
        const count = row.reservationsCount ?? 0;
        const nights = row.nights ?? 0;
        const subtotal = (row.subtotalCents ?? 0) / 100;
        const tax = (row.taxCents ?? 0) / 100;
        const total = (row.totalCents ?? 0) / 100;
        const adr = nights > 0 ? total / nights : 0;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.date}</td>
          <td>${count}</td>
          <td>${nights}</td>
          <td>$${subtotal.toFixed(2)}</td>
          <td>$${tax.toFixed(2)}</td>
          <td>$${total.toFixed(2)}</td>
          <td>$${adr.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);

        totals.reservations += count;
        totals.nights += nights;
        totals.subtotalCents += row.subtotalCents ?? 0;
        totals.taxCents += row.taxCents ?? 0;
        totals.totalCents += row.totalCents ?? 0;
      }
    }

    const totalResEl = document.getElementById("reports-total-res");
    const totalNightsEl = document.getElementById("reports-total-nights");
    const totalSubtotalEl = document.getElementById("reports-total-subtotal");
    const totalTaxEl = document.getElementById("reports-total-tax");
    const totalTotalEl = document.getElementById("reports-total-total");
    const totalAdrEl = document.getElementById("reports-total-adr");

    if (totalResEl) totalResEl.textContent = String(totals.reservations);
    if (totalNightsEl) totalNightsEl.textContent = String(totals.nights);
    if (totalSubtotalEl)
      totalSubtotalEl.textContent = `$${(totals.subtotalCents / 100).toFixed(2)}`;
    if (totalTaxEl)
      totalTaxEl.textContent = `$${(totals.taxCents / 100).toFixed(2)}`;
    if (totalTotalEl)
      totalTotalEl.textContent = `$${(totals.totalCents / 100).toFixed(2)}`;

    const adrTotal =
      totals.nights > 0 ? (totals.totalCents / 100) / totals.nights : 0;
    if (totalAdrEl) totalAdrEl.textContent = `$${adrTotal.toFixed(2)}`;
  }

  async function loadDailyRevenue() {
    if (!reportsTable) return;

    const tbody = reportsTable.querySelector("tbody");
    if (tbody) {
      tbody.innerHTML = "<tr><td colspan='7'>Loading…</td></tr>";
    }
    setReportsStatus("Loading report...");

    try {
      const params = new URLSearchParams();
      if (reportsCampgroundSelect && reportsCampgroundSelect.value) {
        params.set("campgroundId", reportsCampgroundSelect.value);
      }
      if (reportsStartInput && reportsStartInput.value) {
        params.set("startDate", reportsStartInput.value);
      }
      if (reportsEndInput && reportsEndInput.value) {
        params.set("endDate", reportsEndInput.value);
      }

      const qs = params.toString();
      const url = qs ? `/reports/daily-revenue?${qs}` : "/reports/daily-revenue";

      const rows = await fetchJSON(url);
      renderDailyRevenue(rows || []);
      setReportsStatus("Report loaded.");
    } catch (err) {
      console.error(err);
      if (tbody) {
        tbody.innerHTML = "<tr><td colspan='7'>Error loading report.</td></tr>";
      }
      setReportsStatus("Error loading report.", true);
    }
  }
  // ==========================
  // EVENT WIRING
  // ==========================
  if (campgroundForm) {
    campgroundForm.addEventListener("submit", handleCampgroundSubmit);
  }

  if (siteForm) {
    siteForm.addEventListener("submit", handleSiteSubmit);
  }
  // When the global campground selector changes, sync the other selects
  if (globalCampgroundSelect) {
    globalCampgroundSelect.addEventListener("change", async () => {
      currentCampgroundId = globalCampgroundSelect.value || "";

      // Mirror into other dropdowns
      if (siteCampgroundSelect) {
        siteCampgroundSelect.value = currentCampgroundId;
      }
      if (sitesCampgroundSelect) {
        sitesCampgroundSelect.value = currentCampgroundId;
      }
      if (availabilityCampgroundSelect) {
        availabilityCampgroundSelect.value = currentCampgroundId;
      }
      if (reservationCampgroundSelect) {
        reservationCampgroundSelect.value = currentCampgroundId;
      }
      if (prCampgroundSelect) {
        prCampgroundSelect.value = currentCampgroundId;
      }

      // Reload data for the newly selected campground
      await loadAllSites();
      await loadReservations();
      await loadPricingRules();

      setStatus(
        currentCampgroundId
          ? "Switched campground view."
          : "Showing all campgrounds."
      );
    });
  }

  if (sitesCampgroundSelect) {
    sitesCampgroundSelect.addEventListener("change", loadAllSites);
  }

  if (availabilityForm) {
    availabilityForm.addEventListener("submit", handleAvailabilitySearch);
  }

  if (reservationForm) {
    reservationForm.addEventListener("submit", handleReservationSubmit);
  }

  if (reservationCampgroundSelect) {
    reservationCampgroundSelect.addEventListener("change", async () => {
      await loadAllSites();
      await loadReservations();
    });
  }

  if (reloadReservationsBtn) {
    reloadReservationsBtn.addEventListener("click", loadReservations);
  }
  if (accountantForm) {
    accountantForm.addEventListener("submit", (e) => {
      e.preventDefault();
      updateAccountantView();
    });

    if (accountantStartInput) {
      accountantStartInput.addEventListener("change", () =>
        updateAccountantView()
      );
    }
    if (accountantEndInput) {
      accountantEndInput.addEventListener("change", () =>
        updateAccountantView()
      );
    }
    if (accountantModeSelect) {
      accountantModeSelect.addEventListener("change", () =>
        updateAccountantView()
      );
    }
  }

  if (prCampgroundSelect) {
    prCampgroundSelect.addEventListener("change", loadPricingRules);
  }

  if (prForm) {
    prForm.addEventListener("submit", handlePricingRuleSubmit);
  }
  if (reportsRunBtn) {
    reportsRunBtn.addEventListener("click", loadDailyRevenue);
  }

   // Optional: default reports date range to next year (matches seeded 2026 data)
  const now = new Date();
  const defaultYear = now.getFullYear() + 1;
  const yearStart = new Date(defaultYear, 0, 1);
  const yearEnd = new Date(defaultYear, 11, 31);

  if (reportsStartInput && !reportsStartInput.value) {
    reportsStartInput.value = yearStart.toISOString().slice(0, 10);
  }
  if (reportsEndInput && !reportsEndInput.value) {
    reportsEndInput.value = yearEnd.toISOString().slice(0, 10);
  }
  // ==========================
  // TABS (simple card switcher)
  // ==========================
  const tabButtons = document.querySelectorAll("[data-tab-target]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");

  if (tabButtons.length && tabPanels.length) {
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-tab-target");
        if (!targetId) return;

        // Highlight active button
        tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Show matching panel, hide others
        tabPanels.forEach((panel) => {
          const panelId = panel.getAttribute("data-tab-panel");
          if (panelId === targetId) {
            panel.classList.remove("hidden");
          } else {
            panel.classList.add("hidden");
          }
        });
      });
    });
  }

  // ==========================
  // INITIAL LOAD
  // ==========================
  loadCampgrounds();
  loadAllSites();
  loadReservations();
  setStatus("Ready.");
});