
import { HexCell, BattleCell, BattleHazard } from '../types';
import { TERRAIN_MOVEMENT_COST } from '../constants';
import { getHazardMovementMultiplier } from './dndRules';

const HEX_DIRECTIONS = [
    { dq: 1, dr: 0 }, { dq: 0, dr: 1 }, { dq: -1, dr: 1 },
    { dq: -1, dr: 0 }, { dq: 0, dr: -1 }, { dq: 1, dr: -1 }
];

const GRID_DIRECTIONS = [
    { dx: 0, dy: -1 }, { dx: 1, dy: -1 }, { dx: 1, dy: 0 }, { dx: 1, dy: 1 },
    { dx: 0, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: 0 }, { dx: -1, dy: -1 }
];

const distHex = (a: {q:number, r:number}, b: {q:number, r:number}) => {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
};

const distGrid = (a: {x:number, y:number}, b: {x:number, y:number}) => {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
};

// Helper to get cell from either array or generator
const getCell = (q: number, r: number, map?: HexCell[], generator?: (q: number, r: number) => HexCell): HexCell | null => {
    if (map) {
        return map.find(c => c.q === q && c.r === r) || null;
    }
    if (generator) {
        return generator(q, r);
    }
    return null;
};

/**
 * A* Pathfinding for Hexagonal Grid (Overworld)
 * Now supports Generator Function for Infinite Maps
 */
export const findPath = (
    start: {q:number, r:number}, 
    end: {q:number, r:number}, 
    map?: HexCell[], 
    generator?: (q:number, r:number) => HexCell
): HexCell[] | null => {
    
    // Limit search depth for infinite map performance
    const MAX_DEPTH = 200; 

    const startCell = getCell(start.q, start.r, map, generator);
    const endCell = getCell(end.q, end.r, map, generator);

    if (!startCell || !endCell) return null;
    if ((TERRAIN_MOVEMENT_COST[endCell.terrain] || 1) >= 99) return null;

    const openSet: { cell: HexCell, f: number, g: number, parent?: any }[] = [];
    const closedSet = new Set<string>();

    openSet.push({ cell: startCell, f: 0, g: 0 });

    let iterations = 0;

    while (openSet.length > 0) {
        iterations++;
        if (iterations > MAX_DEPTH * 10) return null; // Safety break

        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;
        const currentKey = `${current.cell.q},${current.cell.r}`;

        if (current.cell.q === end.q && current.cell.r === end.r) {
            const path: HexCell[] = [];
            let curr = current;
            while (curr.parent) {
                path.push(curr.cell);
                curr = curr.parent;
            }
            return path.reverse();
        }

        closedSet.add(currentKey);

        // If we are too far from target in infinite mode, heuristically prune
        if (generator && distHex(current.cell, end) > MAX_DEPTH) continue;

        for (const dir of HEX_DIRECTIONS) {
            const nQ = current.cell.q + dir.dq;
            const nR = current.cell.r + dir.dr;
            const nKey = `${nQ},${nR}`;

            if (closedSet.has(nKey)) continue;

            const neighbor = getCell(nQ, nR, map, generator);
            if (!neighbor) continue;

            const cost = TERRAIN_MOVEMENT_COST[neighbor.terrain] || 1;
            if (cost >= 99) continue;

            const tentativeG = current.g + cost;
            const existingNode = openSet.find(n => n.cell.q === nQ && n.cell.r === nR);
            if (existingNode && tentativeG >= existingNode.g) continue;

            const heuristic = distHex({q: nQ, r: nR}, end);
            const newNode = { cell: neighbor, g: tentativeG, f: tentativeG + heuristic, parent: current };

            if (existingNode) {
                existingNode.g = tentativeG;
                existingNode.f = tentativeG + heuristic;
                existingNode.parent = current;
            } else {
                openSet.push(newNode);
            }
        }
    }
    return null;
};

/**
 * A* Pathfinding for Square Grid (Battle)
 */
export const findBattlePath = (
    start: {x:number, y:number}, 
    end: {x:number, y:number}, 
    grid: BattleCell[],
    hazards?: BattleHazard[]
): BattleCell[] | null => {
    const mapIndex = new Map<string, BattleCell>();
    grid.forEach(c => mapIndex.set(`${c.x},${c.z}`, c));

    const hazardMap = new Map<string, BattleHazard>();
    if (hazards) {
        hazards.forEach(h => hazardMap.set(`${h.x},${h.z}`, h));
    }

    if (!mapIndex.has(`${end.x},${end.y}`)) return null;
    const targetCell = mapIndex.get(`${end.x},${end.y}`);
    if (targetCell?.isObstacle) return null;

    const openSet: { cell: BattleCell, f: number, g: number, parent?: any }[] = [];
    const closedSet = new Set<string>();

    const startCell = mapIndex.get(`${start.x},${start.y}`);
    if (!startCell) return null;

    openSet.push({ cell: startCell, f: 0, g: 0 });

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;
        const currentKey = `${current.cell.x},${current.cell.z}`;

        if (current.cell.x === end.x && current.cell.z === end.y) {
            const path: BattleCell[] = [];
            let curr = current;
            while (curr.parent) {
                path.push(curr.cell);
                curr = curr.parent;
            }
            return path.reverse();
        }

        closedSet.add(currentKey);

        for (const dir of GRID_DIRECTIONS) {
            const nX = current.cell.x + dir.dx;
            const nY = current.cell.z + dir.dy;
            const nKey = `${nX},${nY}`;

            if (closedSet.has(nKey)) continue;

            const neighbor = mapIndex.get(nKey);
            if (!neighbor) continue;

            if (neighbor.isObstacle) continue;
            
            const heightDiff = (neighbor.offsetY + neighbor.height) - (current.cell.offsetY + current.cell.height);
            // Allow climbing steep slopes up to 2.0 height blocks, but restrict anything higher
            if (heightDiff > 2.0) continue;
            // Prevent falling off lethal cliffs (too deep drop)
            if (heightDiff < -3.0) continue;

            // Diagonal Cost + D&D 5E Environmental Hazard Multiplier (e.g. Difficult terrain = 2x)
            const isDiagonal = dir.dx !== 0 && dir.dy !== 0;
            let baseCost = isDiagonal ? 1.4 : 1.0;

            // Apply 3D Slope / Vertical Climbing Costs
            if (heightDiff > 0) {
                // Going uphill: extra fatigue/stamina/movement penalty (1.5x cost multiplier per height unit)
                baseCost += heightDiff * 1.5;
            } else if (heightDiff < 0) {
                // Going downhill: gravitational acceleration boost, making descending faster (clamped to min 0.5)
                baseCost = Math.max(0.5, baseCost - Math.abs(heightDiff) * 0.25);
            }

            const hazardOnNeighbor = hazardMap.get(nKey);
            const hazardMultiplier = getHazardMovementMultiplier(hazardOnNeighbor?.type);
            const cost = baseCost * hazardMultiplier;
            
            const tentativeG = current.g + cost;
            
            const existingNode = openSet.find(n => n.cell.x === nX && n.cell.z === nY);
            if (existingNode && tentativeG >= existingNode.g) continue;

            const heuristic = distGrid({x: nX, y: nY}, end);
            const newNode = { cell: neighbor, g: tentativeG, f: tentativeG + heuristic, parent: current };

            if (existingNode) {
                existingNode.g = tentativeG;
                existingNode.f = tentativeG + heuristic;
                existingNode.parent = current;
            } else {
                openSet.push(newNode);
            }
        }
    }
    return null;
};
