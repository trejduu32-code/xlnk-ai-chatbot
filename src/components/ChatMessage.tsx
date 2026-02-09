import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const TypingCursor = () => (
  <span className="inline-block w-[3px] h-[1.1em] bg-foreground/80 rounded-full align-middle ml-0.5 animate-blink" />
);

const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 w-full animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <Bot size={18} className="text-foreground" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed overflow-hidden break-words",
          isUser
            ? "bg-secondary text-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <div className="overflow-x-auto">
            <MarkdownRenderer content={content} />
            {isStreaming && <TypingCursor />}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User size={18} className="text-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
