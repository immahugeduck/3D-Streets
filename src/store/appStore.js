// Zustand store implementation
import create from 'zustand';

const useStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (item) => set((state) => ({ items: state.items.filter(i => i !== item) })),
}));

export default useStore;