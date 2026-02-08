import { Plus, MessageSquare, Trash2, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onClose,
}: ChatSidebarProps) => {
  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-50 h-full bg-card border-r border-border transition-transform duration-300 ease-in-out",
          "w-64 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-0 md:overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-foreground" size={20} />
              <span className="font-semibold text-foreground">Chats</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded transition-colors md:hidden"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          <Button
            onClick={() => {
              onNewConversation();
              onClose();
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
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors group",
                  activeConversationId === conversation.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50 text-foreground"
                )}
              >
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate flex-1 text-sm">
                  {conversation.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
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
