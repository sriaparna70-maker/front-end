// Replace with your Render backend URL after deploying, e.g.:
// const BACKEND_URL = "https://sree-sastha-backend.onrender.com";
const BACKEND_URL = "https://sree-sastha-backend.onrender.com";

const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
if (toggle && menu){ toggle.addEventListener('click', () => { const isOpen = menu.classList.toggle('show'); toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false'); }); }

const tabs = document.querySelectorAll('.tab'); const panels = document.querySelectorAll('.tab-panel');
function showPanel(id){ panels.forEach(p => p.classList.remove('is-visible')); const next = document.getElementById(id); if(next){ void next.offsetWidth; next.classList.add('is-visible'); } }
tabs.forEach(btn => { btn.addEventListener('click', () => { tabs.forEach(b => b.classList.remove('is-active')); btn.classList.add('is-active'); showPanel(btn.dataset.target); }); }); showPanel('vision');

const toTop = document.querySelector('.to-top'); if (toTop){ toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'})); }
const yearEl = document.getElementById('year'); if (yearEl){ yearEl.textContent = new Date().getFullYear(); }

const form = document.getElementById('contactForm'); const note = document.getElementById('formNote');
if (form){ form.addEventListener('submit', async (e) => {
  e.preventDefault(); const data = Object.fromEntries(new FormData(form).entries()); note.textContent = 'Sending…';
  try{ const res = await fetch(`${BACKEND_URL}/api/contact`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(data) });
       const out = await res.json(); if(!res.ok || !out.ok) throw new Error(out.error || 'Failed');
       note.textContent = 'Thanks! Your message was sent.'; form.reset();
  }catch(err){ console.error(err); note.textContent = 'Could not send. Please try again or email us.'; }
}); }
// Vision & Mission tabs with fade
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

  // Ensure a default on first load
  if (!scope.querySelector('.tab-panel.is-visible')) show('panel-vision');
})();
// ===== Open Access Inquiry (new form) =====
(function(){
  const form = document.getElementById('oaInquiryForm');
  if(!form) return;
  const note = document.getElementById('oaFormNote');

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
      topic: 'Open Access Inquiry',
      name: fd.get('name'),
      company: fd.get('company'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      sanctioned_load: fd.get('sanctioned_load'),
      monthly_kwh: fd.get('monthly_kwh'),
      callback: !!fd.get('callback')
    };
    const file = fd.get('eb_bill');
    if(file && file.size){
      payload.eb_bill = {
        filename: file.name,
        content_type: file.type,
        b64: await fileToBase64(file)
      };
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/oa-inquiry`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const out = await res.json();
      if(!res.ok || !out.ok) throw new Error(out.error||'Failed');
      note.textContent = 'Thanks! We got your request.';
      form.reset();
    } catch(err){
      console.error(err);
      note.textContent = 'Could not send. Please email us.';
    }
  });
})();


