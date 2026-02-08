import { useState, useRef, useEffect } from "react";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import ChatSidebar from "@/components/ChatSidebar";
import { Sparkles, Menu } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";

const models = [
  { value: "https://xlnk-350m.hf.space/v1/chat/completions", label: "350M" },
  { value: "https://xlnk-ai.hf.space/v1/chat/completions", label: "700M" },
  { value: "https://xlnk-corelm.hf.space/v1/chat/completions", label: "1B" },
];

const Index = () => {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    deleteConversation,
    addMessage,
  } = useConversations();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("https://xlnk-ai.hf.space/v1/chat/completions");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = activeConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message: string, files?: File[]) => {
    let conversationId = activeConversationId;

    // Create new conversation if none exists
    if (!conversationId) {
      conversationId = createConversation();
    }

    // Build message content with file info
    let fullMessage = message;
    if (files && files.length > 0) {
      const fileNames = files.map(f => f.name).join(", ");
      fullMessage = message ? `${message}\n\n[Attached files: ${fileNames}]` : `[Attached files: ${fileNames}]`;
    }

    addMessage(conversationId, { role: "user", content: fullMessage });
    setIsLoading(true);

    try {
      const allMessages = [...messages, { role: "user" as const, content: fullMessage }];

      const response = await fetch(selectedModel, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          max_tokens: 512,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

      addMessage(conversationId, { role: "assistant", content: assistantContent });
    } catch (error) {
      console.error("Error:", error);
      addMessage(conversationId, { role: "assistant", content: "Sorry, something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={createConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-border py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Menu size={20} className="text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="text-foreground" size={22} />
              <h1 className="text-lg font-semibold text-foreground">Xlnk AI</h1>
            </div>
          </div>

          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-secondary text-foreground text-sm px-3 py-1.5 rounded-lg border border-border outline-none focus:ring-1 focus:ring-ring transition-all cursor-pointer"
          >
            {models.map((model) => (
              <option key={model.value} value={model.value} className="bg-popover">
                {model.label}
              </option>
            ))}
          </select>
        </header>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-foreground" size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Welcome to Xlnk AI
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Your intelligent assistant powered by cutting-edge language models. Start a conversation below.
                </p>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 space-y-4 scrollbar-thin">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} role={msg.role} content={msg.content} />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Sparkles size={18} className="text-foreground animate-pulse" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-muted">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Floating Input */}
          <div className="absolute bottom-0 left-0 right-0 pb-6 pt-4 flex justify-center bg-gradient-to-t from-background via-background to-transparent">
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
