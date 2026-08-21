
import React from 'react';
import { Entity, VisualComponent, CharacterClass } from '../../types';
import { ASSETS, sanitizeAssetUrl } from '../../constants';

interface UnitPortraitProps {
    entity: Entity & { visual: VisualComponent };
    className?: string;
    scale?: number;
}

export const UnitPortrait: React.FC<UnitPortraitProps> = ({ entity, className = "w-full h-full", scale = 1.5 }) => {
    const rawSpriteUrl = entity.visual?.spriteUrl;
    const spriteUrl = sanitizeAssetUrl(rawSpriteUrl);
    const isPriest = (spriteUrl && spriteUrl.toLowerCase().includes('priest')) || entity.stats?.class === CharacterClass.CLERIC;
    const isFighter = (spriteUrl && spriteUrl.toLowerCase().includes('fighter')) || entity.stats?.class === CharacterClass.FIGHTER;

    if (isPriest) {
        return (
            <div className={`w-full h-full relative overflow-hidden flex items-center justify-center ${className}`}>
                <img 
                    src={ASSETS.UNITS.PLAYER_CLERIC_ROSTER || '/assets/players/priest/priest_roster.png'} 
                    alt={entity.name} 
                    className="w-full h-full object-cover scale-[1.36] translate-y-[2%] pixelated" 
                />
            </div>
        );
    }

    if (isFighter) {
        return (
            <div className={`w-full h-full relative overflow-hidden flex items-center justify-center ${className}`}>
                <div 
                    className="w-full h-full pixelated scale-125"
                    style={{
                        backgroundImage: `url(/assets/fighter/fighter_walk.png)`,
                        backgroundSize: '380% 380%',
                        backgroundPosition: '10% 8%', // Upper body frame
                        imageRendering: 'pixelated'
                    }}
                />
            </div>
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
