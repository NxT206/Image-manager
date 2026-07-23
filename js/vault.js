import { loadMetadata } from "./metadata.js";
import { renderCardTags, openTagSelectorModal } from "./tags.js";
import { openLightbox } from "./lightbox.js";

export const selectedFilenames = new Set();

export async function connectVault(imagesMap, onVaultLoaded) {
  try {
    const folderHandle = await window.showDirectoryPicker();
    imagesMap.clear();
    selectedFilenames.clear();
    document.getElementById("images").innerHTML = "";

    const savedMetadata = await loadMetadata(folderHandle);

    for await (const entry of folderHandle.values()) {
      if (entry.kind !== "file") continue;
      if (entry.name === "metadata.json") continue;

      const file = await entry.getFile();
      if (!file.type.startsWith("image/")) continue;

      const filename = file.name;
      const tags = savedMetadata[filename] || [];

      imagesMap.set(filename, { file, tags });
      createImageCard(filename, file, tags, imagesMap, onVaultLoaded);
    }

    onVaultLoaded();
    document.getElementById("status").textContent = `${imagesMap.size} images loaded`;
    return folderHandle;
  } catch (err) {
    console.error(err);
    document.getElementById("status").textContent = "Folder access cancelled.";
    return null;
  }
}

function createImageCard(filename, file, tags, imagesMap, onUpdate) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.filename = filename.toLowerCase();
  card.dataset.tagsJSON = JSON.stringify(tags);

  const imgWrapper = document.createElement("div");
  imgWrapper.className = "card-img-wrapper";

  // Checkbox for Batch Selection
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "card-checkbox";
  
  checkbox.addEventListener("change", (e) => {
    e.stopPropagation();
    if (checkbox.checked) {
      selectedFilenames.add(filename);
      card.classList.add("selected");
    } else {
      selectedFilenames.delete(filename);
      card.classList.remove("selected");
    }
    onUpdate();
  });

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.addEventListener("click", () => openLightbox(img.src));

  imgWrapper.appendChild(checkbox);
  imgWrapper.appendChild(img);

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const title = document.createElement("p");
  title.className = "card-title";
  title.textContent = filename;

  const tagContainer = document.createElement("div");
  tagContainer.className = "card-tags";

  const tagBtn = document.createElement("button");
  tagBtn.className = "btn";
  tagBtn.style.padding = "4px 8px";
  tagBtn.style.fontSize = "11px";
  tagBtn.style.width = "100%";
  tagBtn.textContent = "+ Tags";
  
  tagBtn.addEventListener("click", () => {
    openTagSelectorModal(filename, imagesMap, () => {
      renderCardTags(card, filename, imagesMap);
      onUpdate();
    });
  });

  cardBody.appendChild(title);
  cardBody.appendChild(tagContainer);
  cardBody.appendChild(tagBtn);

  card.appendChild(imgWrapper);
  card.appendChild(cardBody);
  document.getElementById("images").appendChild(card);

  renderCardTags(card, filename, imagesMap);
}

export function updateBatchUI() {
  const batchTagBtn = document.getElementById("batchTagBtn");
  const selectCount = document.getElementById("selectCount");
  const count = selectedFilenames.size;

  if (count > 0) {
    batchTagBtn.style.display = "inline-flex";
    selectCount.textContent = count;
  } else {
    batchTagBtn.style.display = "none";
  }
}
