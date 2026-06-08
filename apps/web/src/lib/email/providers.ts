export type EmailProvider = "gmail" | "outlook";

export interface EmailIntegration {
  id: string;
  organization_id: string;
  provider: EmailProvider;
  email_address: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  last_sync_at: string | null;
  sync_cursor: string | null;
  auto_scan: boolean;
  auto_send: boolean;
  scan_filters: {
    broker_domains?: string[];
    subject_keywords?: string[];
  };
  status: string;
}

export interface InboundEmail {
  externalId: string;
  threadId?: string;
  subject: string;
  sender: string;
  body: string;
  receivedAt: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  email: string;
}

export function getOAuthConfig(provider: EmailProvider) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (provider === "gmail") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      redirectUri: `${appUrl}/api/integrations/email/callback`,
    };
  }

  return {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authUrl:
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl:
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: [
      "offline_access",
      "https://graph.microsoft.com/Mail.Read",
      "https://graph.microsoft.com/Mail.Send",
      "https://graph.microsoft.com/User.Read",
    ],
    redirectUri: `${appUrl}/api/integrations/email/callback`,
  };
}

export function buildAuthUrl(provider: EmailProvider, state: string) {
  const config = getOAuthConfig(provider);
  if (!config.clientId) {
    throw new Error(
      `${provider === "gmail" ? "GOOGLE" : "MICROSOFT"}_CLIENT_ID not configured`
    );
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  provider: EmailProvider,
  code: string
): Promise<OAuthTokens> {
  const config = getOAuthConfig(provider);
  if (!config.clientId || !config.clientSecret) {
    throw new Error("OAuth credentials not configured");
  }

  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${await res.text()}`);
  }

  const data = await res.json();
  const email = await fetchAccountEmail(provider, data.access_token);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined,
    email,
  };
}

async function fetchAccountEmail(
  provider: EmailProvider,
  accessToken: string
): Promise<string> {
  if (provider === "gmail") {
    const res = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();
    return data.email;
  }

  const res = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  return data.mail ?? data.userPrincipalName;
}

export async function refreshAccessToken(
  provider: EmailProvider,
  refreshToken: string
): Promise<OAuthTokens> {
  const config = getOAuthConfig(provider);
  const body = new URLSearchParams({
    client_id: config.clientId!,
    client_secret: config.clientSecret!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error("Token refresh failed");
  const data = await res.json();
  const email = await fetchAccountEmail(provider, data.access_token);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined,
    email,
  };
}
