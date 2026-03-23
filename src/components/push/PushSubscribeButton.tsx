"use client";

import { useEffect, useState } from "react";

type PushState = "unsupported" | "denied" | "prompt" | "subscribed" | "unsubscribed" | "loading";

export default function PushSubscribeButton() {
  const [state, setState] = useState<PushState>("loading");

  useEffect(() => {
    checkState();
  }, []);

  async function checkState() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? "subscribed" : "unsubscribed");
      } else {
        setState("unsubscribed");
      }
    } catch {
      setState("unsubscribed");
    }
  }

  async function subscribe() {
    setState("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
        setState("unsubscribed");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      if (res.ok) {
        setState("subscribed");
      } else {
        setState("unsubscribed");
      }
    } catch (err) {
      console.error("[push] Subscribe failed:", err);
      setState("unsubscribed");
    }
  }

  async function unsubscribe() {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
      }
      setState("unsubscribed");
    } catch (err) {
      console.error("[push] Unsubscribe failed:", err);
      setState("unsubscribed");
    }
  }

  if (state === "unsupported") return null;

  if (state === "denied") {
    return (
      <p className="text-xs text-zinc-500">
        Notificaciones bloqueadas. Habilitalo desde la config del navegador.
      </p>
    );
  }

  if (state === "loading") {
    return (
      <button
        disabled
        className="rounded-lg bg-zinc-700 px-4 py-2 text-sm text-zinc-400"
      >
        Cargando...
      </button>
    );
  }

  if (state === "subscribed") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-emerald-400">Notificaciones activadas</span>
        <button
          onClick={unsubscribe}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
        >
          Desactivar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
    >
      Activar notificaciones
    </button>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}
