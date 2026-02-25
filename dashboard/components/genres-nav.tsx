"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const genres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "History",
    "Horror", "Music", "Mystery", "Romance", "Science Fiction",
    "TV Movie", "Thriller", "War", "Western"
]

export function GenresNav() {
    const router = useRouter()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="px-3 py-2 uppercase tracking-tight text-sm font-medium opacity-50">
                Genres
            </div>
        )
    }

    return (
        <NavigationMenu viewport={false}>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger
                        onClick={() => router.push("/genres")}
                        className="group bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50 px-3 py-2 rounded-md uppercase tracking-tight text-sm transition-colors shrink-0"
                    >
                        Genres
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="right-0 left-auto top-full mt-2">
                        <div className="p-2 w-[280px] sm:w-[320px] md:w-[400px]">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5">
                                {genres.map((genre) => (
                                    <NavigationMenuLink key={genre} asChild>
                                        <Link
                                            href={`/browser?includeGenres=${encodeURIComponent(genre)}`}
                                            className="block text-left rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-primary focus:bg-muted focus:text-primary outline-none"
                                        >
                                            {genre}
                                        </Link>
                                    </NavigationMenuLink>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-border/50">
                                <Link
                                    href="/genres"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2"
                                >
                                    View All Genres →
                                </Link>
                            </div>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}
