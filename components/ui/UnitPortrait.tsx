
import React from 'react';
import { Entity, VisualComponent } from '../../types';

interface UnitPortraitProps {
    entity: Entity & { visual: VisualComponent };
    className?: string;
    scale?: number;
}

export const UnitPortrait: React.FC<UnitPortraitProps> = ({ entity, className = "w-full h-full", scale = 1.5 }) => {
    const spriteUrl = entity.visual.spriteUrl;
    const isPriest = spriteUrl && spriteUrl.toLowerCase().includes('priest');
    const isFighter = spriteUrl && spriteUrl.toLowerCase().includes('fighter');

    if (isPriest || isFighter) {
        const url = isPriest 
            ? '/assets/players/priest/spritesheetpriest.png' 
            : '/assets/fighter/fighter_walk.png';
        return (
            <div 
                className={`pixelated ${className}`}
                style={{
                    backgroundImage: `url(${url})`,
                    backgroundSize: '400% 400%',
                    backgroundPosition: '0% 0%', // Top-left frame
                    imageRendering: 'pixelated'
                }}
            />
        );
    }

    return (
        <img 
            src={spriteUrl} 
            alt={entity.name} 
            className={`${className} object-cover pixelated`} 
            style={{ transform: `scale(${scale}) translateY(10%)` }}
        />
    );
};
