export const  getImgUrl = (name) => {
  const base = "https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/2023%2FUsers%2F";
  return `${base}${encodeURIComponent(name)}.jpg?alt=media`;
};

export const getUserAssetUrl = (name, type, filename) => {
  const base = "https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/";

  const tryTypes = ["PosterSorce", "PosterSorce01", "PosterSorce02", "VideoSorce", "VideoSorce1", "VideoSorce2"]
    .filter(folder => folder.startsWith(type)); // matches the base type (PosterSorce or VideoSorce)

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