
export interface VideoInfo {
  platform: 'youtube' | 'vimeo' | 'file' | null;
  id?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
}

/**
 * Extract video information from a URL
 */
export const extractVideoInfo = (url: string): VideoInfo => {
  // YouTube URL patterns
  const youtubePatterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i
  ];

  // Vimeo URL patterns
  const vimeoPatterns = [
    /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/i,
    /(?:https?:\/\/)?(?:player\.)?vimeo\.com\/video\/(\d+)/i
  ];

  // Check YouTube patterns
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        platform: 'youtube',
        id: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
        thumbnailUrl: `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
      };
    }
  }

  // Check Vimeo patterns
  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        platform: 'vimeo',
        id: match[1],
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
        // Vimeo requires an API call to get the thumbnail URL, so we leave it undefined
        thumbnailUrl: undefined
      };
    }
  }

  // Direct video file URL
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  if (videoExtensions.some(ext => url.toLowerCase().includes(ext))) {
    return {
      platform: 'file',
      thumbnailUrl: undefined
    };
  }

  // Not a recognized video URL
  return {
    platform: null
  };
};

/**
 * Get the appropriate thumbnail URL for a video
 */
export const getVideoThumbnailUrl = async (videoInfo: VideoInfo): Promise<string | undefined> => {
  if (!videoInfo.platform) return undefined;

  if (videoInfo.platform === 'youtube' && videoInfo.id) {
    return `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`;
  }
  
  if (videoInfo.platform === 'vimeo' && videoInfo.id) {
    try {
      // This requires a CORS proxy in production
      const response = await fetch(`https://vimeo.com/api/v2/video/${videoInfo.id}.json`);
      const data = await response.json();
      return data[0]?.thumbnail_large;
    } catch (error) {
      console.error('Error fetching Vimeo thumbnail:', error);
      return undefined;
    }
  }

  return undefined;
};
