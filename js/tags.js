export function getAllTags(imagesMap) {
  let tags = new Set();
  imagesMap.forEach(data => data.tags.forEach(t => tags.add(t)));
  return [...tags].sort();
}

export function renderTagFilterBar(imagesMap, activeFilters, onFilterChange) {
  const tagFilterBar = document.getElementById("tagFilterBar");
  tagFilterBar.innerHTML = "";
  const allTags = getAllTags(imagesMap);

  if (allTags.length === 0) {
    tagFilterBar.innerHTML = `<span style="font-size:11px; color:var(--text-muted); padding:4px;">No tags found</span>`;
    return;
  }

  allTags.forEach(tag => {
    const chip = document.createElement("div");
    chip.className = `filter-chip ${activeFilters.has(tag) ? 'active' : ''}`;
    chip.textContent = tag;
    chip.addEventListener("click", () => {
      if (activeFilters.has(tag)) activeFilters.delete(tag);
      else activeFilters.add(tag);
      onFilterChange();
    });
    tagFilterBar.appendChild(chip);
  });
}

export function renderCardTags(filename, imagesMap, onTagUpdate) {
  const card = document.querySelector(`.card[data-filename="${CSS.escape(filename.toLowerCase())}"]`);
  if (!card) return;

  const tagContainer = card.querySelector(".card-tags");
  tagContainer.innerHTML = "";

  const currentData = imagesMap.get(filename);
  card.dataset.tagsJSON = JSON.stringify(currentData.tags);

  currentData.tags.forEach(tag => {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.innerHTML = `${tag} <span class="del">&times;</span>`;

    badge.querySelector(".del").addEventListener("click", (e) => {
      e.stopPropagation();
      currentData.tags = currentData.tags.filter(t => t !== tag);
      onTagUpdate();
    });
    tagContainer.appendChild(badge);
  });
}
