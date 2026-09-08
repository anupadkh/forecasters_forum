// Resolve images dynamically from src/images/icons using Vite's glob import
const iconModules = import.meta.glob('/src/images/icons/*.{png,jpg,jpeg,svg,webp}', {
  eager: true,
  import: 'default',
});

/**
 * Maps raw icon data to a standardized frontend image item.
 * Resolves filenames to assets bundled by Vite.
 */
export function mapImageItem(item) {
  if (!item) return null;

  // Already standard format with URL
  if (item.url) {
    return {
      id: item.id || item.filename || item.name,
      label: item.label || item.name || 'Image',
      url: item.url,
      ...item,
    };
  }

  const filename = item.filename;
  // Match key from Vite's glob map: /src/images/icons/{filename}
  const resolvedUrl =
    iconModules[`/src/images/icons/${filename}`] || `/src/images/icons/${filename}`;

  return {
    id: item.filename ? item.filename.replace(/\.[^/.]+$/, '') : (item.name || ''),
    label: item.name || item.filename || 'Icon',
    url: resolvedUrl,
    filename: item.filename,
    lastWriteTime: item.lastWriteTime,
    length: item.length,
  };
}

/**
 * Normalizes an array of items through mapImageItem
 */
export function mapImageList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(mapImageItem);
}

// Simple image provider: try external API, fall back to local JSON
export async function getImages(section) {
  const apiBase = import.meta.env.VITE_IMAGE_API || '/api/images';
  const apiUrl = section ? `${apiBase}/${encodeURIComponent(section)}` : apiBase;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('API response not ok');
    const data = await res.json();
    if (Array.isArray(data)) return mapImageList(data);
    throw new Error('Invalid data');
  } catch (err) {
    clearTimeout(timeout);

    // 1. Try section-specific JSON file in src/assets/
    try {
      if (section) {
        const mod = await import(`../assets/images-${section}.json`);
        return mapImageList(mod.default || mod);
      }
    } catch (e) {
      // Ignore and continue to generic fallback
    }

    // 2. Primary local fallback: src/assets/images.json
    try {
      const mod = await import('../assets/images.json');
      return mapImageList(mod.default || mod);
    } catch (e) {
      // 3. Final fallback: provide a minimal placeholder list
      return [
        { id: 'placeholder-1', label: 'Placeholder 150', url: 'https://via.placeholder.com/150' },
        { id: 'placeholder-2', label: 'Placeholder 300', url: 'https://via.placeholder.com/300' },
      ];
    }
  }
}