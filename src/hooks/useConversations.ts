import { useState, useEffect, useCallback } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "xlnk-conversations";

const generateId = () => Math.random().toString(36).substring(2, 15);

const getInitialTitle = (firstMessage: string) => {
  const title = firstMessage.substring(0, 30);
  return title.length < firstMessage.length ? `${title}...` : title;
};

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Conversation[];
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse stored conversations", e);
      }
    }
  }, []);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const createConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeConversationId === id) {
        setActiveConversationId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [activeConversationId]);

  const addMessage = useCallback((conversationId: string, message: Message) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      
      const updatedMessages = [...c.messages, message];
      const title = c.messages.length === 0 && message.role === "user" 
        ? getInitialTitle(message.content)
        : c.title;
      
      return {
        ...c,
        messages: updatedMessages,
        title,
        updatedAt: Date.now(),
      };
    }));
  }, []);

  const clearConversation = useCallback((id: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        messages: [],
        title: "New Chat",
        updatedAt: Date.now(),
      };
    }));
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    deleteConversation,
    addMessage,
    clearConversation,
  };
};
