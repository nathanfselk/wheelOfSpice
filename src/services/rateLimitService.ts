interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

export class RateLimitService {
  private storage: Map<string, RateLimitEntry> = new Map();
  private configs: Record<string, RateLimitConfig> = {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 }, // 5 attempts per 15min, block for 30min
    signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }, // 3 attempts per hour, block for 1 hour
    ranking: { maxAttempts: 50, windowMs: 60 * 60 * 1000, blockDurationMs: 10 * 60 * 1000 }, // 50 rankings per hour, block for 10min
    passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }, // 3 resets per hour, block for 1 hour
    missingSpice: { maxAttempts: 10, windowMs: 60 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 } // 10 submissions per hour, block for 30min
  };

  private getKey(action: string, identifier: string): string {
    return `${action}:${identifier}`;
  }

  private getIdentifier(): string {
    // Use a combination of IP simulation and browser fingerprint
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screen = `${screen.width}x${screen.height}`;
    
    // Create a simple hash of browser characteristics
    let hash = 0;
    const str = `${userAgent}${language}${timezone}${screen}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString();
  }

  checkRateLimit(action: keyof typeof this.configs, customIdentifier?: string): { allowed: boolean; remainingTime?: number; message?: string } {
    const config = this.configs[action];
    if (!config) {
      return { allowed: true };
    }

    const identifier = customIdentifier || this.getIdentifier();
    const key = this.getKey(action, identifier);
    const now = Date.now();
    
    let entry = this.storage.get(key);
    
    // Check if currently blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      const remainingTime = Math.ceil((entry.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingTime,
        message: `Too many attempts. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`
      };
    }

    // Initialize or reset if window expired
    if (!entry || (now - entry.firstAttempt) > config.windowMs) {
      entry = {
        attempts: 0,
        firstAttempt: now
      };
    }

    // Check if limit exceeded
    if (entry.attempts >= config.maxAttempts) {
      entry.blockedUntil = now + config.blockDurationMs;
      this.storage.set(key, entry);
      
      const remainingTime = Math.ceil(config.blockDurationMs / 1000);
      return {
        allowed: false,
        remainingTime,
        message: `Rate limit exceeded. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`
      };
    }

    return { allowed: true };
  }

  recordAttempt(action: keyof typeof this.configs, customIdentifier?: string): void {
    const identifier = customIdentifier || this.getIdentifier();
    const key = this.getKey(action, identifier);
    const now = Date.now();
    
    let entry = this.storage.get(key);
    
    if (!entry || (now - entry.firstAttempt) > this.configs[action].windowMs) {
      entry = {
        attempts: 1,
        firstAttempt: now
      };
    } else {
      entry.attempts++;
    }
    
    this.storage.set(key, entry);
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      const config = this.configs[key.split(':')[0] as keyof typeof this.configs];
      if (config && (now - entry.firstAttempt) > config.windowMs && (!entry.blockedUntil || now > entry.blockedUntil)) {
        this.storage.delete(key);
      }
    }
  }

  getRemainingAttempts(action: keyof typeof this.configs, customIdentifier?: string): number {
    const config = this.configs[action];
    if (!config) return Infinity;

    const identifier = customIdentifier || this.getIdentifier();
    const key = this.getKey(action, identifier);
    const entry = this.storage.get(key);
    
    if (!entry) return config.maxAttempts;
    
    const now = Date.now();
    if ((now - entry.firstAttempt) > config.windowMs) {
      return config.maxAttempts;
    }
    
    return Math.max(0, config.maxAttempts - entry.attempts);
  }
}

export const rateLimitService = new RateLimitService();

// Clean up old entries every 5 minutes
setInterval(() => {
  rateLimitService.cleanup();
}, 5 * 60 * 1000);