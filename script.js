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
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzjSO5b4XGLfFubgXyhCfPDdF_gYey8sl4wJqicgkkqv_sl5matFeLrG__Ic2hsZMPlqA/exec';

/* ===== SPIDEY BUTTON ===== */
function initSpideyButton() {
  const button = document.getElementById('spidey-button');
  if (!button) return;

  button.addEventListener('click', () => {
    // Launch confetti
    launchConfetti();

    // Add web-shoot effect
    button.classList.add('web-shoot');
    button.querySelector('.spidey-button-text').textContent = '🎉 Spidey Power Activated!';

    // Create floating emojis
    const emojis = ['🕸️', '🕷️', '⚡', '💥', '✨', '🎉'];
    for (let i = 0; i < 12; i++) {
      const emoji = document.createElement('div');
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.cssText = `
        position: fixed;
        left: ${button.getBoundingClientRect().left + button.offsetWidth / 2}px;
        top: ${button.getBoundingClientRect().top}px;
        font-size: ${Math.random() * 20 + 20}px;
        pointer-events: none;
        z-index: 9999;
        animation: float-emoji 1.5s ease-out forwards;
      `;
      document.body.appendChild(emoji);
      setTimeout(() => emoji.remove(), 1500);
    }

    // Reset after animation
    setTimeout(() => {
      button.classList.remove('web-shoot');
      button.querySelector('.spidey-button-text').textContent = '🕸️ Thwip! Click for Spidey Magic!';
    }, 2000);
  });

  // Add emoji animation style
  if (!document.getElementById('emoji-style')) {
    const style = document.createElement('style');
    style.id = 'emoji-style';
    style.textContent = `
      @keyframes float-emoji {
        0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translateY(-150px) rotate(${Math.random() * 360}deg) scale(0.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ===== RSVP FORM ===== */
function initRSVP() {
  const form = document.getElementById('rsvp-form');
  const success = document.getElementById('rsvp-success');
  const submitBtn = form.querySelector('.rsvp-button');
  const attending = document.getElementById('attending');
  const guestGroup = document.getElementById('guest-count-group');

  // Hide guest count when "Can't make it"
  attending.addEventListener('change', () => {
    guestGroup.style.display = attending.value === 'no' ? 'none' : '';
  });

  // Check if already submitted
  if (localStorage.getItem('akshar-birthday-rsvp-sent')) {
    form.style.display = 'none';
    success.style.display = 'block';
    document.getElementById('success-title').textContent = 'Already RSVP\'d!';
    document.getElementById('success-message').textContent = 'We already have your RSVP. See you at the party!';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const raw = Object.fromEntries(formData);

    const data = {
      name: raw.yourName || '',
      phone: raw.phone || '',
      attending: raw.attending || '',
      guests: raw.attending === 'no' ? '0' : (raw.guestCount || '1'),
      message: raw.message || '',
      timestamp: new Date().toISOString(),
    };

    submitBtn.disabled = true;
    submitBtn.querySelector('.button-text').textContent = 'Sending...';

    // Save locally as backup
    const rsvps = JSON.parse(localStorage.getItem('akshar-birthday-rsvps') || '[]');
    rsvps.push(data);
    localStorage.setItem('akshar-birthday-rsvps', JSON.stringify(rsvps));
    localStorage.setItem('akshar-birthday-rsvp-sent', 'true');

    // Send to Google Sheets
    if (GOOGLE_SHEET_URL) {
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn('Could not reach Google Sheets, saved locally:', err);
      }
    }

    // Dynamic success message
    const successTitle = document.getElementById('success-title');
    const successMsg = document.getElementById('success-message');

    if (raw.attending === 'yes') {
      successTitle.textContent = 'Awesome!';
      successMsg.textContent = 'Can\'t wait to see you! Akshar will be thrilled!';
    } else if (raw.attending === 'maybe') {
      successTitle.textContent = 'Noted!';
      successMsg.textContent = 'Hope you can make it! We\'ll keep a spot for you.';
    } else {
      successTitle.textContent = 'We\'ll miss you!';
      successMsg.textContent = 'Thanks for letting us know. Maybe next time!';
    }

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

/* ===== CLICK WEB ANIMATION ===== */
function initClickWebs() {
  // Don't fire on buttons, links, form elements, or lightbox
  const IGNORE = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];

  document.addEventListener('click', (e) => {
    if (IGNORE.includes(e.target.tagName)) return;
    if (e.target.closest('.rsvp-form, .lightbox, .photo-frame, a, button')) return;
    spawnWeb(e.clientX, e.clientY);
  });

  function spawnWeb(x, y) {
    const canvas = document.createElement('canvas');
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    canvas.style.cssText = `
      position: fixed;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 10;
    const numSpokes = 8 + Math.floor(Math.random() * 5); // 8-12 spokes
    const numRings = 4 + Math.floor(Math.random() * 3);  // 4-6 rings
    const spokeAngles = [];

    for (let i = 0; i < numSpokes; i++) {
      spokeAngles.push((i / numSpokes) * Math.PI * 2 + (Math.random() - 0.5) * 0.3);
    }

    // Pick a random color scheme per web
    const schemes = [
      { stroke: 'rgba(255, 255, 255, 0.7)', glow: 'rgba(226, 54, 54, 0.3)' },
      { stroke: 'rgba(255, 213, 79, 0.7)', glow: 'rgba(255, 213, 79, 0.2)' },
      { stroke: 'rgba(226, 54, 54, 0.6)', glow: 'rgba(226, 54, 54, 0.3)' },
      { stroke: 'rgba(21, 101, 192, 0.6)', glow: 'rgba(21, 101, 192, 0.3)' },
    ];
    const scheme = schemes[Math.floor(Math.random() * schemes.length)];

    let progress = 0;
    const duration = 400; // ms for web to fully draw
    const fadeStart = 1200; // ms before fade begins
    const fadeDuration = 600;
    const startTime = performance.now();

    function drawFrame(now) {
      const elapsed = now - startTime;
      progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      ctx.clearRect(0, 0, size, size);

      // Global fade
      let alpha = 1;
      if (elapsed > fadeStart) {
        alpha = 1 - Math.min((elapsed - fadeStart) / fadeDuration, 1);
      }
      ctx.globalAlpha = alpha;

      // Glow at center
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * eased * 0.5);
      glow.addColorStop(0, scheme.glow);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = scheme.stroke;
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';

      const currentR = maxR * eased;

      // Draw spokes
      spokeAngles.forEach((angle) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(angle) * currentR,
          cy + Math.sin(angle) * currentR
        );
        ctx.stroke();
      });

      // Draw spiral rings
      const ringsDrawn = Math.floor(numRings * eased);
      for (let r = 1; r <= ringsDrawn; r++) {
        const ringR = (r / numRings) * currentR;
        ctx.beginPath();
        for (let i = 0; i <= spokeAngles.length; i++) {
          const angle = spokeAngles[i % spokeAngles.length];
          const nextAngle = spokeAngles[(i + 1) % spokeAngles.length];
          // Slight wobble for organic look
          const wobble = ringR + (Math.sin(i * 3 + r * 2) * 3);
          const px = cx + Math.cos(angle) * wobble;
          const py = cy + Math.sin(angle) * wobble;
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            // Curved segments between spokes
            const cpAngle = (angle + (spokeAngles[(i - 1) % spokeAngles.length] || angle)) / 2;
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Small spider dot at center
      if (eased > 0.2) {
        ctx.globalAlpha = alpha * Math.min((eased - 0.2) / 0.3, 1);
        ctx.fillStyle = scheme.stroke;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Tiny legs
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = scheme.stroke;
        for (let i = 0; i < 8; i++) {
          const legAngle = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(legAngle) * 3, cy + Math.sin(legAngle) * 3);
          const mid = 7;
          const end = 10;
          const bendAngle = legAngle + (i < 4 ? 0.3 : -0.3);
          ctx.quadraticCurveTo(
            cx + Math.cos(bendAngle) * mid,
            cy + Math.sin(bendAngle) * mid,
            cx + Math.cos(legAngle) * end,
            cy + Math.sin(legAngle) * end
          );
          ctx.stroke();
        }
      }

      if (elapsed < fadeStart + fadeDuration) {
        requestAnimationFrame(drawFrame);
      } else {
        canvas.remove();
      }
    }

    requestAnimationFrame(drawFrame);

    // Spawn a "thwip" text occasionally
    if (Math.random() < 0.3) {
      spawnThwip(x, y);
    }
  }

  function spawnThwip(x, y) {
    const words = ['Thwip!', 'Pow!', 'Zap!', 'Web!'];
    const el = document.createElement('div');
    el.textContent = words[Math.floor(Math.random() * words.length)];
    el.style.cssText = `
      position: fixed;
      left: ${x + 20}px;
      top: ${y - 30}px;
      font-family: 'Bangers', cursive;
      font-size: 1.4rem;
      color: #ffd54f;
      text-shadow: 2px 2px 0 rgba(0,0,0,0.3);
      pointer-events: none;
      z-index: 9999;
      animation: thwip-float 1s ease-out forwards;
      transform: rotate(${Math.random() * 20 - 10}deg);
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  // Inject thwip animation
  if (!document.getElementById('thwip-style')) {
    const style = document.createElement('style');
    style.id = 'thwip-style';
    style.textContent = `
      @keyframes thwip-float {
        0% { opacity: 1; transform: translateY(0) scale(0.5); }
        30% { transform: translateY(-10px) scale(1.2); opacity: 1; }
        100% { transform: translateY(-50px) scale(0.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ===== SPIDER-MAN THEME MUSIC ===== */
function initThemeMusic() {
  const audio = new Audio('audio/theme.mp3');
  audio.loop = true;
  let isPlaying = false;

  // Create floating music button
  const btn = document.createElement('button');
  btn.className = 'music-toggle';
  btn.innerHTML = '<span class="music-icon">🎵</span>';
  btn.title = 'Play Spider-Man Theme';
  document.body.appendChild(btn);

  function play() {
    audio.play();
    isPlaying = true;
    btn.classList.add('playing');
    btn.innerHTML = '<span class="music-icon">🔊</span>';
  }

  function stop() {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    btn.classList.remove('playing');
    btn.innerHTML = '<span class="music-icon">🎵</span>';
  }

  btn.addEventListener('click', () => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initScrollAnimations();
  initLightbox();
  initRSVP();
  initParticles();
  initWebCanvas();
  initSmoothScroll();
  initParallax();
  initSpideyButton();
  initClickWebs();
  initThemeMusic();
});
