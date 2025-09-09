import { Vector2D, random } from './Utils';

export class Target {
  public position: Vector2D;
  public velocity: Vector2D;
  public radius: number;
  public color: string;
  public glowIntensity: number = 0;
  public active: boolean = true;
  public sliced: boolean = false;
  public age: number = 0;
  public maxAge: number;
  public rotationAngle: number = 0;
  public rotationSpeed: number;
  private logo: HTMLImageElement | null = null;
  private logoLoaded: boolean = false;

  constructor(position: Vector2D, velocity: Vector2D) {
    this.position = position;
    this.velocity = velocity;
    this.radius = random(30, 50); // Slightly larger for better visibility
    this.maxAge = random(4, 8); // Live longer for better gameplay
    this.rotationSpeed = random(-5, 5); // Rotation speed
    
    // Billions brand colors
    const colors = [
      '#1A45FF', // Billions blue
      '#FF4B8F', // Billions pink
      '#ED6D3F', // Billions orange
      '#ACFF4B', // Billions green
      '#60E7CE', // Billions turquoise
      '#FFFF00', // Yellow
      '#00FF88'  // Bright green
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    
    // Load Billions logo
    this.loadLogo();
  }

  private loadLogo(): void {
    this.logo = new Image();
    this.logo.onload = () => {
      this.logoLoaded = true;
    };
    this.logo.onerror = () => {
      this.logoLoaded = false;
    };
    this.logo.src = '/billions-logo.jpg';
  }

  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    if (!this.active) return;

    // Update position with faster movement
    this.position = this.position.add(this.velocity.multiply(deltaTime));
    this.age += deltaTime;
    
    // Update rotation
    this.rotationAngle += this.rotationSpeed * deltaTime;
    
    // Pulsing glow effect
    this.glowIntensity = (Math.sin(this.age * 6) + 1) * 0.5;
    
    // Apply gravity more strongly
    this.velocity.y += 150 * deltaTime;
    
    // Bounce off edges with some dampening
    if (this.position.x - this.radius <= 0 || this.position.x + this.radius >= canvasWidth) {
      this.velocity.x *= -0.7;
      this.position.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.position.x));
    }
    
    if (this.position.y - this.radius <= 0) {
      this.velocity.y *= -0.6;
      this.position.y = this.radius;
    }
    
    // Deactivate if too old or fell off screen
    if (this.age >= this.maxAge || this.position.y > canvasHeight + this.radius * 2) {
      this.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active || this.sliced) return;

    ctx.save();
    
    const glowSize = this.radius + (this.glowIntensity * 20);
    
    // Outer glow
    const gradient = ctx.createRadialGradient(
      this.position.x, this.position.y, this.radius * 0.2,
      this.position.x, this.position.y, glowSize
    );
    gradient.addColorStop(0, this.color + 'FF');
    gradient.addColorStop(0.6, this.color + '80');
    gradient.addColorStop(1, this.color + '00');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw circle background
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw Billions logo if loaded
    if (this.logoLoaded && this.logo) {
      ctx.save();
      
      // Move to center and rotate
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.rotationAngle);
      
      // Draw logo scaled to fit inside the circle
      const logoSize = this.radius * 1.3;
      ctx.globalAlpha = 0.9;
      
      // Create circular clipping mask for the logo
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.8, 0, Math.PI * 2);
      ctx.clip();
      
      ctx.drawImage(
        this.logo,
        -logoSize / 2,
        -logoSize / 2,
        logoSize,
        logoSize
      );
      
      ctx.restore();
    }
    
    // Inner highlight
    const innerGradient = ctx.createRadialGradient(
      this.position.x - this.radius * 0.4,
      this.position.y - this.radius * 0.4,
      0,
      this.position.x,
      this.position.y,
      this.radius
    );
    innerGradient.addColorStop(0, '#FFFFFF60');
    innerGradient.addColorStop(1, '#FFFFFF00');
    
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  isPointInside(point: Vector2D): boolean {
    return this.position.distance(point) <= this.radius;
  }

  slice(): void {
    this.sliced = true;
    this.active = false;
  }
}
