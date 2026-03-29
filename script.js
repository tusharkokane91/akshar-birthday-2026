/* ===== COUNTDOWN TIMER ===== */
function initCountdown() {
  const partyDate = new Date('2026-03-30T18:30:00');

  function update() {
    const now = new Date();
    const diff = partyDate - now;

    if (diff <= 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ===== SCROLL ANIMATIONS ===== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');

  // Fallback: if IntersectionObserver isn't supported or fails, show everything
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100;
          entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
  );

  elements.forEach((el) => observer.observe(el));

  // Safety net: make everything visible after 3 seconds regardless
  setTimeout(() => {
    elements.forEach((el) => el.classList.add('visible'));
  }, 3000);
}

/* ===== GALLERY LIGHTBOX ===== */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  const images = Array.from(document.querySelectorAll('.photo-frame img'));
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = images[index].src;
    lightboxImg.alt = images[index].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
      lightboxImg.style.opacity = '1';
    }, 200);
  }

  images.forEach((img, i) => {
    img.closest('.photo-frame').addEventListener('click', () => openLightbox(i));
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

/* ===== RSVP CONFIG ===== */
// To set up Google Sheets tracking:
// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste the code from google-apps-script.js in this project
// 4. Deploy as Web App (Execute as: Me, Access: Anyone)
// 5. Copy the deployment URL and paste it below
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbw2CBYyzMlsaFAhPrQQdai75i8SbhO9U3cPu-BjsozyB_8mOj4-pAsy2ygIeAgFg_hv/exec';

/* ===== DYNAMIC KID NAME FIELDS ===== */
function initKidNames() {
  const kidsSelect = document.getElementById('kids-count');
  const container = document.getElementById('kid-names-container');

  kidsSelect.addEventListener('change', () => {
    const count = parseInt(kidsSelect.value) || 0;
    // 4+ means 4 fields (they can add more names in the message)
    const numFields = Math.min(count || 0, 4);

    container.innerHTML = '';
    for (let i = 1; i <= numFields; i++) {
      const div = document.createElement('div');
      div.classList.add('form-group');
      div.innerHTML = `
        <label for="kid-name-${i}">Child ${numFields > 1 ? i : ''} Name</label>
        <input type="text" id="kid-name-${i}" name="kidName${i}" placeholder="Child's name" required>
      `;
      container.appendChild(div);
    }
  });
}

/* ===== RSVP FORM ===== */
function initRSVP() {
  const form = document.getElementById('rsvp-form');
  const success = document.getElementById('rsvp-success');
  const submitBtn = form.querySelector('.rsvp-button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const raw = Object.fromEntries(formData);

    // Collect all kid names into a single comma-separated string
    const kidNames = [];
    for (let i = 1; i <= 4; i++) {
      if (raw[`kidName${i}`]) kidNames.push(raw[`kidName${i}`]);
      delete raw[`kidName${i}`];
    }

    const data = {
      ...raw,
      kidNames: kidNames.join(', '),
      timestamp: new Date().toISOString(),
    };

    // Disable button while submitting
    submitBtn.disabled = true;
    submitBtn.querySelector('.button-text').textContent = 'Sending...';

    // Always save locally as backup
    const rsvps = JSON.parse(localStorage.getItem('akshar-birthday-rsvps') || '[]');
    rsvps.push(data);
    localStorage.setItem('akshar-birthday-rsvps', JSON.stringify(rsvps));

    // Send to Google Sheets if configured
    if (GOOGLE_SHEET_URL) {
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (err) {
        // Silently fail — data is saved locally as backup
        console.warn('Could not reach Google Sheets, saved locally:', err);
      }
    }

    // Show success
    form.style.display = 'none';
    success.style.display = 'block';
    launchConfetti();
  });
}

/* ===== CONFETTI ===== */
function launchConfetti() {
  const colors = ['#e23636', '#1565c0', '#ffd54f', '#ffffff', '#0a1628'];
  const container = document.body;

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -10px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      z-index: 9999;
      pointer-events: none;
      animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards;
    `;
    container.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }

  // Add confetti animation if not exists
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(0) rotate(0deg) scale(1);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(${Math.random() * 720}deg) scale(0.5);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ===== FLOATING PARTICLES ===== */
function initParticles() {
  const container = document.getElementById('particles');
  const particleCount = window.innerWidth < 768 ? 15 : 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particle.style.width = `${Math.random() * 4 + 2}px`;
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

/* ===== WEB CANVAS ===== */
function initWebCanvas() {
  const canvas = document.getElementById('web-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(226, 54, 54, 0.5)';
    ctx.lineWidth = 0.5;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.max(canvas.width, canvas.height);

    // Radial lines
    for (let angle = 0; angle < 360; angle += 15) {
      const rad = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(rad) * maxRadius,
        centerY + Math.sin(rad) * maxRadius
      );
      ctx.stroke();
    }

    // Concentric arcs
    for (let r = 40; r < maxRadius; r += 40) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  resize();
  window.addEventListener('resize', resize);
}

/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ===== PARALLAX on hero ===== */
function initParallax() {
  const hero = document.querySelector('.hero-content');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${scrolled * 0.3}px)`;
      hero.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
    }
  });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initScrollAnimations();
  initLightbox();
  initKidNames();
  initRSVP();
  initParticles();
  initWebCanvas();
  initSmoothScroll();
  initParallax();
});
