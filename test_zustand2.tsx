import React from 'react';
import { create } from 'zustand';

interface State { count: number }
const useStore = create<State>((set) => ({ count: 0 }));

export function Test() {
  const count = useStore(state => state.count);
  return <div>{count}</div>;
}
