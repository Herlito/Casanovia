import re

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'r') as f:
    content = f.read()

old_long_logic = """      const longSeats = elem.seatsLongSide !== undefined ? elem.seatsLongSide : (Math.floor((count - (isOneSideOnly ? headSeats : headSeats * 2)) / 2) || 3);

      let seatIdx = 0;

      // Top Side
      const topSpacing = w / (longSeats + 1);
      for (let i = 1; i <= longSeats && seatIdx < count; i++) {"""

new_long_logic = """      const longSeatsRaw = elem.seatsLongSide !== undefined ? elem.seatsLongSide : (Math.floor((count - (isOneSideOnly ? headSeats : headSeats * 2)) / 2) || 3);
      const isOneSideLong = longSeatsRaw < 0;
      const longSeats = Math.abs(longSeatsRaw);

      let seatIdx = 0;

      // Top Side
      const topSpacing = w / (longSeats + 1);
      for (let i = 1; i <= longSeats && seatIdx < count; i++) {"""

content = content.replace(old_long_logic, new_long_logic)

old_bottom_logic = """      // Bottom Side
      const botSpacing = w / (longSeats + 1);
      for (let i = longSeats; i >= 1 && seatIdx < count; i--) {"""

new_bottom_logic = """      // Bottom Side (Only if not one-side long)
      const botSpacing = w / (longSeats + 1);
      if (!isOneSideLong) {
        for (let i = longSeats; i >= 1 && seatIdx < count; i--) {"""

content = content.replace(old_bottom_logic, new_bottom_logic)

old_bottom_end = """        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI });
        seatIdx++;
      }

      // Left Head"""

new_bottom_end = """        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI });
        seatIdx++;
        }
      }

      // Left Head"""

content = content.replace(old_bottom_end, new_bottom_end)

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'w') as f:
    f.write(content)
