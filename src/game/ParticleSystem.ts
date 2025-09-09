import { Vector2D, random } from './Utils';

interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
  size: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 500;

  public emit(position: Vector2D, count: number, type: 'slice' | 'miss' = 'slice'): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift(); // Remove oldest particle
      }

      const particle: Particle = {
        position: position.clone(),
        velocity: new Vector2D(
          random(-200, 200),
          random(-200, 200)
        ),
        life: 0,
        maxLife: random(0.5, 1.5),
        color: type === 'slice' ? this.getSliceColor() : this.getMissColor(),
        alpha: 1,
        size: random(2, 6)
      };

      this.particles.push(particle);
    }
  }

  private getSliceColor(): string {
    const colors = ['#1A45FF', '#FF4B8F', '#ED6D3F', '#ACFF4B', '#60E7CE'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getMissColor(): string {
    const colors = ['#FF4444', '#FF6666', '#FF8888'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  public update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.position = particle.position.add(particle.velocity.multiply(deltaTime));
      
      // Update life
      particle.life += deltaTime;
      
      // Apply gravity
      particle.velocity.y += 300 * deltaTime;
      
      // Apply drag
      particle.velocity = particle.velocity.multiply(0.98);
      
      // Update alpha based on life
      particle.alpha = 1 - (particle.life / particle.maxLife);
      
      // Remove dead particles
      if (particle.life >= particle.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    this.particles.forEach(particle => {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  }

  public clear(): void {
    this.particles = [];
  }
}
