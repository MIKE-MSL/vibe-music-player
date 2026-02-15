import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getUploads, getPlaylistItems } from "@/lib/youtube";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get("playlistId");

    try {
        let videos;
        if (playlistId) {
            videos = await getPlaylistItems(session.accessToken, playlistId);
        } else {
            videos = await getUploads(session.accessToken);
        }
        return NextResponse.json({ videos });
    } catch (error: any) {
        console.error("YouTube API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch videos" }, { status: 500 });
    }
}
