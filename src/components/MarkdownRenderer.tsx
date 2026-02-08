import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface MarkdownRendererProps {
  content: string;
}

const CodeBlock = ({
  language,
  children,
}: {
  language: string | undefined;
  children: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-1.5 rounded bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? (
          <Check size={14} className="text-accent-foreground" />
        ) : (
          <Copy size={14} className="text-muted-foreground" />
        )}
      </button>
      <SyntaxHighlighter
        style={oneDark}
        language={language || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match && !className;
          
          if (isInline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <CodeBlock language={match?.[1]}>
              {String(children).replace(/\n$/, "")}
            </CodeBlock>
          );
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-3">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-semibold mb-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mb-2">{children}</h3>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-3">
              {children}
            </blockquote>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-border rounded">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-border px-3 py-2 bg-muted text-left font-semibold">
              {children}
            </th>
          );
        },
        td({ children }) {
          return <td className="border border-border px-3 py-2">{children}</td>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
