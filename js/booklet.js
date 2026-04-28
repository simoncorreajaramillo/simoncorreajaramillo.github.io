(() => {
  const booklets = Array.from(document.querySelectorAll('[data-booklet]'));
  const requestIdleTask = typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback.bind(window)
    : (callback) => window.setTimeout(callback, 120);

  if (!booklets.length) {
    return;
  }

  const bookletLightbox = createBookletLightbox();

  booklets.forEach((booklet) => {
    const pages = Array.from(booklet.querySelectorAll('[data-booklet-page]'));
    const leftImage = booklet.querySelector('[data-booklet-left]');
    const rightImage = booklet.querySelector('[data-booklet-right]');
    const counter = booklet.querySelector('[data-booklet-count]');
    const prev = booklet.querySelector('[data-booklet-prev]');
    const next = booklet.querySelector('[data-booklet-next]');

    if (!pages.length || !leftImage || !rightImage || !counter || !prev || !next) {
      return;
    }

    let spreadIndex = 0;
    const totalSpreads = Math.ceil(pages.length / 2);
    const preloadedSources = new Set();

    const preloadPage = (page) => {
      const source = page?.dataset.src;

      if (!source || preloadedSources.has(source)) {
        return;
      }

      preloadedSources.add(source);
      requestIdleTask(() => {
        const preload = new Image();
        preload.decoding = 'async';
        preload.src = source;
      });
    };

    const preloadNearbySpreads = () => {
      const firstPageIndex = spreadIndex * 2;
      const nearbyPages = [
        pages[firstPageIndex],
        pages[firstPageIndex + 1],
        pages[firstPageIndex + 2],
        pages[firstPageIndex + 3],
        pages[firstPageIndex - 1],
        pages[firstPageIndex - 2]
      ];

      nearbyPages.forEach(preloadPage);
    };

    const registerZoomTrigger = (image, fallbackAlt) => {
      const openImage = () => {
        const source = image.currentSrc || image.src;

        if (!source || image.hidden) {
          return;
        }

        bookletLightbox.open({
          src: source,
          alt: image.alt || fallbackAlt,
          trigger: image
        });
      };

      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-haspopup', 'dialog');
      image.addEventListener('click', openImage);
      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openImage();
        }
      });
    };

    const setImage = (image, page, fallbackAlt) => {
      if (!page) {
        image.removeAttribute('src');
        image.alt = fallbackAlt;
        image.hidden = true;
        image.removeAttribute('aria-label');
        return;
      }

      image.decoding = 'async';
      image.loading = 'eager';
      image.src = page.dataset.src;
      image.alt = page.dataset.alt || fallbackAlt;
      image.hidden = false;
      image.setAttribute('aria-label', `Open ${image.alt} in full size`);
    };

    const renderSpread = (direction = 0) => {
      const firstPageIndex = spreadIndex * 2;
      const leftPage = pages[firstPageIndex];
      const rightPage = pages[firstPageIndex + 1];
      const firstVisiblePage = firstPageIndex + 1;
      const lastVisiblePage = Math.min(firstPageIndex + 2, pages.length);

      booklet.dataset.turn = direction > 0 ? 'next' : direction < 0 ? 'prev' : 'idle';
      setImage(leftImage, leftPage, 'Left page');
      setImage(rightImage, rightPage, 'Right page');
      counter.textContent = firstVisiblePage === lastVisiblePage
        ? `Page ${firstVisiblePage} / ${pages.length}`
        : `Pages ${firstVisiblePage}-${lastVisiblePage} / ${pages.length}`;
      prev.disabled = spreadIndex === 0;
      next.disabled = spreadIndex === totalSpreads - 1;
      preloadNearbySpreads();

      window.setTimeout(() => {
        booklet.dataset.turn = 'idle';
      }, 320);
    };

    registerZoomTrigger(leftImage, 'Left page');
    registerZoomTrigger(rightImage, 'Right page');

    prev.addEventListener('click', () => {
      if (spreadIndex > 0) {
        spreadIndex -= 1;
        renderSpread(-1);
      }
    });

    next.addEventListener('click', () => {
      if (spreadIndex < totalSpreads - 1) {
        spreadIndex += 1;
        renderSpread(1);
      }
    });

    booklet.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        prev.click();
      }

      if (event.key === 'ArrowRight') {
        next.click();
      }
    });

    booklet.tabIndex = 0;
    renderSpread();
  });

  function createBookletLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'project-image-lightbox';
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <div class="project-image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Expanded booklet page">
        <button class="project-image-lightbox-close" type="button" aria-label="Close expanded page">&times;</button>
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
    let activeTrigger = null;
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
      lightboxCaption.textContent = '';
      lightboxFigure.scrollTop = 0;
      lightboxFigure.scrollLeft = 0;
      currentZoom = 1;

      if (activeTrigger) {
        activeTrigger.focus();
        activeTrigger = null;
      }
    };

    const openLightbox = ({ src, alt, trigger }) => {
      if (!src) {
        return;
      }

      activeTrigger = trigger || null;
      currentZoom = 1;
      lightboxImage.decoding = 'async';
      lightboxImage.src = src;
      lightboxImage.alt = alt || '';
      lightboxCaption.textContent = alt || 'Expanded booklet page';
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

    return {
      open: openLightbox
    };
  }
})();
