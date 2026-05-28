document.addEventListener('DOMContentLoaded', () => {
  // --- テーマ切替 ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') document.body.classList.add('light-mode');
  
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
  });

  // --- 吹き出しスクロール出現 ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.speech-row').forEach(el => observer.observe(el));

  // --- アコーディオンの巻き戻りアニメーション ---
  // 動的に生成されるモーダル内のアコーディオンにも対応させるため、イベントの書き方を修正
  document.body.addEventListener('click', function (e) {
    const summary = e.target.closest('.accordion summary');
    if (!summary) return;

    // ▼ 削除： if (window.innerWidth < 900) return; （これでスマホでも動くようになります）

    e.preventDefault();
    const details = summary.parentElement;
    const content = summary.nextElementSibling;
    
    if (details.open) {
      content.style.overflow = 'hidden';
      content.style.height = content.offsetHeight + 'px';
      content.offsetHeight; 
      content.style.transition = 'height 0.3s ease-out';
      content.style.height = '0px';

      setTimeout(() => {
        details.open = false;
        content.style.height = '';
        content.style.transition = '';
      }, 300);
    } else {
      details.open = true;
      content.style.overflow = 'hidden';
      content.style.height = '0px';
      content.style.transition = 'height 0.3s ease-out';
      content.offsetHeight; 
      content.style.height = content.scrollHeight + 'px';

      setTimeout(() => {
        content.style.height = '';
        content.style.transition = '';
        content.style.overflow = 'visible';
      }, 300);
    }
  });

  // =========================================
  // 1. 画像クリック拡大モーダル（既存機能）
  // =========================================
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const imageWrapper = document.getElementById('modal-image-wrapper');
  const modalImage = document.getElementById('modal-image');

  const closeImageModal = () => {
    modalOverlay.classList.remove('is-active');
    imageWrapper.classList.remove('is-active');
    scale = 1; pointX = 0; pointY = 0;
    setTransform();
  };

  modalClose.addEventListener('click', closeImageModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay || e.target === imageWrapper) closeImageModal();
  });

  document.querySelectorAll('.log-figure img').forEach(img => {
    img.addEventListener('click', () => {
      modalImage.src = img.src;
      imageWrapper.classList.add('is-active');
      modalOverlay.classList.add('is-active');
    });
  });

  let scale = 1, pointX = 0, pointY = 0, startX = 0, startY = 0, isDragging = false;
  function setTransform() { modalImage.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`; }

  modalImage.addEventListener('mousedown', (e) => { e.preventDefault(); isDragging = true; startX = e.clientX - pointX; startY = e.clientY - pointY; });
  window.addEventListener('mousemove', (e) => { if (!isDragging) return; pointX = e.clientX - startX; pointY = e.clientY - startY; setTransform(); });
  window.addEventListener('mouseup', () => { isDragging = false; });
  imageWrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
    scale = delta > 0 ? scale * 1.1 : scale / 1.1;
    scale = Math.min(Math.max(0.5, scale), 5);
    setTransform();
  }, { passive: false });

  // =========================================
  // 2. キャラクター詳細 HTMLモーダル（新デザイン統合）
  // =========================================
  const htmlModal = document.getElementById('modal');
  const htmlWrapper = document.getElementById('modal-html-wrapper');
  let revealObserver = null;

  // アニメーション初期化関数
  function initModalAnimations() {
    if (revealObserver) revealObserver.disconnect();
    const revealItems = htmlWrapper.querySelectorAll(".reveal");
    
    revealItems.forEach((el) => {
      el.classList.remove("is-visible");
      el.style.transitionDelay = "0s";
    });

    revealObserver = new IntersectionObserver((entries) => {
      let visibleEntries = entries.filter(entry => entry.isIntersecting && !entry.target.classList.contains("is-visible"));
      visibleEntries.forEach((entry, index) => {
        entry.target.style.transitionDelay = `${index * 0.1}s`;
        requestAnimationFrame(() => {
          entry.target.classList.add("is-visible");
        });
      });
    }, { root: null, threshold: 0.1, rootMargin: "0px 0px 0px 0px" });
    
    revealItems.forEach((el) => revealObserver.observe(el));
  }

  // HTMLモーダルを閉じる関数
  const closeHtmlModal = () => {
    htmlModal.classList.remove('is-open', 'is-sharp');
    htmlModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // アニメーション用に中身を少し遅延してクリア
    setTimeout(() => { htmlWrapper.innerHTML = ''; }, 400);
  };

  // 背景クリックやESCキーで閉じる処理
  document.getElementById('modal-backdrop-html').addEventListener('click', closeHtmlModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && htmlModal.classList.contains("is-open")) closeHtmlModal();
  });

  // キャラクターピルメニューのクリックイベント
  document.querySelectorAll('.char-item').forEach(item => {
    item.addEventListener('click', () => {
      const modalUrl = item.getAttribute('data-modal-url');
      if (modalUrl) {
        fetch(modalUrl)
          .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.text();
          })
          .then(htmlContent => {
            htmlWrapper.innerHTML = htmlContent;
            
            // モーダルを開く
            htmlModal.classList.add('is-open');
            htmlModal.classList.remove('is-sharp');
            htmlModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            // アニメーション初期化
            initModalAnimations();
            
            // 読み込んだHTML内の閉じるボタンにイベント登録
            htmlWrapper.querySelectorAll('.js-close').forEach(btn => {
              btn.addEventListener('click', closeHtmlModal);
            });

            // 背景画像のぼかしを時間差でシャープにする演出
            requestAnimationFrame(() => {
              setTimeout(() => htmlModal.classList.add("is-sharp"), 600);
            });
          })
          .catch(error => {
            console.error(error);
            htmlWrapper.innerHTML = `<div style="padding:40px; color:#fff;">エラー: ${modalUrl} を読み込めませんでした。</div>`;
            htmlModal.classList.add('is-open');
          });
      }
    });
  });
});