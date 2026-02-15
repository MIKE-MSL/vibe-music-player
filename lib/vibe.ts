export type Vibe = "Uptempo" | "Jazzy" | "Chill" | "Nature" | "All";

export interface VibeData {
    label: string;
    keywords: string[];
    color: string;
}

export const VIBES: Record<Exclude<Vibe, "All">, VibeData> = {
    Uptempo: {
        label: "Uptempo (元気)",
        keywords: ["remix", "up", "dance", "electro", "fast", "rock", "pop", "beat"],
        color: "from-orange-400 to-red-600",
    },
    Jazzy: {
        label: "Jazzy (おしゃれ)",
        keywords: ["jazz", "piano", "saxophone", "lounge", "bossa", "smooth"],
        color: "from-blue-400 to-indigo-600",
    },
    Chill: {
        label: "Chill (ゆったり)",
        keywords: ["chill", "lofi", "relax", "sleep", "study", "ambient", "soft"],
        color: "from-teal-400 to-emerald-600",
    },
    Nature: {
        label: "Nature (自然)",
        keywords: ["nature", "forest", "rain", "ocean", "bird", "wind", "water"],
        color: "from-green-400 to-lime-600",
    },
};

export const getVibeForVideo = (title: string, description: string): Vibe[] => {
    const text = (title + " " + description).toLowerCase();
    const detected: Vibe[] = [];

    (Object.entries(VIBES) as [Exclude<Vibe, "All">, VibeData][]).forEach(([vibe, data]) => {
        if (data.keywords.some(keyword => text.includes(keyword))) {
            detected.push(vibe);
        }
    });

    return detected;
};
