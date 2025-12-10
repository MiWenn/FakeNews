import { useState } from 'react';
import './ShareButton.css';

function ShareButton({ url, rating }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = `FakeNews Analyzer - Bewertung: ${rating}\nURL: ${url}`;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FakeNews Analyzer Ergebnis',
          text: shareText,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button onClick={handleShare} className="share-button">
      {copied ? '✓ Kopiert!' : '📤 Ergebnis teilen'}
    </button>
  );
}

export default ShareButton;
