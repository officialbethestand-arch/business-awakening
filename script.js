// ===== グローバル変数 =====
let selectedPlan = "";
let selectedPrice = "";
let formData = {};

// ===== Stripe Payment Links =====
const STRIPE_LINKS = {
  'Step by Step 1コース': 'https://buy.stripe.com/dRm3cx4we4DX6Exc7k6sw04',
  '段階別受講':           'https://buy.stripe.com/dRm3cx4we4DX6Exc7k6sw04',
  '3段階コース':           'https://buy.stripe.com/6oU14p3sa6M5fb39Zc6sw05',
  '全3段階パック':         'https://buy.stripe.com/6oU14p3sa6M5fb39Zc6sw05',
  'プレミアム':             'https://buy.stripe.com/3cIdRb4we4DX3slb3g6sw06',
  '体験セミナー':           'https://buy.stripe.com/00w5kF0fYfiB5Atefs6sw00'
};

// ===== 日程管理API設定 =====
// Google Apps Script をデプロイしたら、発行されたURLをここに貼る
// 空のままにするとschedule.jsonを使う（フォールバック）
const SCHEDULE_API_URL = 'https://script.google.com/macros/s/AKfycbydojVFCEcS_HRYtPn-ilmpoeHUv3fBJJXery2X_zY1dB_8Y_22N60uUyOsJJILW7g5qw/exec';  // 例: 'https://script.google.com/macros/s/xxxx/exec'

// ===== schedule.json / Apps Script から日程を動的に読み込む =====
let SCHEDULE = null;

async function loadSchedule() {
  // Apps Script URLが設定されていればそちらを優先
  const url = SCHEDULE_API_URL
    ? SCHEDULE_API_URL
    : './schedule.json?v=' + Date.now();
  try {
    const res = await fetch(url);
    SCHEDULE = await res.json();
    applySchedule();
  } catch (e) {
    console.warn('[schedule] 日程データの読み込みに失敗しました。', e);
  }
}

function applySchedule() {
  if (!SCHEDULE) return;

  const taiken = SCHEDULE.taiken_seminar && SCHEDULE.taiken_seminar[0];
  const main   = SCHEDULE.main_course    && SCHEDULE.main_course[0];
  const lineUrl = SCHEDULE.line_url;

  // ── 体験セミナー日程の反映 ──────────────────────────────
  if (taiken) {
    // CTAセクションの日付・時刻
    const ctaDate = document.getElementById('cta-date-long');
    const ctaTime = document.getElementById('cta-time');
    if (ctaDate) ctaDate.textContent = '次回開催：' + taiken.date_long;
    if (ctaTime) ctaTime.textContent = taiken.time;

    // 固定CTAバー（ZONE A）の更新
    ZONES.a.sub     = '次回開催: ' + taiken.date_short;
    ZONES.a.href    = taiken.form_url;
    ZONES.b.href    = taiken.form_url;

    // Exit Popupのフォームリンク
    const popupBtn = document.getElementById('exit-popup-btn');
    if (popupBtn) popupBtn.href = taiken.form_url;

    // hero内の申込ボタン
    const heroFormBtn = document.getElementById('hero-form-btn');
    if (heroFormBtn) heroFormBtn.href = taiken.form_url;

    // heroバッジの日程テキスト
    const heroDateText = document.getElementById('hero-date-text');
    if (heroDateText) heroDateText.textContent = '次回開催: ' + taiken.date_short + ' ' + taiken.time + '　今すぐ申し込む';

    // 固定CTAの現在ゾーンを再適用
    if (currentZone) applyZone(currentZone, true);
  }

  // ── 本講座日程の反映 ──────────────────────────────────
  if (main) {
    const mainDate = document.getElementById('main-course-date');
    if (mainDate) mainDate.textContent = main.date_long;
    ZONES.c.href = main.form_url;
  }

}

// ===== 料金プラン選択 =====
function selectPlan(planName, price) {
  selectedPlan  = planName;
  selectedPrice = price;
  document.getElementById('main-course').scrollIntoView({ behavior: 'smooth' });
  console.log('Selected plan:', planName, price);
}

// ===== Exit Intent Popup =====
let exitPopupShown = false;
document.addEventListener('mouseleave', (e) => {
  if (e.clientY <= 0 && !exitPopupShown) {
    document.getElementById('exit-popup').classList.add('show');
    exitPopupShown = true;
  }
});
function closeExitPopup() {
  document.getElementById('exit-popup').classList.remove('show');
}

// ===== 固定CTAボタン表示制御 + スクロール深度別CTA変化 =====
const floatingCta  = document.getElementById('floating-cta');
const fctaBtn      = document.getElementById('fcta-btn');
const fctaLabel    = document.getElementById('fcta-label');
const fctaSubText  = document.getElementById('fcta-sub-text');

const ZONES = {
  a: {
    bg:      'zone-a',
    label:   '体験セミナー受付中',
    sub:     '次回開催: 日程読み込み中...',
    btnText: 'まず体験セミナーへ（¥2,000）',
    href:    'https://docs.google.com/forms/d/e/1FAIpQLSeyOZymUPss9dDELMvaRgd3dVkD0wESOj8tNZwcoSqpw1XI_A/viewform'
  },
  b: {
    bg:      'zone-b',
    label:   '思考の型を体験してみませんか？',
    sub:     '30時間で仕事が変わる実戦プログラム',
    btnText: '体験セミナーで確かめる',
    href:    'https://docs.google.com/forms/d/e/1FAIpQLSeyOZymUPss9dDELMvaRgd3dVkD0wESOj8tNZwcoSqpw1XI_A/viewform'
  },
  c: {
    bg:      'zone-c',
    label:   '本講座へのお申し込みはこちら',
    sub:     '¥208,000〜（段階別）/ ¥550,000（全3段階）',
    btnText: '本講座に申し込む →',
    href:    'https://docs.google.com/forms/d/e/1FAIpQLSeEXTJ9IoejSezpt6qQaSx9IlQ6wFD_Xp8NwfmFXVs0Afo9RA/viewform'
  }
};

let currentZone = '';
let isVisible   = false;

function applyZone(zoneKey, force = false) {
  if (currentZone === zoneKey && !force) return;
  const z = ZONES[zoneKey];
  floatingCta.classList.remove('zone-a', 'zone-b', 'zone-c');
  floatingCta.classList.add(z.bg);
  fctaLabel.textContent   = z.label;
  fctaSubText.textContent = z.sub;
  fctaBtn.textContent     = z.btnText;
  fctaBtn.href            = z.href;
  currentZone = zoneKey;
}

applyZone('a');

window.addEventListener('scroll', () => {
  const scrollY   = window.scrollY;
  const docH      = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPct = scrollY / docH;

  const heroSection = document.getElementById('hero');
  const heroBottom  = heroSection.offsetTop + heroSection.offsetHeight;
  const pricingEl   = document.getElementById('pricing');
  const pricingTop  = pricingEl ? pricingEl.offsetTop : docH * 0.75;

  if (scrollY > heroBottom && !isVisible) {
    floatingCta.classList.add('visible');
    isVisible = true;
  } else if (scrollY <= heroBottom && isVisible) {
    floatingCta.classList.remove('visible');
    isVisible = false;
  }

  if (scrollY >= pricingTop - 100) {
    applyZone('c');
  } else if (scrollPct >= 0.35) {
    applyZone('b');
  } else {
    applyZone('a');
  }
});

// ===== フォーム自動保存通知 =====
function showFormSaveNotification() {
  const notification = document.getElementById('form-save-notification');
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 3000);
}

// ===== ページ読み込み時の初期化 =====
document.addEventListener('DOMContentLoaded', () => {
  // schedule.json 読み込み（日程・LINE URL の動的反映）
  loadSchedule();

  // Scroll Reveal Animation
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.05 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) other.classList.remove('active');
      });
      item.classList.toggle('active');
    });
  });

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // LocalStorage フォームデータ復元
  const savedData = localStorage.getItem('formData');
  if (savedData) {
    try { formData = JSON.parse(savedData); } catch (_) {}
  }
});

// ===== フォーム入力時の自動保存 =====
document.addEventListener('input', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    formData[e.target.name] = e.target.value;
    localStorage.setItem('formData', JSON.stringify(formData));
  }
});
