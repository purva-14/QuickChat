// Browser notifications for new messages when tab isn't focused,
// plus a soft ping sound.

export const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
};

export const notifyNewMessage = (senderName, text, avatar) => {
  if (document.visibilityState === "visible") return; // don't nag if user is already looking

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(senderName, {
      body: text || "Sent an image",
      icon: avatar || "/vite.svg",
    });
  }
  playPing();
};

let audioCtx;
export const playPing = () => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch {
    // ignore if audio isn't available
  }
};
