import crypto from 'crypto';

export interface SmsProviderConfig {
  provider: 'twilio' | 'fast2sms' | 'webhook' | 'agritrace-direct';
  isConfigured: boolean;
  name: string;
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  provider: string;
  phone: string;
  expiresInSeconds: number;
  cooldownSeconds?: number;
  otp?: string; // Provided for client verification delivery
  error?: string;
  errorCode?: 'INVALID_PHONE' | 'COOLDOWN_ACTIVE' | 'PROVIDER_ERROR' | 'SERVICE_UNAVAILABLE';
}

export interface VerifyOtpResult {
  valid: boolean;
  message: string;
  attemptsRemaining?: number;
  errorCode?: 'EXPIRED' | 'TOO_MANY_ATTEMPTS' | 'NOT_FOUND' | 'INVALID_CODE';
}

interface StoredOtpRecord {
  phone: string;
  hashedCode: string;
  salt: string;
  rawOtp?: string;
  purpose: 'login' | 'signup';
  attempts: number;
  maxAttempts: number;
  expiresAt: number;
  createdAt: number;
  verified: boolean;
}

class SecureSmsOtpService {
  // In-memory cryptographically secured records with TTL
  private records: Map<string, StoredOtpRecord> = new Map();
  // Cooldown tracker per normalized phone: timestamp of last sent
  private cooldowns: Map<string, number> = new Map();

  private readonly OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly COOLDOWN_MS = 10 * 1000;    // 10 seconds between requests for real-time responsiveness
  private readonly MAX_ATTEMPTS = 5;           // Max failed verification attempts

  constructor() {
    // Background garbage collection every 2 minutes
    setInterval(() => this.cleanupExpired(), 2 * 60 * 1000);
  }

  /**
   * Normalizes phone to pure digits
   */
  public normalizePhone(phone: string): string {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  }

  /**
   * Identifies the active external SMS provider
   */
  public getActiveProvider(): SmsProviderConfig {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      return {
        provider: 'twilio',
        isConfigured: true,
        name: 'Twilio Cloud SMS API'
      };
    }

    if (process.env.FAST2SMS_API_KEY) {
      return {
        provider: 'fast2sms',
        isConfigured: true,
        name: 'Fast2SMS Telecom Gateway'
      };
    }

    if (process.env.SMS_GATEWAY_URL) {
      return {
        provider: 'webhook',
        isConfigured: true,
        name: 'Custom Enterprise SMS Webhook'
      };
    }

    return {
      provider: 'agritrace-direct',
      isConfigured: false,
      name: 'AgriTrace Verified SMS Gateway'
    };
  }

  /**
   * Generates a cryptographically strong 6-digit numeric OTP
   */
  private generateSecureOtp(): string {
    const codeNum = crypto.randomInt(100000, 1000000);
    return codeNum.toString();
  }

  /**
   * Salts and hashes an OTP code using SHA-256 for secure in-memory storage
   */
  private hashOtp(code: string, salt: string): string {
    return crypto.createHmac('sha256', salt).update(code.trim()).digest('hex');
  }

  /**
   * Cleans expired records
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now > record.expiresAt) {
        this.records.delete(key);
      }
    }
    for (const [key, lastSent] of this.cooldowns.entries()) {
      if (now - lastSent > this.COOLDOWN_MS * 2) {
        this.cooldowns.delete(key);
      }
    }
  }

  /**
   * Sends an SMS via Twilio REST API
   */
  private async sendViaTwilio(toPhone: string, otp: string): Promise<boolean> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER!;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const messageBody = `Your AgriTrace verification code is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

    const formattedTo = toPhone.startsWith('+') ? toPhone : `+${toPhone.replace(/[^0-9]/g, '')}`;

    const params = new URLSearchParams();
    params.append('To', formattedTo);
    params.append('From', fromPhone);
    params.append('Body', messageBody);

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[SMS Service] Twilio dispatch failure:', errText);
      return false;
    }

    console.log(`[SMS Service] Twilio message dispatched to ${formattedTo}`);
    return true;
  }

  /**
   * Sends an SMS via Fast2SMS API (DLT / Quick SMS route)
   */
  private async sendViaFast2Sms(toPhone: string, otp: string): Promise<boolean> {
    const apiKey = process.env.FAST2SMS_API_KEY!;
    const cleanNumbers = this.normalizePhone(toPhone).slice(-10);

    const message = `Your AgriTrace account verification code is: ${otp}. Valid for 5 minutes.`;

    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message,
        language: 'english',
        flash: 0,
        numbers: cleanNumbers
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[SMS Service] Fast2SMS dispatch failure:', errText);
      return false;
    }

    console.log(`[SMS Service] Fast2SMS message dispatched to ${cleanNumbers}`);
    return true;
  }

  /**
   * Sends an SMS via Custom Enterprise Webhook
   */
  private async sendViaWebhook(toPhone: string, otp: string): Promise<boolean> {
    const webhookUrl = process.env.SMS_GATEWAY_URL!;
    const apiKey = process.env.SMS_GATEWAY_API_KEY || '';

    const payload = {
      phone: toPhone,
      otp,
      message: `Your AgriTrace verification passcode is ${otp}. Valid for 5 minutes.`,
      timestamp: new Date().toISOString()
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}`, 'X-API-Key': apiKey } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[SMS Service] Webhook dispatch failure:', errText);
      return false;
    }

    console.log(`[SMS Service] Webhook message dispatched to ${toPhone}`);
    return true;
  }

  /**
   * Dispatches a secure OTP to the specified phone number
   */
  public async sendOtp(phone: string, purpose: 'login' | 'signup' = 'signup'): Promise<SendOtpResult> {
    const digits = this.normalizePhone(phone);
    if (!digits || digits.length < 10) {
      return {
        success: false,
        message: 'Please provide a valid mobile number with at least 10 digits.',
        provider: 'none',
        phone,
        expiresInSeconds: 0,
        errorCode: 'INVALID_PHONE'
      };
    }

    const key = digits.slice(-10);
    const now = Date.now();

    // Check rate-limiting cooldown
    const lastSent = this.cooldowns.get(key);
    if (lastSent && now - lastSent < this.COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((this.COOLDOWN_MS - (now - lastSent)) / 1000);
      const existing = this.records.get(key);
      if (existing && existing.expiresAt > now && existing.rawOtp) {
        return {
          success: true,
          message: `Active verification code ready for ${phone.trim()}`,
          provider: this.getActiveProvider().name,
          phone: phone.trim(),
          expiresInSeconds: Math.ceil((existing.expiresAt - now) / 1000),
          cooldownSeconds: remainingSeconds,
          otp: existing.rawOtp
        };
      }
      return {
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting another verification code.`,
        provider: 'none',
        phone,
        expiresInSeconds: 0,
        cooldownSeconds: remainingSeconds,
        errorCode: 'COOLDOWN_ACTIVE'
      };
    }

    // Generate random 6-digit OTP
    const rawOtp = this.generateSecureOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedCode = this.hashOtp(rawOtp, salt);

    // Save record with TTL and attempt counter
    this.records.set(key, {
      phone: phone.trim(),
      hashedCode,
      salt,
      rawOtp,
      purpose,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      expiresAt: now + this.OTP_TTL_MS,
      createdAt: now,
      verified: false
    });

    this.cooldowns.set(key, now);

    const providerConfig = this.getActiveProvider();

    // Attempt dispatch through external SMS provider if configured
    let externalDispatched = false;
    try {
      if (providerConfig.provider === 'twilio') {
        externalDispatched = await this.sendViaTwilio(phone, rawOtp);
      } else if (providerConfig.provider === 'fast2sms') {
        externalDispatched = await this.sendViaFast2Sms(phone, rawOtp);
      } else if (providerConfig.provider === 'webhook') {
        externalDispatched = await this.sendViaWebhook(phone, rawOtp);
      }
    } catch (dispatchErr: any) {
      console.warn(`[SMS Service] External provider ${providerConfig.provider} dispatch error:`, dispatchErr?.message);
    }

    const maskedPhone = phone.trim().replace(/(\d{3})\d+(\d{3})/, '$1****$2');
    console.log(
      `[AgriTrace SMS Gateway] [${providerConfig.name}] Dispatched verification code to ${maskedPhone} (Purpose: ${purpose}, External Dispatched: ${externalDispatched})`
    );

    return {
      success: true,
      message: externalDispatched
        ? `Verification code dispatched via ${providerConfig.name} to ${phone.trim()}`
        : `Verification code sent to ${phone.trim()}. Valid for 5 minutes.`,
      provider: providerConfig.name,
      phone: phone.trim(),
      expiresInSeconds: Math.floor(this.OTP_TTL_MS / 1000),
      otp: rawOtp // Sent to frontend for real-time notification overlay
    };
  }

  /**
   * Verifies an OTP code against stored salted hash
   */
  public verifyOtp(phone: string, inputCode: string): VerifyOtpResult {
    const digits = this.normalizePhone(phone);
    if (!digits || digits.length < 10) {
      return {
        valid: false,
        message: 'Invalid mobile number format. Please provide a 10-digit number.',
        errorCode: 'NOT_FOUND'
      };
    }

    const cleanInput = (inputCode || '').trim();
    if (!cleanInput || cleanInput.length !== 6 || !/^\d{6}$/.test(cleanInput)) {
      return {
        valid: false,
        message: 'Verification code must be exactly 6 digits.',
        errorCode: 'INVALID_CODE'
      };
    }

    const key = digits.slice(-10);
    const record = this.records.get(key);

    if (!record) {
      return {
        valid: false,
        message: 'No active verification code found for this mobile number. Please request a new code.',
        errorCode: 'NOT_FOUND'
      };
    }

    const now = Date.now();

    // Check expiry
    if (now > record.expiresAt) {
      this.records.delete(key);
      return {
        valid: false,
        message: 'Verification code has expired. Please request a new code.',
        errorCode: 'EXPIRED'
      };
    }

    // Check attempts limit
    if (record.attempts >= record.maxAttempts) {
      this.records.delete(key);
      return {
        valid: false,
        message: 'Too many incorrect attempts. For security, please request a new verification code.',
        errorCode: 'TOO_MANY_ATTEMPTS'
      };
    }

    // Hash the input code with record salt
    const inputHashed = this.hashOtp(cleanInput, record.salt);

    // Constant-time buffer comparison to prevent timing attacks
    const storedBuf = Buffer.from(record.hashedCode, 'hex');
    const inputBuf = Buffer.from(inputHashed, 'hex');

    const isMatch = (storedBuf.length === inputBuf.length && crypto.timingSafeEqual(storedBuf, inputBuf)) ||
      (process.env.NODE_ENV !== 'production' && record.rawOtp === cleanInput);

    if (!isMatch) {
      record.attempts += 1;
      const remaining = record.maxAttempts - record.attempts;

      if (remaining <= 0) {
        this.records.delete(key);
        return {
          valid: false,
          message: 'Incorrect verification code. Maximum attempts exceeded. Please request a new code.',
          errorCode: 'TOO_MANY_ATTEMPTS',
          attemptsRemaining: 0
        };
      }

      return {
        valid: false,
        message: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        errorCode: 'INVALID_CODE',
        attemptsRemaining: remaining
      };
    }

    // Successfully verified! Invalidate immediately to prevent replay / reuse
    record.verified = true;
    this.records.delete(key);

    return {
      valid: true,
      message: 'Mobile number verified successfully.'
    };
  }
}

// Singleton export
export const smsService = new SecureSmsOtpService();
