const realSizeGalleryRoots = Array.from(document.querySelectorAll('.project-gallery-grid-fluid'));

if (realSizeGalleryRoots.length) {
  const syncAllRealSizeGalleries = () => {
    realSizeGalleryRoots.forEach(syncRealSizeGallery);
  };

  window.addEventListener('resize', debounce(syncAllRealSizeGalleries, 120));
  window.addEventListener('load', syncAllRealSizeGalleries);
  syncAllRealSizeGalleries();
}

function syncRealSizeGallery(grid) {
  const cards = Array.from(grid.querySelectorAll('.project-gallery-card'));
  const images = cards
    .map((card) => ({ card, image: card.querySelector('img') }))
    .filter(({ image }) => image);

  if (!images.length) {
    return;
  }

  const allReady = images.every(({ image }) => image.complete && image.naturalWidth && image.naturalHeight);

  if (!allReady) {
    images.forEach(({ image }) => {
      image.addEventListener('load', () => syncRealSizeGallery(grid), { once: true });
    });
    return;
  }

  const computedStyle = window.getComputedStyle(grid);
  const gap = parseFloat(computedStyle.columnGap || computedStyle.gap || '18');
  const isSingleColumn = window.innerWidth <= 640;
  const columnCount = isSingleColumn ? 1 : 2;
  const availableWidth = columnCount === 1
    ? grid.clientWidth
    : (grid.clientWidth - gap) / columnCount;

  const widestImage = Math.max(...images.map(({ image }) => image.naturalWidth));
  const scale = widestImage > 0 ? availableWidth / widestImage : 1;

  images.forEach(({ card, image }) => {
    if (columnCount === 1) {
      card.style.setProperty('--gallery-card-width', '100%');
      return;
    }

    const scaledWidth = Math.round(image.naturalWidth * scale);
    const clampedWidth = Math.max(Math.min(scaledWidth, availableWidth), 220);
    card.style.setProperty('--gallery-card-width', `${clampedWidth}px`);
  });
}

function debounce(callback, delay) {
  let timerId = 0;

  return () => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(callback, delay);
  };
}
