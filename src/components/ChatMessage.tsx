import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 w-full", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <Bot size={18} className="text-foreground" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-secondary text-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <MarkdownRenderer content={content} />
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
