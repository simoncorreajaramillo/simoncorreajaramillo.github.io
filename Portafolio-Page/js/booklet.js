(() => {
  const booklets = Array.from(document.querySelectorAll('[data-booklet]'));

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

    const setImage = (image, page, fallbackAlt) => {
      if (!page) {
        image.removeAttribute('src');
        image.alt = fallbackAlt;
        image.hidden = true;
        return;
      }

      image.src = page.dataset.src;
      image.alt = page.dataset.alt || fallbackAlt;
      image.hidden = false;
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

      window.setTimeout(() => {
        booklet.dataset.turn = 'idle';
      }, 320);
    };

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
    pages.forEach((page) => {
      const preload = new Image();
      preload.src = page.dataset.src;
    });
    renderSpread();
  });
})();