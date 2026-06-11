/* ==================================================================
   Vật Lý 11 Ez – AI PLUS module
   Phụ thuộc: KaTeX (đã có), Pollinations.AI (đã dùng trong file gốc)
   ================================================================== */
(function(){
'use strict';

const AI_URL = 'https://text.pollinations.ai/openai';
const SYSTEM_BASE = 'Bạn là gia sư Vật Lý 11 cho học sinh THPT Việt Nam. ' +
  'CHỈ trả lời các câu hỏi về Vật Lý, Toán, Hoá lớp 11 hoặc các kiến thức bổ trợ. ' +
  'Từ chối lịch sự nếu câu hỏi ngoài phạm vi học tập. ' +
  'Trình bày tiếng Việt, công thức đặt trong $...$ hoặc $$...$$ (KaTeX). ' +
  'Khi giải bài tập, chia thành các bước: ## Tóm tắt, ## Công thức, ## Thay số, ## Kết quả, ## Nhận xét.';

const CHAPTER_CONTEXT = {
  'home':       '',
  'baigiang':   'Học sinh đang xem trang bài giảng tổng hợp.',
  'congthu':    'Học sinh đang tra cứu công cụ / công thức.',
  'mophong':    'Học sinh đang xem mô phỏng vật lý.',
  'chuong1':    'Chương đang học: 1 – DAO ĐỘNG (dao động điều hoà, con lắc lò xo, con lắc đơn, năng lượng dao động).',
  'chuong2':    'Chương đang học: 2 – SÓNG (sóng cơ, giao thoa, sóng dừng, sóng âm, sóng điện từ).',
  'chuong3':    'Chương đang học: 3 – ĐIỆN TRƯỜNG (điện tích, định luật Coulomb, điện trường, điện thế, tụ điện).',
  'chuong4':    'Chương đang học: 4 – DÒNG ĐIỆN KHÔNG ĐỔI (cường độ, hiệu điện thế, định luật Ohm, ghép nguồn, công và công suất).'
};

let aiMode = 'normal';   // normal | beginner | advanced
let currentChapter = '';

/* ============== TOAST ============== */
function toast(msg, type){
  const t = document.createElement('div');
  t.className = 'vl-ai-toast';
  if (type === 'ok') t.style.background = 'rgba(34,197,94,.95)';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 3500);
}

/* ============== CORE AI CALL ============== */
async function callAI(messages, opts){
  opts = opts || {};
  const body = {
    model: opts.model || 'openai',
    messages: messages,
    temperature: opts.temperature ?? 0.6,
    private: true
  };
  let res;
  try {
    res = await fetch(AI_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
  } catch(e){
    throw new Error('Mất kết nối. Kiểm tra mạng nhé!');
  }
  if (res.status === 429) throw new Error('Quá nhiều yêu cầu, đợi 30s rồi thử lại.');
  if (res.status === 402) throw new Error('Hết lượt AI miễn phí. Thử lại sau ít phút.');
  if (!res.ok) throw new Error('AI lỗi ('+res.status+').');
  const data = await res.json();
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
}

function buildSystem(extra){
  let s = SYSTEM_BASE;
  if (aiMode === 'beginner') s += ' Giải thích như đang nói chuyện với người mới, tránh thuật ngữ khó.';
  if (aiMode === 'advanced') s += ' Giải thích nâng cao, đưa thêm mở rộng và ví dụ phức tạp.';
  if (currentChapter && CHAPTER_CONTEXT[currentChapter]) s += ' ' + CHAPTER_CONTEXT[currentChapter];
  if (extra) s += ' ' + extra;
  return s;
}

/* ============== TTS (đọc to) ============== */
function speak(text){
  if (!('speechSynthesis' in window)){ toast('Trình duyệt không hỗ trợ đọc.'); return; }
  speechSynthesis.cancel();
  // Loại bỏ markdown / LaTeX cho dễ đọc
  const clean = String(text).replace(/[`*_#>]/g,'').replace(/\$\$?[^$]+\$\$?/g,' công thức ').replace(/\s+/g,' ').trim();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'vi-VN'; u.rate = 1.0; u.pitch = 1.0;
  speechSynthesis.speak(u);
}
function stopSpeak(){ if (window.speechSynthesis) speechSynthesis.cancel(); }

/* ============== STT (mic) ============== */
function startSTT(onText, btn){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR){ toast('Trình duyệt không hỗ trợ nhập giọng nói.'); return; }
  const r = new SR();
  r.lang = 'vi-VN'; r.interimResults = false; r.maxAlternatives = 1;
  if (btn) btn.classList.add('listening');
  r.onresult = (e)=>{ onText(e.results[0][0].transcript); };
  r.onerror  = ()=>{ toast('Không nghe được, thử lại nhé.'); };
  r.onend    = ()=>{ if (btn) btn.classList.remove('listening'); };
  r.start();
  return r;
}

/* ============== PHOTO SOLVER ============== */
async function solveFromImage(dataURL, prompt){
  const messages = [
    { role:'system', content: buildSystem('Học sinh gửi ảnh đề bài. Hãy đọc đề, ghi lại đề rồi giải đầy đủ.') },
    { role:'user', content: [
      { type:'text', text: prompt || 'Đọc đề trong ảnh và giải chi tiết từng bước, có công thức KaTeX.' },
      { type:'image_url', image_url: { url: dataURL } }
    ]}
  ];
  return await callAI(messages, { model:'openai', temperature:0.3 });
}

/* ============== QUIZ GENERATOR ============== */
async function genQuiz(chapter, n, level){
  const prompt = `Hãy tạo ${n} câu trắc nghiệm Vật Lý 11 thuộc ${chapter}, mức ${level}. ` +
    `Trả về JSON thuần (không markdown) đúng dạng: ` +
    `{"quiz":[{"q":"...","opts":["A","B","C","D"],"answer":0,"explain":"..."}]}.`;
  const messages = [
    { role:'system', content: 'Bạn là giáo viên Vật Lý. Chỉ trả JSON.' },
    { role:'user', content: prompt }
  ];
  const raw = await callAI(messages, { temperature:0.7 });
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('AI trả về sai định dạng.');
  return JSON.parse(m[0]);
}

/* ============== FLASHCARD GENERATOR ============== */
async function genFlashcards(topic, n){
  const prompt = `Tạo ${n} flashcard Vật Lý 11 về "${topic}". ` +
    `JSON: {"cards":[{"front":"...","back":"..."}]}. Chỉ trả JSON.`;
  const raw = await callAI([
    { role:'system', content:'Bạn là giáo viên Vật Lý. Chỉ trả JSON.' },
    { role:'user', content: prompt }
  ]);
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('AI trả về sai định dạng.');
  return JSON.parse(m[0]);
}

/* ============== STEP-BY-STEP PARSER ============== */
function renderStepwise(md){
  // Tách theo "## Tiêu đề" thành các <details>
  const parts = md.split(/\n##\s+/);
  if (parts.length < 2) return null;
  let html = parts[0];
  for (let i=1; i<parts.length; i++){
    const [title, ...rest] = parts[i].split('\n');
    const body = rest.join('\n');
    html += `<details class="vl-solve-step" ${i<=2?'open':''}><summary>${title.trim()}</summary><div>${escapeHTML(body)}</div></details>`;
  }
  return html;
}
function escapeHTML(s){ return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

/* ============== BACK TO TOP ============== */
function initBackTop(){
  const btn = document.getElementById('vlBackTop'); if (!btn) return;
  window.addEventListener('scroll', ()=>{
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive:true });
  btn.onclick = ()=> window.scrollTo({ top:0, behavior:'smooth' });
}

/* ============== SEARCH ============== */
const SEARCH_INDEX = [
  { t:'Trang chủ', tag:'Trang', go:()=> window.showPage && showPage('home') },
  { t:'Bài giảng', tag:'Trang', go:()=> window.showPage && showPage('baigiang') },
  { t:'Công cụ – Công thức', tag:'Trang', go:()=> window.showPage && showPage('congthu') },
  { t:'Mô phỏng', tag:'Trang', go:()=> window.showPage && showPage('mophong') },
  { t:'Trò chơi', tag:'Trang', go:()=> window.showPage && showPage('trochoi') },
  { t:'Giới thiệu', tag:'Trang', go:()=> window.showPage && showPage('gioithieu') },
  { t:'Góp ý', tag:'Trang', go:()=> window.showPage && showPage('gopy') },
  { t:'AI Gia sư', tag:'Công cụ', go:()=> window.openTool && openTool('ai') },
  { t:'Hỏi đáp với AI', tag:'Công cụ', go:()=> window.openTool && openTool('qa') },
  { t:'Bài tập tự luyện', tag:'Công cụ', go:()=> window.openTool && openTool('baitap') },
  { t:'Flashcard', tag:'Công cụ', go:()=> window.openTool && openTool('flashcard') },
  { t:'Ứng dụng thực tế', tag:'Công cụ', go:()=> window.openTool && openTool('ungdung') },
  { t:'Đổi đơn vị', tag:'Công cụ', go:()=> window.openTool && openTool('doidonvi') },
  { t:'Chương 1 – Dao động', tag:'Chương', go:()=>{ currentChapter='chuong1'; window.showPage && showPage('baigiang'); } },
  { t:'Chương 2 – Sóng', tag:'Chương', go:()=>{ currentChapter='chuong2'; window.showPage && showPage('baigiang'); } },
  { t:'Chương 3 – Điện trường', tag:'Chương', go:()=>{ currentChapter='chuong3'; window.showPage && showPage('baigiang'); } },
  { t:'Chương 4 – Dòng điện không đổi', tag:'Chương', go:()=>{ currentChapter='chuong4'; window.showPage && showPage('baigiang'); } },
  { t:'Điều khoản sử dụng', tag:'Pháp lý', go:()=> openLegal('terms') },
  { t:'Chính sách bảo mật', tag:'Pháp lý', go:()=> openLegal('privacy') }
];
function initSearch(){
  const box = document.getElementById('vlSearchBox');
  const inp = document.getElementById('vlSearchInput');
  const list= document.getElementById('vlSearchResults');
  if (!box || !inp || !list) return;
  function open(){ box.hidden=false; inp.value=''; render(''); setTimeout(()=> inp.focus(),50); }
  function close(){ box.hidden=true; }
  function render(q){
    const ql = q.toLowerCase().trim();
    const matches = ql ? SEARCH_INDEX.filter(x => x.t.toLowerCase().includes(ql)) : SEARCH_INDEX.slice(0,10);
    list.innerHTML = matches.map((x,i)=>
      `<li data-i="${i}"><span class="vl-tag">${x.tag}</span> ${x.t}</li>`
    ).join('') || '<li style="opacity:.6">Không tìm thấy</li>';
    list.querySelectorAll('li').forEach(li=>{
      li.onclick = ()=>{ const i = +li.dataset.i; matches[i] && matches[i].go(); close(); };
    });
  }
  inp.addEventListener('input', e=> render(e.target.value));
  box.addEventListener('click', e=>{ if (e.target===box) close(); });
  window.addEventListener('keydown', e=>{
    if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); box.hidden ? open() : close(); }
    if (e.key==='Escape' && !box.hidden) close();
  });
  window.VLSearch = { open, close };
}

/* ============== LEGAL PAGES ============== */
function openLegal(kind){
  const m = document.getElementById('vlLegalModal');
  const c = document.getElementById('vlLegalContent');
  if (!m || !c) return;
  c.innerHTML = kind==='terms' ? TERMS_HTML : PRIVACY_HTML;
  m.hidden = false;
}
const TERMS_HTML = `
<h2>Điều khoản sử dụng</h2>
<p>Vật Lý 11 Ez là nền tảng học tập miễn phí, phi lợi nhuận, dành cho học sinh THPT.</p>
<h3>1. Sử dụng</h3>
<p>Bạn được quyền sử dụng mọi nội dung trên web cho mục đích học tập cá nhân.</p>
<h3>2. AI Gia sư</h3>
<p>Câu trả lời từ AI chỉ mang tính tham khảo, có thể có sai sót. Hãy đối chiếu với SGK và giáo viên.</p>
<h3>3. Không chịu trách nhiệm</h3>
<p>Chúng tôi không chịu trách nhiệm cho thiệt hại phát sinh từ việc sử dụng nội dung.</p>
<h3>4. Liên hệ</h3>
<p>Mọi góp ý xin gửi qua trang Góp Ý.</p>
`;
const PRIVACY_HTML = `
<h2>Chính sách bảo mật</h2>
<p>Chúng tôi tôn trọng quyền riêng tư của bạn.</p>
<h3>1. Dữ liệu thu thập</h3>
<ul>
  <li>Email / tên hiển thị khi đăng nhập (tuỳ chọn).</li>
  <li>Lịch sử chat AI (lưu trên thiết bị hoặc tài khoản của bạn).</li>
  <li>Cookie kỹ thuật phục vụ đăng nhập.</li>
</ul>
<h3>2. Bên thứ ba</h3>
<p>Câu hỏi gửi đến AI được xử lý bởi <a href="https://pollinations.ai" target="_blank" rel="noopener">Pollinations.AI</a>. Không gửi thông tin nhạy cảm.</p>
<h3>3. Quyền của bạn</h3>
<p>Bạn có thể xoá tài khoản và lịch sử bất cứ lúc nào trong phần Tài khoản.</p>
`;
window.openLegal = openLegal;

/* ============== PWA install banner ============== */
function initPWA(){
  let deferred = null;
  const banner = document.getElementById('vlInstallBanner');
  const btn = document.getElementById('vlInstallBtn');
  const cls = document.getElementById('vlInstallClose');
  if (!banner) return;
  if (localStorage.getItem('vlInstallDismissed')) return;
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault(); deferred = e; banner.hidden = false;
  });
  btn && (btn.onclick = async ()=>{
    if (deferred){ deferred.prompt(); await deferred.userChoice; deferred=null; banner.hidden=true; }
  });
  cls && (cls.onclick = ()=>{ banner.hidden=true; localStorage.setItem('vlInstallDismissed','1'); });
}

/* ============== INJECT AI CONTROL BAR ============== */
function injectAIBar(){
  // Tìm khung AI Chat trong DOM (lớp .ai-chat-wrap đã có sẵn)
  const wrap = document.querySelector('.ai-chat-wrap');
  if (!wrap || wrap.dataset.vlPlus) return;
  wrap.dataset.vlPlus = '1';

  const bar = document.createElement('div');
  bar.className = 'vl-ai-plus-bar';
  bar.innerHTML = `
    <button data-act="img" title="Giải bài từ ảnh">📷 Ảnh đề</button>
    <button data-act="quiz" title="Tạo đề trắc nghiệm">📝 Tạo đề</button>
    <button data-act="flash" title="Tạo flashcard">🃏 Flashcard</button>
    <button data-act="mic" class="vl-voice-btn" title="Nói">🎤 Nói</button>
    <button data-act="speak" title="Đọc câu trả lời">🔊 Đọc</button>
    <button data-act="stop" title="Dừng đọc">⏹</button>
    <span style="flex:1"></span>
    <button data-act="mode-normal" class="active" title="Bình thường">Thường</button>
    <button data-act="mode-beginner" title="Dễ hiểu">Dễ</button>
    <button data-act="mode-advanced" title="Nâng cao">Nâng cao</button>
  `;
  wrap.appendChild(bar);

  bar.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button'); if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'img')      openImageSolver();
    else if (act === 'quiz') openQuizGen();
    else if (act === 'flash') openFlashGen();
    else if (act === 'mic'){
      const input = document.querySelector('.ai-chat-wrap input[type="text"], .ai-chat-wrap textarea');
      startSTT(t=>{ if (input){ input.value = (input.value? input.value+' ':'') + t; input.focus(); } }, btn);
    }
    else if (act === 'speak'){
      const last = document.querySelector('.ai-chat-wrap .msg.assistant:last-child, .ai-chat-wrap .ai-msg:last-child, .ai-chat-wrap [data-role="assistant"]:last-child');
      if (last) speak(last.innerText); else toast('Chưa có câu trả lời để đọc.');
    }
    else if (act === 'stop') stopSpeak();
    else if (act.startsWith('mode-')){
      aiMode = act.slice(5);
      bar.querySelectorAll('[data-act^="mode-"]').forEach(b=> b.classList.toggle('active', b.dataset.act===act));
      toast('Chế độ: '+ ({normal:'Thường',beginner:'Dễ hiểu',advanced:'Nâng cao'}[aiMode]), 'ok');
    }
  });
}

/* ============== POPUP HELPER ============== */
function makePopup(title, innerHTML){
  const wrap = document.createElement('div');
  wrap.className = 'vl-legal-modal';
  wrap.innerHTML = `<div class="vl-legal-inner">
    <button class="vl-legal-close">✕</button>
    <h2 style="margin-top:0">${title}</h2>
    <div class="vl-pop-body">${innerHTML}</div>
  </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector('.vl-legal-close').onclick = ()=> wrap.remove();
  wrap.addEventListener('click', e=>{ if (e.target===wrap) wrap.remove(); });
  return wrap;
}

/* ============== IMAGE SOLVER UI ============== */
function openImageSolver(){
  const pop = makePopup('📷 Giải bài tập từ ảnh', `
    <p style="color:#cfd5e8">Chụp / chọn / dán (Ctrl+V) ảnh đề bài. AI sẽ đọc và giải chi tiết.</p>
    <div class="vl-img-drop" id="vlImgDrop">Bấm để chọn ảnh hoặc kéo-thả vào đây<br><small>(hỗ trợ paste Ctrl+V)</small></div>
    <input type="file" id="vlImgFile" accept="image/*" hidden>
    <img id="vlImgPrev" class="vl-img-preview" hidden>
    <textarea id="vlImgPrompt" placeholder="Yêu cầu thêm (tuỳ chọn): vd 'giải bằng phương pháp năng lượng'" style="width:100%;min-height:60px;margin-top:10px;padding:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff"></textarea>
    <button id="vlImgGo" class="vl-quizgen" style="display:none;margin-top:10px;padding:10px 16px;background:linear-gradient(135deg,#3a6ff7,#a855f7);color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:600">✨ Giải bài</button>
    <div id="vlImgResult" style="margin-top:14px;color:#e6ebff"></div>
  `);
  const drop = pop.querySelector('#vlImgDrop');
  const file = pop.querySelector('#vlImgFile');
  const prev = pop.querySelector('#vlImgPrev');
  const go   = pop.querySelector('#vlImgGo');
  const res  = pop.querySelector('#vlImgResult');
  let dataURL = '';
  function loadFile(f){
    if (!f || !f.type.startsWith('image/')) return;
    const rd = new FileReader();
    rd.onload = ()=>{ dataURL = rd.result; prev.src = dataURL; prev.hidden=false; go.style.display='block'; };
    rd.readAsDataURL(f);
  }
  drop.onclick = ()=> file.click();
  file.onchange = e=> loadFile(e.target.files[0]);
  drop.addEventListener('dragover', e=>{ e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave', ()=> drop.classList.remove('dragover'));
  drop.addEventListener('drop', e=>{ e.preventDefault(); drop.classList.remove('dragover'); loadFile(e.dataTransfer.files[0]); });
  window.addEventListener('paste', function pasteH(e){
    if (!document.body.contains(pop)){ window.removeEventListener('paste', pasteH); return; }
    const it = [...(e.clipboardData?.items||[])].find(i=> i.type.startsWith('image/'));
    if (it) loadFile(it.getAsFile());
  });
  go.onclick = async ()=>{
    if (!dataURL) return;
    res.innerHTML = '⏳ AI đang đọc ảnh và giải...';
    try {
      const md = await solveFromImage(dataURL, pop.querySelector('#vlImgPrompt').value);
      const stepped = renderStepwise(md);
      res.innerHTML = stepped || ('<div>'+(window.marked? marked.parse(md): md)+'</div>');
      if (window.renderMathInElement) renderMathInElement(res,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
    } catch(e){ res.innerHTML = '❌ ' + e.message; toast(e.message); }
  };
}

/* ============== QUIZ GEN UI ============== */
function openQuizGen(){
  const pop = makePopup('📝 Tạo đề trắc nghiệm bằng AI', `
    <div class="vl-quizgen">
      <label>Chương</label>
      <select id="vlQGCh">
        <option value="Chương 1 – Dao động">Chương 1 – Dao động</option>
        <option value="Chương 2 – Sóng">Chương 2 – Sóng</option>
        <option value="Chương 3 – Điện trường">Chương 3 – Điện trường</option>
        <option value="Chương 4 – Dòng điện không đổi">Chương 4 – Dòng điện không đổi</option>
        <option value="tổng hợp Vật Lý 11">Tổng hợp Vật Lý 11</option>
      </select>
      <label>Số câu</label>
      <input id="vlQGN" type="number" min="3" max="20" value="5">
      <label>Mức độ</label>
      <select id="vlQGL">
        <option>nhận biết</option><option>thông hiểu</option><option selected>vận dụng</option><option>vận dụng cao</option>
      </select>
      <button id="vlQGGo">🚀 Tạo đề</button>
    </div>
    <div id="vlQGOut" style="margin-top:14px"></div>
  `);
  pop.querySelector('#vlQGGo').onclick = async ()=>{
    const out = pop.querySelector('#vlQGOut');
    out.innerHTML = '⏳ Đang tạo...';
    try {
      const ch = pop.querySelector('#vlQGCh').value;
      const n  = +pop.querySelector('#vlQGN').value || 5;
      const l  = pop.querySelector('#vlQGL').value;
      const data = await genQuiz(ch, n, l);
      out.innerHTML = data.quiz.map((q,i)=>`
        <div style="background:rgba(255,255,255,.04);padding:12px;border-radius:10px;margin:10px 0">
          <div style="font-weight:600;color:#fff">Câu ${i+1}. ${escapeHTML(q.q)}</div>
          <ul style="list-style:none;padding:8px 0">
            ${q.opts.map((o,j)=>`<li>${String.fromCharCode(65+j)}. ${escapeHTML(o)}</li>`).join('')}
          </ul>
          <details><summary style="cursor:pointer;color:#86efac">Xem đáp án</summary>
            <div style="padding:8px;color:#cfd5e8">✅ <b>${String.fromCharCode(65+q.answer)}</b> – ${escapeHTML(q.explain||'')}</div>
          </details>
        </div>`).join('');
      if (window.renderMathInElement) renderMathInElement(out,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
    } catch(e){ out.innerHTML='❌ '+e.message; toast(e.message); }
  };
}

/* ============== FLASHCARD GEN UI ============== */
function openFlashGen(){
  const pop = makePopup('🃏 Tạo Flashcard bằng AI', `
    <div class="vl-quizgen">
      <label>Chủ đề / nội dung</label>
      <input id="vlFCT" placeholder="VD: Định luật Coulomb">
      <label>Số thẻ</label>
      <input id="vlFCN" type="number" min="3" max="20" value="6">
      <button id="vlFCGo">✨ Tạo</button>
    </div>
    <div id="vlFCOut" style="margin-top:14px;display:grid;gap:10px"></div>
  `);
  pop.querySelector('#vlFCGo').onclick = async ()=>{
    const out = pop.querySelector('#vlFCOut');
    out.innerHTML = '⏳ Đang tạo...';
    try {
      const topic = pop.querySelector('#vlFCT').value || 'Vật Lý 11';
      const n = +pop.querySelector('#vlFCN').value || 6;
      const d = await genFlashcards(topic, n);
      out.innerHTML = d.cards.map(c=>`
        <div style="background:linear-gradient(135deg,rgba(244,114,182,.1),rgba(168,85,247,.1));padding:14px;border-radius:12px;border:1px solid rgba(244,114,182,.25)">
          <div style="font-weight:600;color:#fff;margin-bottom:6px">${escapeHTML(c.front)}</div>
          <div style="color:#e9d5ff">${escapeHTML(c.back)}</div>
        </div>`).join('');
      if (window.renderMathInElement) renderMathInElement(out,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
    } catch(e){ out.innerHTML='❌ '+e.message; toast(e.message); }
  };
}

/* ============== EXPORT ============== */
window.VLPlus = {
  callAI, speak, stopSpeak, startSTT, solveFromImage, genQuiz, genFlashcards,
  setChapter:(c)=>{ currentChapter=c; }, setMode:(m)=>{ aiMode=m; },
  openImageSolver, openQuizGen, openFlashGen, openLegal, toast
};

/* ============== INIT ============== */
function init(){
  initBackTop();
  initSearch();
  initPWA();
  // Theo dõi DOM để chèn AI bar khi modal AI mở
  const obs = new MutationObserver(()=> injectAIBar());
  obs.observe(document.body, { childList:true, subtree:true });
  injectAIBar();
}
if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);

})();
