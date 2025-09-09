import { Vector2D } from './Utils';
import { Target } from './Target';

interface SlicePoint {
  position: Vector2D;
  time: number;
}

export class Slicer {
  private canvas: HTMLCanvasElement;
  private isSlicing: boolean = false;
  private slicePoints: SlicePoint[] = [];
  private maxPoints: number = 50;
  private pointLifetime: number = 0.3; // seconds
  private lastMousePosition: Vector2D | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private getCanvasPosition(clientX: number, clientY: number): Vector2D {
    const rect = this.canvas.getBoundingClientRect();
    return new Vector2D(
      clientX - rect.left,
      clientY - rect.top
    );
  }

  private handleMouseDown(e: MouseEvent): void {
    e.preventDefault();
    this.isSlicing = true;
    this.lastMousePosition = this.getCanvasPosition(e.clientX, e.clientY);
    this.addSlicePoint(this.lastMousePosition);
  }

  private handleMouseMove(e: MouseEvent): void {
    e.preventDefault();
    if (!this.isSlicing) return;
    
    const currentPosition = this.getCanvasPosition(e.clientX, e.clientY);
    this.addSlicePoint(currentPosition);
    this.lastMousePosition = currentPosition;
  }

  private handleMouseUp(e: MouseEvent): void {
    e.preventDefault();
    this.isSlicing = false;
    this.lastMousePosition = null;
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.isSlicing = true;
      this.lastMousePosition = this.getCanvasPosition(touch.clientX, touch.clientY);
      this.addSlicePoint(this.lastMousePosition);
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (!this.isSlicing || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const currentPosition = this.getCanvasPosition(touch.clientX, touch.clientY);
    this.addSlicePoint(currentPosition);
    this.lastMousePosition = currentPosition;
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    this.isSlicing = false;
    this.lastMousePosition = null;
  }

  private addSlicePoint(position: Vector2D): void {
    this.slicePoints.push({
      position: position.clone(),
      time: Date.now() / 1000
    });

    // Remove old points
    if (this.slicePoints.length > this.maxPoints) {
      this.slicePoints.shift();
    }
  }

  public update(_deltaTime: number): void {
    const currentTime = Date.now() / 1000;
    
    // Remove expired slice points
    this.slicePoints = this.slicePoints.filter(point => 
      currentTime - point.time < this.pointLifetime
    );
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.slicePoints.length < 2) return;

    ctx.save();
    
    const currentTime = Date.now() / 1000;
    
    // Draw slice trail
    ctx.strokeStyle = '#1A45FF';
    ctx.shadowColor = '#1A45FF';
    ctx.shadowBlur = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < this.slicePoints.length; i++) {
      const point = this.slicePoints[i];
      const prevPoint = this.slicePoints[i - 1];
      
      // Calculate alpha based on age
      const age = currentTime - point.time;
      const alpha = Math.max(0, 1 - (age / this.pointLifetime));
      
      // Calculate width based on alpha
      const width = Math.max(2, 8 * alpha);
      
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      
      ctx.beginPath();
      ctx.moveTo(prevPoint.position.x, prevPoint.position.y);
      ctx.lineTo(point.position.x, point.position.y);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  public checkTargetCollisions(targets: Target[]): Target[] {
    const slicedTargets: Target[] = [];
    
    if (this.slicePoints.length < 2) return slicedTargets;
    
    targets.forEach(target => {
      if (target.sliced || !target.active) return;
      
      // Check if slice path intersects with target
      for (let i = 1; i < this.slicePoints.length; i++) {
        const point1 = this.slicePoints[i - 1].position;
        const point2 = this.slicePoints[i].position;
        
        if (this.lineIntersectsCircle(point1, point2, target.position, target.radius)) {
          target.slice();
          slicedTargets.push(target);
          break;
        }
      }
    });
    
    return slicedTargets;
  }

  private lineIntersectsCircle(lineStart: Vector2D, lineEnd: Vector2D, circleCenter: Vector2D, radius: number): boolean {
    // Vector from line start to circle center
    const toCircle = circleCenter.subtract(lineStart);
    
    // Line direction vector
    const lineDir = lineEnd.subtract(lineStart);
    const lineLength = lineDir.length();
    
    if (lineLength === 0) return false;
    
    const lineDirNorm = lineDir.normalize();
    
    // Project circle center onto line
    const projection = toCircle.dot(lineDirNorm);
    const clampedProjection = Math.max(0, Math.min(lineLength, projection));
    
    // Find closest point on line segment
    const closestPoint = lineStart.add(lineDirNorm.multiply(clampedProjection));
    
    // Check if closest point is within circle radius
    return closestPoint.distance(circleCenter) <= radius;
  }

  public clear(): void {
    this.slicePoints = [];
    this.isSlicing = false;
    this.lastMousePosition = null;
  }

  public destroy(): void {
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
}
