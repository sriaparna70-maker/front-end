// Replace with your Render backend URL after deploying, e.g.:
// const BACKEND_URL = "https://sree-sastha-backend.onrender.com";
const BACKEND_URL = "https://final-backend-xcxo.onrender.com";

/* Nav */
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
if (toggle && menu){
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('show');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

/* Tabs (Vision/Mission) with fade */
(function () {
  const scope  = document.querySelector('#vision-mission');
  if (!scope) return;

  const tabs   = scope.querySelectorAll('.tab');
  const panels = scope.querySelectorAll('.tab-panel');

  function show(targetId) {
    panels.forEach(p => p.classList.toggle('is-visible', p.id === targetId));
    tabs.forEach(t => {
      const on = t.dataset.target === targetId;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.target)));

  // Ensure a default on first load (IDs are "vision" and "mission")
  if (!scope.querySelector('.tab-panel.is-visible')) show('vision');
})();

/* Footer year + to-top */
const toTop = document.querySelector('.to-top'); 
if (toTop){ toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'})); }
const yearEl = document.getElementById('year'); 
if (yearEl){ yearEl.textContent = new Date().getFullYear(); }

/* --- Contact form --- */
(function(){
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (!form || !note) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      name: (fd.get('name')||'').trim(),
      email: (fd.get('email')||'').trim(),
      message: (fd.get('message')||'').trim()
    };

    if (!data.name || !/\S+@\S+\.\S+/.test(data.email) || !data.message){
      note.textContent = 'Please enter a valid name, email and message.'; 
      return;
    }

    note.textContent = 'Sending…';
    try{
      const res = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(data)
      });
      const txt = await res.text();
      let out = {}; try{ out = JSON.parse(txt); }catch{}
      if(!res.ok || !out.ok) throw new Error(out.error || `HTTP ${res.status}`);
      note.textContent = 'Thanks! Your message was sent.'; 
      form.reset();
    }catch(err){
      console.error('CONTACT ERROR:', err); 
      note.textContent = 'Could not send. Please try again or email us.';
    }
  });
})();

/* --- Open Access Inquiry form --- */
(function(){
  const form = document.getElementById('oaInquiryForm');      // <-- ensure your HTML form has this id
  const note = document.getElementById('oaFormNote');         // <-- and a <p id="oaFormNote">
  if(!form || !note) return;

  function fileToBase64(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1]);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    note.textContent = 'Sending…';
    const fd = new FormData(form);

    const payload = {
      name: (fd.get('name')||'').trim(),
      email: (fd.get('email')||'').trim(),
      phone: (fd.get('phone')||'').trim(),
      sanctioned_load: (fd.get('sanctioned_load')||'').trim(),
      monthly_kwh: (fd.get('monthly_kwh')||'').trim(),
      callback: !!fd.get('callback')
    };

    if (!payload.name || !/\S+@\S+\.\S+/.test(payload.email) || !payload.sanctioned_load || !payload.monthly_kwh){
      note.textContent = 'Please fill Name, valid Email, Sanctioned Load and Monthly kWh.'; 
      return;
    }

    const file = fd.get('eb_bill');
    if (file && file.size){
      try{
        payload.eb_bill = {
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          b64: await fileToBase64(file)
        };
      }catch(e){
        console.warn('File read failed:', e);
      }
    }

    try {
      // IMPORTANT: correct endpoint is /api/openaccess (not /api/oa-inquiry)
      const res = await fetch(`${BACKEND_URL}/api/openaccess`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const txt = await res.text();
      let out = {}; try{ out = JSON.parse(txt); }catch{}
      if(!res.ok || !out.ok) throw new Error(out.error||`HTTP ${res.status}`);
      note.textContent = 'Thanks! We received your Open Access request.';
      form.reset();
    } catch(err){
      console.error('OPENACCESS ERROR:', err);
      note.textContent = 'Could not send. Please email us.';
    }
  });
})();
