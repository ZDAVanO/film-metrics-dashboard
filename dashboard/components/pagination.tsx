"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    baseUrl = '/browser'
}: PaginationProps) {
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const createPageUrl = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());

        if (newPage === 1) {
            params.delete('page');
        } else {
            params.set('page', newPage.toString());
        }

        // Always remove old cursors for clean URLs
        params.delete('afterVal');
        params.delete('afterId');
        params.delete('beforeVal');
        params.delete('beforeId');

        const queryString = params.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    };

    const getPageNumbers = () => {
        const pages = [];
        const showMax = 5;

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first, last, current, and neighbors
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) end = 4;
            if (currentPage >= totalPages - 2) start = totalPages - 3;

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');

            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col items-center gap-6 pt-8 border-t border-border/40">
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full size-10 border-border/60 hover:border-primary/50 transition-all hover:bg-primary/5 shadow-sm"
                    disabled={currentPage <= 1}
                    asChild={currentPage > 1}
                >
                    {currentPage > 1 ? (
                        <Link href={createPageUrl(currentPage - 1)}>
                            <ChevronLeft className="size-4" />
                        </Link>
                    ) : (
                        <ChevronLeft className="size-4" />
                    )}
                </Button>

                <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-full border border-border/40 shadow-inner overflow-x-auto max-w-[calc(100vw-12rem)] sm:max-w-none no-scrollbar">
                    {getPageNumbers().map((page, i) => {
                        if (page === '...') {
                            return (
                                <span key={`dots-${i}`} className="w-8 text-center text-muted-foreground text-xs font-bold px-1">
                                    •••
                                </span>
                            );
                        }

                        const isCurrent = page === currentPage;
                        return (
                            <Button
                                key={page}
                                variant={isCurrent ? "default" : "ghost"}
                                size="icon"
                                className={cn(
                                    "rounded-full size-9 text-xs font-bold transition-all shrink-0",
                                    isCurrent ? "shadow-md scale-105" : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
                                )}
                                asChild={!isCurrent}
                            >
                                {!isCurrent ? (
                                    <Link href={createPageUrl(page as number)}>{page}</Link>
                                ) : (
                                    <span>{page}</span>
                                )}
                            </Button>
                        );
                    })}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full size-10 border-border/60 hover:border-primary/50 transition-all hover:bg-primary/5 shadow-sm"
                    disabled={currentPage >= totalPages}
                    asChild={currentPage < totalPages}
                >
                    {currentPage < totalPages ? (
                        <Link href={createPageUrl(currentPage + 1)}>
                            <ChevronRight className="size-4" />
                        </Link>
                    ) : (
                        <ChevronRight className="size-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
