"use strict";
"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { VideoItem, PlaylistItem } from "@/lib/youtube";
import { Vibe, VIBES, getVibeForVideo } from "@/lib/vibe";
import YouTubePlayer from "@/components/YouTubePlayer";
import { Play, Pause, SkipForward, Music, LogOut, Disc, Volume2, ListMusic, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
    const { data: session } = useSession();

    // Data States
    const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
    const [allVideos, setAllVideos] = useState<VideoItem[]>([]);

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeVibe, setActiveVibe] = useState<Vibe>("All");
    const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // 1. Load playlists on mount
    useEffect(() => {
        if (session?.accessToken) {
            fetchPlaylists();
        }
    }, [session]);

    // 2. Load videos when playlist changes
    useEffect(() => {
        if (selectedPlaylistId && session?.accessToken) {
            fetchVideos(selectedPlaylistId);
        }
    }, [selectedPlaylistId, session]);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/youtube/playlists");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setPlaylists(data.playlists || []);

            // Auto-select first playlist if available (optional)
            // if (data.playlists?.length > 0) setSelectedPlaylistId(data.playlists[0].id);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchVideos = async (playlistId: string) => {
        setLoading(true);
        setAllVideos([]);
        try {
            const res = await fetch(`/api/youtube/uploads?playlistId=${playlistId}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setAllVideos(data.videos || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredVideos = useMemo(() => {
        if (activeVibe === "All") return allVideos;
        return allVideos.filter(v => getVibeForVideo(v.title, v.description).includes(activeVibe));
    }, [allVideos, activeVibe]);

    const playRandom = () => {
        if (filteredVideos.length === 0) return;
        const randomIndex = Math.floor(Math.random() * filteredVideos.length);
        setCurrentVideo(filteredVideos[randomIndex]);
        setIsPlaying(true);
    };

    const handleNext = () => {
        playRandom();
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Music size={18} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Vibe Player
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500 font-medium hidden sm:block">{session?.user?.email}</span>
                    <button
                        onClick={() => signOut()}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
                {!selectedPlaylistId ? (
                    /* Playlist Selection View */
                    <section className="max-w-2xl mx-auto py-12">
                        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-zinc-500 mb-8">Select a playlist from your library to start playing.</p>

                        <div className="space-y-3">
                            {loading && playlists.length === 0 ? (
                                <div className="py-20 text-center">Loading playlists...</div>
                            ) : (
                                playlists.map(pl => (
                                    <button
                                        key={pl.id}
                                        onClick={() => setSelectedPlaylistId(pl.id)}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition group text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-purple-400 transition">
                                                <ListMusic size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{pl.title}</h3>
                                                <p className="text-xs text-zinc-500 mt-1">Playlist</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-zinc-600 group-hover:text-white transition" />
                                    </button>
                                ))
                            )}
                            {!loading && playlists.length === 0 && (
                                <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <p className="text-zinc-500 mb-4">No playlists found in your account.</p>
                                    <p className="text-xs text-zinc-600">YouTube Musicで再生したい曲を入れたプレイリストを作成してください。</p>
                                </div>
                            )}
                        </div>
                    </section>
                ) : (
                    /* Player View */
                    <>
                        {/* Back to Playlists */}
                        <button
                            onClick={() => setSelectedPlaylistId(null)}
                            className="mb-8 text-xs font-medium text-zinc-500 hover:text-white transition flex items-center gap-2"
                        >
                            <ChevronRight className="rotate-180" size={14} />
                            Switch Playlist
                        </button>

                        {/* Vibe Selector */}
                        <section className="mb-12">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-6">Select Your Vibe</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                <button
                                    onClick={() => setActiveVibe("All")}
                                    className={`py-4 rounded-2xl border transition-all duration-300 ${activeVibe === "All" ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                                >
                                    <span className="text-sm font-medium">✨ All</span>
                                </button>
                                {(Object.entries(VIBES) as [Vibe, typeof VIBES.Uptempo][]).map(([key, vibe]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveVibe(key)}
                                        className={`relative py-4 rounded-2xl border overflow-hidden transition-all duration-300 group ${activeVibe === key ? 'border-white/30' : 'border-transparent hover:border-white/10 bg-white/5'}`}
                                    >
                                        {activeVibe === key && (
                                            <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${vibe.color}`} />
                                        )}
                                        <span className="relative text-sm font-medium z-10">{vibe.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <section className="lg:col-span-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                                        {activeVibe === "All" ? "Songs" : `${VIBES[activeVibe as keyof typeof VIBES].label} Only`}
                                    </h2>
                                    <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded">{filteredVideos.length} items</span>
                                </div>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-sm text-zinc-400">Loading songs...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {filteredVideos.map((video) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                key={video.id}
                                                onClick={() => {
                                                    setCurrentVideo(video);
                                                    setIsPlaying(true);
                                                }}
                                                className={`group flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer ${currentVideo?.id === video.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'}`}
                                            >
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg shrink-0">
                                                    <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-medium truncate group-hover:text-purple-400 transition">{video.title}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getVibeForVideo(video.title, video.description).map(v => (
                                                            <span key={v} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-500">{v}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {filteredVideos.length === 0 && (
                                            <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl">
                                                <p className="text-sm text-zinc-500">No songs found for this vibe.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>

                            <aside className="lg:col-span-4 space-y-6">
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10 shadow-xl overflow-hidden relative">
                                    <div className="relative z-10">
                                        <h3 className="font-bold mb-2">Vibe Mix</h3>
                                        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                                            Shuffle all {activeVibe === "All" ? "available" : activeVibe} music from this playlist.
                                        </p>
                                        <button
                                            onClick={playRandom}
                                            disabled={filteredVideos.length === 0}
                                            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition active:scale-95 disabled:opacity-50"
                                        >
                                            Start Vibe
                                        </button>
                                    </div>
                                    <Disc className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32 rotate-12" />
                                </div>
                            </aside>
                        </div>
                    </>
                )}
            </main>

            {/* Player Bar */}
            <AnimatePresence>
                {currentVideo && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-6 left-6 right-6 z-50 pointer-events-none"
                    >
                        <div className="max-w-5xl mx-auto p-4 rounded-3xl bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pointer-events-auto">
                            <YouTubePlayer
                                videoId={currentVideo.resourceId}
                                playing={isPlaying}
                                onEnd={handleNext}
                            />

                            <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                                <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg shrink-0 relative">
                                    <img src={currentVideo.thumbnailUrl} alt="" className={`w-full h-full object-cover ${isPlaying ? 'animate-[pulse_4s_infinite]' : ''}`} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold truncate">{currentVideo.title}</h4>
                                    <p className="text-xs text-zinc-500 mt-1">Now Playing</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 grow justify-center">
                                <button className="text-zinc-500 hover:text-white transition rotate-180">
                                    <SkipForward size={24} />
                                </button>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg shrink-0"
                                >
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} fill="black" />}
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="text-zinc-500 hover:text-white transition"
                                >
                                    <SkipForward size={24} />
                                </button>
                            </div>

                            <div className="hidden md:flex items-center gap-4 w-40 justify-end">
                                <Volume2 size={18} className="text-zinc-500" />
                                <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="w-2/3 h-full bg-white/40" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
