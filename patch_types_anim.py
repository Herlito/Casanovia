import re

with open('src/WeddingCraft/types.ts', 'r') as f:
    text = f.read()

# Add AnimationConfig interface
anim_interface = """export interface AnimationConfig {
  type: string;
  duration: number;
  delay: number;
  easing: string;
  trigger: 'onLoad' | 'onScroll' | 'onClick';
  infinite?: boolean;
  direction?: 'normal' | 'reverse' | 'alternate';
  intensity?: number;
}

export interface CanvasElement {"""

text = text.replace('export interface CanvasElement {', anim_interface)

# Add animation property to CanvasElement
anim_prop = """  dataBinding?: {
    field: 'coupleNames' | 'eventDate' | 'venueName';
    format?: string; // e.g. "{{0}} & {{1}}"
  };
  animation?: {
    entrance?: AnimationConfig;
    permanent?: AnimationConfig;
    exit?: AnimationConfig;
  };
}"""

text = text.replace("""  dataBinding?: {
    field: 'coupleNames' | 'eventDate' | 'venueName';
    format?: string; // e.g. "{{0}} & {{1}}"
  };
}""", anim_prop)

with open('src/WeddingCraft/types.ts', 'w') as f:
    f.write(text)
