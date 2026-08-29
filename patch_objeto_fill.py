import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

old_svg_process = """                   reader.onload = (ev) => {
                     const svgText = ev.target?.result as string;
                     const src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgText)));"""

new_svg_process = """                   reader.onload = (ev) => {
                     let svgText = ev.target?.result as string;
                     const color = '#8B3A4A';
                     const styleTag = `<style>* { fill: ${color} !important; stroke: ${color} !important; }</style>`;
                     if (svgText.includes('<svg')) {
                       svgText = svgText.replace(/(<svg[^>]*>)/i, `$1${styleTag}`);
                     }
                     const src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgText)));"""

text = text.replace(old_svg_process, new_svg_process)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(text)
