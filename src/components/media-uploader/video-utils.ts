
// Function to extract video ID from YouTube and Vimeo URLs
export const extractVideoInfo = (url: string): { platform: string | null; id: string | null } => {
  if (!url) return { platform: null, id: null };

  // YouTube patterns - handle both standard and shortened URLs
  const youtubeStandardRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const youtubeMatch = url.match(youtubeStandardRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return { platform: 'youtube', id: youtubeMatch[1] };
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)|player\.vimeo\.com\/video\/(\d+))/i;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && (vimeoMatch[1] || vimeoMatch[2])) {
    const vimeoId = vimeoMatch[1] || vimeoMatch[2];
    return { platform: 'vimeo', id: vimeoId };
  }

  return { platform: null, id: null };
};

// Function to get thumbnail URL based on platform and ID
export const getVideoThumbnailUrl = (platform: string | null, id: string | null): string => {
  if (!platform || !id) return '';
  
  if (platform === 'youtube') {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  } else if (platform === 'vimeo') {
    return `https://vumbnail.com/${id}.jpg`;
  }
  
  return '';
};

// Function to get embed URL for the video preview
export const getVideoEmbedUrl = (platform: string | null, id: string | null): string => {
  if (!platform || !id) return '';
  
  if (platform === 'youtube') {
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  } else if (platform === 'vimeo') {
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  
  return '';
};
