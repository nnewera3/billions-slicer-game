class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private soundEnabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    // Try to initialize audio context
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
      this.audioContext = null;
    }
  }

  public initializeOnUserInteraction(): void {
    if (this.initialized || !this.audioContext) return;
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.initialized = true;
    this.preloadSounds();
  }

  private preloadSounds(): void {
    const soundDefinitions = {
      click: this.generateClickSound(),
      slice: this.generateSliceSound(),
      miss: this.generateMissSound(),
      combo: this.generateComboSound(),
      start: this.generateStartSound(),
      gameOver: this.generateGameOverSound()
    };

    Object.entries(soundDefinitions).forEach(([name, buffer]) => {
      this.sounds.set(name, buffer);
    });
  }

  private generateClickSound(): AudioBuffer {
    if (!this.audioContext) return this.createEmptyBuffer();
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10) * 0.3;
    }

    return buffer;
  }

  private generateSliceSound(): AudioBuffer {
    if (!this.audioContext) return this.createEmptyBuffer();
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 1200 + (t * 400); // Rising frequency
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8) * 0.4;
    }

    return buffer;
  }

  private generateMissSound(): AudioBuffer {
    if (!this.audioContext) return this.createEmptyBuffer();
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 - (t * 50); // Falling frequency
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.5;
    }

    return buffer;
  }

  private generateComboSound(): AudioBuffer {
    if (!this.audioContext) return this.createEmptyBuffer();
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency1 = 523; // C5
      const frequency2 = 659; // E5
      const frequency3 = 784; // G5
      
      data[i] = (
        Math.sin(2 * Math.PI * frequency1 * t) +
        Math.sin(2 * Math.PI * frequency2 * t) +
        Math.sin(2 * Math.PI * frequency3 * t)
      ) / 3 * Math.exp(-t * 4) * 0.3;
    }

    return buffer;
  }

  private generateStartSound(): AudioBuffer {
    if (!this.audioContext) return this.createEmptyBuffer();
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 440 + (t * 220); // Rising from A4 to A5
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.4;
    }

    return buffer;
  }

  private generateGameOverSound(): AudioBuffer {
    if (!this.audioContext) return this.createEmptyBuffer();
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.0;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 440 - (t * 200); // Falling from A4 to lower
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 1.5) * 0.3;
    }

    return buffer;
  }

  private createEmptyBuffer(): AudioBuffer {
    // Return a silent buffer as fallback
    if (!this.audioContext) {
      // Create a minimal mock buffer
      return {
        sampleRate: 44100,
        length: 1,
        duration: 0,
        numberOfChannels: 1,
        getChannelData: () => new Float32Array(1),
        copyFromChannel: () => {},
        copyToChannel: () => {}
      } as AudioBuffer;
    }
    
    return this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
  }

  public play(soundName: string): void {
    if (!this.soundEnabled || !this.audioContext || !this.initialized) return;
    
    const buffer = this.sounds.get(soundName);
    if (!buffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set volume
      gainNode.gain.value = 0.5;
      
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.sounds.clear();
    this.initialized = false;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
