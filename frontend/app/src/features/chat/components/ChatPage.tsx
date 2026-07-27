import { useEffect, useMemo, useRef, useState } from "react";
import { chatClient } from "../services/chatClient";
import { FiUsers, FiUser } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const ACTIVE_CHAT_SESSION_KEY = "activeChatCode";
const CHAT_MESSAGES_SESSION_PREFIX = "chatMessages:";

type Role = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: Role;
  channel: string;
  text: string;
  time: string;
};

export const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { code } = useParams() || { code: "" };
  const channel = code || "-1";
  const greeting = t("chatGreeting");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = sessionStorage.getItem(`${CHAT_MESSAGES_SESSION_PREFIX}${channel}`);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (error) {
      console.error("Failed to read chat session messages:", error);
    }

    return [
      {
        id: "m1",
        role: "assistant",
        channel,
        text: greeting,
        time: "09:41",
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const quickPrompts = useMemo(
    () => [
      t("quickPromptSummarizeApp"),
      t("quickPromptReadAuthor"),
      t("quickPromptAppGuidelines")
    ],
    [t],
  );

  useEffect(() => {
    // Sticky chat is enabled only when visiting /chat/:code.
    if (!code) return;
    sessionStorage.setItem(ACTIVE_CHAT_SESSION_KEY, code);
  }, [code]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`${CHAT_MESSAGES_SESSION_PREFIX}${channel}`, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to persist chat session messages:", error);
    }
  }, [channel, messages]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      channel,
      text: trimmed,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    chatClient
      .sendMessage({ message: trimmed }, code) // Send the message to the backend
      .then((response) => {
        const botMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          channel,
          text: response.message ?? "", // Use the response from the backend
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        setIsTyping(false);
      });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar placeholder">
                  <div
                    className={`w-9 flex justify-center items-center rounded-full ${msg.role === "user" ? "bg-primary text-primary-content" : "bg-secondary text-secondary-content"}`}
                  >
                    <span className="text-xs font-semibold">
                      {msg.role === "user" ? <FiUser  size={18} /> : <FiUsers size={18} /> }
                    </span>
                  </div>
                </div>
                <div className="chat-bubble">{msg.id === "m1" && msg.role === "assistant" ? greeting : msg.text}</div>
                <div className="chat-footer mt-1 text-xs opacity-60">
                  {msg.time}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat chat-start">
                <div className="chat-image avatar placeholder">
                  <div className="w-9 flex justify-center items-center rounded-full bg-secondary text-secondary-content">
                    <span className="text-xs font-semibold"><FiUsers size={18} /></span>
                  </div>
                </div>
                <div className="chat-bubble">
                  <span className="loading loading-dots loading-sm" />
                </div>
              </div>
            )}

            <div ref={listEndRef} />
          </div>
        </div>

        <div className="border-t border-base-300 bg-base-100 p-3 md:p-4">
          <div className="mx-auto mb-3 flex w-full max-w-3xl flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={onSubmit}
            className="mx-auto flex w-full max-w-3xl items-center gap-2"
          >
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder={t("typeYourMessage")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSend}
            >
              {t("send")}
            </button>
          </form>
        </div>
    </>
  );
};
