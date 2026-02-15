import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export const getYouTubeClient = (accessToken: string) => {
    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });

    return google.youtube({ version: "v3", auth });
};

export interface VideoItem {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    resourceId: string; // The actual video ID
    publishedAt: string;
}

export interface PlaylistItem {
    id: string;
    title: string;
}

export const getPlaylists = async (accessToken: string): Promise<PlaylistItem[]> => {
    const youtube = getYouTubeClient(accessToken);
    const res = await youtube.playlists.list({
        part: ["snippet"],
        mine: true,
        maxResults: 50,
    });

    return res.data.items?.map(item => ({
        id: item.id!,
        title: item.snippet?.title || "No Title",
    })) || [];
};

export const getPlaylistItems = async (accessToken: string, playlistId: string): Promise<VideoItem[]> => {
    const youtube = getYouTubeClient(accessToken);
    const playlistResponse = await youtube.playlistItems.list({
        part: ["snippet"],
        playlistId: playlistId,
        maxResults: 50,
    });

    const videos = playlistResponse.data.items?.map((item) => ({
        id: item.id!,
        title: item.snippet?.title || "No Title",
        description: item.snippet?.description || "",
        thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || "",
        resourceId: item.snippet?.resourceId?.videoId!,
        publishedAt: item.snippet?.publishedAt || "",
    })) || [];

    return videos;
};

// Keep existing for backward compatibility or fallback
export const getUploads = async (accessToken: string): Promise<VideoItem[]> => {
    const youtube = getYouTubeClient(accessToken);
    const channelResponse = await youtube.channels.list({
        part: ["contentDetails"],
        mine: true,
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        throw new Error("Channel not found");
    }

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) throw new Error("Uploads playlist not found");

    return getPlaylistItems(accessToken, uploadsPlaylistId);
};
