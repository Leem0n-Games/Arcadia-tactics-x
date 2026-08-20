import React from 'react';
import { EquipmentSlot } from '../types';
import { CharacterEquipmentSheet } from './inventory/CharacterEquipmentSheet';
import { InventoryGrid } from './inventory/InventoryGrid';
import { ItemDetailCard } from './inventory/ItemDetailCard';
import { sfx } from '../services/SoundSystem';
import { useInventoryLogic } from '../hooks/useInventoryLogic';

export const InventoryScreen: React.FC = () => {
    const {
        inventory,
        party,
        activeChar,
        activeCharId,
        setActiveCharId,
        selectedItem,
        mobileTab,
        setMobileTab,
        gold,
        hasActed,
        gameState,
        handleSelectItem,
        handleEquip,
        handleUnequip,
        handleConsume,
        handleClose
    } = useInventoryLogic();

    if (!activeChar) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-200 p-2 sm:p-4 lg:p-6 pointer-events-auto select-none">
            
            {/* Main Fantasy Parchment / Stone Modal Container */}
            <div className="w-full max-w-7xl h-full max-h-[94dvh] grid grid-cols-1 lg:grid-cols-12 gap-3 relative overflow-hidden bg-slate-950/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-3 sm:p-4 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
                
                {/* Global Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-3 right-3 lg:top-4 lg:right-4 z-50 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center border border-white/20 bg-slate-900/90 text-amber-300 hover:bg-slate-800 shadow-xl transition-transform active:scale-90 font-black text-sm"
                    aria-label="Cerrar Zurrón"
                >
                    ✕
                </button>

                {/* Mobile View Switcher Tabs (< 1024px) */}
                <div className="lg:hidden col-span-1 flex items-center justify-between gap-1 bg-slate-900/80 p-1 rounded-2xl border border-white/10 shrink-0 pr-12">
                    <button
                        onClick={() => {
                            sfx.playUiClick();
                            setMobileTab('POUCH');
                        }}
                        className={`flex-1 min-h-[40px] py-1.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            mobileTab === 'POUCH'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <span>🎒</span>
                        <span>Zurrón</span>
                    </button>

                    <button
                        onClick={() => {
                            sfx.playUiClick();
                            setMobileTab('HERO');
                        }}
                        className={`flex-1 min-h-[40px] py-1.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            mobileTab === 'HERO'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <span>🥋</span>
                        <span>Equipo</span>
                    </button>

                    <button
                        onClick={() => {
                            sfx.playUiClick();
                            setMobileTab('DETAILS');
                        }}
                        className={`flex-1 min-h-[40px] py-1.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            mobileTab === 'DETAILS'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <span>📜</span>
                        <span>Detalles</span>
                    </button>
                </div>

                {/* COLUMN 1: CHARACTER HERO EQUIPMENT & STATS SHEET (4 cols on lg) */}
                <div className={`lg:col-span-4 h-full min-h-0 ${mobileTab === 'HERO' ? 'block' : 'hidden lg:block'}`}>
                    <CharacterEquipmentSheet
                        party={party}
                        activeChar={activeChar}
                        selectedItem={selectedItem}
                        onSelectChar={setActiveCharId}
                        onSelectItem={handleSelectItem}
                        onUnequipSlot={(slot) => handleUnequip(slot, activeChar.id)}
                    />
                </div>

                {/* COLUMN 2: ADVENTURER'S POUCH GRID (4 or 5 cols on lg) */}
                <div className={`lg:col-span-4 xl:col-span-5 h-full min-h-0 ${mobileTab === 'POUCH' ? 'block' : 'hidden lg:block'}`}>
                    <InventoryGrid
                        inventory={inventory}
                        party={party}
                        selectedItem={selectedItem}
                        gold={gold}
                        maxCapacity={24}
                        onSelectItem={handleSelectItem}
                    />
                </div>

                {/* COLUMN 3: DEEP RPG ITEM INSPECTION & ACTIONS CARD (4 or 3 cols on lg) */}
                <div className={`lg:col-span-4 xl:col-span-3 h-full min-h-0 ${mobileTab === 'DETAILS' ? 'block' : 'hidden lg:block'}`}>
                    <ItemDetailCard
                        item={selectedItem}
                        activeChar={activeChar}
                        party={party}
                        gameState={gameState}
                        hasActed={hasActed}
                        onEquip={handleEquip}
                        onUnequip={handleUnequip}
                        onConsume={handleConsume}
                        onClose={mobileTab === 'DETAILS' ? () => setMobileTab('POUCH') : undefined}
                    />
                </div>

            </div>
        </div>
    );
};
