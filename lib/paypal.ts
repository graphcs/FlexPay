interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface PayPalPayout {
  sender_batch_header: {
    sender_batch_id: string;
    email_subject: string;
    email_message?: string;
  };
  items: PayPalPayoutItem[];
}

interface PayPalPayoutItem {
  recipient_type: "EMAIL";
  amount: {
    value: string;
    currency: string;
  };
  receiver: string;
  note?: string;
  sender_item_id: string;
}

interface PayPalPayoutResponse {
  batch_header: {
    payout_batch_id: string;
    batch_status: string;
  };
}

interface PayPalBatchStatus {
  batch_header: {
    payout_batch_id: string;
    batch_status: string;
    time_completed?: string;
    amount: {
      value: string;
      currency: string;
    };
  };
  items: Array<{
    payout_item_id: string;
    transaction_status: string;
    payout_item: {
      receiver: string;
      amount: { value: string; currency: string };
    };
    errors?: {
      message: string;
    };
  }>;
}

export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  mode: "sandbox" | "live";
}

function getBaseUrl(mode: string): string {
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

// Get access token using user's API credentials
export async function getAccessToken(credentials: PayPalCredentials): Promise<string> {
  const { clientId, clientSecret, mode } = credentials;
  const baseUrl = getBaseUrl(mode);

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get PayPal access token: ${error}`);
  }

  const data: PayPalTokenResponse = await response.json();
  return data.access_token;
}

// Create a payout batch
export async function createPayout(
  credentials: PayPalCredentials,
  items: Array<{
    email: string;
    amount: string;
    currency: string;
    note?: string;
    itemId: string;
  }>,
  batchId: string
): Promise<PayPalPayoutResponse> {
  const accessToken = await getAccessToken(credentials);
  const baseUrl = getBaseUrl(credentials.mode);

  const payout: PayPalPayout = {
    sender_batch_header: {
      sender_batch_id: batchId,
      email_subject: "You have a payment from FlexPay",
      email_message: "You have received a payment through FlexPay.",
    },
    items: items.map((item) => ({
      recipient_type: "EMAIL",
      amount: {
        value: item.amount,
        currency: item.currency,
      },
      receiver: item.email,
      note: item.note,
      sender_item_id: item.itemId,
    })),
  };

  const response = await fetch(`${baseUrl}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payout),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create payout: ${error}`);
  }

  return response.json();
}

// Get payout batch status
export async function getPayoutStatus(
  credentials: PayPalCredentials,
  batchId: string
): Promise<PayPalBatchStatus> {
  const accessToken = await getAccessToken(credentials);
  const baseUrl = getBaseUrl(credentials.mode);

  const response = await fetch(`${baseUrl}/v1/payments/payouts/${batchId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get payout status");
  }

  return response.json();
}

// Verify webhook signature
export async function verifyWebhookSignature(
  credentials: PayPalCredentials,
  headers: Headers,
  body: string,
  webhookId: string
): Promise<boolean> {
  const accessToken = await getAccessToken(credentials);
  const baseUrl = getBaseUrl(credentials.mode);

  const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.verification_status === "SUCCESS";
}
