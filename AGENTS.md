# Casanovia App Design Guidelines

## Neumorphic Style Configuration
This project uses a Neumorphic design system (soft UI) for elements like cards, modals, and buttons. 

When generating or modifying UI components, follow these standard Tailwind utility classes:

### Colors
- **Main Background**: `bg-[#EBEBEB]` (Light gray/off-white)
- **Primary Text**: `text-gray-900` or `text-gray-800`
- **Secondary Text (Labels)**: `text-gray-500`
- **Error Text**: `text-rose-600`
- **Success Text**: `text-emerald-600`

### Shadows (The core of Neumorphism)
- **Convex (Raised Elements - Cards, Buttons, Modals)**: 
  - Base: `shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]`
  - Smaller elements (Icons, small buttons): `shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]`
  - Hover states: `hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff]`
- **Concave/Inset (Depressed Elements - Inputs, Active Buttons, Inner containers)**:
  - Base Inputs: `shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff]`
  - Active Button State: `active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]`
  - Inner containers (like selected states or form backgrounds): `shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff]`
  - Focus states on Inputs: `focus:shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff]`

### Border Radius
- Cards / Modals: `rounded-[2.5rem]` or `rounded-3xl`
- Buttons / Inputs: `rounded-2xl`
- Small Icons: `rounded-full`

### Other conventions
- Use `transition-all` or `transition-all duration-300` on elements with shadow changes.
- Ensure inputs and buttons share the same background color (`bg-[#EBEBEB]`) as the canvas, relying on shadows to create depth.
- Labels should generally be `text-[11px] font-bold text-gray-500 uppercase tracking-wider`.
