"use client";

interface UrlInputProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="M8 7.5l4 2.5-4 2.5V7.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function UrlInput({ urls, onChange, disabled }: UrlInputProps) {
  const addUrl = () => {
    if (urls.length < 5) onChange([...urls, ""]);
  };

  const isInstagram = (url: string) => url.includes("instagram.com");

  const updateUrl = (index: number, value: string) => {
    const updated = [...urls];
    updated[index] = value;
    onChange(updated);
  };

  const removeUrl = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-8">
      <label className="block font-sans text-xs font-bold text-forest uppercase tracking-widest mb-3">
        Recipe videos
      </label>
      <div className="space-y-3">
        {urls.map((url, i) => (
          <div key={i} className={`flex items-center gap-2 ${isInstagram(url) ? "mb-6" : ""}`}>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bark-muted pointer-events-none">
                <VideoIcon />
              </span>
              <input
                type="url"
                placeholder="Paste a TikTok URL"
                value={url}
                onChange={(e) => updateUrl(i, e.target.value)}
                disabled={disabled}
                className={`w-full pl-10 pr-4 py-4 bg-cream border-2 rounded-2xl font-sans text-sm text-bark placeholder:text-bark/30 focus:outline-none transition-colors disabled:opacity-50 ${isInstagram(url) ? "border-terra focus:border-terra" : "border-parchment focus:border-forest"}`}
              />
              {isInstagram(url) && (
                <p className="absolute -bottom-5 left-1 font-sans text-xs text-terra">
                  Instagram not supported yet — TikTok only
                </p>
              )}
            </div>
            {urls.length > 1 && (
              <button
                onClick={() => removeUrl(i)}
                disabled={disabled}
                aria-label="Remove URL"
                className="w-10 h-10 rounded-full bg-terra-pale text-terra hover:bg-terra hover:text-white transition-colors flex items-center justify-center text-sm font-bold disabled:opacity-40 shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      {urls.length < 5 && (
        <button
          onClick={addUrl}
          disabled={disabled}
          className="mt-4 font-sans text-sm font-semibold text-forest hover:text-forest-dark flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <span className="w-5 h-5 bg-forest-pale rounded-full flex items-center justify-center text-forest text-xs font-bold">＋</span>
          Add another recipe
        </button>
      )}
    </div>
  );
}
