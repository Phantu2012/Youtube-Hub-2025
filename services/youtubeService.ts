import { YouTubeStats, ViewHistoryData, YouTubeVideoDetails, Dream100Video, ChannelStats } from '../types';

// This service fetches real video statistics from the YouTube Data API v3.

const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// Generates a plausible view history chart based on a total view count.
// The YouTube API does not provide this historical data in a simple way.
const generateViewHistory = (totalViews: number): ViewHistoryData[] => {
    if (totalViews <= 0) return [];

    const history: ViewHistoryData[] = [];
    const days = 30;
    let accumulatedViews = 0;

    for (let i = 0; i < days; i++) {
        const day = days - i;
        const growthFactor = Math.pow(0.85, i) * Math.random() * 0.5 + 0.01;
        let dailyViews = (totalViews - accumulatedViews) * growthFactor;

        if (i === days - 1) {
            dailyViews = totalViews - accumulatedViews;
        }

        accumulatedViews += dailyViews;
        history.push({ daysAgo: day, views: Math.floor(accumulatedViews) });
    }
    
    return history.sort((a,b) => a.daysAgo - b.daysAgo);
};

export const fetchVideoStats = async (youtubeLink: string, apiKey: string): Promise<{ stats: YouTubeStats; history: ViewHistoryData[] } | null> => {
    if (!apiKey) {
        throw new Error("YouTube API Key is missing. Please set it in the settings.");
    }
    
    const videoId = extractVideoId(youtubeLink);
    if (!videoId) {
        // Don't throw an error for an invalid link, just return null so the UI can clear stats.
        return null;
    }
    
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
            console.error('YouTube API Error:', errorMessage);
            // Provide a more user-friendly message for common errors
            if (response.status === 400 || response.status === 403) {
                 throw new Error('API key is invalid or has restrictions. Please check your key.');
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found. Please check the YouTube link.');
        }

        const statistics = data.items[0].statistics;
        
        const stats: YouTubeStats = {
            views: parseInt(statistics.viewCount, 10) || 0,
            likes: parseInt(statistics.likeCount, 10) || 0,
            comments: parseInt(statistics.commentCount, 10) || 0,
        };

        const history = generateViewHistory(stats.views);

        return { stats, history };

    } catch (error) {
        console.error('Failed to fetch video stats:', error);
        throw error;
    }
};


export const fetchVideoDetails = async (youtubeLink: string, apiKey: string): Promise<YouTubeVideoDetails | null> => {
    if (!apiKey) {
        throw new Error("YouTube API Key is missing. Please set it in the settings.");
    }
    
    const videoId = extractVideoId(youtubeLink);
    if (!videoId) {
        return null; // Invalid link is not an error, just no details.
    }
    
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
            console.error('YouTube API Error:', errorMessage);
            if (response.status === 400 || response.status === 403) {
                 throw new Error('API key is invalid or has restrictions. Please check your key.');
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found. Please check the YouTube link.');
        }

        const snippet = data.items[0].snippet;
        
        const details: YouTubeVideoDetails = {
            title: snippet.title || '',
            description: snippet.description || '',
            tags: snippet.tags || [],
            thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
            channelTitle: snippet.channelTitle || '',
            publishedAt: snippet.publishedAt || new Date().toISOString(),
        };

        return details;

    } catch (error) {
        console.error('Failed to fetch video details:', error);
        throw error;
    }
};

export const fetchFullVideoDetailsForDream100 = async (youtubeLink: string, apiKey: string): Promise<Omit<Dream100Video, 'status'> | null> => {
    if (!apiKey) {
        throw new Error("YouTube API Key is missing. Please set it in the settings.");
    }
    
    const videoId = extractVideoId(youtubeLink);
    if (!videoId) {
        return null;
    }
    
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
            console.error('YouTube API Error:', errorMessage);
            if (response.status === 400 || response.status === 403) {
                    throw new Error('API key is invalid or has restrictions. Please check your key.');
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found. Please check the YouTube link.');
        }
        
        const item = data.items[0];
        const snippet = item.snippet;
        const statistics = item.statistics;
        
        const details: Omit<Dream100Video, 'status'> = {
            id: videoId,
            title: snippet.title || '',
            description: snippet.description || '',
            tags: snippet.tags || [],
            thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
            channelTitle: snippet.channelTitle || '',
            viewCount: parseInt(statistics.viewCount, 10) || 0,
            likeCount: parseInt(statistics.likeCount, 10) || 0,
            commentCount: parseInt(statistics.commentCount, 10) || 0,
            publishedAt: snippet.publishedAt || new Date().toISOString(),
            youtubeLink: `https://www.youtube.com/watch?v=${videoId}`,
        };

        return details;

    } catch (error) {
        console.error('Failed to fetch full video details:', error);
        throw error;
    }
};

const extractChannelIdentifier = (url: string): { type: 'id' | 'handle', value: string } | null => {
    if (!url) return null;
    let match = url.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
    if (match && match[1]) {
        return { type: 'id', value: match[1] };
    }
    match = url.match(/@([a-zA-Z0-9_.-]+)/);
    if (match && match[1]) {
        return { type: 'handle', value: match[1] };
    }
    return null;
};

export const fetchChannelStats = async (channelUrl: string, apiKey: string): Promise<ChannelStats | null> => {
    if (!apiKey) {
        throw new Error("YouTube API Key is missing.");
    }
    
    const identifier = extractChannelIdentifier(channelUrl);
    if (!identifier) {
        return null;
    }

    let channelId = '';

    if (identifier.type === 'id') {
        channelId = identifier.value;
    } else if (identifier.type === 'handle') {
        // Use Search API to find channel ID from handle
        const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=id&q=${identifier.value}&type=channel&key=${apiKey}`);
        if (!searchResponse.ok) {
            throw new Error('Failed to resolve channel handle.');
        }
        const searchData = await searchResponse.json();
        if (!searchData.items || searchData.items.length === 0) {
            throw new Error(`Could not find a channel with handle: @${identifier.value}`);
        }
        channelId = searchData.items[0].id.channelId;
    }

    if (!channelId) {
        return null;
    }

    const statsResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`);
     if (!statsResponse.ok) {
        const errorData = await statsResponse.json();
        throw new Error(errorData.error?.message || 'Could not fetch channel statistics.');
    }

    const statsData = await statsResponse.json();
    if (!statsData.items || statsData.items.length === 0) {
        return null;
    }

    const statistics = statsData.items[0].statistics;
    
    return {
        subscriberCount: parseInt(statistics.subscriberCount, 10) || 0,
        viewCount: parseInt(statistics.viewCount, 10) || 0,
        videoCount: parseInt(statistics.videoCount, 10) || 0,
    };
};