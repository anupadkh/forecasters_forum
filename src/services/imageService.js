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
    if (Array.isArray(data)) return data;
    throw new Error('Invalid data');
  } catch (err) {
    // fallback to local JSON shipped with the frontend; try section-specific file first
    try {
      if (section) {
        const mod = await import(`../pages/bulletin/images-${section}.json`);
        return mod.default || mod;
      }
    } catch (e) {
      // ignore and try generic
    }

    try {
      const mod = await import('../pages/bulletin/images.json');
      return mod.default || mod;
    } catch (e) {
      // final fallback: provide a minimal placeholder list
      return [
        { id: 'placeholder-1', label: 'Placeholder 150', url: 'https://via.placeholder.com/150' },
        { id: 'placeholder-2', label: 'Placeholder 300', url: 'https://via.placeholder.com/300' },
      ];
    }
  }
}
