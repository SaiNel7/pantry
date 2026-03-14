"use client";

interface UrlInputProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

export default function UrlInput({ urls, onChange, disabled }: UrlInputProps) {
  const addUrl = () => {
    if (urls.length < 5) onChange([...urls, ""]);
  };

  const updateUrl = (index: number, value: string) => {
    const updated = [...urls];
    updated[index] = value;
    onChange(updated);
  };

  const removeUrl = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-6">
      <label className="block text-bark font-sans text-sm font-semibold mb-2 tracking-wide uppercase">
        Recipe Videos
      </label>
      <div className="space-y-2">
        {urls.map((url, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="url"
              placeholder="Paste a TikTok or Instagram Reel URL"
              value={url}
              onChange={(e) => updateUrl(i, e.target.value)}
              disabled={disabled}
              className="flex-1 px-4 py-3 bg-white border-2 border-parchment rounded-lg font-sans text-sm text-bark placeholder:text-bark/30 focus:outline-none focus:border-forest transition-colors disabled:opacity-50"
            />
            {urls.length > 1 && (
              <button
                onClick={() => removeUrl(i)}
                disabled={disabled}
                className="px-3 py-3 text-terra hover:text-terra-light transition-colors disabled:opacity-50"
                aria-label="Remove URL"
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
          className="mt-3 text-forest hover:text-forest-light font-sans text-sm font-semibold transition-colors disabled:opacity-50"
        >
          + Add another recipe
        </button>
      )}
    </div>
  );
}
