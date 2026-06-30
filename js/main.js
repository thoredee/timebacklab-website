// timebacklab — Homepage interactions

document.addEventListener('DOMContentLoaded', function () {
  const nav = document.getElementById('site-nav');
  const navToggle = document.querySelector('.nav-toggle');

  // Mobile menu toggle
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.querySelectorAll('.nav-mobile-panel a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Hide nav on scroll down, show on scroll up
  let lastScrollY = window.scrollY;

  function handleScroll() {
    const currentScrollY = window.scrollY;
    const isScrollingDown = currentScrollY > lastScrollY;
    const scrolled = currentScrollY > 20;

    if (!nav.classList.contains('menu-open')) {
      if (isScrollingDown && currentScrollY > 100) {
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }
    }

    nav.classList.toggle('scrolled', scrolled);
    lastScrollY = currentScrollY;
  }

  if (nav) {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Marquee auto-scroll (Section 01)
  const track = document.querySelector('.marquee-track');
  if (track) {
    const items = track.querySelectorAll('.marquee-item');
    const numUnique = 5;
    const gap = 24;
    const scrollDuration = 800;
    const pauseDuration = 4000;
    let currentIndex = 0;
    let pos = 0;
    let timeoutId;

    function step() {
      const itemHeight = items[0].offsetHeight;
      const itemWithGap = itemHeight + gap;
      currentIndex += 1;
      const targetScroll = currentIndex * itemWithGap;
      const startScroll = pos;
      const startTime = performance.now();

      function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        pos = startScroll + (targetScroll - startScroll) * eased;
        track.style.transform = 'translateY(-' + pos + 'px)';

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          pos = targetScroll;
          timeoutId = setTimeout(function () {
            if (currentIndex >= numUnique) {
              pos = 0;
              track.style.transform = 'translateY(0px)';
              currentIndex = 0;
            }
            step();
          }, pauseDuration);
        }
      }

      requestAnimationFrame(animate);
    }

    track.style.transform = 'translateY(0px)';
    timeoutId = setTimeout(step, pauseDuration);
  }
});
