export async function loadMetadata(folderHandle) {
  try {
    const metaHandle = await folderHandle.getFileHandle("metadata.json");
    const metaFile = await metaHandle.getFile();
    const text = await metaFile.text();
    return JSON.parse(text);
  } catch (e) {
    return {};
  }
}

export async function saveMetadata(folderHandle, imagesMap) {
  if (!folderHandle) throw new Error("No folder connected");

  const fileHandle = await folderHandle.getFileHandle("metadata.json", { create: true });
  const writable = await fileHandle.createWritable();

  const exportObj = {};
  imagesMap.forEach((data, filename) => {
    exportObj[filename] = data.tags;
  });

  await writable.write(JSON.stringify(exportObj, null, 2));
  await writable.close();
}
