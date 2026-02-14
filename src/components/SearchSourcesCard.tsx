import { Globe, ExternalLink } from "lucide-react";

interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

interface SearchSourcesCardProps {
  sources: SearchSource[];
}

const SearchSourcesCard = ({ sources }: SearchSourcesCardProps) => {
  if (sources.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-border bg-card p-3 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Globe size={14} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Sources searched</span>
      </div>
      <div className="space-y-1.5">
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 px-2.5 py-2 rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=16`}
              alt=""
              className="w-4 h-4 mt-0.5 rounded-sm shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{source.title || new URL(source.url).hostname}</p>
              <p className="text-[10px] text-muted-foreground truncate">{new URL(source.url).hostname}</p>
            </div>
            <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SearchSourcesCard;
export type { SearchSource };
