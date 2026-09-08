// src/store/atoms.ts
import { atom } from 'jotai';
import type { LayoutItem } from 'react-grid-layout';

// 1. Let's define a custom type so TypeScript knows about our extra lock properties!
export interface CustomLayout extends LayoutItem {
  isDraggable?: boolean;
  isResizable?: boolean;
}

// 2. Create the atom for Edit Mode
export const isEditingAtom = atom(true);

// 3. Create the atom for the Grid Layout
export const layoutAtom = atom<CustomLayout[]>([
  { i: 'widget-1', x: 0, y: 0, w: 2, h: 2, isDraggable: true, isResizable: true },
  { i: 'widget-2', x: 2, y: 0, w: 2, h: 2, isDraggable: true, isResizable: true },
  { i: 'widget-3', x: 0, y: 2, w: 4, h: 2, isDraggable: true, isResizable: true }
]);