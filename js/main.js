// Guarda la referencia de la pantalla de entrada para cubrir el primer instante de la home. | EN: Store the entry screen reference so it can cover the first instant of the home page.
const entryScreen = document.querySelector('[data-entry-screen]');
// Solo activa la portada de entrada si realmente existe en la pagina. | EN: Only activate the entry cover if it actually exists on the page.
if (entryScreen) {
  // Reusa la referencia al body para bloquear y liberar el scroll durante la entrada. | EN: Reuse the body reference to lock and release scrolling during entry.
  const pageBody = document.body;
  // Respeta la preferencia de menos movimiento para reducir el tiempo visible. | EN: Respect the reduced-motion preference to shorten the visible time.
  const prefersReducedEntryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Controla el tiempo automatico de salida y evita cerrar dos veces. | EN: Control the automatic exit timing and avoid closing twice.
  const entryExitDelay = prefersReducedEntryMotion.matches ? 1200 : 3600;
  const entryExitDuration = prefersReducedEntryMotion.matches ? 0 : 850;
  let isEntryClosed = false;
  let entryExitTimerId = 0;

  // Agrupa el cierre visual y la liberacion del scroll en una sola rutina. | EN: Group the visual close and scroll release into a single routine.
  const closeEntryScreen = () => {
    // Sale si la portada ya esta cerrada para no repetir clases ni timers. | EN: Exit if the cover is already closed so classes and timers are not repeated.
    if (isEntryClosed) {
      return;
    }

    isEntryClosed = true;
    window.clearTimeout(entryExitTimerId);
    pageBody.classList.remove('is-intro-active');
    entryScreen.classList.add('is-exiting');

    window.setTimeout(() => {
      entryScreen.classList.add('is-hidden');
      window.removeEventListener('keydown', handleEntryScreenKeydown);
    }, entryExitDuration);
  };

  // Permite saltar la pantalla de entrada con teclado sin depender del mouse. | EN: Let the entry screen be skipped with the keyboard without depending on the mouse.
  const handleEntryScreenKeydown = (event) => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      closeEntryScreen();
    }
  };

  entryExitTimerId = window.setTimeout(closeEntryScreen, entryExitDelay);
  entryScreen.addEventListener('click', closeEntryScreen, { once: true });
  window.addEventListener('keydown', handleEntryScreenKeydown);
}

// Guarda una referencia al boton hamburguesa del menu responsive. | EN: Stores a reference to the hamburger button of the responsive menu.
const navToggle = document.querySelector('.nav-toggle');
// Guarda una referencia a la lista del menu que se abre y se cierra. | EN: Stores a reference to the menu list that opens and closes.
const navMenu = document.querySelector('.nav-menu');
// Define el mismo breakpoint que usa el CSS para separar desktop de tablet/mobile. | EN: Defines the same breakpoint used by the CSS to separate desktop from tablet and mobile.
const navBreakpoint = 1024;

// Solo ejecuta la logica si el boton y el menu existen en la pagina. | EN: Only runs the logic if the button and menu exist on the page.
if (navToggle && navMenu) {
  // Reune en una sola funcion todo lo necesario para cerrar el menu. | EN: Gathers everything needed to close the menu into a single function.
  const closeMenu = () => {
    // Quita la clase que deja visible el panel del menu. | EN: Removes the class that makes the menu panel visible.
    navMenu.classList.remove('is-open');
    // Quita la clase que transforma la hamburguesa en una X. | EN: Removes the class that turns the hamburger into an X.
    navToggle.classList.remove('is-active');
    // Actualiza el estado accesible para lectores de pantalla. | EN: Updates the accessible state for screen readers.
    navToggle.setAttribute('aria-expanded', 'false');
    // Devuelve la etiqueta accesible al estado de menu cerrado. | EN: Restores the accessible label to the closed menu state.
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  // Escucha el click del boton hamburguesa. | EN: Listens for clicks on the hamburger button.
  navToggle.addEventListener('click', () => {
    // Si ya estamos en desktop, no deja abierto el modo de menu responsive. | EN: If we are already on desktop, it does not keep the responsive menu mode open.
    if (window.innerWidth > navBreakpoint) {
      // Cierra el menu para mantener el estado limpio al volver a desktop. | EN: Closes the menu to keep the state clean when returning to desktop.
      closeMenu();
      // Sale de la funcion para no seguir alternando clases innecesariamente. | EN: Exits the function so it does not keep toggling classes unnecessarily.
      return;
    }

    // Alterna la clase del menu y guarda si quedo abierto o cerrado. | EN: Toggles the menu class and stores whether it ended up open or closed.
    const isOpen = navMenu.classList.toggle('is-open');
    // Alterna la clase visual del boton segun el estado abierto/cerrado. | EN: Toggles the visual button class based on the open or closed state.
    navToggle.classList.toggle('is-active', isOpen);
    // Escribe en aria-expanded si el menu esta abierto o no. | EN: Writes to aria-expanded whether the menu is open or not.
    navToggle.setAttribute('aria-expanded', String(isOpen));
    // Cambia la etiqueta accesible del boton segun la accion disponible. | EN: Changes the accessible button label depending on the available action.
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // Busca todos los enlaces dentro del menu. | EN: Finds all links inside the menu.
  navMenu.querySelectorAll('a').forEach((link) => {
    // Cierra el menu cuando el usuario toca cualquier enlace. | EN: Closes the menu when the user clicks any link.
    link.addEventListener('click', closeMenu);
  });

  // Escucha cambios de tamano de ventana para limpiar estados al cambiar de breakpoint. | EN: Listens for window size changes to clean states when switching breakpoints.
  window.addEventListener('resize', () => {
    // Si el viewport supera el rango responsive, fuerza el cierre del menu. | EN: If the viewport goes beyond the responsive range, it forces the menu to close.
    if (window.innerWidth > navBreakpoint) {
      // Restablece el estado correcto para desktop. | EN: Restores the correct state for desktop.
      closeMenu();
    }
  });
}

// Guarda referencias del hero para animar el fondo con JavaScript y lanzar el wordmark al cargar. | EN: Store hero references to animate the background with JavaScript and launch the wordmark on load.
const heroSection = document.querySelector('.hero');
const heroWordmark = document.querySelector('.Hero-text');
// Detecta si la persona prefiere menos movimiento para respetar accesibilidad. | EN: Detect whether the person prefers less motion to respect accessibility.
const prefersReducedHeroMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Solo activa la logica si el hero existe en la pagina. | EN: Only activate the logic if the hero exists on the page.
if (heroSection) {
  // Centraliza el estado dinamico del fondo para moverlo con suavidad. | EN: Centralize the dynamic background state so it moves smoothly.
  const heroMotion = {
    pointerTargetX: 0,
    pointerTargetY: 0,
    pointerCurrentX: 0,
    pointerCurrentY: 0,
    scrollTarget: 0,
    scrollCurrent: 0,
    frameId: 0,
    wordmarkAnimated: false
  };

  // Evita que los desplazamientos calculados se salgan del rango visual esperado. | EN: Keep computed offsets within the expected visual range.
  const clampHeroValue = (value, min, max) => Math.min(Math.max(value, min), max);

  // Escribe los desplazamientos calculados en variables CSS para que el hero se mueva. | EN: Write computed offsets into CSS variables so the hero can move.
  const setHeroMotionVariables = (timestamp = 0) => {
    // Crea una oscilacion base continua aunque la persona no toque el mouse. | EN: Create a continuous base oscillation even when the user is not moving the mouse.
    const idleX = Math.sin(timestamp * 0.00038) * 34;
    const idleY = Math.cos(timestamp * 0.00028) * 24;
    // Combina desplazamiento autonomo, puntero y scroll para que el fondo tenga mas profundidad. | EN: Combine autonomous drift, pointer, and scroll so the background has more depth.
    const backgroundX = idleX + (heroMotion.pointerCurrentX * 84) + (heroMotion.scrollCurrent * -24);
    const backgroundY = idleY + (heroMotion.pointerCurrentY * 64) + (heroMotion.scrollCurrent * 48);
    const orbOneX = (idleX * 1.6) + (heroMotion.pointerCurrentX * 128) + (heroMotion.scrollCurrent * -34);
    const orbOneY = (idleY * 1.2) + (heroMotion.pointerCurrentY * 92) + (heroMotion.scrollCurrent * 56);
    const orbTwoX = (idleX * -1.3) + (heroMotion.pointerCurrentX * -110) + (heroMotion.scrollCurrent * 28);
    const orbTwoY = (idleY * -1.4) + (heroMotion.pointerCurrentY * -78) + (heroMotion.scrollCurrent * -44);

    // Publica los desplazamientos en el CSS del hero. | EN: Publish the offsets into the hero CSS.
    heroSection.style.setProperty('--hero-bg-offset-x', `${backgroundX.toFixed(2)}px`);
    heroSection.style.setProperty('--hero-bg-offset-y', `${backgroundY.toFixed(2)}px`);
    heroSection.style.setProperty('--hero-orb-one-x', `${orbOneX.toFixed(2)}px`);
    heroSection.style.setProperty('--hero-orb-one-y', `${orbOneY.toFixed(2)}px`);
    heroSection.style.setProperty('--hero-orb-two-x', `${orbTwoX.toFixed(2)}px`);
    heroSection.style.setProperty('--hero-orb-two-y', `${orbTwoY.toFixed(2)}px`);
  };

  // Calcula cuanto debe influir el scroll actual en el movimiento del hero. | EN: Compute how much the current scroll should influence the hero movement.
  const updateHeroScrollTarget = () => {
    // Toma la posicion actual del hero respecto al viewport. | EN: Take the hero's current position relative to the viewport.
    const heroRect = heroSection.getBoundingClientRect();
    // Convierte esa posicion en un valor corto y estable para usarlo como parallax. | EN: Convert that position into a short stable value to use as parallax.
    const normalizedScroll = clampHeroValue((heroRect.top + (heroRect.height * 0.5)) / Math.max(window.innerHeight, 1), -1.2, 1.2);
    heroMotion.scrollTarget = -normalizedScroll;
  };

  // Hace que el fondo siga suavemente el mouse dentro del hero. | EN: Make the background smoothly follow the mouse inside the hero.
  const updateHeroPointerTarget = (event) => {
    // Usa el rect del hero para traducir el mouse a un rango centrado. | EN: Use the hero rect to translate the mouse into a centered range.
    const heroRect = heroSection.getBoundingClientRect();
    const pointerX = ((event.clientX - heroRect.left) / Math.max(heroRect.width, 1)) - 0.5;
    const pointerY = ((event.clientY - heroRect.top) / Math.max(heroRect.height, 1)) - 0.5;

    heroMotion.pointerTargetX = clampHeroValue(pointerX, -0.5, 0.5);
    heroMotion.pointerTargetY = clampHeroValue(pointerY, -0.5, 0.5);
  };

  // Devuelve el fondo a un estado neutro cuando el mouse sale del hero. | EN: Return the background to a neutral state when the mouse leaves the hero.
  const resetHeroPointerTarget = () => {
    heroMotion.pointerTargetX = 0;
    heroMotion.pointerTargetY = 0;
  };

  // Anima en bucle el hero interpolando los valores para que el movimiento sea fluido. | EN: Animate the hero in a loop by interpolating values so motion stays fluid.
  const animateHeroBackground = (timestamp) => {
    // Acerca gradualmente el estado actual hacia el objetivo del puntero y scroll. | EN: Gradually move the current state toward the pointer and scroll targets.
    heroMotion.pointerCurrentX += (heroMotion.pointerTargetX - heroMotion.pointerCurrentX) * 0.08;
    heroMotion.pointerCurrentY += (heroMotion.pointerTargetY - heroMotion.pointerCurrentY) * 0.08;
    heroMotion.scrollCurrent += (heroMotion.scrollTarget - heroMotion.scrollCurrent) * 0.08;

    // Escribe el frame actual del movimiento en CSS. | EN: Write the current motion frame into CSS.
    setHeroMotionVariables(timestamp);
    // Pide el siguiente frame para mantener el hero vivo continuamente. | EN: Request the next frame to keep the hero alive continuously.
    heroMotion.frameId = window.requestAnimationFrame(animateHeroBackground);
  };

  // Lanza el texto PORTAFOLIO desde fuera de la pantalla solo una vez al cargar. | EN: Launch the PORTFOLIO text from outside the screen only once on load.
  const animateHeroWordmarkEntrance = () => {
    // Sale rapido si no hay wordmark, si ya corrio o si la persona prefiere menos movimiento. | EN: Exit quickly if there is no wordmark, it already ran, or the person prefers less motion.
    if (!heroWordmark || heroMotion.wordmarkAnimated || prefersReducedHeroMotion.matches) {
      return;
    }

    // Marca que la animacion ya quedo disparada para evitar repetirla. | EN: Mark that the animation has already been triggered so it does not repeat.
    heroMotion.wordmarkAnimated = true;
    // Lo prepara fuera de pantalla antes de iniciar la transicion. | EN: Prepare it off-screen before starting the transition.
    heroWordmark.classList.add('is-primed');

    // Espera un par de frames para asegurar que el estado inicial quede aplicado antes de entrar. | EN: Wait a couple of frames to ensure the initial state is applied before entering.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        heroWordmark.classList.add('is-entered');
      });
    });
  };

  // Inicia o limpia las animaciones del hero segun la preferencia de movimiento. | EN: Start or clear the hero animations depending on the motion preference.
  const syncHeroMotionMode = () => {
    // Si la persona prefiere menos movimiento, deja el hero estable y visible. | EN: If the person prefers less motion, leave the hero stable and visible.
    if (prefersReducedHeroMotion.matches) {
      if (heroMotion.frameId) {
        window.cancelAnimationFrame(heroMotion.frameId);
        heroMotion.frameId = 0;
      }

      heroSection.style.setProperty('--hero-bg-offset-x', '0px');
      heroSection.style.setProperty('--hero-bg-offset-y', '0px');
      heroSection.style.setProperty('--hero-orb-one-x', '0px');
      heroSection.style.setProperty('--hero-orb-one-y', '0px');
      heroSection.style.setProperty('--hero-orb-two-x', '0px');
      heroSection.style.setProperty('--hero-orb-two-y', '0px');

      if (heroWordmark) {
        heroWordmark.classList.remove('is-primed', 'is-entered');
      }

      return;
    }

    // Asegura que el texto de PORTAFOLIO entre apenas carga la pagina. | EN: Ensure the PORTFOLIO text enters as soon as the page loads.
    animateHeroWordmarkEntrance();
    // Actualiza el scroll objetivo antes de arrancar el bucle visual. | EN: Update the scroll target before starting the visual loop.
    updateHeroScrollTarget();

    // Evita arrancar mas de un requestAnimationFrame al mismo tiempo. | EN: Prevent more than one requestAnimationFrame loop from running at the same time.
    if (!heroMotion.frameId) {
      heroMotion.frameId = window.requestAnimationFrame(animateHeroBackground);
    }
  };

  // Escucha interacciones del hero para enriquecer el movimiento del fondo. | EN: Listen for hero interactions to enrich the background motion.
  heroSection.addEventListener('pointermove', updateHeroPointerTarget);
  heroSection.addEventListener('pointerleave', resetHeroPointerTarget);
  // Recalcula el efecto del scroll y del resize sobre el hero. | EN: Recalculate the effect of scroll and resize on the hero.
  window.addEventListener('scroll', updateHeroScrollTarget, { passive: true });
  window.addEventListener('resize', updateHeroScrollTarget);
  // Reacciona si la preferencia del sistema cambia en tiempo real. | EN: React if the system preference changes in real time.
  if (typeof prefersReducedHeroMotion.addEventListener === 'function') {
    prefersReducedHeroMotion.addEventListener('change', syncHeroMotionMode);
  } else if (typeof prefersReducedHeroMotion.addListener === 'function') {
    prefersReducedHeroMotion.addListener(syncHeroMotionMode);
  }

  // Arranca la logica del hero con el estado correcto desde el inicio. | EN: Start the hero logic with the correct state from the beginning.
  syncHeroMotionMode();
}

// Guarda una referencia a la foto del bloque About para animar su marco con JavaScript. | EN: Store a reference to the About image so its frame can be animated with JavaScript.
const aboutProfileImage = document.querySelector('.about .hero-profile img');
// Reutiliza la preferencia de menos movimiento para el marco animado. | EN: Reuse the reduced-motion preference for the animated frame.
const prefersReducedProfileMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Solo activa la animacion si la imagen del About existe en la pagina. | EN: Only activate the animation if the About image exists on the page.
if (aboutProfileImage) {
  // Agrupa el estado del marco para poder girarlo de forma continua y controlada. | EN: Group the frame state so it can spin continuously in a controlled way.
  const profileFrameMotion = {
    angle: 0,
    frameId: 0,
    lastTimestamp: 0,
    degreesPerSecond: 65
  };

  // Escribe el angulo actual del marco dentro de la variable CSS que pinta el borde. | EN: Write the current frame angle into the CSS variable that paints the border.
  const setProfileFrameAngle = () => {
    aboutProfileImage.style.setProperty('--profile-frame-angle', `${profileFrameMotion.angle.toFixed(2)}deg`);
  };

  // Gira el borde alrededor del retrato siguiendo su forma redondeada. | EN: Rotate the border around the portrait following its rounded shape.
  const animateProfileFrame = (timestamp) => {
    // Usa el delta entre frames para mantener una velocidad estable en equipos distintos. | EN: Use frame delta to keep a stable speed on different devices.
    const deltaSeconds = profileFrameMotion.lastTimestamp ? (timestamp - profileFrameMotion.lastTimestamp) / 1000 : 0;
    profileFrameMotion.lastTimestamp = timestamp;
    profileFrameMotion.angle = (profileFrameMotion.angle + (profileFrameMotion.degreesPerSecond * deltaSeconds)) % 360;

    setProfileFrameAngle();
    profileFrameMotion.frameId = window.requestAnimationFrame(animateProfileFrame);
  };

  // Inicia o detiene el bucle del marco segun la preferencia de movimiento. | EN: Start or stop the frame loop depending on the motion preference.
  const syncProfileFrameMotion = () => {
    // Si la persona prefiere menos movimiento, deja el borde quieto en un angulo legible. | EN: If the person prefers less motion, leave the border still at a readable angle.
    if (prefersReducedProfileMotion.matches) {
      if (profileFrameMotion.frameId) {
        window.cancelAnimationFrame(profileFrameMotion.frameId);
        profileFrameMotion.frameId = 0;
      }

      profileFrameMotion.lastTimestamp = 0;
      profileFrameMotion.angle = 0;
      setProfileFrameAngle();
      return;
    }

    // Evita iniciar mas de un bucle de animacion al mismo tiempo. | EN: Prevent starting more than one animation loop at the same time.
    if (!profileFrameMotion.frameId) {
      profileFrameMotion.lastTimestamp = 0;
      profileFrameMotion.frameId = window.requestAnimationFrame(animateProfileFrame);
    }
  };

  // Permite pausar el bucle cuando la pestana no esta visible y retomarlo al volver. | EN: Allow pausing the loop when the tab is hidden and resuming it when it returns.
  const handleProfileFrameVisibility = () => {
    if (document.hidden) {
      if (profileFrameMotion.frameId) {
        window.cancelAnimationFrame(profileFrameMotion.frameId);
        profileFrameMotion.frameId = 0;
      }

      profileFrameMotion.lastTimestamp = 0;
      return;
    }

    syncProfileFrameMotion();
  };

  // Reacciona si la preferencia del sistema cambia en tiempo real. | EN: React if the system preference changes in real time.
  if (typeof prefersReducedProfileMotion.addEventListener === 'function') {
    prefersReducedProfileMotion.addEventListener('change', syncProfileFrameMotion);
  } else if (typeof prefersReducedProfileMotion.addListener === 'function') {
    prefersReducedProfileMotion.addListener(syncProfileFrameMotion);
  }

  // Coordina la animacion con la visibilidad de la pestana para ahorrar trabajo innecesario. | EN: Coordinate the animation with tab visibility to avoid unnecessary work.
  document.addEventListener('visibilitychange', handleProfileFrameVisibility);

  // Arranca el marco con el modo correcto desde el primer render. | EN: Start the frame in the correct mode from the first render.
  syncProfileFrameMotion();
}

// Reune los elementos que visualmente funcionan como botones para animar su borde con JavaScript. | EN: Gather the elements that visually behave like buttons to animate their border with JavaScript.
const orbitButtonElements = Array.from(document.querySelectorAll(
  '.nav-toggle, .nav-menu a, .social-links a, .site-btn, .project-link, .contact-socials a, .footer-top-link'
));
// Detecta si la persona prefiere menos movimiento tambien para los botones. | EN: Detect whether the person prefers reduced motion for buttons as well.
const prefersReducedButtonMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Solo activa la logica si hay botones compatibles en la pagina. | EN: Only activate the logic if there are compatible buttons on the page.
if (orbitButtonElements.length) {
  // Lee los colores globales para reutilizarlos cuando un boton entra en estado presionado. | EN: Read the global colors to reuse them when a button enters the pressed state.
  const rootStyles = window.getComputedStyle(document.documentElement);
  const orbitButtonPressBackground = rootStyles.getPropertyValue('--color-frame-highlight').trim() || 'rgb(0, 229, 255)';
  const orbitButtonPressRgb = rootStyles.getPropertyValue('--color-frame-highlight-rgb').trim() || '0, 229, 255';
  const orbitButtonPressForeground = rootStyles.getPropertyValue('--color-bg-main').trim() || 'rgb(5, 5, 5)';
  const orbitButtonPressShadow = `0 0 0 1px rgba(${orbitButtonPressRgb}, 0.28), 0 0 16px rgba(${orbitButtonPressRgb}, 0.32), 0 0 28px rgba(57, 255, 20, 0.18)`;
  const orbitButtonHoverBackground = rootStyles.getPropertyValue('--color-hover-highlight').trim() || 'rgb(59, 255, 248)';
  const orbitButtonHoverRgb = rootStyles.getPropertyValue('--color-hover-highlight-rgb').trim() || '59, 255, 248';
  const orbitButtonHoverForeground = rootStyles.getPropertyValue('--color-bg-main').trim() || 'rgb(5, 5, 5)';
  const orbitButtonHoverShadow = `0 0 0 1px rgba(${orbitButtonHoverRgb}, 0.28), 0 0 18px rgba(${orbitButtonHoverRgb}, 0.34), 0 0 30px rgba(${orbitButtonHoverRgb}, 0.14)`;

  // Prepara una fase distinta para cada boton para que el efecto no quede totalmente sincronizado. | EN: Prepare a different phase for each button so the effect does not feel completely synchronized.
  const orbitButtons = orbitButtonElements.map((element, index) => {
    element.classList.add('orbit-button');

    return {
      element,
      phase: (index * 37) % 360
    };
  });

  // Filtra solo los botones que deben encender un color distinto al entrar. | EN: Filter only the buttons that should light up with a different color on enter.
  const orbitHoverAccentButtons = orbitButtons.filter(({ element }) =>
    element.matches('.hero .site-btn, .social-links a, .project-link')
  );

  // Aplica el color de presion del sistema a un boton mientras se mantiene hundido. | EN: Apply the system press color to a button while it is being held down.
  const applyOrbitButtonPressColor = (element) => {
    element.style.background = orbitButtonPressBackground;
    element.style.color = orbitButtonPressForeground;
    element.style.boxShadow = orbitButtonPressShadow;

    // Asegura contraste en las lineas del boton hamburguesa cuando el fondo cambia. | EN: Ensure contrast on the hamburger button lines when the background changes.
    if (element.classList.contains('nav-toggle')) {
      element.querySelectorAll('span').forEach((line) => {
        line.style.background = orbitButtonPressForeground;
      });
    }
  };

  // Aplica un color de hover diferente para los botones principales que lo necesitan. | EN: Apply a different hover color for the main buttons that need it.
  const applyOrbitButtonHoverColor = (element) => {
    element.style.background = orbitButtonHoverBackground;
    element.style.color = orbitButtonHoverForeground;
    element.style.boxShadow = orbitButtonHoverShadow;

    if (element.classList.contains('nav-toggle')) {
      element.querySelectorAll('span').forEach((line) => {
        line.style.background = orbitButtonHoverForeground;
      });
    }
  };

  // Restablece el aspecto normal del boton al terminar la presion. | EN: Restore the button's normal look when the press ends.
  const resetOrbitButtonPressColor = (element) => {
    element.style.background = '';
    element.style.color = '';
    element.style.boxShadow = '';

    if (element.classList.contains('nav-toggle')) {
      element.querySelectorAll('span').forEach((line) => {
        line.style.background = '';
      });
    }
  };

  // Quita el estado de presion de todos los botones orbitales cuando ya no hace falta. | EN: Remove the pressed state from all orbital buttons when it is no longer needed.
  const clearOrbitButtonPressState = () => {
    orbitButtons.forEach(({ element }) => {
      element.classList.remove('is-pressing');
      resetOrbitButtonPressColor(element);

      if (element.classList.contains('is-hover-lit')) {
        applyOrbitButtonHoverColor(element);
      }
    });
  };

  // Centraliza el estado del aro animado compartido por todos los botones. | EN: Centralize the animated ring state shared by all buttons.
  const orbitButtonMotion = {
    angle: 0,
    frameId: 0,
    lastTimestamp: 0,
    degreesPerSecond: 72
  };

  // Escribe el angulo actual en cada boton conservando su desfase individual. | EN: Write the current angle to each button while keeping its individual offset.
  const setOrbitButtonAngles = () => {
    orbitButtons.forEach(({ element, phase }) => {
      element.style.setProperty('--button-frame-angle', `${(orbitButtonMotion.angle + phase) % 360}deg`);
    });
  };

  // Recorre circularmente el borde de todos los botones usando un unico loop liviano. | EN: Travel the border of all buttons circularly using a single lightweight loop.
  const animateOrbitButtons = (timestamp) => {
    // Usa el tiempo real entre frames para mantener la velocidad estable. | EN: Use the real frame delta to keep the speed stable.
    const deltaSeconds = orbitButtonMotion.lastTimestamp ? (timestamp - orbitButtonMotion.lastTimestamp) / 1000 : 0;
    orbitButtonMotion.lastTimestamp = timestamp;
    orbitButtonMotion.angle = (orbitButtonMotion.angle + (orbitButtonMotion.degreesPerSecond * deltaSeconds)) % 360;

    setOrbitButtonAngles();
    orbitButtonMotion.frameId = window.requestAnimationFrame(animateOrbitButtons);
  };

  // Inicia o detiene la animacion de los botones segun accesibilidad y visibilidad. | EN: Start or stop the button animation depending on accessibility and visibility.
  const syncOrbitButtonMotion = () => {
    // Si la persona prefiere menos movimiento, deja los botones con un aro fijo. | EN: If the person prefers reduced motion, leave the buttons with a static ring.
    if (prefersReducedButtonMotion.matches) {
      if (orbitButtonMotion.frameId) {
        window.cancelAnimationFrame(orbitButtonMotion.frameId);
        orbitButtonMotion.frameId = 0;
      }

      orbitButtonMotion.lastTimestamp = 0;
      orbitButtonMotion.angle = 0;
      setOrbitButtonAngles();
      return;
    }

    // Evita duplicar el loop si ya esta corriendo. | EN: Avoid duplicating the loop if it is already running.
    if (!orbitButtonMotion.frameId) {
      orbitButtonMotion.lastTimestamp = 0;
      orbitButtonMotion.frameId = window.requestAnimationFrame(animateOrbitButtons);
    }
  };

  // Pausa la animacion cuando la pestana no esta visible para ahorrar trabajo. | EN: Pause the animation when the tab is not visible to save work.
  const handleOrbitButtonVisibility = () => {
    if (document.hidden) {
      if (orbitButtonMotion.frameId) {
        window.cancelAnimationFrame(orbitButtonMotion.frameId);
        orbitButtonMotion.frameId = 0;
      }

      orbitButtonMotion.lastTimestamp = 0;
      clearOrbitButtonPressState();
      return;
    }

    syncOrbitButtonMotion();
  };

  // Asocia el estado de presion a mouse, touch y teclado para que el efecto aparezca al hundir cada boton. | EN: Attach the pressed state to mouse, touch, and keyboard so the effect appears when pressing each button.
  orbitButtons.forEach(({ element }) => {
    element.addEventListener('pointerdown', (event) => {
      if (element.matches(':disabled')) {
        return;
      }

      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      element.classList.add('is-pressing');
      applyOrbitButtonPressColor(element);
    });

    element.addEventListener('pointerleave', () => {
      element.classList.remove('is-pressing');
      resetOrbitButtonPressColor(element);
    });

    element.addEventListener('blur', () => {
      element.classList.remove('is-pressing');
      resetOrbitButtonPressColor(element);
    });

    element.addEventListener('keyup', () => {
      element.classList.remove('is-pressing');
      resetOrbitButtonPressColor(element);
    });

    element.addEventListener('keydown', (event) => {
      if (element.matches(':disabled')) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        element.classList.add('is-pressing');
        applyOrbitButtonPressColor(element);
      }
    });
  });

  // Activa un hover luminoso alterno solo en los botones principales solicitados. | EN: Activate an alternate luminous hover only on the requested primary buttons.
  orbitHoverAccentButtons.forEach(({ element }) => {
    element.addEventListener('mouseenter', () => {
      if (element.matches(':disabled')) {
        return;
      }

      element.classList.add('is-hover-lit');
      applyOrbitButtonHoverColor(element);
    });

    element.addEventListener('mouseleave', () => {
      element.classList.remove('is-hover-lit');
      resetOrbitButtonPressColor(element);
    });

    element.addEventListener('focus', () => {
      if (element.matches(':disabled')) {
        return;
      }

      element.classList.add('is-hover-lit');
      applyOrbitButtonHoverColor(element);
    });

    element.addEventListener('blur', () => {
      element.classList.remove('is-hover-lit');
      resetOrbitButtonPressColor(element);
    });
  });

  // Reacciona a cambios de accesibilidad en tiempo real. | EN: React to accessibility changes in real time.
  if (typeof prefersReducedButtonMotion.addEventListener === 'function') {
    prefersReducedButtonMotion.addEventListener('change', syncOrbitButtonMotion);
  } else if (typeof prefersReducedButtonMotion.addListener === 'function') {
    prefersReducedButtonMotion.addListener(syncOrbitButtonMotion);
  }

  // Vincula la animacion a la visibilidad real del documento. | EN: Bind the animation to the real document visibility.
  document.addEventListener('visibilitychange', handleOrbitButtonVisibility);
  // Limpia la presion cuando el puntero o el foco terminan la interaccion. | EN: Clear the pressed state when pointer or focus interactions end.
  document.addEventListener('pointerup', clearOrbitButtonPressState);
  document.addEventListener('pointercancel', clearOrbitButtonPressState);
  window.addEventListener('blur', clearOrbitButtonPressState);

  // Arranca el marco orbital de los botones desde el estado correcto. | EN: Start the orbital button frame from the correct state.
  syncOrbitButtonMotion();
}

// Guarda una referencia al enlace flotante que devuelve la pagina al inicio. | EN: Store a reference to the floating link that takes the page back to the top.
const backToTopLink = document.querySelector('.footer-top-link');

// Solo activa la logica si el enlace existe en la pagina. | EN: Only activate the logic if the link exists on the page.
if (backToTopLink) {
  // Define desde que punto de scroll conviene mostrar el boton flotante. | EN: Define from which scroll point it makes sense to show the floating button.
  const backToTopOffset = 280;

  // Alterna la visibilidad y el foco del boton segun la posicion actual del scroll. | EN: Toggle the button visibility and focusability based on the current scroll position.
  const toggleBackToTopVisibility = () => {
    // Evalua si la persona ya bajo lo suficiente como para necesitar volver arriba. | EN: Check whether the user has scrolled far enough to need going back to the top.
    const shouldShow = window.scrollY > backToTopOffset;
    // Agrega o quita la clase visual del boton flotante. | EN: Add or remove the floating button visual class.
    backToTopLink.classList.toggle('is-visible', shouldShow);
    // Evita que se pueda tabular cuando todavia esta oculto. | EN: Prevent tab navigation to the button while it is still hidden.
    backToTopLink.tabIndex = shouldShow ? 0 : -1;
    // Expone el estado correcto a tecnologias de asistencia. | EN: Expose the correct state to assistive technologies.
    backToTopLink.setAttribute('aria-hidden', String(!shouldShow));
  };

  // Ejecuta una primera evaluacion al cargar la pagina. | EN: Run an initial evaluation when the page loads.
  toggleBackToTopVisibility();

  // Revisa el estado del boton cada vez que cambia el scroll. | EN: Recheck the button state whenever the scroll changes.
  window.addEventListener('scroll', toggleBackToTopVisibility, { passive: true });
}

// Define el endpoint que usara el formulario cuando el servidor este listo. | EN: Defines the endpoint the form will use once the server is ready.
const contactFormEndpoint = '';
// Busca el formulario de contacto dentro de la home. | EN: Finds the contact form inside the home page.
const contactForm = document.querySelector('.contact-form');

// Solo activa la logica si el formulario existe en la pagina. | EN: Only activates the logic if the form exists on the page.
if (contactForm) {
  // Busca el boton submit para poder bloquearlo mientras se envia el mensaje. | EN: Finds the submit button so it can be locked while the message is being sent.
  const contactSubmitButton = contactForm.querySelector('.contact-submit');
  // Reune referencias de los campos principales para validarlos y construir el payload. | EN: Gathers references to the main fields to validate them and build the payload.
  const contactFields = {
    fullName: contactForm.querySelector('[name="full-name"]'),
    email: contactForm.querySelector('[name="email"]'),
    subject: contactForm.querySelector('[name="subject"]'),
    category: contactForm.querySelector('[name="category"]'),
    message: contactForm.querySelector('[name="message"]')
  };

  // Marca como obligatorios los campos realmente importantes del formulario. | EN: Marks the truly important form fields as required.
  ['fullName', 'email', 'subject', 'message'].forEach((fieldName) => {
    // Evita errores si el HTML cambia y algun campo deja de existir. | EN: Avoids errors if the HTML changes and any field stops existing.
    if (contactFields[fieldName]) {
      // Activa la validacion nativa del navegador para ese campo. | EN: Turns on native browser validation for that field.
      contactFields[fieldName].required = true;
    }
  });

  // Crea o reutiliza un bloque de estado para mostrar mensajes del formulario. | EN: Creates or reuses a status block to show form messages.
  const contactStatus = contactForm.querySelector('.contact-form-status') || document.createElement('p');
  // Da una clase fija al mensaje de estado para poder darle estilo desde CSS. | EN: Gives the status message a fixed class so it can be styled from CSS.
  contactStatus.className = 'contact-form-status';
  // Hace que lectores de pantalla anuncien los cambios del mensaje. | EN: Makes screen readers announce status message changes.
  contactStatus.setAttribute('role', 'status');
  // Marca el area como actualizable sin interrumpir de golpe la navegacion. | EN: Marks the area as updatable without abruptly interrupting navigation.
  contactStatus.setAttribute('aria-live', 'polite');

  // Inserta el mensaje debajo del boton si todavia no existe en el DOM. | EN: Inserts the message below the button if it does not yet exist in the DOM.
  if (!contactStatus.parentElement) {
    // Si hay boton submit, coloca el mensaje justo despues de el. | EN: If there is a submit button, place the message right after it.
    if (contactSubmitButton) {
      contactSubmitButton.insertAdjacentElement('afterend', contactStatus);
    } else {
      // Si no hay boton por algun cambio futuro, lo agrega al final del form. | EN: If there is no button due to a future change, append it to the end of the form.
      contactForm.append(contactStatus);
    }
  }

  // Guarda el texto original del boton para restaurarlo despues del envio. | EN: Stores the button's original text so it can be restored after submission.
  const defaultSubmitLabel = contactSubmitButton ? contactSubmitButton.textContent.trim() : 'Send Message';

  // Centraliza el cambio visual del mensaje de estado. | EN: Centralizes visual updates to the status message.
  const setContactStatus = (message, state = 'info') => {
    // Escribe el texto que vera el usuario debajo del formulario. | EN: Writes the text the user will see below the form.
    contactStatus.textContent = message;
    // Guarda el tipo de mensaje para que CSS pinte el estado correcto. | EN: Stores the message type so CSS can paint the correct state.
    contactStatus.dataset.state = state;
  };

  // Cambia el estado del boton mientras se procesa el envio. | EN: Changes the button state while the submission is processed.
  const setContactSubmittingState = (isSubmitting) => {
    // Sale rapido si por algun motivo el boton no existe. | EN: Exit early if for any reason the button does not exist.
    if (!contactSubmitButton) {
      return;
    }

    // Desactiva el boton para evitar dobles envios. | EN: Disable the button to prevent double submissions.
    contactSubmitButton.disabled = isSubmitting;
    // Agrega una clase auxiliar para el estado de carga. | EN: Adds a helper class for the loading state.
    contactSubmitButton.classList.toggle('is-loading', isSubmitting);
    // Cambia el texto del boton segun el estado actual. | EN: Switches the button text based on the current state.
    contactSubmitButton.textContent = isSubmitting ? 'Sending...' : defaultSubmitLabel;
  };

  // Intenta resolver la URL de envio desde el HTML o desde esta constante JS. | EN: Tries to resolve the submission URL from the HTML or from this JS constant.
  const getContactEndpoint = () => {
    // Lee primero un posible data-endpoint que puedas agregar en el futuro al form. | EN: First reads a possible data-endpoint you may add to the form in the future.
    const dataEndpoint = contactForm.dataset.endpoint?.trim();
    // Lee tambien el atributo action por si luego decides usarlo como fuente principal. | EN: Also reads the action attribute in case you later decide to use it as the main source.
    const actionEndpoint = contactForm.getAttribute('action')?.trim();

    // Usa data-endpoint si existe y tiene contenido real. | EN: Use data-endpoint if it exists and has real content.
    if (dataEndpoint) {
      return dataEndpoint;
    }

    // Usa action si ya no apunta al placeholder "#". | EN: Use action if it no longer points to the "#" placeholder.
    if (actionEndpoint && actionEndpoint !== '#') {
      return actionEndpoint;
    }

    // Como respaldo, usa la constante JS editable para el futuro backend. | EN: As a fallback, use the editable JS constant for the future backend.
    return contactFormEndpoint.trim();
  };

  // Escucha el submit del formulario para validarlo y enviarlo via fetch cuando exista servidor. | EN: Listens for the form submit to validate it and send it via fetch once a server exists.
  contactForm.addEventListener('submit', async (event) => {
    // Evita el envio clasico del navegador para manejar todo con JavaScript. | EN: Prevents the browser's classic submission so everything is handled with JavaScript.
    event.preventDefault();

    // Pide al navegador validar los campos requeridos y formatos basicos. | EN: Ask the browser to validate required fields and basic formats.
    if (!contactForm.reportValidity()) {
      // Muestra una guia corta si falta completar algo. | EN: Show a short hint if something is missing.
      setContactStatus('Please complete the required fields before sending the message.', 'error');
      return;
    }

    // Resuelve el endpoint configurado actualmente. | EN: Resolve the endpoint that is currently configured.
    const endpoint = getContactEndpoint();

    // Si aun no existe endpoint, deja el formulario listo pero sin intentar enviarlo. | EN: If there is still no endpoint, keep the form ready but do not try to send it.
    if (!endpoint) {
      setContactStatus('The form is ready. When your server exists, add its endpoint in js/main.js or as data-endpoint on the form.', 'info');
      return;
    }

    // Construye un payload limpio y predecible para cualquier backend futuro. | EN: Build a clean, predictable payload for any future backend.
    const payload = {
      fullName: contactFields.fullName?.value.trim() || '',
      email: contactFields.email?.value.trim() || '',
      subject: contactFields.subject?.value.trim() || '',
      category: contactFields.category?.value.trim() || '',
      message: contactFields.message?.value.trim() || ''
    };

    try {
      // Activa el estado visual de envio mientras espera respuesta del servidor. | EN: Turn on the visual sending state while waiting for a server response.
      setContactSubmittingState(true);
      // Informa al usuario que el mensaje esta saliendo. | EN: Inform the user that the message is being sent.
      setContactStatus('Sending your message...', 'info');

      // Envia el formulario como JSON para que el backend lo procese de forma clara. | EN: Send the form as JSON so the backend can process it clearly.
      const response = await fetch(endpoint, {
        method: (contactForm.getAttribute('method') || 'POST').toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Si el servidor responde con error, lo trata como envio fallido. | EN: If the server responds with an error, treat it as a failed submission.
      if (!response.ok) {
        throw new Error('Contact request failed');
      }

      // Limpia el formulario despues de un envio correcto. | EN: Clear the form after a successful submission.
      contactForm.reset();
      // Confirma al usuario que el mensaje ya fue enviado. | EN: Confirm to the user that the message has been sent.
      setContactStatus('Message sent successfully. I will get back to you soon.', 'success');
    } catch (error) {
      // Muestra un mensaje claro si el endpoint aun no responde como se espera. | EN: Show a clear message if the endpoint does not yet respond as expected.
      setContactStatus('The message could not be sent. Check your future backend endpoint and try again.', 'error');
    } finally {
      // Devuelve el boton a su estado normal termine bien o mal el intento. | EN: Return the button to its normal state whether the attempt succeeds or fails.
      setContactSubmittingState(false);
    }
  });
}
