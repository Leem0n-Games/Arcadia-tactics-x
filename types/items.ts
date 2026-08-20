import { Attributes } from '../types';
import { ArmorResistances, ArmorImmunities, ArmorSpecialEffects } from './armor';

export enum EquipmentSlot {
  MAIN_HAND = 'main_hand',
  OFF_HAND = 'off_hand',
  BODY = 'body'
}

export enum ItemRarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  VERY_RARE = 'Very Rare',
  LEGENDARY = 'Legendary'
}

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'key';
  rarity: ItemRarity;
  description: string;
  flavorText?: string;
  icon: string;
  effect?: {
      type: 'heal_hp' | 'restore_mana' | 'buff_str';
      amount: number;
  };
  equipmentStats?: {
      slot: EquipmentSlot;
      ac?: number;
      diceCount?: number;
      diceSides?: number;
      modifiers?: Partial<Attributes>;
      properties?: string[];
      // New Armor Properties
      resistances?: ArmorResistances;
      immunities?: ArmorImmunities[];
      specialEffects?: ArmorSpecialEffects;
      warmthBonus?: number;
      movementSpeedModifier?: number;
  }
}

export interface InventorySlot {
  item: Item;
  quantity: number;
}

export interface StartingEquipmentPackage {
  id: string;
  name: string;
  archetype: string;
  description: string;
  equipment: Partial<Record<EquipmentSlot, Item>>;
  bonusItems: { item: Item; quantity: number }[];
}

export interface LootDrop {
  id: string;
  position: { x: number; y: number; z?: number };
  items: Item[];
  gold: number;
  rarity: ItemRarity;
}
