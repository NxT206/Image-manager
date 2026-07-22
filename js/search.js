export function applyFilters(activeFilters) {
  const query = document.getElementById("search").value.toLowerCase().trim();
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const filename = card.dataset.filename || "";
    const tags = JSON.parse(card.dataset.tagsJSON || "[]");

    const matchesQuery = !query || filename.includes(query) || tags.some(t => t.includes(query));
    const matchesTags = [...activeFilters].every(filterTag => tags.includes(filterTag));

    card.style.display = (matchesQuery && matchesTags) ? "flex" : "none";
  });
}
