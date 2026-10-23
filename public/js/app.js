/* =========================================================
   WikiLupe · Interacciones del cliente
   ========================================================= */

(function () {
  'use strict';

  // --- Menú responsive -------------------------------------------------
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    siteNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', (event) => {
      if (!siteNav.classList.contains('open')) return;
      if (siteNav.contains(event.target) || navToggle.contains(event.target)) return;
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && siteNav.classList.contains('open')) {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // --- Cerrar avisos ---------------------------------------------------
  document.querySelectorAll('.alert-close').forEach((button) => {
    button.addEventListener('click', () => {
      const alert = button.closest('.alert');
      if (alert) alert.remove();
    });
  });

  // --- Confirmaciones --------------------------------------------------
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const message = form.getAttribute('data-confirm') || '¿Seguro que quieres continuar?';
      if (!window.confirm(message)) {
        event.preventDefault();
      }
    });
  });

  // --- Apodos por cada foto nueva --------------------------------------
  const photoInput = document.getElementById('photoInput');
  const nicknameContainer = document.getElementById('photoNicknames');
  const characterForm = document.getElementById('characterForm');

  if (photoInput && nicknameContainer && characterForm) {
    const fieldName = characterForm.getAttribute('data-nickname-field') || 'photo_nicknames';

    photoInput.addEventListener('change', () => {
      nicknameContainer.innerHTML = '';

      let files = Array.from(photoInput.files || []);

      if (files.length > 12) {
        window.alert('Puedes subir hasta 12 fotos por personaje.');
        photoInput.value = '';
        files = [];
      }

      files.forEach((file, index) => {
        const wrapper = document.createElement('label');
        wrapper.className = 'photo-nickname';

        const preview = document.createElement('span');
        preview.className = 'photo-nickname-preview';

        try {
          const image = document.createElement('img');
          image.src = URL.createObjectURL(file);
          image.alt = '';
          image.onload = () => URL.revokeObjectURL(image.src);
          preview.appendChild(image);
        } catch (error) {
          // Si el navegador no permite previsualizar, igual mostramos el nombre.
        }

        const fileName = document.createElement('span');
        fileName.textContent = `Foto ${index + 1}: ${file.name}`;
        preview.appendChild(fileName);

        const text = document.createElement('span');
        text.textContent = 'Apodo de esta foto (ej: nombre de la ropa)';

        const input = document.createElement('input');
        input.type = 'text';
        input.name = fieldName;
        input.maxLength = 60;
        input.placeholder = 'Ej: Outfit de invierno';

        wrapper.appendChild(preview);
        wrapper.appendChild(text);
        wrapper.appendChild(input);
        nicknameContainer.appendChild(wrapper);
      });
    });
  }

  // --- Galería de la ficha ---------------------------------------------
  const galleryImage = document.getElementById('galleryImage');
  const galleryCaption = document.getElementById('galleryCaption');
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');

  galleryThumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      if (!galleryImage) return;

      const source = thumb.getAttribute('data-src');
      const caption = thumb.getAttribute('data-caption') || 'Sin apodo';

      if (source) {
        galleryImage.src = source;
        galleryImage.alt = caption;
      }

      if (galleryCaption) {
        galleryCaption.textContent = caption;
      }

      galleryThumbs.forEach((item) => item.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // --- Filtro del selector de relaciones -------------------------------
  const relationSearch = document.getElementById('relationSearch');
  const relationSelect = document.getElementById('relatedCharacterSelect');

  if (relationSearch && relationSelect) {
    const options = Array.from(relationSelect.options).map((option) => ({
      option,
      value: option.value,
      text: option.textContent.toLowerCase()
    }));

    relationSearch.addEventListener('input', () => {
      const term = relationSearch.value.trim().toLowerCase();

      options.forEach(({ option, value, text }) => {
        if (!value) {
          option.hidden = false;
          return;
        }
        option.hidden = Boolean(term) && !text.includes(term);
      });

      const selected = relationSelect.options[relationSelect.selectedIndex];
      if (selected && selected.hidden) {
        relationSelect.value = '';
      }
    });
  }

  // --- Vista previa del fondo del personaje ----------------------------
  const bgAutoInput = document.getElementById('bgAutoInput');
  const bgColorInput = document.getElementById('bgColorInput');
  const elementInput = document.getElementById('elementInput');
  const themePreview = document.getElementById('themePreview');
  const themePreviewEmoji = document.getElementById('themePreviewEmoji');
  const themePreviewParticles = document.getElementById('themePreviewParticles');
  const themesScript = document.getElementById('elementThemes');

  let elementThemes = {};
  if (themesScript) {
    try {
      elementThemes = JSON.parse(themesScript.textContent || '{}');
    } catch (error) {
      elementThemes = {};
    }
  }

  const fallbackTheme = { emoji: '✨', colors: ['#ece6ff', '#d9d0f7', '#f9f6ff'] };

  function themeFor(value) {
    const key = String(value || '').trim().toLowerCase();
    return elementThemes[key] || fallbackTheme;
  }

  function paintPreviewParticles(emoji) {
    if (!themePreviewParticles) return;

    themePreviewParticles.innerHTML = '';
    const count = 9;

    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement('span');
      particle.className = 'theme-preview-particle';
      particle.textContent = emoji;
      particle.style.left = `${Math.random() * 92}%`;
      particle.style.top = `${35 + Math.random() * 65}%`;
      particle.style.fontSize = `${10 + Math.random() * 12}px`;
      particle.style.animationDelay = `${-Math.random() * 9}s`;
      particle.style.animationDuration = `${6 + Math.random() * 6}s`;
      themePreviewParticles.appendChild(particle);
    }
  }

  function updateThemePreview() {
    if (!themePreview) return;

    const auto = Boolean(bgAutoInput && bgAutoInput.checked);
    const theme = themeFor(elementInput ? elementInput.value : '');
    const color = auto
      ? theme.colors[0]
      : (bgColorInput && bgColorInput.value) || theme.colors[0];

    themePreview.style.setProperty('--preview-color', color);
    if (themePreviewEmoji) themePreviewEmoji.textContent = theme.emoji;
    if (auto && bgColorInput) bgColorInput.value = theme.colors[0];

    paintPreviewParticles(theme.emoji);
  }

  if (themePreview) {
    if (bgAutoInput) bgAutoInput.addEventListener('change', updateThemePreview);

    if (bgColorInput) {
      bgColorInput.addEventListener('input', () => {
        if (bgAutoInput) bgAutoInput.checked = false;
        updateThemePreview();
      });
    }

    if (elementInput) elementInput.addEventListener('input', updateThemePreview);

    document.querySelectorAll('.color-swatch').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        const color = swatch.getAttribute('data-color');
        if (!color) return;

        if (bgAutoInput) bgAutoInput.checked = false;
        if (bgColorInput) bgColorInput.value = color;
        updateThemePreview();
      });
    });

    updateThemePreview();
  }

  // --- Índice rápido y secciones plegables del formulario --------------
  document.querySelectorAll('.form-quick-index a').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      if (target.tagName === 'DETAILS') {
        target.open = true;
      }
    });
  });

  // --- Splash art animado de la ficha ----------------------------------
  const scene = document.getElementById('characterScene');
  const sceneParticles = document.getElementById('sceneParticles');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (scene && sceneParticles && !reducedMotion) {
    const emoji = scene.getAttribute('data-emoji') || '✨';
    const count = window.innerWidth < 720 ? 12 : 26;

    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement('span');
      particle.className = 'scene-particle';
      particle.textContent = emoji;
      particle.setAttribute('aria-hidden', 'true');
      particle.style.left = `${-10 + Math.random() * 75}%`;
      particle.style.top = `${25 + Math.random() * 85}%`;
      particle.style.fontSize = `${12 + Math.random() * 24}px`;
      particle.style.animationDuration = `${16 + Math.random() * 18}s`;
      particle.style.animationDelay = `${-Math.random() * 34}s`;
      particle.style.setProperty('--particle-rotate', `${Math.random() * 240 - 120}deg`);
      particle.style.setProperty('--particle-opacity', (0.16 + Math.random() * 0.32).toFixed(2));
      sceneParticles.appendChild(particle);
    }
  }
})();
