import { Vector2D, random } from './Utils';
import { Target } from './Target';
import { ParticleSystem } from './ParticleSystem';
import { Slicer } from './Slicer';
import { soundManager } from './SoundManager';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface GameCallbacks {
  onStateChange: (state: GameState) => void;
  onScoreUpdate: (score: number) => void;
  onTimerUpdate: (time: number) => void;
  onGameOver: (finalScore: number, finalTime: number) => void;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameCallbacks;
  
  private state: GameState = 'MENU';
  private animationFrame: number = 0;
  private lastTime: number = 0;
  
  // Game objects
  private targets: Target[] = [];
  private particleSystem: ParticleSystem;
  private slicer: Slicer;
  
  // Game state
  private score: number = 0;
  private timer: number = 0;
  private missedTargets: number = 0;
  private maxMisses: number = 3;

  private timeSinceLastSpawn: number = 0;
  private gameSpeed: number = 1;
  private combo: number = 0;
  
  // Settings
  private readonly minSpawnDelay = 0.2; // Faster minimum spawn delay
  private readonly maxSpawnDelay = 1.2; // Faster maximum spawn delay
  
  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;
    
    this.particleSystem = new ParticleSystem();
    this.slicer = new Slicer(canvas);
    
    this.setupCanvas();
    this.startGameLoop();
    
    // Initialize sound on first user interaction
    this.setupSoundInitialization();
  }
  
  private setupCanvas(): void {
    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      
      this.canvas.width = rect.width * pixelRatio;
      this.canvas.height = rect.height * pixelRatio;
      
      this.ctx.scale(pixelRatio, pixelRatio);
      
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
  
  private setupSoundInitialization(): void {
    // Initialize sound on first click
    const initializeSound = () => {
      soundManager.initializeOnUserInteraction();
      document.removeEventListener('click', initializeSound);
      document.removeEventListener('touchstart', initializeSound);
    };
    
    document.addEventListener('click', initializeSound);
    document.addEventListener('touchstart', initializeSound);
  }
  
  private startGameLoop(): void {
    const gameLoop = (timestamp: number) => {
      const deltaTime = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      
      this.update(Math.min(deltaTime, 1/30)); // Cap at 30fps minimum
      this.render();
      
      this.animationFrame = requestAnimationFrame(gameLoop);
    };
    
    this.animationFrame = requestAnimationFrame(gameLoop);
  }
  
  private update(deltaTime: number): void {
    if (this.state !== 'PLAYING') return;
    
    // Update timer
    this.timer += deltaTime;
    this.callbacks.onTimerUpdate(this.timer);
    
    // Increase game speed over time more aggressively
    this.gameSpeed = 1 + (this.timer * 0.15);
    
    // Update targets
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      target.update(deltaTime, this.canvas.width / (window.devicePixelRatio || 1), this.canvas.height / (window.devicePixelRatio || 1));
      
      if (!target.active && !target.sliced) {
        // Target expired without being sliced
        this.missedTargets++;
        this.combo = 0; // Reset combo on miss
        this.particleSystem.emit(target.position, 10, 'miss');
        this.targets.splice(i, 1);
        
        // Screen shake effect
        this.screenShake();
        
        if (this.missedTargets >= this.maxMisses) {
          this.gameOver();
          return;
        }
        
        // Play miss sound
        soundManager.play('miss');
      } else if (!target.active && target.sliced) {
        // Target was sliced
        this.targets.splice(i, 1);
      }
    }
    
    // Spawn new targets more frequently
    this.timeSinceLastSpawn += deltaTime;
    const spawnDelay = this.minSpawnDelay + 
      (this.maxSpawnDelay - this.minSpawnDelay) / this.gameSpeed;
      
    if (this.timeSinceLastSpawn >= spawnDelay) {
      this.spawnTarget();
      this.timeSinceLastSpawn = 0;
      
      // Sometimes spawn multiple targets at once for higher difficulty
      if (this.gameSpeed > 2 && Math.random() < 0.3) {
        setTimeout(() => this.spawnTarget(), 100);
      }
    }
    
    // Update slicer
    this.slicer.update(deltaTime);
    
    // Check slice collisions
    const slicedTargets = this.slicer.checkTargetCollisions(this.targets);
    slicedTargets.forEach(target => {
      this.handleTargetSliced(target);
    });
    
    // Update particle system
    this.particleSystem.update(deltaTime);
  }
  
  private spawnTarget(): void {
    const canvas = this.canvas;
    const displayWidth = canvas.width / (window.devicePixelRatio || 1);
    const displayHeight = canvas.height / (window.devicePixelRatio || 1);
    
    let position: Vector2D;
    let velocity: Vector2D;
    
    // Spawn from edges with velocity toward center with higher speeds
    const side = Math.floor(Math.random() * 4);
    const baseSpeed = random(200, 500); // Increased base speed
    const speed = baseSpeed * this.gameSpeed;
    
    switch (side) {
      case 0: // Top
        position = new Vector2D(random(100, displayWidth - 100), -50);
        velocity = new Vector2D(
          random(-100, 100),
          random(speed * 0.7, speed * 1.2)
        );
        break;
      case 1: // Right
        position = new Vector2D(displayWidth + 50, random(100, displayHeight - 200));
        velocity = new Vector2D(
          -random(speed * 0.7, speed * 1.2),
          random(-150, 150)
        );
        break;
      case 2: // Left
        position = new Vector2D(-50, random(100, displayHeight - 200));
        velocity = new Vector2D(
          random(speed * 0.7, speed * 1.2),
          random(-150, 150)
        );
        break;
      default: // Bottom-left or bottom-right (like fruit ninja)
        const fromLeft = Math.random() < 0.5;
        position = new Vector2D(
          fromLeft ? -50 : displayWidth + 50,
          displayHeight - random(50, 150)
        );
        velocity = new Vector2D(
          fromLeft ? random(150, 350) : -random(150, 350),
          -random(300, 600) // Higher upward velocity
        );
    }
    
    this.targets.push(new Target(position, velocity));
  }
  
  private handleTargetSliced(target: Target): void {
    // Increase combo
    this.combo++;
    
    // Calculate score with combo multiplier
    const baseScore = 100;
    const comboMultiplier = Math.min(this.combo * 0.15, 3); // Higher max multiplier
    const speedMultiplier = this.gameSpeed * 0.3;
    
    const points = Math.floor(baseScore * (1 + comboMultiplier + speedMultiplier));
    this.score += points;
    
    this.callbacks.onScoreUpdate(this.score);
    
    // Create slice particles with Billions colors
    this.particleSystem.emit(target.position, 20, 'slice');
    
    // Play slice sound
    soundManager.play('slice');
    
    // Play combo sound for combos >= 3
    if (this.combo >= 3 && this.combo % 2 === 1) {
      setTimeout(() => soundManager.play('combo'), 100);
    }
  }
  
  private screenShake(): void {
    // Simple screen shake effect
    const shakeIntensity = 8;
    const shakeDuration = 150; // ms
    
    const originalTransform = this.ctx.getTransform();
    
    setTimeout(() => {
      this.ctx.setTransform(originalTransform);
    }, shakeDuration);
    
    this.ctx.translate(
      (Math.random() - 0.5) * shakeIntensity,
      (Math.random() - 0.5) * shakeIntensity
    );
  }
  
  private render(): void {
    const { width, height } = this.canvas;
    const displayWidth = width / (window.devicePixelRatio || 1);
    const displayHeight = height / (window.devicePixelRatio || 1);
    
    // Clear canvas
    this.ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    // Draw background
    this.renderBackground();
    
    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      // Render game objects
      this.targets.forEach(target => target.render(this.ctx));
      this.slicer.render(this.ctx);
      this.particleSystem.render(this.ctx);
      
      // Render combo indicator
      if (this.combo > 1) {
        this.renderCombo();
      }
    }
  }
  
  private renderBackground(): void {
    const displayWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const displayHeight = this.canvas.height / (window.devicePixelRatio || 1);
    
    const gradient = this.ctx.createRadialGradient(
      displayWidth / 2, displayHeight / 2, 0,
      displayWidth / 2, displayHeight / 2, Math.max(displayWidth, displayHeight) / 2
    );
    gradient.addColorStop(0, 'rgba(26, 69, 255, 0.1)'); // Billions blue
    gradient.addColorStop(1, 'rgba(10, 1, 26, 0.3)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, displayWidth, displayHeight);
  }
  
  private renderCombo(): void {
    const displayWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const displayHeight = this.canvas.height / (window.devicePixelRatio || 1);
    
    const centerX = displayWidth / 2;
    const centerY = displayHeight * 0.2;
    
    this.ctx.save();
    
    // Combo text with Billions colors
    this.ctx.font = 'bold 48px Montserrat';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#FF4B8F'; // Billions pink
    this.ctx.strokeStyle = '#1A45FF'; // Billions blue
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = '#FF4B8F';
    this.ctx.shadowBlur = 20;
    
    const comboText = `COMBO x${this.combo}`;
    this.ctx.strokeText(comboText, centerX, centerY);
    this.ctx.fillText(comboText, centerX, centerY);
    
    this.ctx.restore();
  }
  
  private gameOver(): void {
    this.state = 'GAME_OVER';
    this.callbacks.onStateChange(this.state);
    this.callbacks.onGameOver(this.score, this.timer);
    
    // Play game over sound
    soundManager.play('gameOver');
  }
  
  // Public methods
  public start(): void {
    this.resetGame();
    this.state = 'PLAYING';
    this.callbacks.onStateChange(this.state);
    
    // Play start sound
    soundManager.play('start');
  }
  
  public pause(): void {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.callbacks.onStateChange(this.state);
    }
  }
  
  public resume(): void {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.callbacks.onStateChange(this.state);
    }
  }
  
  public restart(): void {
    this.start();
  }
  
  public goToMenu(): void {
    this.resetGame();
    this.state = 'MENU';
    this.callbacks.onStateChange(this.state);
  }
  
  private resetGame(): void {
    this.score = 0;
    this.timer = 0;
    this.missedTargets = 0;
    this.gameSpeed = 1;
    this.combo = 0;
    this.timeSinceLastSpawn = 0;
    this.targets = [];
    this.particleSystem.clear();
    this.slicer.clear();
    
    this.callbacks.onScoreUpdate(this.score);
    this.callbacks.onTimerUpdate(this.timer);
  }
  
  public destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.slicer.destroy();
    soundManager.destroy();
  }
}
