import { Source } from "@/types/library.types";

export const SourceUtils = {
  detectFromUrl: (url: string): { source: Source, id: string } | null => {
    console.log('SourceUtils.detectFromUrl called with:', JSON.stringify(url));
    
    if (!url || typeof url !== 'string') return null;

    // YouTube patterns - handle both http and https, www and non-www, and extract just video ID
    const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1]; // Extract everything before any additional parameters
      console.log('YouTube match found:', videoId);
      return { source: Source.YOUTUBE, id: videoId };
    }

    // SoundCloud patterns
    const soundcloudMatch = url.match(/soundcloud\.com\/([^\/]+\/[^\/]+)/);
    if (soundcloudMatch) {
      return { source: Source.SOUNDCLOUD, id: soundcloudMatch[1] };
    }

    return null;
  },

  getSourceName: (source: Source): string => {
    switch (source) {
      case Source.YOUTUBE:
        return 'YouTube';
      case Source.SOUNDCLOUD:
        return 'SoundCloud';
      default:
        return 'Unknown';
    }
  },

  buildEmbedUrl: (source: Source, sourceId: string): string => {
    switch (source) {
      case Source.YOUTUBE:
        return `https://www.youtube.com/embed/${sourceId}`;
      case Source.SOUNDCLOUD:
        return `https://w.soundcloud.com/player/?url=https://soundcloud.com/${sourceId}`;
      default:
        return '';
    }
  }
};