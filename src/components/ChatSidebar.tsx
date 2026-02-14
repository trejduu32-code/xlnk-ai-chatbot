import { Plus, MessageSquare, Trash2, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  persistOnDesktop?: boolean;
}

const ChatSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onClose,
  persistOnDesktop = false,
}: ChatSidebarProps) => {
  const sidebarRef = useRef<HTMLElement>(null);

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    if (!persistOnDesktop) {
      onClose();
    }
  };

  // Handle click outside (only for mobile/overlay mode)
  useEffect(() => {
    if (persistOnDesktop) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isOpen, onClose, persistOnDesktop]);

  return (
    <>
      {/* Overlay for mobile only */}
      {isOpen && !persistOnDesktop && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-all duration-300 ease-in-out",
          "w-72 flex flex-col shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-foreground" size={20} />
              <span className="font-semibold text-foreground text-lg">Chats</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          <Button
            onClick={() => {
              onNewConversation();
              if (!persistOnDesktop) onClose();
            }}
            variant="secondary"
            className="w-full"
          >
            <Plus size={18} />
            <span className="ml-2">New Chat</span>
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group",
                  activeConversationId === conversation.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50 text-foreground"
                )}
              >
                <MessageSquare size={16} className="shrink-0 text-muted-foreground" />
                <span className="truncate flex-1 text-sm">
                  {conversation.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 rounded transition-all"
                  aria-label="Delete conversation"
                >
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </button>
            ))}

            {conversations.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                No conversations yet
              </p>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default ChatSidebar;
