```javascript
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


// ===============================
// موسیقی
// ===============================

function startMusic() {
  if (musicOn) return;

  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();

    const notes = [
      261.63, 329.63, 392, 523.25,
      392, 329.63, 293.66, 349.23,
      440, 523.25, 440, 349.23
    ];

    let i = 0;

    function playNote() {
      if (!audioCtx) return;

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

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.65);
    }

    playNote();
    musicTimer = setInterval(playNote, 650);
    musicOn = true;

    if (musicBtn) {
      musicBtn.textContent = "♫";
    }

  } catch (error) {
    console.log("Music error:", error);
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


// ===============================
// قلب‌های شناور
// ===============================

function floatingHeart() {
  const container = document.querySelector(".hearts");

  if (!container) return;

  const h = document.createElement("span");

  h.className = "heart";
  h.textContent = Math.random() > 0.5 ? "♥" : "♡";

  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = (12 + Math.random() * 22) + "px";
  h.style.animationDuration = (5 + Math.random() * 5) + "s";

  container.appendChild(h);

  setTimeout(() => {
    h.remove();
  }, 10000);
}

setInterval(floatingHeart, 900);


// ===============================
// باز کردن نامه
// ===============================

function showCard(event) {

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!envelope) return;

  envelope.classList.add("open");

  setTimeout(() => {

    if (envelopeScene) {
      envelopeScene.classList.add("hidden");
    }

    if (card) {
      card.classList.remove("hidden");
    }

    startMusic();

  }, 1100);
}


// اگر دکمه وجود داشت
if (envelope) {
  envelope.addEventListener("click", showCard);
}


// ===============================
// دکمه موسیقی
// ===============================

if (musicBtn) {

  musicBtn.addEventListener("click", function(event) {

    event.preventDefault();
    event.stopPropagation();

    if (musicOn) {
      stopMusic();
    } else {
      startMusic();
    }

  });

}


// ===============================
// ارسال انتخاب به Formspree
// ===============================

async function sendChoice(choice) {

  const time = new Date().toLocaleString("fa-IR");

  const payload = {
    choice: choice,
    time: time,
    page: window.location.href
  };

  // ذخیره روی همان دستگاه
  localStorage.setItem(
    "anniversary_choice",
    JSON.stringify(payload)
  );

  try {

    const formData = new FormData();

    formData.append("choice", choice);
    formData.append("time", time);
    formData.append("page", window.location.href);

    formData.append(
      "_subject",
      "🎁 انتخاب هدیه سالگرد از طرف مهسا ❤️"
    );

    const response = await fetch(
      FORMSPREE_ENDPOINT,
      {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      }
    );

    if (!response.ok) {
      console.log("Formspree error:", response.status);
      return false;
    }

    console.log("Choice sent successfully.");

    return true;

  } catch (error) {

    console.log("Formspree connection error:", error);

    return false;
  }
}


// ===============================
// انتخاب هدیه
// ===============================

if (choices) {

  choices.addEventListener("click", async function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const choice = button.dataset.choice;

    if (!choice) return;


    // جلوگیری از انتخاب دوباره
    const allButtons = choices.querySelectorAll("button");

    allButtons.forEach(function(btn) {
      btn.disabled = true;
    });


    // تغییر ظاهری دکمه
    button.style.transform = "scale(0.97)";


    // ارسال انتخاب
    // منتظر ایمیل نمی‌مانیم تا صفحه گیر نکند
    sendChoice(choice);


    // نمایش نتیجه
    setTimeout(function() {

      if (resultText) {
        resultText.textContent =
          "پس انتخابت «" + choice + "» بود! 😍";
      }

      if (card) {
        card.classList.add("hidden");
      }

      if (result) {
        result.classList.remove("hidden");
      }

      stopMusic();


      // جشن قلب‌ها ❤️
      for (let i = 0; i < 12; i++) {

        setTimeout(
          floatingHeart,
          i * 130
        );

      }

    }, 250);

  });

}
```
