import { connectVault, selectedFilenames, updateBatchUI } from "./vault.js";
import { saveMetadata } from "./metadata.js";
import { renderTagFilterBar, openBatchTagModal, renderCardTags } from "./tags.js";
import { applyFilters } from "./search.js";
import { initLightbox } from "./lightbox.js";

const imagesMap = new Map();
let activeFilters = new Set();
let activeFolderHandle = null;

document.addEventListener("DOMContentLoaded", () => {
  initLightbox();

  // Connect Folder
  document.getElementById("pickFolder").addEventListener("click", async () => {
    activeFolderHandle = await connectVault(imagesMap, refreshUI);
  });

  // Save Metadata
  document.getElementById("saveMetaBtn").addEventListener("click", async () => {
    try {
      await saveMetadata(activeFolderHandle, imagesMap);
      document.getElementById("status").textContent = "Metadata successfully saved to vault!";
    } catch (err) {
      alert(err.message);
    }
  });

  // Search Bar
  document.getElementById("search").addEventListener("input", () => {
    applyFilters(activeFilters);
  });

  // Grid / List View Switcher
  document.getElementById("viewSelect").addEventListener("change", (e) => {
    const imagesDiv = document.getElementById("images");
    imagesDiv.className = "";
    if (e.target.value === "compact") imagesDiv.classList.add("view-compact");
    if (e.target.value === "list") imagesDiv.classList.add("view-list");
  });

  // Select All Visible Images
  document.getElementById("selectAllBtn").addEventListener("click", () => {
    const visibleCards = document.querySelectorAll('.card[style*="display: flex"]');
    const allSelected = Array.from(visibleCards).every(card => card.classList.contains("selected"));

    visibleCards.forEach(card => {
      const filenameKey = Array.from(imagesMap.keys()).find(
        key => key.toLowerCase() === card.dataset.filename
      );
      if (!filenameKey) return;

      const checkbox = card.querySelector(".card-checkbox");
      if (allSelected) {
        selectedFilenames.delete(filenameKey);
        card.classList.remove("selected");
        if (checkbox) checkbox.checked = false;
      } else {
        selectedFilenames.add(filenameKey);
        card.classList.add("selected");
        if (checkbox) checkbox.checked = true;
      }
    });

    refreshUI();
  });

  // Open Bulk Tag Modal
  document.getElementById("batchTagBtn").addEventListener("click", () => {
    if (selectedFilenames.size === 0) return;
    openBatchTagModal(selectedFilenames, imagesMap, () => {
      // Re-render tags across all cards
      document.querySelectorAll(".card").forEach(card => {
        const filenameKey = Array.from(imagesMap.keys()).find(
          key => key.toLowerCase() === card.dataset.filename
        );
        if (filenameKey) renderCardTags(card, filenameKey, imagesMap);
      });
      refreshUI();
    });
  });
});

function refreshUI() {
  renderTagFilterBar(imagesMap, activeFilters, () => {
    renderTagFilterBar(imagesMap, activeFilters, refreshUI);
    applyFilters(activeFilters);
  });
  applyFilters(activeFilters);
  updateBatchUI();
}
