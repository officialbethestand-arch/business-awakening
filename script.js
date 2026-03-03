// ===== グローバル変数 =====
    let selectedPlan = "";
    let selectedPrice = "";
    let formData = {};

    // ===== Stripe Payment Links（実際のURLに置き換えてください）=====
    const STRIPE_LINKS = {
      'Step by Step 1コース': 'https://buy.stripe.com/dRm3cx4we4DX6Exc7k6sw04',
      '段階別受講':       'https://buy.stripe.com/dRm3cx4we4DX6Exc7k6sw04',
      '3段階コース':       'https://buy.stripe.com/6oU14p3sa6M5fb39Zc6sw05',
      '全3段階パック':   'https://buy.stripe.com/6oU14p3sa6M5fb39Zc6sw05',
      'プレミアム':         'https://buy.stripe.com/3cIdRb4we4DX3slb3g6sw06',
      '体験セミナー':     'https://buy.stripe.com/00w5kF0fYfiB5Atefs6sw00'
    };

    // ===== 料金プラン選択 =====
    function selectPlan(planName, price) {
      selectedPlan = planName;
      selectedPrice = price;
      
      // 本講座申込セクションにスクロール
      document.getElementById('main-course').scrollIntoView({ behavior: 'smooth' });
      
      // フォームにプラン名を事前入力（GoogleフォームのURLパラメータで実装可能）
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
    const floatingCta   = document.getElementById('floating-cta');
    const fctaBtn       = document.getElementById('fcta-btn');
    const fctaLabel     = document.getElementById('fcta-label');
    const fctaSubText   = document.getElementById('fcta-sub-text');

    // ゾーン定義
    const ZONES = {
      a: {
        bg: 'zone-a',
        label: '体験セミナー受付中',
        sub: '次回開催: 3月20日(金・祝)',
        btnText: 'まず体験セミナーへ（¥2,000）',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSeyOZymUPss9dDELMvaRgd3dVkD0wESOj8tNZwcoSqpw1XI_A/viewform'
      },
      b: {
        bg: 'zone-b',
        label: '思考の型を体験してみませんか？',
        sub: '30時間で仕事が変わる実戦プログラム',
        btnText: '体験セミナーで確かめる',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSeyOZymUPss9dDELMvaRgd3dVkD0wESOj8tNZwcoSqpw1XI_A/viewform'
      },
      c: {
        bg: 'zone-c',
        label: '本講座へのお申し込みはこちら',
        sub: '¥208,000〜（段階別）/ ¥550,000（全3段階）',
        btnText: '本講座に申し込む →',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSeEXTJ9IoejSezpt6qQaSx9IlQ6wFD_Xp8NwfmFXVs0Afo9RA/viewform'
      }
    };

    let currentZone = '';
    let isVisible = false;

    function applyZone(zoneKey) {
      if (currentZone === zoneKey) return;
      const z = ZONES[zoneKey];
      // クラス切り替え
      floatingCta.classList.remove('zone-a','zone-b','zone-c');
      floatingCta.classList.add(z.bg);
      // テキスト・リンク更新
      fctaLabel.textContent   = z.label;
      fctaSubText.textContent = z.sub;
      fctaBtn.textContent     = z.btnText;
      fctaBtn.href            = z.href;
      currentZone = zoneKey;
    }

    // 初期ゾーン設定
    applyZone('a');

    window.addEventListener('scroll', () => {
      const scrollY      = window.scrollY;
      const docH         = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct    = scrollY / docH; // 0〜1

      const heroSection  = document.getElementById('hero');
      const heroBottom   = heroSection.offsetTop + heroSection.offsetHeight;
      const pricingEl    = document.getElementById('pricing');
      const pricingTop   = pricingEl ? pricingEl.offsetTop : docH * 0.75;

      // 表示・非表示
      if (scrollY > heroBottom && !isVisible) {
        floatingCta.classList.add('visible');
        isVisible = true;
      } else if (scrollY <= heroBottom && isVisible) {
        floatingCta.classList.remove('visible');
        isVisible = false;
      }

      // ゾーン判定
      if (scrollY >= pricingTop - 100) {
        applyZone('c');              // ZONE C: 料金プラン以降
      } else if (scrollPct >= 0.35) {
        applyZone('b');              // ZONE B: 35%スクロール以降
      } else {
        applyZone('a');              // ZONE A: 初期
      }
    });

    // ===== 開催日までのカウントダウン（オプション）=====
    function updateSeminarDate() {
      // セミナー日時を動的に表示する場合はここで処理
      // 現在は固定表示のため処理なし
    }
    updateSeminarDate();

    // ===== フォーム自動保存通知 =====
    function showFormSaveNotification() {
      const notification = document.getElementById('form-save-notification');
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }

    // ===== ページ読み込み時の初期化 =====
    document.addEventListener('DOMContentLoaded', () => {

      // Scroll Reveal Animation
      const revealOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.05,
      };

      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, revealOptions);

      document.querySelectorAll('.reveal').forEach((el) => {
        revealObserver.observe(el);
      });

      // FAQ Accordion
      document.querySelectorAll('.faq-question').forEach((question) => {
        question.addEventListener('click', () => {
          const item = question.parentElement;
          document.querySelectorAll('.faq-item').forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });
          item.classList.toggle('active');
        });
      });

      // Navbar scroll effect
      const navbar = document.getElementById('navbar');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });

      // LocalStorageからフォームデータを復元（離脱防止）
      const savedData = localStorage.getItem('formData');
      if (savedData) {
        formData = JSON.parse(savedData);
        // フォームに復元（実装は個別に対応）
      }
    });

    // ===== フォーム入力時の自動保存（離脱防止）=====
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        formData[e.target.name] = e.target.value;
        localStorage.setItem('formData', JSON.stringify(formData));
      }
    });