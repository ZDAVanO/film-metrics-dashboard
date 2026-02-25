"use client"

import { Search, X, Filter, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { searchMovies } from "@/lib/movies";
import Image from "next/image";

const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w92";

export function SearchBar() {
    const { searchQuery, setSearchQuery } = useAppStore();
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsLoading(true);
                try {
                    const movies = await searchMovies(searchQuery);
                    setResults(movies);
                } catch (error) {
                    console.error("Search failed:", error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex-1 max-w-sm relative" ref={containerRef}>
            <div className="relative group flex items-center">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none">
                    <Search className="h-4 w-4" />
                </div>
                <Input
                    placeholder="Search films..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!isOpen && e.target.value.length >= 2) setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (searchQuery.length >= 2) setIsOpen(true);
                    }}
                    className="pl-10 h-9 sm:h-10 text-sm bg-muted/60 dark:bg-muted/30 border border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/40 rounded-full transition-all w-full placeholder:text-muted-foreground"
                />

                <div className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setResults([]);
                                setIsOpen(false);
                            }}
                            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    <Link
                        href="/browser"
                        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full hover:bg-muted/80 text-sm font-bold uppercase tracking-tight text-foreground/80 hover:text-foreground transition-all"
                    >
                        <Filter className="h-3.5 w-3.5 fill-current" />
                        <span className="hidden sm:inline">FILTER</span>
                    </Link>
                </div>
            </div>

            {/* Search Results Dropdown */}
            {isOpen && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="p-2">
                            {results.map((movie) => (
                                <Link
                                    key={movie.id}
                                    href={`/movies/${movie.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 rounded-xl transition-colors group"
                                >
                                    <div className="relative w-10 h-14 rounded-md overflow-hidden bg-muted shrink-0 border border-border/40">
                                        {movie.poster_path ? (
                                            <Image
                                                src={`${TMDB_POSTER_BASE}${movie.poster_path}`}
                                                alt={movie.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground text-center p-1">No Poster</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                            {movie.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-muted-foreground">
                                                {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
                                            </span>
                                            {movie.rating > 0 && (
                                                <div className="flex items-center gap-0.5 text-yellow-500 scale-90 origin-left">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span className="text-[10px] font-bold">{movie.rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">No movies found.</div>
                    )}
                </div>
            )}
        </div>
    );
}

