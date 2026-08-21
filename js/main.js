const GLOWS = ['#c6ff3d', '#9d5cff', '#ff6b3d', '#ff3d8a', '#3d9dff', '#3dffd3'];
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage = document.getElementById('stage');
const spiralScene = document.getElementById('spiralScene');
const listView = document.getElementById('listView');
const listStack = document.getElementById('listStack');
const detailOverlay = document.getElementById('detailOverlay');
const detailCard = document.getElementById('detailCard');
const drawer = document.getElementById('drawer');
const drawerMask = document.getElementById('drawerMask');
const drawerDot = document.getElementById('drawerDot');
const aboutOverlay = document.getElementById('aboutOverlay');
const contactOverlay = document.getElementById('contactOverlay');
const showcaseView = document.getElementById('showcaseView');
const introOverlay = document.getElementById('introOverlay');
const introPage = document.getElementById('introPage');
const showcaseCarousel = document.getElementById('showcaseCarousel');
const showcaseInfo = document.getElementById('showcaseInfo');
const showcaseDetails = document.getElementById('showcaseDetails');
const showcaseCarouselSection = document.getElementById('showcaseCarouselSection');
let infoOpen = false;
let showcaseOpen = false;
let showcaseActive = 0;
let scCards = [];
let scFloatTime = 0;
let introOpen = false;
let introIndex = 0;

const SPIRAL = { radius: 350, heightStep: 58, rotSpeed: .0008, vertSpeed: .6, vertAmp: 18, phaseOffset: .5, minScale: .6, maxScale: 1.22, dimRange: .4 };
const SPIRAL_TOTAL = 11;
const SPIRAL_DISPLAY = Array.from({ length: SPIRAL_TOTAL }, (_, i) => i % WORKS.length);
let spiralTime = 0;
let viewMode = 'spiral';
let currentDetail = 0;
let wheelVelocity = 0;
let detailOpen = false;
let cardElements = [];

const escapeHTML = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const mod = (value, length) => (value % length + length) % length;

function mediaMarkup(work, className = '') {
  return work.image
    ? `<img src="${work.image}" alt="${escapeHTML(work.title)}" loading="lazy" />`
    : `<div class="work-fallback ${className}">${escapeHTML(work.title)}</div>`;
}

function renderCards() {
  spiralScene.innerHTML = SPIRAL_DISPLAY.map((workIndex, index) => {
    const work = WORKS[workIndex];
    return `
    <article class="work-card entered" data-index="${index}" data-work="${workIndex}" style="--glow:${GLOWS[index % GLOWS.length]}">
      <div class="card-inner"><div class="card-float"><div class="card-media">${mediaMarkup(work)}</div></div><div class="card-label">${escapeHTML(work.title)}</div></div>
    </article>`;
  }).join('');
  cardElements = Array.from(spiralScene.querySelectorAll('.work-card'));
  cardElements.forEach((card, index) => {
    card._angle = (index / SPIRAL_TOTAL) * Math.PI * 2;
    card._baseHeight = (index - (SPIRAL_TOTAL - 1) / 2) * SPIRAL.heightStep;
    card.addEventListener('mouseenter', () => dimOthers(card, true));
    card.addEventListener('mouseleave', () => dimOthers(card, false));
    card.addEventListener('click', () => openIntro(Number(card.dataset.work)));
  });
}

function dimOthers(active, dim) {
  cardElements.forEach(card => {
    const isDimmed = dim && card !== active;
    card.classList.toggle('dimmed', isDimmed);
    if (isDimmed) card.style.setProperty('--card-filter', 'none');
    card._lastBlur = null;
  });
}

function animateSpiral() {
  if (viewMode === 'spiral' && !detailOpen && !showcaseOpen) {
    if (!REDUCED) { spiralTime += SPIRAL.rotSpeed + wheelVelocity; wheelVelocity *= .92; }
    for (let i = 0; i < cardElements.length; i++) {
      const card = cardElements[i];
      const angle = card._angle + spiralTime;
      const x = Math.cos(angle) * SPIRAL.radius;
      const z = Math.sin(angle) * SPIRAL.radius;
      const y = card._baseHeight + Math.sin(spiralTime * SPIRAL.vertSpeed + i * SPIRAL.phaseOffset) * SPIRAL.vertAmp;
      const depth = (z + SPIRAL.radius) / (2 * SPIRAL.radius);
      const dist = 1 - depth;
      const scale = SPIRAL.minScale + depth * (SPIRAL.maxScale - SPIRAL.minScale);
      card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${(-angle * 180 / Math.PI).toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      const zi = Math.round(z * 10 + 5000);
      if (card._lastZ !== zi) { card._lastZ = zi; card.style.zIndex = String(zi); }
      if (!card.classList.contains('dimmed')) {
        const blurLevel = dist < .12 ? 0 : Math.min(5, Math.max(1, Math.floor(dist * 7)));
        if (card._lastBlur !== blurLevel) {
          card._lastBlur = blurLevel;
          if (blurLevel === 0) {
            card.style.setProperty('--card-filter', 'none');
          } else {
            const brightness = SPIRAL.dimRange + depth * (1 - SPIRAL.dimRange);
            card.style.setProperty('--card-filter', `blur(${(blurLevel * 1.2).toFixed(1)}px) brightness(${brightness.toFixed(3)})`);
          }
        }
      }
    }
  }
  requestAnimationFrame(animateSpiral);
}

/* ============================================================
   list 视图：纯标题排列 + 悬停封面预览 + 点击进介绍页
   ============================================================ */
const awPreview = document.getElementById('awPreview');
const awPreviewInner = document.getElementById('awPreviewInner');
let awpRAF = 0;
let awpTX = 0, awpTY = 0, awpX = 0, awpY = 0;
const AWP_W = 300, AWP_H = 169;

function awpLoop() {
  awpX += (awpTX - awpX) * .14;
  awpY += (awpTY - awpY) * .14;
  const tilt = Math.max(-6, Math.min(6, (awpTX - awpX) * .045));
  awPreview.style.transform = `translate3d(${awpX.toFixed(1)}px, ${awpY.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
  awpRAF = requestAnimationFrame(awpLoop);
}

function showAwPreview(work, cx, cy) {
  awPreviewInner.innerHTML = work.image
    ? `<img src="${work.image}" alt="${escapeHTML(work.title)}" />`
    : `<div class="awp-fallback">${escapeHTML(work.title)}</div>`;
  awpTX = Math.min(window.innerWidth - AWP_W - 24, cx + 36);
  awpTY = Math.min(window.innerHeight - AWP_H - 24, Math.max(80, cy - AWP_H / 2));
  if (!awpRAF) {
    if (REDUCED) { awpX = awpTX; awpY = awpTY; }
    else { awpX = awpTX - 30; awpY = awpTY; }
    awpLoop();
  }
  awPreview.classList.add('show');
}

function hideAwPreview() {
  awPreview.classList.remove('show');
  if (awpRAF) { cancelAnimationFrame(awpRAF); awpRAF = 0; }
}

function renderAllWorks() {
  listStack.innerHTML = WORKS.map((work, index) => `
    <button class="aw-row" data-index="${index}">
      <span class="aw-num">${String(index + 1).padStart(2, '0')}</span>
      <span class="aw-titles">
        <span class="aw-title-en">${escapeHTML(work.enTitle || work.title)}</span>
        <span class="aw-title-zh">${escapeHTML(work.zhTitle || '')}</span>
      </span>
      <span class="aw-cat">${escapeHTML(work.category)}<i>${escapeHTML(work.year || '')}</i></span>
    </button>`).join('');
  listStack.querySelectorAll('.aw-row').forEach(row => {
    const index = Number(row.dataset.index);
    row.addEventListener('mouseenter', event => showAwPreview(WORKS[index], event.clientX, event.clientY));
    row.addEventListener('mousemove', event => {
      awpTX = Math.min(window.innerWidth - AWP_W - 24, event.clientX + 36);
      awpTY = Math.min(window.innerHeight - AWP_H - 24, Math.max(80, event.clientY - AWP_H / 2));
    });
    row.addEventListener('mouseleave', hideAwPreview);
    row.addEventListener('click', () => { hideAwPreview(); openIntro(index); });
  });
}

function switchView(view) {
  viewMode = view;
  closeShowcase();
  if (view !== 'list') hideAwPreview();
  document.body.classList.toggle('all-works-mode', view === 'list');
  spiralScene.classList.toggle('hidden', view === 'list');
  listView.classList.toggle('active', view === 'list');
  document.querySelectorAll('.vs-btn').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  const viewSwitch = document.getElementById('viewSwitch');
  if (viewSwitch) viewSwitch.classList.toggle('list-on', view === 'list');
  if (view === 'list') renderAllWorks();
}

/* ============================================================
   intro 视图：作品介绍页（封面 + 一句话简介 + 查看详情入口）
   ============================================================ */
function renderIntro() {
  const work = WORKS[introIndex];
  const coverHTML = work.image
    ? `<img src="${work.image}" alt="${escapeHTML(work.title)}" />`
    : `<div class="intro-placeholder">${escapeHTML(work.title)}</div>`;
  introPage.innerHTML = `
    <div class="intro-meta reveal-item" style="--d:0ms">
      <span class="intro-num">${String(introIndex + 1).padStart(2, '0')} / ${String(WORKS.length).padStart(2, '0')}</span>
      <span>${escapeHTML(work.category)}</span>
      <span>${escapeHTML(work.year || '')}</span>
    </div>
    <h1 class="intro-title reveal-item" style="--d:90ms">${escapeHTML(work.title)}</h1>
    <div class="intro-cover-wrap reveal-item" style="--d:180ms">
      <div class="intro-cover" id="introCover">${coverHTML}<div class="intro-cover-glow"></div></div>
    </div>
    <p class="intro-short reveal-item" style="--d:270ms">${escapeHTML(work.short || work.desc.slice(0, 40))}</p>
    <button class="intro-cta reveal-item" style="--d:360ms" id="introViewBtn">查看作品详情 <i>→</i></button>`;
  document.getElementById('introViewBtn').addEventListener('click', () => openDetail(introIndex));
}

function openIntro(index) {
  introIndex = mod(index, WORKS.length);
  introOpen = true;
  document.body.classList.add('intro-mode');
  renderIntro();
  introOverlay.classList.add('open');
  introOverlay.setAttribute('aria-hidden', 'false');
}

function closeIntro() {
  introOpen = false;
  document.body.classList.remove('intro-mode');
  introOverlay.classList.remove('open');
  introOverlay.setAttribute('aria-hidden', 'true');
}

function introNavigate(direction) {
  introIndex = mod(introIndex + direction, WORKS.length);
  renderIntro();
}

/* ============================================================
   lightbox：图片放大查看（图集 + 轮播中心卡）
   ============================================================ */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbTitle = document.getElementById('lbTitle');
const lbCounter = document.getElementById('lbCounter');
let lbList = [];
let lbIndex = 0;
let lbOpen = false;
let lbDcWasPaused = false;

function renderLightbox() {
  const src = lbList[lbIndex];
  if (!src) return;
  lbImg.style.opacity = '0';
  requestAnimationFrame(() => { lbImg.src = src; lbImg.style.opacity = '1'; });
  lbCounter.textContent = `${lbIndex + 1} / ${lbList.length}`;
  const preload = [lbIndex + 1, lbIndex - 1];
  preload.forEach(i => { const s = lbList[mod(i, lbList.length)]; if (s) { const im = new Image(); im.src = s; } });
}

function openLightbox(list, index, title) {
  if (!Array.isArray(list) || !list.length) return;
  lbList = list;
  lbIndex = mod(index, list.length);
  lbOpen = true;
  lbDcWasPaused = dcPaused;
  dcPaused = true;
  lbTitle.textContent = title || '';
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  lbOpen = false;
  dcPaused = lbDcWasPaused;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
}

function lbNavigate(direction) {
  if (!lbList.length) return;
  lbIndex = mod(lbIndex + direction, lbList.length);
  renderLightbox();
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => lbNavigate(-1));
document.getElementById('lbNext').addEventListener('click', () => lbNavigate(1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

/* ============================================================
   作品全览页：顶部自动循环轮播 + 下方完整内容
   轮播与进度条由同一个 rAF 时钟驱动（直接写样式，
   不依赖 CSS animation 的启动时机，兼容各种渲染环境）
   ============================================================ */
const DC_ARC = { angleStep: 22, radius: 680, maxVisible: 3, autoMs: 1700, graceMs: 450 };
let dcSlides = [];
let dcActive = 0;
let dcPaused = false;
let dcLoopRAF = 0;
let dcElapsed = 0;
let dcLastTs = 0;
let revealObserver = null;

function buildDetailCarousel(work) {
  dcSlides = Array.isArray(work.images) ? work.images.filter(Boolean) : [];
  if (!dcSlides.length && work.image) dcSlides = [work.image];
  dcActive = 0;
  if (!dcSlides.length) {
    return `<div class="dc-carousel dc-single"><div class="dc-card active"><div class="dc-card-inner"><div class="dc-fallback">${escapeHTML(work.title)}</div></div></div></div>`;
  }
  if (dcSlides.length === 1) {
    return `<div class="dc-carousel dc-single"><div class="dc-card active"><div class="dc-card-inner"><img src="${dcSlides[0]}" alt="${escapeHTML(work.title)}" /></div></div></div>`;
  }
  const cards = dcSlides.map((src, i) => `<div class="dc-card" data-i="${i}" style="--i:${i}; opacity:0; transform: translate3d(0, 60px, -520px) scale(.4);"><div class="dc-card-inner"><img src="${src}" alt="${escapeHTML(work.title)} ${i + 1}" loading="lazy" /></div></div>`).join('');
  const dots = dcSlides.map((_, i) => `<button class="dc-dot" data-i="${i}" aria-label="第 ${i + 1} 张"></button>`).join('');
  return `
    <div class="dc-wrap" id="dcWrap">
      <div class="dc-carousel" id="dcCarousel">${cards}</div>
      <button class="dc-nav dc-prev" id="dcPrev" aria-label="上一张">‹</button>
      <button class="dc-nav dc-next" id="dcNext" aria-label="下一张">›</button>
    </div>
    <div class="dc-bottom">
      <div class="dc-dots" id="dcDots">${dots}</div>
      <div class="dc-progress"><i id="dcProgressBar"></i></div>
    </div>`;
}

function updateDetailCarousel() {
  const carousel = document.getElementById('dcCarousel');
  if (!carousel || dcSlides.length < 2) return;
  const total = dcSlides.length;
  carousel.querySelectorAll('.dc-card').forEach(card => {
    const i = Number(card.dataset.i);
    let offset = i - dcActive;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    const abs = Math.abs(offset);
    if (abs > DC_ARC.maxVisible) {
      card.style.opacity = '0';
      card.style.transform = 'translate3d(0, 0, -720px) scale(.3)';
      card.style.filter = 'blur(14px)';
      card.style.pointerEvents = 'none';
      card.classList.remove('active');
      return;
    }
    const angle = offset * DC_ARC.angleStep;
    const rad = angle * Math.PI / 180;
    const x = Math.sin(rad) * DC_ARC.radius;
    const z = (Math.cos(rad) - 1) * DC_ARC.radius;
    const isCenter = abs === 0;
    const scale = isCenter ? 1.1 : Math.max(.5, .8 - abs * .12);
    const opacity = isCenter ? 1 : Math.max(.18, .82 - abs * .2);
    const blur = isCenter ? 0 : Math.min(6, abs * 2.4);
    const brightness = isCenter ? 1 : Math.max(.4, .9 - abs * .16);
    card.style.opacity = String(opacity);
    card.style.transform = `translate3d(${x}px, ${isCenter ? -16 : 0}px, ${z}px) rotateY(${-angle * .5}deg) scale(${scale})`;
    card.style.filter = blur ? `blur(${blur}px) brightness(${brightness})` : 'none';
    card.style.pointerEvents = 'auto';
    card.style.zIndex = String(500 - abs * 50);
    card.classList.toggle('active', isCenter);
  });
  const dots = document.getElementById('dcDots');
  if (dots) dots.querySelectorAll('.dc-dot').forEach((dot, i) => dot.classList.toggle('active', i === dcActive));
}

function dcSetBar(ratio) {
  const bar = document.getElementById('dcProgressBar');
  if (bar) bar.style.width = `${(Math.max(0, Math.min(1, ratio)) * 100).toFixed(2)}%`;
}

function dcLoop(ts) {
  if (!detailOpen || dcSlides.length < 2) { dcLoopRAF = 0; return; }
  if (!dcPaused) {
    if (dcLastTs) dcElapsed += ts - dcLastTs;
    dcSetBar(dcElapsed / DC_ARC.autoMs);
    if (dcElapsed >= DC_ARC.autoMs) {
      dcElapsed = 0;
      dcActive = mod(dcActive + 1, dcSlides.length);
      updateDetailCarousel();
      dcSetBar(0);
    }
  }
  dcLastTs = ts;
  dcLoopRAF = requestAnimationFrame(dcLoop);
}

function startDcLoop() {
  if (dcLoopRAF) cancelAnimationFrame(dcLoopRAF);
  dcLastTs = 0;
  dcElapsed = -DC_ARC.graceMs;
  dcSetBar(0);
  dcLoopRAF = requestAnimationFrame(dcLoop);
}

function dcResetClock() {
  dcElapsed = 0;
  dcSetBar(0);
}

function dcNavigate(direction) {
  if (dcSlides.length < 2) return;
  dcActive = mod(dcActive + direction, dcSlides.length);
  updateDetailCarousel();
  dcResetClock();
}

function bindDetailCarousel() {
  const wrap = document.getElementById('dcWrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => { dcPaused = true; });
    wrap.addEventListener('mouseleave', () => { dcPaused = false; });
    document.getElementById('dcPrev').addEventListener('click', () => dcNavigate(-1));
    document.getElementById('dcNext').addEventListener('click', () => dcNavigate(1));
    document.getElementById('dcCarousel').addEventListener('click', event => {
      const card = event.target.closest('.dc-card');
      if (!card) return;
      const i = Number(card.dataset.i);
      if (i !== dcActive) { dcActive = i; updateDetailCarousel(); dcResetClock(); }
      else openLightbox(dcSlides, dcActive, WORKS[currentDetail].title);
    });
  }
  const singleCard = detailCard.querySelector('.dc-single .dc-card');
  if (singleCard) singleCard.addEventListener('click', () => openLightbox(dcSlides, dcActive, WORKS[currentDetail].title));
  const dots = document.getElementById('dcDots');
  if (dots) dots.querySelectorAll('.dc-dot').forEach(dot => dot.addEventListener('click', () => {
    if (dcSlides.length < 2) return;
    dcActive = Number(dot.dataset.i);
    updateDetailCarousel();
    dcResetClock();
  }));
}

function tweenReveal(el) {
  const delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
  const start = performance.now() + delay;
  const dur = 700;
  function step(now) {
    const t = Math.min(1, Math.max(0, (now - start) / dur));
    const eased = 1 - Math.pow(1 - t, 3);
    el.style.opacity = eased.toFixed(3);
    el.style.transform = t >= 1 ? 'none' : `translateY(${((1 - eased) * 30).toFixed(1)}px)`;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initDetailReveal() {
  const items = detailCard.querySelectorAll('.dp-reveal');
  if (!('IntersectionObserver' in window) || REDUCED) {
    items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      tweenReveal(entry.target);
    });
  }, { root: detailOverlay, threshold: .06 });
  items.forEach(el => revealObserver.observe(el));
}

function openDetail(index) {
  currentDetail = index;
  if (introOpen) introIndex = index;
  dcPaused = false;
  detailOpen = true;
  document.body.classList.add('detail-mode');
  detailOverlay.scrollTop = 0;
  const work = WORKS[index];
  const images = Array.isArray(work.images) ? work.images.filter(Boolean) : [];
  const galleryHTML = images.length
    ? `<div class="dp-gallery">${images.map((src, i) => `<div class="dp-gallery-item dp-reveal" style="--d:${(i % 4) * 70}ms"><img src="${src}" alt="${escapeHTML(work.title)}" loading="lazy" /></div>`).join('')}</div>`
    : `<div class="dp-gallery-empty dp-reveal">完整项目图集整理中 · Full gallery coming soon</div>`;
  detailCard.innerHTML = `
    <div class="dp-hero dp-enter" style="--d:0ms">
      <div class="dp-hero-meta">
        <span class="dp-num">${String(index + 1).padStart(2, '0')} / ${String(WORKS.length).padStart(2, '0')}</span>
        <span>${escapeHTML(work.category)}</span>
        <span>${escapeHTML(work.year || '')}</span>
      </div>
      <h1 class="dp-title">${escapeHTML(work.title)}</h1>
    </div>
    <div class="dc-section dp-enter" style="--d:120ms">
      <div class="dp-section-label">作品轮播 · Showcase</div>
      ${buildDetailCarousel(work)}
    </div>
    <div class="dp-section dp-reveal">
      <div class="dp-section-label">项目简介 · Overview</div>
      <p class="dp-desc">${escapeHTML(work.desc)}</p>
    </div>
    <div class="dp-section dp-reveal">
      <div class="dp-section-label">项目图集 · Gallery</div>
      ${galleryHTML}
    </div>
    <div class="dp-section dp-reveal">
      <div class="dp-section-label">项目信息 · Info</div>
      <div class="dp-info-grid">
        <div class="dp-info-item"><span>分类</span><strong>${escapeHTML(work.category)}</strong></div>
        <div class="dp-info-item"><span>年份</span><strong>${escapeHTML(work.year || '—')}</strong></div>
        <div class="dp-info-item"><span>类型</span><strong>${work.type === 'video' ? '视频' : '图片'}</strong></div>
        <div class="dp-info-item"><span>编号</span><strong>${String(index + 1).padStart(2, '0')}</strong></div>
      </div>
    </div>
    <div class="dp-actions dp-reveal">
      <button class="dp-btn dp-btn-next" id="detailNextWork">下一个作品 ↓</button>
      <button class="dp-btn dp-btn-all" id="detailAllWorks">查看全部作品</button>
    </div>`;
  detailOverlay.classList.add('open');
  detailOverlay.setAttribute('aria-hidden', 'false');
  bindDetailCarousel();
  requestAnimationFrame(() => requestAnimationFrame(updateDetailCarousel));
  setTimeout(updateDetailCarousel, 80);
  startDcLoop();
  initDetailReveal();
  if (images.length) detailCard.querySelectorAll('.dp-gallery-item').forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(images, i, work.title));
  });
  document.getElementById('detailNextWork').addEventListener('click', () => openDetail(mod(index + 1, WORKS.length)));
  document.getElementById('detailAllWorks').addEventListener('click', () => { closeDetail(); closeIntro(); openShowcase(index); });
}

function closeDetail() {
  detailOpen = false;
  cancelAnimationFrame(dcLoopRAF);
  dcLoopRAF = 0;
  if (revealObserver) { revealObserver.disconnect(); revealObserver = null; }
  document.body.classList.remove('detail-mode');
  detailOverlay.classList.remove('open');
  detailOverlay.setAttribute('aria-hidden', 'true');
}

function showInfoPanel(panel) {
  infoOpen = true;
  const overlay = panel === 'about' ? aboutOverlay : contactOverlay;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeInfoPanels() {
  infoOpen = false;
  aboutOverlay.classList.remove('open');
  contactOverlay.classList.remove('open');
  aboutOverlay.setAttribute('aria-hidden', 'true');
  contactOverlay.setAttribute('aria-hidden', 'true');
}

/* ============================================================
   showcase 视图：弧形轮播 + 下滑详情
   ============================================================ */
const SC_ARC = { angleStep: 30, radius: 480, maxVisible: 4, floatAmp: 8, floatSpeed: .0012 };
let showcaseEntranceTimer = null;

function renderShowcase() {
  showcaseCarousel.innerHTML = WORKS.map((work, index) => {
    const glow = GLOWS[index % GLOWS.length];
    const media = work.image
      ? `<img src="${work.image}" alt="${escapeHTML(work.title)}" loading="lazy" />`
      : `<div class="sc-fallback">${escapeHTML(work.title)}</div>`;
    return `<div class="sc-card" data-index="${index}" style="--card-glow:${glow}"><div class="sc-card-inner"><div class="sc-glow"></div>${media}</div></div>`;
  }).join('');
  scCards = Array.from(showcaseCarousel.querySelectorAll('.sc-card'));
  scCards.forEach((card, index) => {
    card._inner = card.querySelector('.sc-card-inner');
    card.style.transform = 'translate3d(0, 90px, -640px) scale(.3)';
    card.style.opacity = '0';
    card.style.transitionDelay = `${index * 70}ms`;
    card.addEventListener('click', () => {
      if (index !== showcaseActive) {
        clearShowcaseEntrance();
        showcaseActive = index;
        updateShowcaseCarousel();
      } else {
        openIntro(index);
      }
    });
  });

  showcaseDetails.innerHTML = `<div class="showcase-details-inner">
    <div class="sd-header"><span>portfolio</span><h2>ALL WORKS</h2></div>
    ${WORKS.map((work, index) => {
      const media = work.image
        ? `<img src="${work.image}" alt="${escapeHTML(work.title)}" loading="lazy" />`
        : `<div class="sd-fallback">${escapeHTML(work.title)}</div>`;
      const hasGallery = Array.isArray(work.images) && work.images.length;
      return `<div class="sd-item" id="sd-item-${index}">
        <div class="sd-item-media">${media}</div>
        <div class="sd-item-body">
          <div class="sd-item-num">${String(index + 1).padStart(2, '0')} / ${String(WORKS.length).padStart(2, '0')}</div>
          <div class="sd-item-cat">${escapeHTML(work.category)}</div>
          <h3 class="sd-item-title">${escapeHTML(work.title)}</h3>
          <div class="sd-item-year">${escapeHTML(work.year || '')}</div>
          <p class="sd-item-desc">${escapeHTML(work.desc)}</p>
          <div class="sd-item-tags"><span class="sd-item-tag">${escapeHTML(work.category)}</span><span class="sd-item-tag">${escapeHTML(work.type || 'image')}</span>${work.year ? `<span class="sd-item-tag">${escapeHTML(work.year)}</span>` : ''}</div>
          ${hasGallery ? `<button class="sd-item-btn" data-index="${index}">查看完整内容 →</button>` : ''}
        </div>
      </div>`;
    }).join('')}
  </div>`;
  showcaseDetails.querySelectorAll('.sd-item-btn').forEach(btn => {
    btn.addEventListener('click', () => openIntro(Number(btn.dataset.index)));
  });

  requestAnimationFrame(() => requestAnimationFrame(() => updateShowcaseCarousel()));
  setTimeout(updateShowcaseCarousel, 80);
  clearTimeout(showcaseEntranceTimer);
  showcaseEntranceTimer = setTimeout(clearShowcaseEntrance, 1400);
}

function clearShowcaseEntrance() {
  clearTimeout(showcaseEntranceTimer);
  scCards.forEach(card => { card.style.transitionDelay = ''; });
}

function updateShowcaseCarousel() {
  const total = WORKS.length;
  scCards.forEach((card, index) => {
    let offset = index - showcaseActive;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    const absOffset = Math.abs(offset);
    const isVisible = absOffset <= SC_ARC.maxVisible;
    if (!isVisible) {
      card.style.opacity = '0';
      card.style.transform = 'translate3d(0, 0, -800px) scale(.3)';
      card.style.pointerEvents = 'none';
      card.style.filter = 'blur(20px)';
      card.classList.remove('active');
      return;
    }
    const angle = offset * SC_ARC.angleStep;
    const angleRad = angle * Math.PI / 180;
    const x = Math.sin(angleRad) * SC_ARC.radius;
    const z = (Math.cos(angleRad) - 1) * SC_ARC.radius;
    const scale = Math.max(.35, 1 - absOffset * .22);
    const opacity = Math.max(.15, 1 - absOffset * .28);
    const blur = absOffset === 0 ? 0 : Math.min(8, absOffset * 2.5);
    const brightness = Math.max(.3, 1 - absOffset * .2);
    card.style.opacity = String(opacity);
    card.style.transform = `translate3d(${x}px, 0px, ${z}px) rotateY(${-angle}deg) scale(${scale})`;
    card.style.filter = blur === 0 ? 'none' : `blur(${blur}px) brightness(${brightness})`;
    card.style.pointerEvents = 'auto';
    card.style.zIndex = String(Math.round(1000 - absOffset * 100));
    card.classList.toggle('active', absOffset === 0);
  });

  const work = WORKS[showcaseActive];
  if (work) {
    showcaseInfo.innerHTML = `
      <div class="showcase-info-cat">${escapeHTML(work.category)}</div>
      <div class="showcase-info-title">${escapeHTML(work.title)}</div>
      <div class="showcase-info-meta"><strong>${String(showcaseActive + 1).padStart(2, '0')}</strong> / ${String(WORKS.length).padStart(2, '0')} · ${escapeHTML(work.year || '')}</div>`;
  }
}

function animateShowcaseFloat() {
  if (showcaseOpen && !REDUCED) {
    scFloatTime += SC_ARC.floatSpeed;
    scCards.forEach((card, index) => {
      if (!card._inner) return;
      const floatY = Math.sin(scFloatTime + index * .8) * SC_ARC.floatAmp;
      card._inner.style.transform = `translateY(${floatY.toFixed(2)}px)`;
    });
  }
  requestAnimationFrame(animateShowcaseFloat);
}

function openShowcase(startIndex = 0) {
  showcaseOpen = true;
  showcaseActive = mod(startIndex, WORKS.length);
  document.body.classList.add('showcase-mode');
  showcaseView.classList.add('active');
  showcaseView.scrollTop = 0;
  renderShowcase();
}

function closeShowcase() {
  showcaseOpen = false;
  document.body.classList.remove('showcase-mode');
  showcaseView.classList.remove('active');
}

function showcaseNavigate(direction) {
  clearShowcaseEntrance();
  showcaseActive = mod(showcaseActive + direction, WORKS.length);
  updateShowcaseCarousel();
}

stage.addEventListener('wheel', event => {
  if (viewMode !== 'spiral' || detailOpen || showcaseOpen) return;
  event.preventDefault();
  wheelVelocity += event.deltaY * .0006;
}, { passive: false });

(function parallax() {
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  stage.addEventListener('mousemove', event => {
    const rect = stage.getBoundingClientRect();
    targetX = ((event.clientY - rect.top) / rect.height - .5) * -10;
    targetY = ((event.clientX - rect.left) / rect.width - .5) * 14;
  });
  function loop() {
    const dx = targetX - currentX, dy = targetY - currentY;
    if (Math.abs(dx) > .002 || Math.abs(dy) > .002) {
      currentX += dx * .05;
      currentY += dy * .05;
      if (viewMode === 'spiral' && !detailOpen && !showcaseOpen)
        spiralScene.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

document.querySelectorAll('.vs-btn').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
document.getElementById('allWorksBack').addEventListener('click', () => switchView('spiral'));
document.getElementById('detailClose').addEventListener('click', closeDetail);

document.getElementById('menuBtn').addEventListener('click', () => { drawer.classList.add('open'); drawerMask.classList.add('open'); });
const closeDrawer = () => { drawer.classList.remove('open'); drawerMask.classList.remove('open'); };
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
drawerMask.addEventListener('click', closeDrawer);
document.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('mouseenter', () => { drawerDot.style.transform = `translateY(${link.offsetTop + link.offsetHeight / 2 - 4}px)`; });
  link.addEventListener('click', () => {
    document.querySelectorAll('.drawer-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const target = link.dataset.target;
    closeInfoPanels();
    if (target === 'works') {
      switchView('list');
    } else if (target === 'about' || target === 'contact') {
      switchView('spiral');
      setTimeout(() => showInfoPanel(target), 300);
    }
    closeDrawer();
  });
});
document.getElementById('aboutClose').addEventListener('click', closeInfoPanels);
document.getElementById('contactClose').addEventListener('click', closeInfoPanels);
aboutOverlay.addEventListener('click', event => { if (event.target === aboutOverlay) closeInfoPanels(); });
contactOverlay.addEventListener('click', event => { if (event.target === contactOverlay) closeInfoPanels(); });
document.getElementById('mascot').addEventListener('click', event => { event.preventDefault(); closeInfoPanels(); closeDetail(); closeIntro(); closeShowcase(); switchView('spiral'); });
document.getElementById('audioBtn').addEventListener('click', function () { this.classList.toggle('playing'); });
document.getElementById('introClose').addEventListener('click', closeIntro);
document.getElementById('introPrev').addEventListener('click', () => introNavigate(-1));
document.getElementById('introNext').addEventListener('click', () => introNavigate(1));
introOverlay.addEventListener('mousemove', event => {
  if (!introOpen) return;
  const cover = document.getElementById('introCover');
  if (!cover) return;
  const rect = introOverlay.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width - .5;
  const py = (event.clientY - rect.top) / rect.height - .5;
  cover.style.transform = `rotateY(${(px * 7).toFixed(2)}deg) rotateX(${(-py * 7).toFixed(2)}deg)`;
});
introOverlay.addEventListener('mouseleave', () => {
  const cover = document.getElementById('introCover');
  if (cover) cover.style.transform = '';
});
document.getElementById('listViewAllBtn').addEventListener('click', () => openShowcase(0));
document.getElementById('viewAllEntry').addEventListener('click', () => openShowcase(0));

/* ============================================================
   左下角弧形文字：JS 驱动旋转（悬停时平滑加速至 12 倍）
   ============================================================ */
(function arcSpin() {
  const bottomLeftBox = document.querySelector('.bottom-left');
  const arcTextEl = document.querySelector('.arc-text');
  if (!arcTextEl) return;
  if (REDUCED) return;
  let hovering = false;
  let speed = 9 / 60;   /* 常速 9°/s ≈ 40s 一圈 */
  let angle = 0;
  if (bottomLeftBox) {
    bottomLeftBox.addEventListener('mouseenter', () => { hovering = true; });
    bottomLeftBox.addEventListener('mouseleave', () => { hovering = false; });
  }
  (function loop() {
    const target = hovering ? 108 / 60 : 9 / 60;
    speed += (target - speed) * .07;
    angle = (angle + speed) % 360;
    arcTextEl.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    requestAnimationFrame(loop);
  })();
})();

/* ============================================================
   Contact：小红书 / 微信点击复制到剪贴板
   ============================================================ */
document.querySelectorAll('.ci-copy').forEach(item => {
  item.addEventListener('click', async () => {
    const value = item.dataset.copy || '';
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    const strong = item.querySelector('.ci-body strong');
    if (!strong) return;
    const original = strong.textContent;
    strong.textContent = `${value} · 已复制`;
    item.classList.add('copied');
    setTimeout(() => { strong.textContent = original; item.classList.remove('copied'); }, 1500);
  });
});
document.getElementById('showcaseClose').addEventListener('click', closeShowcase);
document.getElementById('showcasePrev').addEventListener('click', () => showcaseNavigate(-1));
document.getElementById('showcaseNext').addEventListener('click', () => showcaseNavigate(1));
showcaseCarouselSection.addEventListener('wheel', event => {
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    event.preventDefault();
    showcaseNavigate(event.deltaX > 0 ? 1 : -1);
  }
}, { passive: false });
document.addEventListener('keydown', event => {
  if (lbOpen) {
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') lbNavigate(-1);
    if (event.key === 'ArrowRight') lbNavigate(1);
    return;
  }
  if (event.key === 'Escape') {
    if (detailOpen) closeDetail();
    else if (introOpen) closeIntro();
    else if (infoOpen) closeInfoPanels();
    else if (showcaseOpen) closeShowcase();
    else closeDrawer();
    return;
  }
  if (detailOpen) {
    if (event.key === 'ArrowLeft') dcNavigate(-1);
    if (event.key === 'ArrowRight') dcNavigate(1);
  } else if (introOpen) {
    if (event.key === 'ArrowLeft') introNavigate(-1);
    if (event.key === 'ArrowRight') introNavigate(1);
    if (event.key === 'Enter') openDetail(introIndex);
  } else if (showcaseOpen) {
    if (event.key === 'ArrowLeft') showcaseNavigate(-1);
    if (event.key === 'ArrowRight') showcaseNavigate(1);
  }
});

renderCards();
animateSpiral();
animateShowcaseFloat();