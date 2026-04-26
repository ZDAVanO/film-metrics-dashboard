"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface FadeInImageProps extends ImageProps {
    containerClassName?: string;
}

export function FadeInImage({ className, ...props }: FadeInImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [randomDelay, setRandomDelay] = useState(0);

    useEffect(() => {
        setRandomDelay(Math.floor(Math.random() * 300));
    }, []);

    return (
        <Image
            {...props}
            unoptimized
            className={cn(
                "transition-all duration-500 ease-out",
                isLoading ? "scale-105 blur-sm opacity-0" : "scale-100 blur-0 opacity-100",
                className
            )}
            style={{
                transitionDelay: `${randomDelay}ms`,
                ...((props.style as any) || {})
            }}
            onLoad={(e) => {
                if (e.currentTarget.complete) {
                    setIsLoading(false);
                }
            }}
        />
    );
}
