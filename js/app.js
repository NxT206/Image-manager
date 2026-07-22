import { connectVault } from "./vault.js";
import { saveMetadata } from "./metadata.js";
import { renderTagFilterBar } from "./tags.js";
import { applyFilters } from "./search.js";
import { initLightbox } from "./lightbox.js";

const imagesMap = new Map();
let activeFilters = new Set();
let activeFolderHandle = null;

document.addEventListener("DOMContentLoaded", () => {
  initLightbox();

  document.getElementById("pickFolder").addEventListener("click", async () => {
    activeFolderHandle = await connectVault(imagesMap, refreshUI);
  });

  document.getElementById("saveMetaBtn").addEventListener("click", async () => {
    try {
      await saveMetadata(activeFolderHandle, imagesMap);
      document.getElementById("status").textContent = "Metadata successfully saved to vault!";
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById("search").addEventListener("input", () => {
    applyFilters(activeFilters);
  });
});

function refreshUI() {
  renderTagFilterBar(imagesMap, activeFilters, () => {
    renderTagFilterBar(imagesMap, activeFilters, refreshUI);
    applyFilters(activeFilters);
  });
  applyFilters(activeFilters);
}
