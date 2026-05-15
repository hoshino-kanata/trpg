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
  document.querySelectorAll('.accordion summary').forEach(summary => {
    summary.addEventListener('click', function (e) {
      if (window.innerWidth < 900) return; // スマホ版ではクリック無効

      e.preventDefault();
      const details = this.parentElement;
      const content = this.nextElementSibling; // .accordion-content
      
      if (details.open) {
        // 閉じる時のアニメーション（上に巻き戻る）
        content.style.overflow = 'hidden';
        content.style.height = content.offsetHeight + 'px';
        content.offsetHeight; // 強制リフロー（再描画）
        content.style.transition = 'height 0.3s ease-out';
        content.style.height = '0px';

        setTimeout(() => {
          details.open = false;
          content.style.height = '';
          content.style.transition = '';
        }, 300);
      } else {
        // 開く時のアニメーション
        details.open = true;
        content.style.overflow = 'hidden';
        content.style.height = '0px';
        content.style.transition = 'height 0.3s ease-out';
        content.offsetHeight; // 強制リフロー
        content.style.height = content.scrollHeight + 'px';

        setTimeout(() => {
          content.style.height = '';
          content.style.transition = '';
          content.style.overflow = 'visible'; // はみ出しを許可
        }, 300);
      }
    });
  });
});