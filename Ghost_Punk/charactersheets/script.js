// 画像アップロード
const imageInput = document.getElementById('image-input');
const portraitPreview = document.getElementById('portrait-preview');
const uploadText = document.getElementById('upload-text');

imageInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      portraitPreview.src = event.target.result;
      portraitPreview.style.opacity = 1;
      uploadText.style.display = 'none';
    }
    reader.readAsDataURL(file);
  }
});

// 名前入力欄の装飾
const nameInput = document.getElementById('name-input');
function updateNameUnderline() {
  const val = nameInput.value.trim();
  if (val === "CHARACTER NAME" || val === "") {
    nameInput.classList.remove('is-pink');
  } else {
    nameInput.classList.add('is-pink');
  }
}
nameInput.addEventListener('blur', updateNameUnderline);

// ランダムID
function generateRandomID() {
  const idNumberEl = document.getElementById('id-number');
  const digits = Math.floor(1000 + Math.random() * 9000); 
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomChars = '';
  for (let i = 0; i < 4; i++) {
    randomChars += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  idNumberEl.textContent = `NO. ${digits}-${randomChars}`;
}
generateRandomID();

// --- 画像として出力する処理 ---
const downloadBtn = document.getElementById('download-btn');
const sheet = document.getElementById('character-sheet');

downloadBtn.addEventListener('click', () => {
  const originalText = downloadBtn.textContent;
  downloadBtn.textContent = 'GENERATING...';
  downloadBtn.disabled = true;

  // 現在のシートを複製する
  const clone = sheet.cloneNode(true);

  // 入力フォームをdiv要素に変換して描画
  const originalInputs = sheet.querySelectorAll('input:not([type="file"]), select, textarea');
  const clonedInputs = clone.querySelectorAll('input:not([type="file"]), select, textarea');
  
  originalInputs.forEach((input, i) => {
    const cInput = clonedInputs[i];
    const div = document.createElement('div');
    div.className = cInput.className;
    
    if (input.tagName === 'SELECT') {
      div.textContent = input.options[input.selectedIndex].text;
      div.style.display = 'flex';
      div.style.alignItems = 'center';
    } else {
      div.textContent = input.value;
      if (input.tagName === 'TEXTAREA') {
        div.style.whiteSpace = 'pre-wrap';
      }
    }
    
    if (input.id === 'name-input') {
      div.style.lineHeight = '1.3';
      div.style.height = 'auto';
      div.style.paddingBottom = '0.5rem';
      div.style.borderBottom = input.classList.contains('is-pink') ? '2px solid var(--neon-pink)' : '2px solid rgba(255, 255, 255, 0.3)';
    }

    cInput.parentNode.replaceChild(div, cInput);
  });

  clone.classList.add('force-pc-layout');
  clone.style.backdropFilter = 'none';
  clone.style.backgroundColor = '#151322'; 
  clone.style.boxShadow = 'none'; 

  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.zIndex = '-9999';
  wrapper.style.opacity = '0.01';
  wrapper.style.width = '1150px'; 
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // 画像の縦伸び・ぼやけを防ぐ処理
  const cPortrait = clone.querySelector('.portrait-section');
  const cImg = clone.querySelector('#portrait-preview');
  const originalImg = document.getElementById('portrait-preview');

  if (cImg && cImg.src && originalImg.naturalWidth) {
    cImg.style.display = 'block';
    const rect = cPortrait.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;
    const iw = originalImg.naturalWidth;
    const ih = originalImg.naturalHeight;
    const cr = cw / ch;
    const ir = iw / ih;

    cImg.style.position = 'absolute';
    cImg.style.objectFit = 'fill'; 

    if (cr > ir) {
      const scaledHeight = cw / ir;
      cImg.style.width = cw + 'px';
      cImg.style.height = scaledHeight + 'px';
      cImg.style.left = '0px';
      cImg.style.top = ((ch - scaledHeight) / 2) + 'px';
    } else {
      const scaledWidth = ch * ir;
      cImg.style.width = scaledWidth + 'px';
      cImg.style.height = ch + 'px';
      cImg.style.top = '0px';
      cImg.style.left = ((cw - scaledWidth) / 2) + 'px';
    }
  }

  html2canvas(clone, {
    scale: 3, 
    backgroundColor: '#100e17', 
    useCORS: true,
    logging: false
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'Ghostpunk_License.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    document.body.removeChild(wrapper);
    downloadBtn.textContent = originalText;
    downloadBtn.disabled = false;
  }).catch(err => {
    console.error('画像生成エラー:', err);
    alert('画像の生成に失敗しました。');
    document.body.removeChild(wrapper);
    downloadBtn.textContent = originalText;
    downloadBtn.disabled = false;
  });
});