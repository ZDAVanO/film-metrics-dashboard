"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ListFilter, ArrowUp, ArrowDown, Calendar, Tag, X, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Genre } from "@/lib/genres";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const sortOptions = [
    { label: "Most Popular", value: "popularity" },
    { label: "Top Rated", value: "rating" },
    { label: "Release Date", value: "release_date" },
    { label: "Vote Count", value: "vote_count" },
];

interface MovieFiltersProps {
    genres: Genre[];
}

export function MovieFilters({ genres }: MovieFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSort = searchParams.get("sortBy") || "popularity";
    const currentOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
    const currentInclude = searchParams.get("includeGenres")?.split(",").filter(Boolean) || [];
    const currentExclude = searchParams.get("excludeGenres")?.split(",").filter(Boolean) || [];
    const currentMinYear = parseInt(searchParams.get("minYear") || "1900");
    const currentMaxYear = parseInt(searchParams.get("maxYear") || "2026");

    const [yearRange, setYearRange] = useState([currentMinYear, currentMaxYear]);
    const [tempInclude, setTempInclude] = useState<string[]>(currentInclude);
    const [tempExclude, setTempExclude] = useState<string[]>(currentExclude);

    useEffect(() => {
        setYearRange([currentMinYear, currentMaxYear]);
        setTempInclude(currentInclude);
        setTempExclude(currentExclude);
    }, [currentMinYear, currentMaxYear, searchParams]);

    const updateParams = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === "" || value === "all") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        // Omit default values to keep URL clean
        if (params.get("minYear") === "1900") params.delete("minYear");
        if (params.get("maxYear") === "2026") params.delete("maxYear");
        if (params.get("sortBy") === "popularity") params.delete("sortBy");
        if (params.get("sortOrder") === "desc") params.delete("sortOrder");
        if (params.get("page") === "1") params.delete("page");

        // If we just added include/exclude, remove the old single 'genre' param if it exists
        if (newParams.includeGenres || newParams.excludeGenres) {
            params.delete("genre");
        }

        // Always clean up old cursor params
        params.delete("afterVal");
        params.delete("afterId");
        params.delete("beforeVal");
        params.delete("beforeId");

        const queryString = params.toString();
        router.push(queryString ? `/browser?${queryString}` : "/browser");
    };

    const handleSortChange = (value: string) => {
        updateParams({ sortBy: value });
    };

    const toggleOrder = () => {
        const nextOrder = currentOrder === "desc" ? "asc" : "desc";
        updateParams({ sortOrder: nextOrder });
    };

    const toggleGenre = (genreName: string) => {
        if (tempInclude.includes(genreName)) {
            // Move from Include to Exclude
            setTempInclude(prev => prev.filter(g => g !== genreName));
            setTempExclude(prev => [...prev, genreName]);
        } else if (tempExclude.includes(genreName)) {
            // Move from Exclude to Neutral
            setTempExclude(prev => prev.filter(g => g !== genreName));
        } else {
            // Move from Neutral to Include
            setTempInclude(prev => [...prev, genreName]);
        }
    };

    const applyGenreFilters = () => {
        updateParams({
            includeGenres: tempInclude.join(","),
            excludeGenres: tempExclude.join(",")
        });
    };

    const applyYearFilter = () => {
        updateParams({
            minYear: yearRange[0].toString(),
            maxYear: yearRange[1].toString()
        });
    };

    const resetFilters = () => {
        router.push("/browser");
    };

    const hasFilters = currentInclude.length > 0 || currentExclude.length > 0 || currentMinYear !== 1900 || currentMaxYear !== 2026;

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Advanced Genre Filter */}
            <Popover>
                <div className="flex items-center gap-1">
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "rounded-full bg-muted/20 border-border/60 font-medium text-xs h-9 px-4 gap-2 transition-all",
                                (currentInclude.length > 0 || currentExclude.length > 0) && "border-primary/50 bg-primary/5 text-primary pr-2"
                            )}
                        >
                            <Tag className="size-3.5" />
                            <span>Genres</span>
                            {(currentInclude.length > 0 || currentExclude.length > 0) && (
                                <div className="flex items-center gap-1.5 ml-1">
                                    <Badge variant="secondary" className="h-4 px-1 min-w-[1.25rem] text-[10px] rounded-full bg-primary text-primary-foreground">
                                        {currentInclude.length + currentExclude.length}
                                    </Badge>
                                    <div
                                        role="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            updateParams({ includeGenres: null, excludeGenres: null });
                                        }}
                                        className="hover:bg-primary/20 p-0.5 rounded-full transition-colors flex items-center justify-center -mr-1"
                                    >
                                        <X className="size-3" />
                                    </div>
                                </div>
                            )}
                        </Button>
                    </PopoverTrigger>
                </div>
                <PopoverContent className="w-[480px] rounded-2xl border-border/60 p-0 bg-background/95 backdrop-blur-md shadow-xl overflow-hidden" align="start">
                    <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/30">
                        <h4 className="font-bold text-sm">Filter by Genre</h4>
                        <div className="flex gap-4 text-[10px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1"><div className="size-2 bg-emerald-500 rounded-full" /> Include</span>
                            <span className="flex items-center gap-1"><div className="size-2 bg-rose-500 rounded-full" /> Exclude</span>
                        </div>
                    </div>

                    <div className="p-4 grid grid-cols-3 gap-2">
                        {genres.map((genre) => {
                            const isIncluded = tempInclude.includes(genre.genre_name);
                            const isExcluded = tempExclude.includes(genre.genre_name);

                            return (
                                <button
                                    key={genre.id}
                                    onClick={() => toggleGenre(genre.genre_name)}
                                    className={cn(
                                        "group flex items-center px-2 py-2 rounded-xl text-xs font-bold transition-all border relative w-full text-left",
                                        isIncluded ? "bg-emerald-500 text-white border-emerald-600 shadow-sm" :
                                            isExcluded ? "bg-rose-500 text-white border-rose-600 shadow-sm line-through decoration-white/50" :
                                                "bg-muted/40 text-muted-foreground border-border/40 hover:border-border/80 hover:bg-muted/60"
                                    )}
                                >
                                    <div className="flex items-center justify-center w-4 mr-1.5 transition-all shrink-0">
                                        {isIncluded ? <Check className="size-3 animate-in zoom-in duration-200" /> :
                                            isExcluded ? <Minus className="size-3 animate-in zoom-in duration-200" /> :
                                                <div className="size-1 bg-muted-foreground/30 rounded-full group-hover:bg-primary/50 group-hover:scale-125 transition-all" />}
                                    </div>
                                    <span className="truncate">{genre.genre_name}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-4 bg-muted/30 border-t border-border/40 flex justify-end">
                        <Button
                            size="sm"
                            className="px-8 rounded-xl text-xs font-bold"
                            onClick={applyGenreFilters}
                        >
                            Apply Filter
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Year Range Filter */}
            <Popover>
                <div className="flex items-center gap-1">
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "rounded-full bg-muted/20 border-border/60 font-medium text-xs h-9 px-4 gap-2 transition-all",
                                (currentMinYear !== 1900 || currentMaxYear !== 2026) && "border-primary/50 bg-primary/5 text-primary pr-2"
                            )}
                        >
                            <Calendar className="size-3.5" />
                            <span>
                                {currentMinYear === 1900 && currentMaxYear === 2026
                                    ? "Years"
                                    : `${currentMinYear} - ${currentMaxYear}`}
                            </span>
                            {(currentMinYear !== 1900 || currentMaxYear !== 2026) && (
                                <div
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        updateParams({ minYear: null, maxYear: null });
                                    }}
                                    className="hover:bg-primary/20 p-0.5 rounded-full transition-colors flex items-center justify-center ml-1"
                                >
                                    <X className="size-3" />
                                </div>
                            )}
                        </Button>
                    </PopoverTrigger>
                </div>
                <PopoverContent className="w-80 rounded-2xl border-border/60 p-6 bg-background/95 backdrop-blur-md shadow-xl" align="start">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm">Release Years</h4>
                            <span className="text-xs text-muted-foreground font-mono">
                                {yearRange[0]} — {yearRange[1]}
                            </span>
                        </div>

                        <div className="py-2">
                            <Slider
                                value={yearRange}
                                min={1900}
                                max={2026}
                                step={1}
                                onValueChange={setYearRange}
                                className="my-4"
                            />
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button
                                size="sm"
                                className="px-8 rounded-xl text-xs font-bold"
                                onClick={applyYearFilter}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
                <Select value={currentSort} onValueChange={handleSortChange}>
                    <SelectTrigger className="rounded-full bg-muted/20 border-border/60 font-medium text-xs focus:ring-primary/20 h-9 min-w-[130px]">
                        <div className="flex items-center gap-2">
                            <ListFilter className="size-3.5 text-primary" />
                            <SelectValue placeholder="Sort by" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/60 bg-background/95 backdrop-blur-md">
                        {sortOptions.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-xs font-medium rounded-lg cursor-pointer transition-colors focus:bg-primary/10 focus:text-primary"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleOrder}
                    className="rounded-full size-9 bg-muted/20 border-border/60 hover:bg-primary/10 hover:text-primary transition-all active:scale-95 shrink-0"
                    title={currentOrder === "desc" ? "Descending" : "Ascending"}
                >
                    {currentOrder === "desc" ? (
                        <ArrowDown className="size-4" />
                    ) : (
                        <ArrowUp className="size-4" />
                    )}
                </Button>
            </div>


        </div>
    );
}
