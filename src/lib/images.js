const IMG_BASE = "https://images.unsplash.com/";

export function img(id, w = 400, q = 70) {
  if (!id) return "";
  const base = /^https?:\/\//.test(id) ? id.split("?")[0] : IMG_BASE + id;
  return `${base}?auto=format&fit=crop&w=${w}&q=${q}`;
}
