import webPush from "web-push";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Configure VAPID (skip silently if env vars not set)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:admin@matchfeel.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

function isConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

async function sendToSubscription(
  sub: PushSubscriptionRow,
  payload: string
): Promise<boolean> {
  try {
    await webPush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: sub.keys,
      },
      payload
    );
    return true;
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    // 404 or 410 means subscription expired/invalid — delete it
    if (statusCode === 404 || statusCode === 410) {
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .eq("id", sub.id);
    } else {
      console.error(
        `[push] Failed to send to ${sub.endpoint.slice(0, 50)}:`,
        (err as Error).message
      );
    }
    return false;
  }
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  url?: string
) {
  if (!isConfigured()) return;

  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, user_id, endpoint, keys")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return;

  const payload = JSON.stringify({ title, body, url });
  await Promise.allSettled(
    subs.map((sub) => sendToSubscription(sub as PushSubscriptionRow, payload))
  );
}

export async function sendPushToAll(
  title: string,
  body: string,
  url?: string
) {
  if (!isConfigured()) return;

  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, user_id, endpoint, keys");

  if (!subs || subs.length === 0) return;

  const payload = JSON.stringify({ title, body, url });
  await Promise.allSettled(
    subs.map((sub) => sendToSubscription(sub as PushSubscriptionRow, payload))
  );
}

export async function sendPushToUsers(
  userIds: string[],
  title: string,
  body: string,
  url?: string
) {
  if (!isConfigured() || userIds.length === 0) return;

  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, user_id, endpoint, keys")
    .in("user_id", userIds);

  if (!subs || subs.length === 0) return;

  const payload = JSON.stringify({ title, body, url });
  await Promise.allSettled(
    subs.map((sub) => sendToSubscription(sub as PushSubscriptionRow, payload))
  );
}
