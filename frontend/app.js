const backendURL = 'http://localhost:3000'; // Change to your deployed URL

window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const messageId = params.get('id');

  if (messageId) {
    document.getElementById('createForm').classList.add('hidden');
    document.getElementById('readForm').classList.remove('hidden');

    document.getElementById('decrypt').onclick = async () => {
      try {
        const res = await fetch(`${backendURL}/message/${messageId}`);
        if (!res.ok) throw new Error('Message not found or expired');
        const { ciphertext, salt, iv } = await res.json();

        const password = document.getElementById('readPassword').value;
        const key = await deriveKey(password, salt);
        const plaintext = await decrypt(ciphertext, iv, key);

        const output = document.getElementById('plaintext');
        output.textContent = plaintext;
        output.classList.remove('hidden');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    };

  } else {
    // CREATE FLOW
    document.getElementById('create').onclick = async () => {
      const message = document.getElementById('message').value;
      const password = document.getElementById('password').value;
      const expiry = document.getElementById('expiry').value;

      if (!message) return alert('Please enter a message.');

      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(password, salt);
      const encrypted = await encrypt(message, iv, key);

      const payload = {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        salt: btoa(String.fromCharCode(...salt)),
        iv: btoa(String.fromCharCode(...iv)),
        expiry
      };

      const res = await fetch(`${backendURL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const link = `${window.location.origin}?id=${data.id}`;

      document.getElementById('link').value = link;
      document.getElementById('linkContainer').classList.remove('hidden');

      document.getElementById('copy').onclick = () => {
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard');
      };
    };
  }
});

// === Web Crypto Functions ===

async function deriveKey(password, saltBase64) {
  const encoder = new TextEncoder();
  const salt = typeof saltBase64 === 'string'
    ? Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0))
    : saltBase64;

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(plaintext, iv, key) {
  const encoder = new TextEncoder();
  return await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );
}

async function decrypt(ciphertextB64, ivB64, key) {
  const ciphertext = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

const bgImages = [
  'assets/images/adi-goldstein-EUsVwEOsblE-unsplash.jpg',
  'assets/images/lennon-cheng-yAeUPmbyS-0-unsplash.jpg',
  'assets/images/markus-spiske-iar-afB0QQw-unsplash.jpg',
  'assets/images/michael-dziedzic-aQYgUYwnCsM-unsplash.jpg',
  'assets/images/andrea-de-santis-ZSTnDeb-hTY-unsplash.jpg',
];

let currentIndex = 0;
const bgDiv = document.querySelector('.background');

function rotateBackground() {
  bgDiv.style.backgroundImage = `url('${bgImages[currentIndex]}')`;
  currentIndex = (currentIndex + 1) % bgImages.length;
}

rotateBackground(); // Initial image
setInterval(rotateBackground, 30000); // Change every 30 seconds