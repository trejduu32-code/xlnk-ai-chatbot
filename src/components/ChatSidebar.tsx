import { Plus, MessageSquare, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/hooks/useConversations";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

const ChatSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ChatSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={cn(
        "border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-14" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Sparkles className="text-foreground" size={20} />
              <span className="font-semibold text-foreground">Xlnk AI</span>
            </div>
          )}
          <SidebarTrigger className="ml-auto" />
        </div>
        
        <Button
          onClick={onNewConversation}
          variant="secondary"
          size={collapsed ? "icon" : "default"}
          className="w-full mt-3"
        >
          <Plus size={18} />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <ScrollArea className="h-[calc(100vh-140px)]">
          <SidebarMenu>
            {conversations.map((conversation) => (
              <SidebarMenuItem key={conversation.id}>
                <SidebarMenuButton
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    "w-full justify-start group",
                    activeConversationId === conversation.id && "bg-accent"
                  )}
                >
                  <MessageSquare size={16} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left text-sm">
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
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};

export default ChatSidebar;
