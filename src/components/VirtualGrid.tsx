import { useEffect, useRef, useState } from 'react';

interface VirtualGridProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    columnCount: number;
    rowHeight: number;
    gap: number;
    overscan?: number;
}

export function VirtualGrid<T>({
    items,
    renderItem,
    columnCount,
    rowHeight,
    gap,
    overscan = 5
}: VirtualGridProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

    const rowCount = Math.ceil(items.length / columnCount);
    const totalHeight = rowCount * (rowHeight + gap) - gap;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateVisibleRange = () => {
            const scrollTop = container.scrollTop;
            const viewportHeight = container.clientHeight;

            const startRow = Math.floor(scrollTop / (rowHeight + gap));
            const endRow = Math.ceil((scrollTop + viewportHeight) / (rowHeight + gap));

            const start = Math.max(0, (startRow - overscan) * columnCount);
            const end = Math.min(items.length, (endRow + overscan) * columnCount);

            setVisibleRange({ start, end });
        };

        updateVisibleRange();
        container.addEventListener('scroll', updateVisibleRange);
        window.addEventListener('resize', updateVisibleRange);

        return () => {
            container.removeEventListener('scroll', updateVisibleRange);
            window.removeEventListener('resize', updateVisibleRange);
        };
    }, [items.length, columnCount, rowHeight, gap, overscan]);

    const visibleItems = items.slice(visibleRange.start, visibleRange.end);
    const startRow = Math.floor(visibleRange.start / columnCount);

    return (
        <div
            ref={containerRef}
            className="h-full overflow-auto"
            style={{ position: 'relative' }}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                    style={{
                        position: 'absolute',
                        top: startRow * (rowHeight + gap),
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                        gap: gap,
                        width: '100%'
                    }}
                >
                    {visibleItems.map((item, index) => renderItem(item, index + visibleRange.start))}
                </div>
            </div>
        </div>
    );
} 
