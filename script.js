const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();

function compressImage(file, maxWidth = 1800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function applyPhoto(slot, dataUrl) {
  slot.style.backgroundImage = `url("${dataUrl}")`;
  slot.classList.add('has-photo');
  slot.querySelector('.photo-button').textContent = 'Change Photo';
  slot.querySelector('.remove-photo').hidden = false;
}

document.querySelectorAll('.photo-slot').forEach(slot => {
  const input = slot.querySelector('.photo-input');
  const addButton = slot.querySelector('.photo-button');
  const removeButton = slot.querySelector('.remove-photo');
  const key = `estebanPortfolio:${slot.dataset.photoKey}`;

  try {
    const saved = localStorage.getItem(key);
    if (saved) applyPhoto(slot, saved);
  } catch (error) {
    console.warn('Saved photos are unavailable in this browser.', error);
  }

  addButton.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      applyPhoto(slot, dataUrl);
      try { localStorage.setItem(key, dataUrl); } catch (storageError) {
        alert('The photo was added for this session, but your browser could not save it permanently. Try a smaller image.');
      }
    } catch (error) {
      alert('That image could not be loaded. Please try a JPG, PNG, or WEBP file.');
    }
  });

  removeButton.addEventListener('click', () => {
    slot.style.backgroundImage = '';
    slot.classList.remove('has-photo');
    addButton.textContent = 'Add Photo';
    removeButton.hidden = true;
    input.value = '';
    try { localStorage.removeItem(key); } catch (error) {}
  });
});
