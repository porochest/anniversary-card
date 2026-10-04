```javascript
// ============================================
// کارت سالگرد پوریا و مهسا ❤️
// نسخه اصلاح‌شده
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


// ============================================
// موسیقی
// ============================================

function startMusic() {
  if (musicOn) return;

  try {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      console.log("AudioContext پشتیبانی نمی‌شود.");
      return;
    }

    audioCtx = audioCtx || new AudioContext();

    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const notes = [
      261.63,
      329.63,
      392.00,
      523.25,
      392.00,
      329.63,
      293.66,
      349.23,
      440.00,
      523.25,
      440.00,
      349.23
    ];

    let i = 0;

    const play = () => {
      if (!audioCtx) return;

      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.value = notes[i % notes.length];
        i++;

        gain.gain.setValueAtTime(
          0,
          audioCtx.currentTime
        );

        gain.gain.linearRampToValueAtTime(
          0.045,
          audioCtx.currentTime + 0.04
        );

        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioCtx.currentTime + 0.62
        );

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();

        osc.stop(
          audioCtx.currentTime + 0.65
        );
      } catch (e) {
        console.log("خطا در پخش موسیقی:", e);
      }
    };

    play();

    musicTimer = setInterval(play, 650);

    musicOn = true;

    if (musicBtn) {
      musicBtn.textContent = "♫";
    }

  } catch (e) {
    console.log("موسیقی اجرا نشد:", e);
  }
}


function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
  }

  musicTimer = null;
  musicOn = false;

  if (musicBtn) {
    musicBtn.textContent = "♪";
  }
}


// ============================================
// قلب‌های شناور
// ============================================

function floatingHeart() {

  const heartsContainer =
    document.querySelector(".hearts");

  if (!heartsContainer) return;

  const h = document.createElement("span");

  h.className = "heart";

  h.textContent =
    Math.random() > 0.5 ? "♥" : "♡";

  h.style.left =
    Math.random() * 100 + "vw";

  h.style.fontSize =
    12 + Math.random() * 22 + "px";

  h.style.animationDuration =
    5 + Math.random() * 5 + "s";

  heartsContainer.appendChild(h);

  setTimeout(() => {
    h.remove();
  }, 10000);
}

setInterval(floatingHeart, 900);


// ============================================
// باز کردن پاکت
// ============================================

function showCard(event) {

  // جلوگیری از رفتار پیش‌فرض دکمه
  if (event) {
    event.preventDefault();
  }

  // باز شدن پاکت
  envelope.classList.add("open");

  // بعد از انیمیشن پاکت، کارت نمایش داده شود
  setTimeout(() => {

    envelopeScene.classList.add("hidden");

    card.classList.remove("hidden");

    // موسیقی نباید مانع باز شدن کارت شود
    try {
      startMusic();
    } catch (e) {
      console.log(e);
    }

  }, 1100);
}


// فقط یک بار رویداد باز کردن پاکت ثبت می‌شود
envelope.addEventListener("click", showCard);


// ============================================
// دکمه موسیقی
// ============================================

musicBtn.addEventListener("click", (event) => {

  // جلوگیری از هر رفتار ناخواسته
  event.preventDefault();
  event.stopPropagation();

  if (musicOn) {
    stopMusic();
  } else {
    startMusic();
  }
});


// ============================================
// ارسال انتخاب به Formspree
// ============================================

async function sendChoice(choice) {

  const time =
    new Date().toLocaleString("fa-IR");

  const payload = {
    choice: choice,
    time: time,
    page: window.location.href
  };

  // ذخیره پشتیبان روی دستگاه
  localStorage.setItem(
    "anniversary_choice",
    JSON.stringify(payload)
  );

  const formData = new FormData();

  formData.append(
    "choice",
    choice
  );

  formData.append(
    "time",
    time
  );

  formData.append(
    "page",
    window.location.href
  );

  formData.append(
    "_subject",
    "🎁 انتخاب هدیه سالگرد از طرف مهسا ❤️"
  );

  try {

    const response = await fetch(
      FORMSPREE_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Accept": "application/json"
        },
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(
        "Formspree request failed"
      );
    }

    return true;

  } catch (error) {

    console.error(
      "خطا در ارسال Formspree:",
      error
    );

    return false;
  }
}


// ============================================
// انتخاب هدیه
// ============================================

choices.addEventListener(
  "click",
  async (event) => {

    const button =
      event.target.closest("button");

    if (!button) return;

    const choice =
      button.dataset.choice;

    // جلوگیری از انتخاب دوباره
    choices
      .querySelectorAll("button")
      .forEach((btn) => {
        btn.disabled = true;
      });

    // ارسال به ایمیل
    const sent =
      await sendChoice(choice);

    // نمایش نتیجه
    resultText.innerHTML =
      "پس انتخابت <strong>«" +
      choice +
      "»</strong> بود! 😍";

    card.classList.add("hidden");

    result.classList.remove("hidden");

    stopMusic();

    // انفجار قلب ❤️
    for (let i = 0; i < 12; i++) {
      setTimeout(
        floatingHeart,
        i * 130
      );
    }

    if (!sent) {
      console.warn(
        "انتخاب ثبت شد، اما ارسال ایمیل موفق نبود."
      );
    }
  }
);
```
