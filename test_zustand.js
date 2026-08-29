import { create } from 'zustand';
const hook = create((set) => ({ count: 0 }));
console.log(typeof hook);
