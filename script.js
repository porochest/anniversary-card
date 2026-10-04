```javascript
// ============================================
// کارت سالگرد پوریا و مهسا ❤️
// اتصال انتخاب هدیه به Formspree
// ============================================

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xeaejvol";

const envelope = document.getElementById("openEnvelope");
const envelopeScene = document.getElementById("envelopeScene");
const card = document.getElementById("card");
const result = document.getElementById("result");
const resultText = document.getElementById("resultText");
const choices = document.getElementById("choices");
const musicBtn = document.getElementById("musicBtn");

let audioCtx = null;
let musicTimer = null;
let musicOn = false;

// --------------------------------------------
// موسیقی
// --------------------------------------------

function startMusic() {
  if (musicOn) return;

  audioCtx =
    audioCtx ||
    new (window.AudioContext || window.webkitAudioContext)();

  const notes = [
    261.63,
    329.63,
    392,
    523.25,
    392,
    329.63,
    293.66,
    349.23,
    440,
    523.25,
    440,
    349.23
  ];

  let i = 0;

  const play = () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = notes[i++ % notes.length];

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(
      0.045,
      audioCtx.currentTime + 0.04
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + 0.62
    );

    osc.connect(gain).connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.65);
  };

  play();
  musicTimer = setInterval(play, 650);
  musicOn = true;

  musicBtn.textContent = "♫";
}

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);

  musicTimer = null;
  musicOn = false;

  musicBtn.textContent = "♪";
}

// --------------------------------------------
// قلب‌های شناور
// --------------------------------------------

function floatingHeart() {
  const h = document.createElement("span");

  h.className = "heart";
  h.textContent = Math.random() > 0.5 ? "♥" : "♡";

  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 12 + Math.random() * 22 + "px";
  h.style.animationDuration = 5 + Math.random() * 5 + "s";

  document.querySelector(".hearts").appendChild(h);

  setTimeout(() => h.remove(), 10000);
}

setInterval(floatingHeart, 900);

// --------------------------------------------
// باز کردن پاکت
// --------------------------------------------

function showCard() {
  envelope.classList.add("open");

  setTimeout(() => {
    envelopeScene.classList.add("hidden");
    card.classList.remove("hidden");

    // شروع موسیقی بعد از تعامل کاربر
    startMusic();
  }, 1100);
}

envelope.addEventListener("click", showCard);

// --------------------------------------------
// دکمه موسیقی
// --------------------------------------------

musicBtn.addEventListener("click", () => {
  if (musicOn) {
    stopMusic();
  } else {
    startMusic();
  }
});

// --------------------------------------------
// ارسال انتخاب به Formspree
// --------------------------------------------

async function sendChoice(choice) {
  const time = new Date().toLocaleString("fa-IR");

  const payload = {
    choice: choice,
    time: time,
    page: window.location.href
  };

  // ذخیره روی همان دستگاه، به عنوان پشتیبان
  localStorage.setItem(
    "anniversary_choice",
    JSON.stringify(payload)
  );

  const formData = new FormData();

  formData.append("choice", choice);
  formData.append("time", time);
  formData.append("page", window.location.href);

  // عنوان ایمیل
  formData.append(
    "_subject",
    "🎁 انتخاب هدیه سالگرد از طرف مهسا ❤️"
  );

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error("ارسال به Formspree موفق نبود");
    }

    return true;

  } catch (error) {
    console.error("Formspree error:", error);
    return false;
  }
}

// --------------------------------------------
// انتخاب هدیه
// --------------------------------------------

choices.addEventListener("click", async (event) => {

  const button = event.target.closest("button");

  if (!button) return;

  const choice = button.dataset.choice;

  // جلوگیری از چند بار کلیک
  choices
    .querySelectorAll("button")
    .forEach((btn) => {
      btn.disabled = true;
    });

  // ارسال انتخاب
  const sent = await sendChoice(choice);

  // نمایش نتیجه برای مهسا
  resultText.innerHTML =
    "پس انتخابت <strong>«" +
    choice +
    "»</strong> بود! 😍";

  card.classList.add("hidden");
  result.classList.remove("hidden");

  stopMusic();

  // جشن قلب‌ها ❤️
  for (let i = 0; i < 12; i++) {
    setTimeout(floatingHeart, i * 130);
  }

  // اگر ارسال ناموفق بود، فقط در Console ثبت می‌شود
  // و تجربه مهسا خراب نمی‌شود.
  if (!sent) {
    console.warn(
      "انتخاب روی دستگاه ذخیره شد ولی ارسال ایمیل موفق نبود."
    );
  }
});
```