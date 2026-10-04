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

  try {
    audioCtx =
      audioCtx ||
      new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn("AudioContext پشتیبانی نمی‌شود");
    return;
  }

  const notes = [
    261.63, 329.63, 392, 523.25, 392, 329.63,
    293.66, 349.23, 440, 523.25, 440, 349.23
  ];

  let i = 0;

  const play = () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = notes[i++ % notes.length];

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, audioCtx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.62);

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

  const container = document.querySelector(".hearts");
  if (container) container.appendChild(h);

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
    startMusic();
  }, 1100);
}

envelope.addEventListener("click", showCard);

// --------------------------------------------
// دکمه موسیقی
// --------------------------------------------

musicBtn.addEventListener("click", () => {
  if (musicOn) stopMusic();
  else startMusic();
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

  // ذخیره روی دستگاه به عنوان پشتیبان
  try {
    localStorage.setItem("anniversary_choice", JSON.stringify(payload));
  } catch (e) {
    console.warn("localStorage در دسترس نیست");
  }

  const formData = new FormData();
  formData.append("انتخاب هدیه", choice);
  formData.append("زمان انتخاب", time);
  formData.append("صفحه", window.location.href);
  formData.append("_subject", "🎁 انتخاب هدیه سالگرد از طرف مهسا ❤️");

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Formspree response error:", response.status, errText);
      throw new Error("ارسال به Formspree موفق نبود");
    }

    console.log("✅ انتخاب با موفقیت ارسال شد");
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

  // غیرفعال کردن همه دکمه‌ها
  choices.querySelectorAll("button").forEach((btn) => {
    btn.disabled = true;
  });

  // بازخورد بصری روی دکمه انتخاب‌شده
  button.style.borderColor = "#c94b72";
  button.style.background = "#fff0f4";

  // ارسال انتخاب
  const sent = await sendChoice(choice);

  // نمایش نتیجه
  resultText.innerHTML =
    "پس انتخابت <strong>«" + choice + "»</strong> بود! 😍";

  card.classList.add("hidden");
  result.classList.remove("hidden");

  stopMusic();

  // جشن قلب‌ها ❤️
  for (let i = 0; i < 12; i++) {
    setTimeout(floatingHeart, i * 130);
  }

  if (!sent) {
    console.warn("انتخاب روی دستگاه ذخیره شد ولی ارسال ایمیل موفق نبود.");
  }
});