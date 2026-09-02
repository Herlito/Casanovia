import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

helper = """
// Helper component for Image
const URLImage = ({ image, ...props }: any) => {
"""

new_helper = """
export const getGradientProps = (style: any, w: number, h: number) => {
    if (!style.gradientEnabled) return {};
    const colors = style.gradientColors || ['#ff0000', '#0000ff'];
    const stops = style.gradientStops || [0, 1];
    let colorStops: any[] = [];
    stops.forEach((stop: number, idx: number) => {
        colorStops.push(stop);
        colorStops.push(colors[idx] || colors[0]);
    });
    
    if (style.gradientType === 'radial') {
        return {
            fillRadialGradientStartPoint: { x: w/2, y: h/2 },
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: { x: w/2, y: h/2 },
            fillRadialGradientEndRadius: Math.max(w, h) / 2,
            fillRadialGradientColorStops: colorStops,
        };
    } else {
        return {
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: w, y: h },
            fillLinearGradientColorStops: colorStops,
        };
    }
};

// Helper component for Image
const URLImage = ({ image, ...props }: any) => {
"""

content = content.replace(helper, new_helper)

# Replace SVG shape hardcoded logic with getGradientProps
old_svg_gradient = """                  const isGradient = el.style.gradientEnabled;
                  let gradientProps: any = {};
                  if (isGradient) {
                      const colors = el.style.gradientColors || ['#ff0000', '#0000ff'];
                      const stops = el.style.gradientStops || [0, 1];
                      let colorStops: any[] = [];
                      stops.forEach((stop, idx) => {
                          colorStops.push(stop);
                          colorStops.push(colors[idx] || colors[0]);
                      });
                      
                      if (el.style.gradientType === 'radial') {
                          gradientProps = {
                              fillRadialGradientStartPoint: { x: w/2, y: h/2 },
                              fillRadialGradientStartRadius: 0,
                              fillRadialGradientEndPoint: { x: w/2, y: h/2 },
                              fillRadialGradientEndRadius: Math.max(w, h) / 2,
                              fillRadialGradientColorStops: colorStops,
                          };
                      } else {
                          gradientProps = {
                              fillLinearGradientStartPoint: { x: 0, y: 0 },
                              fillLinearGradientEndPoint: { x: w, y: h },
                              fillLinearGradientColorStops: colorStops,
                          };
                      }
                  }"""

new_svg_gradient = """                  const isGradient = el.style.gradientEnabled;
                  const gradientProps = getGradientProps(el.style, w, h);"""

content = content.replace(old_svg_gradient, new_svg_gradient)

# Apply to Text
old_text = """                            fontSize={el.style.fontSize || 24}
                            fontFamily={el.style.fontFamily || 'Arial'}
                            fill={el.style.fill || el.style.color || '#000000'}
                            align={el.style.align || 'left'}"""

new_text = """                            fontSize={el.style.fontSize || 24}
                            fontFamily={el.style.fontFamily || 'Arial'}
                            fill={!el.style.gradientEnabled ? (el.style.fill || el.style.color || '#000000') : undefined}
                            align={el.style.align || 'left'}
                            {...getGradientProps(el.style, el.transform.width, el.style.fontSize || 24)}"""

# Note: for text we replace both editing and display
content = content.replace(old_text, new_text)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
