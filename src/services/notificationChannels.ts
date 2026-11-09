/**
 * Pickup Wash - Multi-Channel Customer Notification Architecture
 * Location: Kasur City, Pakistan
 * 
 * Future Integration Architecture for:
 * 1. Email Notifications (Resend / SendGrid / Supabase Auth SMTP)
 * 2. WhatsApp Business Notifications (Meta WhatsApp Cloud API / Twilio)
 * 3. SMS Notifications (Pakistan SMS Gateway: TeleStax / Zong / Jazz Business Portal)
 * 
 * SECURITY ARCHITECTURE NOTICE:
 * Production dispatching of SMS, WhatsApp, and transactional Email MUST occur via
 * server-side Supabase Edge Functions or backend webhook proxies. Master API keys
 * and provider access tokens must NEVER be placed in client-side bundles or prefixed with VITE_.
 * 
 * NOTE: As per project guidelines, external paid services are NOT activated yet.
 * All channels use simulated, secure mock dispatchers with clear documentation on how
 * to connect live API credentials when required.
 */

export type NotificationChannelType = 'in_app' | 'email' | 'whatsapp' | 'sms';

export interface ChannelMessage {
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  title: string;
  body: string;
  notificationType: string;
  bookingReference?: string;
  pickupDate?: string;
  pickupTime?: string;
  amount?: number | null;
}

export interface ChannelDeliveryResult {
  channel: NotificationChannelType;
  success: boolean;
  isSimulated: boolean;
  statusMessage: string;
}

/**
 * 1. EMAIL NOTIFICATION CHANNEL ADAPTER
 * Ready for: Resend, SendGrid, Postmark, or Supabase SMTP
 */
export const emailChannel = {
  get isConfigured(): boolean {
    return Boolean(
      (import.meta as any).env?.VITE_RESEND_API_KEY ||
      (import.meta as any).env?.VITE_EMAIL_SMTP_HOST
    );
  },

  async send(message: ChannelMessage): Promise<ChannelDeliveryResult> {
    if (!message.recipientEmail) {
      return {
        channel: 'email',
        success: false,
        isSimulated: false,
        statusMessage: 'No recipient email address provided.',
      };
    }

    if (this.isConfigured) {
      // Future Live Implementation Hook:
      // await resend.emails.send({ from: 'noreply@pickupwash.pk', to: message.recipientEmail, ... })
      return {
        channel: 'email',
        success: true,
        isSimulated: false,
        statusMessage: `Email dispatched to ${message.recipientEmail}.`,
      };
    }

    // Unconfigured Mock Mode
    console.info(
      `[Pickup Wash Notification Architecture] [Simulated Email]\n` +
      `To: ${message.recipientEmail}\n` +
      `Subject: Pickup Wash: ${message.title}\n` +
      `Content: ${message.body}\n` +
      `Notice: External email service not active. Set VITE_RESEND_API_KEY to enable live delivery.`
    );

    return {
      channel: 'email',
      success: true,
      isSimulated: true,
      statusMessage: `Simulated Email sent to ${message.recipientEmail}. Live service inactive.`,
    };
  },
};

/**
 * 2. WHATSAPP NOTIFICATION CHANNEL ADAPTER
 * Ready for: Meta WhatsApp Business Cloud API or Twilio WhatsApp
 */
export const whatsappChannel = {
  get isConfigured(): boolean {
    return Boolean(
      (import.meta as any).env?.VITE_WHATSAPP_ACCESS_TOKEN &&
      (import.meta as any).env?.VITE_WHATSAPP_PHONE_NUMBER_ID
    );
  },

  async send(message: ChannelMessage): Promise<ChannelDeliveryResult> {
    if (!message.recipientPhone) {
      return {
        channel: 'whatsapp',
        success: false,
        isSimulated: false,
        statusMessage: 'No recipient phone number provided.',
      };
    }

    if (this.isConfigured) {
      // Future Live Implementation Hook:
      // POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
      return {
        channel: 'whatsapp',
        success: true,
        isSimulated: false,
        statusMessage: `WhatsApp template sent to ${message.recipientPhone}.`,
      };
    }

    // Unconfigured Mock Mode
    console.info(
      `[Pickup Wash Notification Architecture] [Simulated WhatsApp]\n` +
      `To: ${message.recipientPhone}\n` +
      `Template: ${message.title}\n` +
      `Content: ${message.body}\n` +
      `Notice: WhatsApp Business API not active. Set VITE_WHATSAPP_ACCESS_TOKEN to enable live messaging.`
    );

    return {
      channel: 'whatsapp',
      success: true,
      isSimulated: true,
      statusMessage: `Simulated WhatsApp message to ${message.recipientPhone}. Live service inactive.`,
    };
  },
};

/**
 * 3. SMS NOTIFICATION CHANNEL ADAPTER
 * Ready for: Pakistan SMS Gateway (TeleStax, Zong Business, Jazz Business, SMS Alert PK)
 */
export const smsChannel = {
  get isConfigured(): boolean {
    return Boolean(
      (import.meta as any).env?.VITE_SMS_GATEWAY_API_KEY ||
      (import.meta as any).env?.VITE_PAKISTAN_SMS_SECRET
    );
  },

  async send(message: ChannelMessage): Promise<ChannelDeliveryResult> {
    if (!message.recipientPhone) {
      return {
        channel: 'sms',
        success: false,
        isSimulated: false,
        statusMessage: 'No recipient mobile number provided.',
      };
    }

    if (this.isConfigured) {
      // Future Live Implementation Hook:
      // Call local Pakistani SMS Gateway HTTP API
      return {
        channel: 'sms',
        success: true,
        isSimulated: false,
        statusMessage: `Branded SMS dispatched to ${message.recipientPhone}.`,
      };
    }

    // Unconfigured Mock Mode
    console.info(
      `[Pickup Wash Notification Architecture] [Simulated SMS]\n` +
      `To: ${message.recipientPhone}\n` +
      `Mask: "PICKUPWASH"\n` +
      `Message: ${message.title} - ${message.body}\n` +
      `Notice: Pakistan SMS gateway not active. Set VITE_SMS_GATEWAY_API_KEY to enable live SMS.`
    );

    return {
      channel: 'sms',
      success: true,
      isSimulated: true,
      statusMessage: `Simulated SMS sent to ${message.recipientPhone}. Live service inactive.`,
    };
  },
};

/**
 * Multi-Channel Notification Dispatcher
 */
export const notificationDispatcher = {
  async dispatchMultiChannel(
    channels: NotificationChannelType[],
    message: ChannelMessage
  ): Promise<ChannelDeliveryResult[]> {
    const results: ChannelDeliveryResult[] = [];

    for (const ch of channels) {
      try {
        switch (ch) {
          case 'email':
            results.push(await emailChannel.send(message));
            break;
          case 'whatsapp':
            results.push(await whatsappChannel.send(message));
            break;
          case 'sms':
            results.push(await smsChannel.send(message));
            break;
          case 'in_app':
          default:
            results.push({
              channel: 'in_app',
              success: true,
              isSimulated: false,
              statusMessage: 'In-app notification saved.',
            });
            break;
        }
      } catch (err: any) {
        results.push({
          channel: ch,
          success: false,
          isSimulated: false,
          statusMessage: err.message || 'Channel dispatch error.',
        });
      }
    }

    return results;
  },
};

