export const  getImgUrl = (name) => {
  const base = "https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/2023%2FUsers%2F";
  return `${base}${encodeURIComponent(name)}.jpg?alt=media`;
};

export const getUserAssetUrl = (name, type, filename) => {
  const base = "https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/";

  const allFolders = ["PosterSorce", "PosterSorce01", "PosterSorce02", "VideoSorce", "VideoSorce1", "VideoSorce2"];
  const tryTypes = allFolders.filter(folder =>
    folder.toLowerCase() === type.toLowerCase() ||
    folder.toLowerCase().startsWith(type.toLowerCase() + "1")
  );

  const urls = tryTypes.map(folder => {
    const fullPath = `2023/UsersWorkData/${name}/${folder}/${filename}`;
    return `${base}${encodeURIComponent(fullPath)}?alt=media`;
  });

  return urls; // return list of possible URLs
};

export const getUserAssetPostUrl = (name, relativePath) => {
  const base = "https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/";
  const fullPath = `2023/UsersWorkData/${name}/${relativePath}`;
  return `${base}${encodeURIComponent(fullPath)}?alt=media`;
};

export async function getUserAssetVideoUrl(name, folderPrefix, filename) {
  const base = "https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/";
  const foldersToTry = [folderPrefix, `${folderPrefix}1`, `${folderPrefix}2`];

  for (const folder of foldersToTry) {
    const fullPath = `2023/UsersWorkData/${name}/${folder}/${filename}`;
    const encodedUrl = `${base}${encodeURIComponent(fullPath)}?alt=media`;

    try {
      const res = await fetch(encodedUrl, { method: "HEAD" });
      if (res.ok) {
        return encodedUrl;
      }
    } catch (err) {
      console.warn(`Error checking: ${encodedUrl}`, err);
    }
  }

  return "img/default.png";
}
