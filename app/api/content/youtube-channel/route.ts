import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 1800; // Cache for 30 minutes

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YOUTUBE_CHANNEL_INPUT = process.env.YOUTUBE_CHANNEL_ID || "";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  watchUrl: string;
}

interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId?: string;
  };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

interface YouTubeChannelItem {
  id: string;
}

async function resolveChannelId(input: string): Promise<string> {
  if (!input) return "";

  // Already a channel ID
  if (input.startsWith("UC") && input.length >= 20) {
    return input;
  }

  // Handle like @BUACOfficial
  const handle = input.startsWith("@") ? input : `@${input}`;

  const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(
    handle,
  )}&key=${YOUTUBE_API_KEY}`;

  const response = await fetch(url, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    console.error(
      "Failed to resolve YouTube channel handle:",
      await response.text(),
    );
    return "";
  }

  const data = await response.json();

  const items = data.items as YouTubeChannelItem[] | undefined;

  if (!items || items.length === 0) {
    // Try username lookup as fallback
    const fallbackUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(
      input.replace("@", ""),
    )}&key=${YOUTUBE_API_KEY}`;

    const fallbackResponse = await fetch(fallbackUrl, {
      next: { revalidate: 86400 },
    });

    if (!fallbackResponse.ok) return "";

    const fallbackData = await fallbackResponse.json();
    const fallbackItems = fallbackData.items as YouTubeChannelItem[] | undefined;

    return fallbackItems?.[0]?.id || "";
  }

  return items[0].id;
}

async function fetchChannelVideos(
  channelId: string,
  maxResults: number = 50,
): Promise<YouTubeVideo[]> {
  if (!channelId || !YOUTUBE_API_KEY) return [];

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(
    channelId,
  )}&maxResults=${maxResults}&order=date&type=video&key=${YOUTUBE_API_KEY}`;

  const response = await fetch(url, {
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    console.error(
      "Failed to fetch YouTube channel videos:",
      await response.text(),
    );
    return [];
  }

  const data = await response.json();
  const items = data.items as YouTubeSearchItem[] | undefined;

  if (!items) return [];

  return items
    .filter(
      (item) =>
        item.id.kind === "youtube#video" && Boolean(item.id.videoId),
    )
    .map((item) => ({
      id: item.id.videoId!,
      title: item.snippet.title,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        "",
      publishedAt: item.snippet.publishedAt,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
}

export async function GET() {
  try {
    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        {
          videos: [],
          error: "YouTube API key is not configured.",
        },
        { status: 200 },
      );
    }

    if (!YOUTUBE_CHANNEL_INPUT) {
      return NextResponse.json(
        {
          videos: [],
          error: "YouTube channel ID is not configured.",
        },
        { status: 200 },
      );
    }

    const channelId = await resolveChannelId(YOUTUBE_CHANNEL_INPUT);

    if (!channelId) {
      return NextResponse.json(
        {
          videos: [],
          error: `Could not resolve channel: ${YOUTUBE_CHANNEL_INPUT}`,
        },
        { status: 200 },
      );
    }

    const videos = await fetchChannelVideos(channelId);

    return NextResponse.json(
      {
        channelId,
        channelInput: YOUTUBE_CHANNEL_INPUT,
        totalVideos: videos.length,
        videos,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("YouTube channel API error:", error);

    return NextResponse.json(
      {
        videos: [],
        error: "Failed to fetch YouTube channel videos.",
      },
      { status: 500 },
    );
  }
}