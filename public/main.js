const listContainer = document.getElementById("campgroundsContainer");
const form = document.getElementById("campgroundForm");
const refreshButton = document.getElementById("refreshButton");
const formMessage = document.getElementById("formMessage");

async function fetchCampgrounds() {
  listContainer.classList.remove("empty");
  listContainer.innerHTML = "<p>Loading campgrounds...</p>";

  try {
    const res = await fetch("/campgrounds");
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const campgrounds = await res.json();

    if (!Array.isArray(campgrounds) || campgrounds.length === 0) {
      listContainer.classList.add("empty");
      listContainer.innerHTML = "<p class='muted'>No campgrounds yet. Create one below.</p>";
      return;
    }

    const rows = campgrounds
      .map(
        (cg) => `
          <tr>
            <td><strong>${cg.name}</strong><br /><span class="muted">${cg.description ?? ""}</span></td>
            <td>${cg.city ?? ""}</td>
            <td>${cg.state ?? ""}</td>
            <td>${cg.country ?? ""}</td>
            <td><span class="badge">${cg.id}</span></td>
          </tr>
        `
      )
      .join("");

    listContainer.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>City</th>
            <th>State</th>
            <th>Country</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  } catch (error) {
    listContainer.innerHTML = `<p class="muted">Error loading campgrounds: ${error}</p>`;
  }
}

async function createCampground(event) {
  event.preventDefault();
  formMessage.textContent = "";

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/campgrounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      const message = error?.message || "Could not create campground";
      formMessage.textContent = message;
      return;
    }

    form.reset();
    formMessage.textContent = "Campground created";
    await fetchCampgrounds();
  } catch (error) {
    formMessage.textContent = `Error: ${error}`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  fetchCampgrounds();
  form.addEventListener("submit", createCampground);
  refreshButton.addEventListener("click", fetchCampgrounds);
});
