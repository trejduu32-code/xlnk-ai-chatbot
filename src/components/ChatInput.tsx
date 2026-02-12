import { useState, useRef } from "react";
import { Paperclip, Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend?: (message: string, files?: File[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const ChatInput = ({ onSend, onStop, disabled, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((message.trim() || attachedFiles.length > 0) && onSend) {
      onSend(message.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
      setMessage("");
      setAttachedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachedFiles(prev => [...prev, ...Array.from(files)]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col w-full max-w-2xl px-2 sm:px-4">
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm"
            >
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

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
              className="bg-transparent rounded-2xl border-none w-full h-[50px] text-foreground font-sans text-sm font-normal p-3 resize-none outline-none scrollbar-thin placeholder:text-foreground/80 placeholder:transition-all placeholder:duration-300 focus:placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>

          {/* Options Row */}
          <div className="flex justify-between items-end p-3 pt-0">
            {/* File Upload Button */}
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="*/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={handleFileClick}
                className="flex bg-transparent border-none cursor-pointer icon-button"
                title="Attach files"
              >
                <Paperclip size={20} />
              </button>
            </div>

            {/* Submit / Stop Button */}
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="submit-button flex p-0.5 submit-button-gradient rounded-[10px] cursor-pointer border-none outline-none transition-all duration-150"
                title="Stop generating"
              >
                <span className="w-[30px] h-[30px] p-1.5 bg-black/10 rounded-[10px] backdrop-blur-sm flex items-center justify-center">
                  <Square size={14} className="submit-icon fill-current" />
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled || (!message.trim() && attachedFiles.length === 0)}
                className="submit-button flex p-0.5 submit-button-gradient rounded-[10px] cursor-pointer border-none outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="w-[30px] h-[30px] p-1.5 bg-black/10 rounded-[10px] backdrop-blur-sm flex items-center justify-center">
                  <Send size={18} className="submit-icon" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
