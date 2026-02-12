import { useState, useRef, useEffect, useCallback } from "react";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import ChatSidebar from "@/components/ChatSidebar";
import CalculatorCard, { tryCalculate } from "@/components/CalculatorCard";
import { Sparkles, Menu, RefreshCw } from "lucide-react";
import { useConversations, Message } from "@/hooks/useConversations";
import { readAllFiles } from "@/utils/fileReader";

const models = [
  { value: "https://xlnk-350m.hf.space/v1/chat/completions", label: "350M" },
  { value: "https://xlnk-ai.hf.space/v1/chat/completions", label: "700M" },
  { value: "https://xlnk-corelm.hf.space/v1/chat/completions", label: "1B" },
  { value: "https://xlnk-ai-corelm.hf.space/v1/chat/completions", label: "CoreLM" },
];

interface CalcResult {
  afterMessageIndex: number;
  expression: string;
  result: number | string;
}

const Index = () => {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    deleteConversation,
    addMessage,
    removeLastMessage,
  } = useConversations();

  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModel, setSelectedModel] = useState("https://xlnk-ai.hf.space/v1/chat/completions");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [calcResults, setCalcResults] = useState<CalcResult[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const messages = activeConversation?.messages || [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSend = async (message: string, files?: File[]) => {
    let conversationId = activeConversationId;

    // Create new conversation if none exists
    if (!conversationId) {
      conversationId = createConversation();
    }

    // Build message content with file contents
    let fullMessage = message;
    if (files && files.length > 0) {
      const fileContents = await readAllFiles(files);
      fullMessage = message
        ? `${message}\n\nFile contents:\n${fileContents}`
        : `Here are the file contents:\n${fileContents}`;
    }

    addMessage(conversationId, { role: "user", content: fullMessage });
    setIsLoading(true);
    setStreamingContent("");

    try {
      // Check for calculator
      const calc = tryCalculate(message);
      if (calc) {
        setCalcResults(prev => [...prev, { afterMessageIndex: messages.length, expression: calc.expression, result: calc.result }]);
      }

      const allMessages = [...messages, { role: "user" as const, content: fullMessage }];

      const controller = new AbortController();
      abortControllerRef.current = controller;

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
          max_tokens: -1,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Check if streaming is supported
      if (response.headers.get("content-type")?.includes("text/event-stream") || response.body) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = "";

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content || "";
                    if (delta) {
                      accumulatedContent += delta;
                      setStreamingContent(accumulatedContent);
                    }
                  } catch {
                    // If it's not JSON, it might be the full response
                    if (data && !data.startsWith("{")) {
                      accumulatedContent += data;
                      setStreamingContent(accumulatedContent);
                    }
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }

          // If we got streaming content, add it as the final message
          if (accumulatedContent) {
            addMessage(conversationId, { role: "assistant", content: accumulatedContent });
          }
        }
      } else {
        // Fallback to non-streaming response
        const data = await response.json();
        const assistantContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
        
        // Simulate streaming effect for non-streaming responses
        const words = assistantContent.split(" ");
        let currentContent = "";
        
        for (let i = 0; i < words.length; i++) {
          currentContent += (i === 0 ? "" : " ") + words[i];
          setStreamingContent(currentContent);
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        addMessage(conversationId, { role: "assistant", content: assistantContent });
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        // User stopped generation — save what we have
        if (streamingContent) {
          addMessage(conversationId, { role: "assistant", content: streamingContent });
        }
      } else {
        console.error("Error:", error);
        addMessage(conversationId, { role: "assistant", content: "Sorry, something went wrong. Please try again." });
      }
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  const handleRegenerate = () => {
    if (!activeConversationId || messages.length < 2) return;
    // Remove last assistant message, then re-send the last user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (!lastUserMsg) return;
    removeLastMessage(activeConversationId);
    // Small delay to let state update
    setTimeout(() => {
      handleSend(lastUserMsg.content);
    }, 50);
  };

  // Combine messages with streaming content for display
  const displayMessages = [...messages];
  
  return (
    <div className="h-screen bg-background flex w-full overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={createConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="border-b border-border py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Open chat history"
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
            className="bg-secondary text-foreground text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg border border-border outline-none focus:ring-1 focus:ring-ring transition-all cursor-pointer max-w-[100px] sm:max-w-none"
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
          {displayMessages.length === 0 && !streamingContent ? (
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
              {displayMessages.map((msg, idx) => (
                <div key={idx}>
                  <ChatMessage role={msg.role} content={msg.content} />
                  {/* Show calculator card after user message if math detected */}
                  {msg.role === "user" && calcResults.find(c => c.afterMessageIndex === idx) && (
                    <div className="mt-2 ml-0 sm:ml-11">
                      <CalculatorCard
                        expression={calcResults.find(c => c.afterMessageIndex === idx)!.expression}
                        result={calcResults.find(c => c.afterMessageIndex === idx)!.result}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Regenerate button after last assistant message */}
              {!isLoading && displayMessages.length > 0 && displayMessages[displayMessages.length - 1]?.role === "assistant" && (
                <div className="flex justify-center">
                  <button
                    onClick={handleRegenerate}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-accent border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw size={12} />
                    Regenerate response
                  </button>
                </div>
              )}
              
              {/* Streaming message */}
              {streamingContent && (
                <ChatMessage role="assistant" content={streamingContent} isStreaming />
              )}
              
              {/* Loading indicator when waiting for stream to start */}
              {isLoading && !streamingContent && (
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
              onStop={handleStop}
              disabled={isLoading}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
