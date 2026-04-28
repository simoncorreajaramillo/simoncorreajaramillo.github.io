const realSizeGalleryRoots = Array.from(document.querySelectorAll('.project-gallery-grid-fluid'));
const galleryRuntimeImages = Array.from(document.querySelectorAll(
  '.project-gallery-card img, .project-gallery-board-card img, .project-pdf-cover-image'
));

galleryRuntimeImages.forEach((image) => {
  image.decoding = 'async';

  if (!image.closest('.project-hero-panel')) {
    image.loading = 'lazy';
  }
});

if (realSizeGalleryRoots.length) {
  const syncAllRealSizeGalleries = () => {
    realSizeGalleryRoots.forEach(syncRealSizeGallery);
  };
  const debouncedSyncAllRealSizeGalleries = debounce(syncAllRealSizeGalleries, 120);
  const galleryResizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(() => debouncedSyncAllRealSizeGalleries())
    : null;

  if (galleryResizeObserver) {
    realSizeGalleryRoots.forEach((grid) => galleryResizeObserver.observe(grid));
  } else {
    window.addEventListener('resize', debouncedSyncAllRealSizeGalleries);
  }

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

const lightboxCards = Array.from(document.querySelectorAll('.project-gallery-card, .project-gallery-board-card'))
  .filter((card) => card.querySelector('img'));

if (lightboxCards.length) {
  setupProjectImageLightbox(lightboxCards);
}

function setupProjectImageLightbox(cards) {
  const lightbox = document.createElement('div');
  lightbox.className = 'project-image-lightbox';
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="project-image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Expanded project image">
      <button class="project-image-lightbox-close" type="button" aria-label="Close expanded image">&times;</button>
      <figure class="project-image-lightbox-figure">
        <img class="project-image-lightbox-image" alt="">
        <figcaption class="project-image-lightbox-caption"></figcaption>
      </figure>
    </div>
  `;

  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('.project-image-lightbox-image');
  const lightboxCaption = lightbox.querySelector('.project-image-lightbox-caption');
  const closeButton = lightbox.querySelector('.project-image-lightbox-close');
  const lightboxFigure = lightbox.querySelector('.project-image-lightbox-figure');
  let activeCard = null;
  let currentZoom = 1;
  const minZoom = 1;
  const maxZoom = 12;
  const zoomStep = 0.8;

  const updateLightboxImageSize = () => {
    if (!lightboxImage.naturalWidth || !lightboxImage.naturalHeight) {
      return;
    }

    const figureStyles = window.getComputedStyle(lightboxFigure);
    const horizontalPadding = parseFloat(figureStyles.paddingLeft || '0') + parseFloat(figureStyles.paddingRight || '0');
    const availableWidth = Math.max(lightboxFigure.clientWidth - horizontalPadding, 240);
    const availableHeight = Math.max(window.innerHeight - 220, 260);
    const fitScale = Math.min(
      1,
      availableWidth / lightboxImage.naturalWidth,
      availableHeight / lightboxImage.naturalHeight
    );
    const baseWidth = Math.max(Math.round(lightboxImage.naturalWidth * fitScale), 220);

    lightboxImage.style.width = `${Math.round(baseWidth * currentZoom)}px`;
    lightboxImage.style.maxWidth = 'none';
    lightboxImage.style.maxHeight = 'none';
    lightboxImage.style.cursor = currentZoom > 1 ? 'zoom-out' : 'zoom-in';
  };

  const setZoom = (nextZoom) => {
    const clampedZoom = Math.min(Math.max(nextZoom, minZoom), maxZoom);

    if (clampedZoom === currentZoom) {
      return;
    }

    currentZoom = clampedZoom;
    updateLightboxImageSize();
  };

  const closeLightbox = () => {
    if (lightbox.hidden) {
      return;
    }

    lightbox.hidden = true;
    document.body.classList.remove('has-project-lightbox');
    lightboxImage.removeAttribute('src');
    lightboxImage.style.width = '';
    lightboxImage.style.maxWidth = '';
    lightboxImage.style.maxHeight = '';
    lightboxFigure.scrollTop = 0;
    lightboxFigure.scrollLeft = 0;
    currentZoom = 1;

    if (activeCard) {
      activeCard.focus();
      activeCard = null;
    }
  };

  const openLightbox = (card) => {
    const image = card.querySelector('img');

    if (!image) {
      return;
    }

    activeCard = card;
    currentZoom = 1;
    lightboxImage.decoding = 'async';
    lightboxImage.src = image.dataset.fullsizeSrc || image.currentSrc || image.src;
    lightboxImage.alt = image.alt || '';
    lightboxCaption.textContent = image.alt || 'Project image';
    lightbox.hidden = false;
    document.body.classList.add('has-project-lightbox');
    lightboxFigure.scrollTop = 0;
    lightboxFigure.scrollLeft = 0;
    closeButton.focus();

    if (lightboxImage.complete) {
      updateLightboxImageSize();
    } else {
      lightboxImage.addEventListener('load', updateLightboxImageSize, { once: true });
    }
  };

  cards.forEach((card, index) => {
    const image = card.querySelector('img');
    const altText = image?.alt?.trim() || `Project image ${index + 1}`;

    card.classList.add('is-zoomable');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', `Open ${altText} in full size`);

    card.addEventListener('click', () => openLightbox(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(card);
      }
    });
  });

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  closeButton.addEventListener('click', closeLightbox);

  lightboxImage.addEventListener('click', () => {
    if (currentZoom > 1) {
      setZoom(1);
      return;
    }

    setZoom(3);
  });

  lightboxFigure.addEventListener('wheel', (event) => {
    if (lightbox.hidden) {
      return;
    }

    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    event.preventDefault();
    const direction = event.deltaY < 0 ? zoomStep : -zoomStep;
    setZoom(currentZoom + direction);
  }, { passive: false });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
      return;
    }

    if (lightbox.hidden) {
      return;
    }

    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      setZoom(currentZoom + zoomStep);
      return;
    }

    if (event.key === '-') {
      event.preventDefault();
      setZoom(currentZoom - zoomStep);
      return;
    }

    if (event.key === '0') {
      event.preventDefault();
      setZoom(1);
    }
  });

  window.addEventListener('resize', () => {
    if (!lightbox.hidden) {
      updateLightboxImageSize();
    }
  });
}
