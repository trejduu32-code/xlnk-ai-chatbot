import { useState } from "react";
import { Paperclip, Globe, LayoutGrid, Send } from "lucide-react";

interface ChatInputProps {
  onSend?: (message: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

const models = [
  { value: "https://xlnk-350m.hf.space/v1/chat/completions", label: "Xlnkai 350M (Fastest)" },
  { value: "https://xlnk-ai.hf.space/v1/chat/completions", label: "Xlnkai 700M (Balanced)" },
  { value: "https://xlnk-corelm.hf.space/v1/chat/completions", label: "Xlnkai 1B (Best)" },
];

const ChatInput = ({ onSend, selectedModel, onModelChange, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim() && onSend) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md">
      {/* Model Selector */}
      <div className="mb-3">
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full bg-secondary text-foreground text-sm px-3 py-2 rounded-xl border border-border outline-none focus:ring-1 focus:ring-ring transition-all cursor-pointer"
        >
          {models.map((model) => (
            <option key={model.value} value={model.value} className="bg-popover">
              {model.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Input Container */}
      <div className="relative chat-container-gradient rounded-2xl p-[1.5px] overflow-hidden chat-glow">
        <div className="chat-inner rounded-[15px] w-full overflow-hidden">
          {/* Textarea */}
          <div className="relative flex">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ask Xlnk Ai...✦˚"
              disabled={disabled}
              className="bg-transparent rounded-2xl border-none w-full h-[50px] text-foreground font-sans text-xs font-normal p-3 resize-none outline-none scrollbar-thin placeholder:text-foreground/80 placeholder:transition-all placeholder:duration-300 focus:placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>

          {/* Options Row */}
          <div className="flex justify-between items-end p-3 pt-0">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button type="button" className="flex bg-transparent border-none cursor-pointer icon-button">
                <Paperclip size={20} />
              </button>
              <button type="button" className="flex bg-transparent border-none cursor-pointer icon-button">
                <LayoutGrid size={20} />
              </button>
              <button type="button" className="flex bg-transparent border-none cursor-pointer icon-button">
                <Globe size={20} />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || !message.trim()}
              className="submit-button flex p-0.5 submit-button-gradient rounded-[10px] cursor-pointer border-none outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="w-[30px] h-[30px] p-1.5 bg-black/10 rounded-[10px] backdrop-blur-sm flex items-center justify-center">
                <Send size={18} className="submit-icon" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tags */}
      <div className="pt-3 flex text-foreground text-[10px] gap-1 flex-wrap">
        <span className="px-2 py-1 bg-secondary border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors select-none">
          Help me code
        </span>
        <span className="px-2 py-1 bg-secondary border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors select-none">
          Explain this
        </span>
        <span className="px-2 py-1 bg-secondary border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors select-none">
          Summarize
        </span>
      </div>
    </div>
  );
};

export default ChatInput;
