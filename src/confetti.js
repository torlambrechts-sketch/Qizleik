export function triggerConfetti() {
  // Ensure the canvas element exists on the page
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
  }
  
  const ctx = canvas.getContext('2d');
  
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  const colors = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', 
    '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', 
    '#10b981', '#22c55e', '#a3e635', '#facc15', '#fb923c'
  ];
  const particles = [];
  
  class ConfettiParticle {
    constructor(side) {
      this.side = side; // 'left' or 'right'
      this.radius = Math.random() * 5 + 4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      // Spawn at bottom corners
      if (side === 'left') {
        this.x = -10;
        this.y = canvas.height * 0.9;
        const angle = -Math.PI / 4 + (Math.random() * 0.2 - 0.1); // ~ -45 degrees
        const speed = Math.random() * 18 + 14;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      } else {
        this.x = canvas.width + 10;
        this.y = canvas.height * 0.9;
        const angle = -3 * Math.PI / 4 + (Math.random() * 0.2 - 0.1); // ~ -135 degrees
        const speed = Math.random() * 18 + 14;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      }
      
      this.gravity = 0.32;
      this.drag = 0.975;
      
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 12 - 6;
      this.opacity = 1.0;
    }
    
    update() {
      this.vx *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      
      this.rotation += this.rotationSpeed;
      
      // Start fading when falling below bottom or moving off-screen
      if (this.y > canvas.height * 0.8) {
        this.opacity -= 0.015;
      }
    }
    
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.opacity);
      
      // Draw rectangular confetti piece
      ctx.fillRect(-this.radius, -this.radius / 1.5, this.radius * 2, this.radius * 1.5);
      ctx.restore();
    }
  }
  
  // Fire 75 particles from the left and 75 particles from the right
  const particlesPerSide = 80;
  
  for (let i = 0; i < particlesPerSide; i++) {
    setTimeout(() => {
      if (document.body.contains(canvas)) {
        particles.push(new ConfettiParticle('left'));
        particles.push(new ConfettiParticle('right'));
      }
    }, Math.random() * 400); // Stagger over 400ms
  }
  
  let animationFrameId;
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      
      // Remove particle if it has faded out completely or gone out of bounds
      if (p.opacity <= 0 || p.x < -100 || p.x > canvas.width + 100) {
        particles.splice(i, 1);
      }
    }
    
    if (particles.length > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      // Cleanup DOM and listeners
      window.removeEventListener('resize', resizeCanvas);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }
  
  render();
}
