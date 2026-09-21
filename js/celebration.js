/**
 * My Notepad - Celebration Engine
 * - Motivational celebratory quotes
 * - Harmonic Web Audio chime synthesizer
 * - Tasteful canvas confetti burst
 */

const Celebration = {
  // Curated list of fun, encouraging, empowering quotes
  quotes: [
    "Woohoo! You did a great job! 🎉",
    "Bravo! Task complete! ⭐",
    "You go girl! Absolutely crushing it! 💖",
    "Look at you being unstoppable! ⚡",
    "Checked off and thriving! 🌸",
    "Productivity queen mode activated! 👑",
    "Small steps lead to big victories! ✨",
    "Nailed it! Keep that momentum going! 🎯",
    "One down, nothing stopping you now! 🚀",
    "Superstar focus today! 🌟"
  ],

  toastTimer: null,
  audioCtx: null,

  // Initialize Web Audio Context on first interaction
  _getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  // Play a cheerful, bright 3-note ascending chime
  playChime() {
    if (!Store.isSoundEnabled()) return;

    try {
      const ctx = this._getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Rising major triad: G5 (784Hz) -> C6 (1046.5Hz) -> E6 (1318.5Hz)
      const notes = [
        { freq: 783.99, start: 0, duration: 0.18 },
        { freq: 1046.50, start: 0.10, duration: 0.22 },
        { freq: 1318.51, start: 0.20, duration: 0.35 }
      ];

      notes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.start);

        // Envelope: quick attack, smooth exponential decay
        gain.gain.setValueAtTime(0.001, now + note.start);
        gain.gain.exponentialRampToValueAtTime(0.18, now + note.start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.start);
        osc.stop(now + note.start + note.duration + 0.05);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  },

  // Show motivational quote toast
  showMotivationalToast() {
    const toast = document.getElementById('motivationToast');
    const quoteText = document.getElementById('motivationQuoteText');
    if (!toast || !quoteText) return;

    // Pick a random quote
    const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    quoteText.textContent = randomQuote;

    toast.classList.remove('hidden');

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  },

  // Canvas confetti burst
  launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Palette: rose, blush, champagne gold, soft coral, cream
    const colors = ['#E26D82', '#F9D5DA', '#F4B942', '#FA8E9C', '#FFD166', '#83C5BE'];
    const particles = [];
    const particleCount = 55;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() * 200 - 100),
        y: canvas.height * 0.35 + (Math.random() * 100 - 50),
        w: Math.random() * 9 + 5,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        drag: 0.98,
        opacity: 1
      });
    }

    let animationId = null;

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      for (let p of particles) {
        p.vx *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0 && p.y < canvas.height) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }

      if (aliveCount > 0) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationId);
      }
    }

    render();
  },

  // Trigger the full celebration sequence!
  celebrateTaskCompletion() {
    this.playChime();
    this.launchConfetti();
    this.showMotivationalToast();
  }
};
