#!/bin/bash
sed -i "s/color: \${el.style.numberColor || '#000'};/color: \${numberColor};/g" src/WeddingCraft/lib/exportHTML.ts
sed -i "s/color: \${el.style.labelColor || '#666'};/color: \${labelColor};/g" src/WeddingCraft/lib/exportHTML.ts
