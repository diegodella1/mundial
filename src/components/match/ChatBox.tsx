"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ChatMessage {
  id: string;
  match_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  body: string;
  is_blocked: boolean;
  created_at: string;
}

interface ChatBoxProps {
  matchId: string;
  chatEnabled: boolean;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 10) return "ahora";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

export default function ChatBox({ matchId, chatEnabled }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = useRef(createClient()).current;

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Fetch initial messages + subscribe to realtime
  useEffect(() => {
    if (!chatEnabled) return;

    // Fetch last 100 messages
    async function fetchMessages() {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("match_id", matchId)
        .eq("is_blocked", false)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data) {
        setMessages(data as ChatMessage[]);
        setTimeout(scrollToBottom, 50);
      }
    }

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          if (!msg.is_blocked) {
            setMessages((prev) => [...prev.slice(-99), msg]);
            setTimeout(scrollToBottom, 50);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, chatEnabled, supabase, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending || cooldown) return;

    setSending(true);
    setCooldown(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId, body: trimmed }),
      });

      if (res.ok) {
        setInput("");
      }
    } catch {
      // Silently fail
    } finally {
      setSending(false);
      setTimeout(() => setCooldown(false), 3000);
    }
  }, [input, sending, cooldown, matchId]);

  const handleReport = useCallback(
    async (messageId: string) => {
      if (reportedIds.has(messageId)) return;

      try {
        const res = await fetch("/api/chat/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message_id: messageId, match_id: matchId }),
        });

        if (res.ok || res.status === 409) {
          setReportedIds((prev) => new Set(prev).add(messageId));
        }
      } catch {
        // Silently fail
      }
    },
    [matchId, reportedIds]
  );

  if (!chatEnabled) {
    return (
      <div className="rounded-xl bg-zinc-900 p-4 text-center text-sm text-zinc-500">
        Chat desactivado
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-1.5 p-3 overflow-y-auto"
        style={{ height: "280px" }}
      >
        {messages.length === 0 && (
          <p className="text-center text-xs text-zinc-600 mt-auto mb-auto">
            Sin mensajes aun. Se el primero!
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="group flex items-start gap-2">
            {/* Avatar */}
            <div className="h-6 w-6 flex-shrink-0 rounded-full bg-zinc-700 overflow-hidden mt-0.5">
              {msg.avatar_url ? (
                <img
                  src={msg.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-400">
                  {msg.display_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="inline rounded-lg bg-zinc-800 px-2.5 py-1.5 text-sm">
                <span className="font-medium text-zinc-300 mr-1.5">
                  {msg.display_name}
                </span>
                <span className="text-zinc-100 break-words">{msg.body}</span>
              </div>
              <span className="ml-2 text-[10px] text-zinc-600">
                {timeAgo(msg.created_at)}
              </span>
            </div>

            {/* Report button */}
            <button
              onClick={() => handleReport(msg.id)}
              className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                reportedIds.has(msg.id)
                  ? "text-red-500 cursor-default"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
              title={reportedIds.has(msg.id) ? "Reportado" : "Reportar"}
              disabled={reportedIds.has(msg.id)}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 border-t border-zinc-800 p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          maxLength={280}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-zinc-600"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending || cooldown}
          className={`flex-shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            !input.trim() || sending || cooldown
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              : "bg-white text-black hover:bg-zinc-200"
          }`}
        >
          {cooldown ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
