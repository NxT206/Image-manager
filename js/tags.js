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
    tagFilterBar.innerHTML = `<span style="font-size:11px; color:var(--text-muted); padding:4px;">No tags created yet</span>`;
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

// Single Card Tag Selector Modal
export function openTagSelectorModal(filename, imagesMap, onUpdate) {
  const existing = document.getElementById("tagModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "tagModal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); display: flex; justify-content: center;
    align-items: center; z-index: 2000;
  `;

  const box = document.createElement("div");
  box.style.cssText = `
    background: var(--panel-bg, #1e1e24); border: 1px solid var(--border-color, #2e2e38);
    padding: 20px; border-radius: 8px; width: 300px; max-width: 90vw;
    display: flex; flex-direction: column; gap: 12px; color: var(--text-main, #f4f4f6);
  `;

  const title = document.createElement("h3");
  title.style.margin = "0";
  title.style.fontSize = "14px";
  title.textContent = `Manage Tags for: ${filename}`;

  const searchInput = document.createElement("input");
  searchInput.placeholder = "Search or create new tag...";
  searchInput.style.cssText = `
    background: var(--bg-color, #121214); border: 1px solid var(--border-color, #2e2e38);
    padding: 8px; color: white; border-radius: 4px; outline: none; font-size: 13px;
  `;

  const listContainer = document.createElement("div");
  listContainer.style.cssText = `
    max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
  `;

  const currentData = imagesMap.get(filename);

  function renderList(filter = "") {
    listContainer.innerHTML = "";
    const allKnownTags = getAllTags(imagesMap);
    const filtered = allKnownTags.filter(t => t.toLowerCase().includes(filter.toLowerCase()));

    if (filtered.length === 0 && filter.trim()) {
      const createBtn = document.createElement("button");
      createBtn.className = "btn";
      createBtn.textContent = `Create tag "${filter.trim().toLowerCase()}"`;
      createBtn.onclick = () => {
        const newTag = filter.trim().toLowerCase();
        if (!currentData.tags.includes(newTag)) currentData.tags.push(newTag);
        onUpdate();
        modal.remove();
      };
      listContainer.appendChild(createBtn);
      return;
    }

    filtered.forEach(tag => {
      const item = document.createElement("div");
      const isAttached = currentData.tags.includes(tag);
      item.style.cssText = `
        padding: 8px; background: ${isAttached ? 'var(--accent, #4f46e5)' : 'var(--bg-color, #121214)'};
        border-radius: 4px; cursor: pointer; display: flex; justify-content: space-between; font-size: 12px;
      `;
      item.innerHTML = `<span>${tag}</span> <span>${isAttached ? '✓' : '+'}</span>`;
      
      item.onclick = () => {
        if (isAttached) {
          currentData.tags = currentData.tags.filter(t => t !== tag);
        } else {
          currentData.tags.push(tag);
        }
        onUpdate();
        renderList(searchInput.value);
      };
      listContainer.appendChild(item);
    });
  }

  searchInput.oninput = (e) => renderList(e.target.value);
  renderList();

  const closeBtn = document.createElement("button");
  closeBtn.className = "btn btn-success";
  closeBtn.textContent = "Done";
  closeBtn.onclick = () => modal.remove();

  box.appendChild(title);
  box.appendChild(searchInput);
  box.appendChild(listContainer);
  box.appendChild(closeBtn);
  modal.appendChild(box);
  document.body.appendChild(modal);
}

// Bulk Batch Tag Selector Modal
export function openBatchTagModal(selectedFilenames, imagesMap, onUpdate) {
  const existing = document.getElementById("tagModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "tagModal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); display: flex; justify-content: center;
    align-items: center; z-index: 2000;
  `;

  const box = document.createElement("div");
  box.style.cssText = `
    background: var(--panel-bg, #1e1e24); border: 1px solid var(--border-color, #2e2e38);
    padding: 20px; border-radius: 8px; width: 320px; max-width: 90vw;
    display: flex; flex-direction: column; gap: 12px; color: var(--text-main, #f4f4f6);
  `;

  const title = document.createElement("h3");
  title.style.margin = "0";
  title.style.fontSize = "14px";
  title.textContent = `Batch Tag (${selectedFilenames.size} Selected)`;

  const searchInput = document.createElement("input");
  searchInput.placeholder = "Search or create tag to attach...";
  searchInput.style.cssText = `
    background: var(--bg-color, #121214); border: 1px solid var(--border-color, #2e2e38);
    padding: 8px; color: white; border-radius: 4px; outline: none; font-size: 13px;
  `;

  const listContainer = document.createElement("div");
  listContainer.style.cssText = `
    max-height: 160px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
  `;

  function applyTagToSelected(tag) {
    selectedFilenames.forEach(filename => {
      const currentData = imagesMap.get(filename);
      if (currentData && !currentData.tags.includes(tag)) {
        currentData.tags.push(tag);
      }
    });
    onUpdate();
  }

  function renderList(filter = "") {
    listContainer.innerHTML = "";
    const allKnownTags = getAllTags(imagesMap);
    const filtered = allKnownTags.filter(t => t.toLowerCase().includes(filter.toLowerCase()));

    if (filtered.length === 0 && filter.trim()) {
      const createBtn = document.createElement("button");
      createBtn.className = "btn";
      createBtn.textContent = `Add "${filter.trim().toLowerCase()}" to all selected`;
      createBtn.onclick = () => {
        applyTagToSelected(filter.trim().toLowerCase());
        modal.remove();
      };
      listContainer.appendChild(createBtn);
      return;
    }

    filtered.forEach(tag => {
      const item = document.createElement("div");
      item.style.cssText = `
        padding: 8px; background: var(--bg-color, #121214);
        border-radius: 4px; cursor: pointer; display: flex; justify-content: space-between; font-size: 12px;
      `;
      item.innerHTML = `<span>+ ${tag}</span>`;
      
      item.onclick = () => {
        applyTagToSelected(tag);
        modal.remove();
      };
      listContainer.appendChild(item);
    });
  }

  searchInput.oninput = (e) => renderList(e.target.value);
  renderList();

  const closeBtn = document.createElement("button");
  closeBtn.className = "btn btn-success";
  closeBtn.textContent = "Done";
  closeBtn.onclick = () => modal.remove();

  box.appendChild(title);
  box.appendChild(searchInput);
  box.appendChild(listContainer);
  box.appendChild(closeBtn);
  modal.appendChild(box);
  document.body.appendChild(modal);
}

export function renderCardTags(card, filename, imagesMap) {
  if (!card) return;
  const tagContainer = card.querySelector(".card-tags");
  tagContainer.innerHTML = "";
  
  const currentData = imagesMap.get(filename);
  card.dataset.tagsJSON = JSON.stringify(currentData.tags);

  currentData.tags.forEach(tag => {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = tag;
    tagContainer.appendChild(badge);
  });
}
