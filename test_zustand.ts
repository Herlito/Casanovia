import { create } from 'zustand';
interface State { count: number }
export const useStore = create<State>((set) => ({ count: 0 }));
console.log(typeof useStore, typeof useStore.getState);
