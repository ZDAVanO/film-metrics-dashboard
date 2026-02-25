"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ListFilter, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const sortOptions = [
    { label: "Most Popular", value: "popularity" },
    { label: "Top Rated", value: "rating" },
    { label: "Release Date", value: "release_date" },
    { label: "Vote Count", value: "vote_count" },
];

export function MovieSort() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sortBy") || "popularity";
    const currentOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const updateParams = (newParams: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            params.set(key, value);
        });
        params.delete("afterVal"); // Reset cursors when sorting changes
        params.delete("afterId");
        params.delete("beforeVal");
        params.delete("beforeId");
        params.set("page", "1"); // Go back to page 1

        router.push(`/browser?${params.toString()}`);
    };

    const handleSortChange = (value: string) => {
        updateParams({ sortBy: value });
    };

    const toggleOrder = () => {
        const nextOrder = currentOrder === "desc" ? "asc" : "desc";
        updateParams({ sortOrder: nextOrder });
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="rounded-full bg-muted/20 border-border/60 font-medium text-xs focus:ring-primary/20 h-9">
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
    );
}
