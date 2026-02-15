import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getPlaylists } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const playlists = await getPlaylists(session.accessToken);
        return NextResponse.json({ playlists });
    } catch (error: any) {
        console.error("YouTube API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch playlists" }, { status: 500 });
    }
}
