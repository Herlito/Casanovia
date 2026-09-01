import re

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'r') as f:
    content = f.read()

old_get_chairs = """      const longSeats = elem.seatsLongSide || Math.floor((count - (elem.seatsHead || 0) * 2) / 2) || 3;
      const headSeats = elem.seatsHead !== undefined ? elem.seatsHead : 1;

      let seatIdx = 0;

      // Top Side
      const topSpacing = w / (longSeats + 1);
      for (let i = 1; i <= longSeats && seatIdx < count; i++) {
        const localX = -w / 2 + i * topSpacing;
        const localY = -h / 2 - 20;
        const pt = rotatePoint(localX, localY);
        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot });
        seatIdx++;
      }

      // Right Head
      if (headSeats > 0 && seatIdx < count) {
        for (let i = 1; i <= headSeats && seatIdx < count; i++) {
          const localX = w / 2 + 20;
          const localY = -h / 2 + (i * h) / (headSeats + 1);
          const pt = rotatePoint(localX, localY);
          chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI / 2 });
          seatIdx++;
        }
      }

      // Bottom Side
      const botSpacing = w / (longSeats + 1);
      for (let i = longSeats; i >= 1 && seatIdx < count; i--) {
        const localX = -w / 2 + i * botSpacing;
        const localY = h / 2 + 20;
        const pt = rotatePoint(localX, localY);
        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI });
        seatIdx++;
      }

      // Left Head
      if (headSeats > 0 && seatIdx < count) {
        for (let i = 1; i <= headSeats && seatIdx < count; i++) {
          const localX = -w / 2 - 20;
          const localY = -h / 2 + (i * h) / (headSeats + 1);
          const pt = rotatePoint(localX, localY);
          chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot - Math.PI / 2 });
          seatIdx++;
        }
      }"""

new_get_chairs = """      const headSeatsRaw = elem.seatsHead !== undefined ? elem.seatsHead : 1;
      const headSeats = Math.abs(headSeatsRaw);
      const isOneSideOnly = headSeatsRaw < 0;
      
      const longSeats = elem.seatsLongSide || Math.floor((count - (isOneSideOnly ? headSeats : headSeats * 2)) / 2) || 3;

      let seatIdx = 0;

      // Top Side
      const topSpacing = w / (longSeats + 1);
      for (let i = 1; i <= longSeats && seatIdx < count; i++) {
        const localX = -w / 2 + i * topSpacing;
        const localY = -h / 2 - 20;
        const pt = rotatePoint(localX, localY);
        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot });
        seatIdx++;
      }

      // Right Head (Only if not one-side only)
      if (headSeats > 0 && !isOneSideOnly && seatIdx < count) {
        for (let i = 1; i <= headSeats && seatIdx < count; i++) {
          const localX = w / 2 + 20;
          const localY = -h / 2 + (i * h) / (headSeats + 1);
          const pt = rotatePoint(localX, localY);
          chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI / 2 });
          seatIdx++;
        }
      }

      // Bottom Side
      const botSpacing = w / (longSeats + 1);
      for (let i = longSeats; i >= 1 && seatIdx < count; i--) {
        const localX = -w / 2 + i * botSpacing;
        const localY = h / 2 + 20;
        const pt = rotatePoint(localX, localY);
        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI });
        seatIdx++;
      }

      // Left Head (Always render if headSeats > 0, this is the "start" side where numbering technically starts geometrically on the left)
      if (headSeats > 0 && seatIdx < count) {
        for (let i = 1; i <= headSeats && seatIdx < count; i++) {
          const localX = -w / 2 - 20;
          const localY = -h / 2 + (i * h) / (headSeats + 1);
          const pt = rotatePoint(localX, localY);
          chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot - Math.PI / 2 });
          seatIdx++;
        }
      }"""

content = content.replace(old_get_chairs, new_get_chairs)

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'w') as f:
    f.write(content)
