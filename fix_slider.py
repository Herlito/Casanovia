import re

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    content = f.read()

# Update handleRectSeatsChange
# wait we already did that! We did:
# const handleRectSeatsChange = (longSides: number, heads: number) => {
#    if (!selectedElement) return;
#    const actualHeadsCount = heads < 0 ? Math.abs(heads) : heads * 2;
#    const totalCount = longSides * 2 + actualHeadsCount;

# Update Sillas por Lado Largo rendering
old_slider = """                    <span className="font-bold text-[#2D3748]">
                      {selectedElement.seatsLongSide || 3}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={selectedElement.seatsLongSide || 3}
                    onChange={(e) =>
                      handleRectSeatsChange(
                        parseInt(e.target.value),
                        selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1
                      )
                    }"""

new_slider = """                    <span className="font-bold text-[#2D3748]">
                      {selectedElement.seatsLongSide !== undefined ? selectedElement.seatsLongSide : 3}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={selectedElement.seatsLongSide !== undefined ? selectedElement.seatsLongSide : 3}
                    onChange={(e) =>
                      handleRectSeatsChange(
                        parseInt(e.target.value),
                        selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1
                      )
                    }"""

content = content.replace(old_slider, new_slider)

# When pressing button for -1, -2 we already use 0! Wait, let's look at what we did before.
# In update_rect_seats.py:
# onClick={() => handleRectSeatsChange(selectedElement.seatsLongSide || 3, head) }
# we should pass 0 for long sides when head < 0 !!

old_head = """                  <div className="grid grid-cols-2 gap-1">
                    {[-1, -2].map((head) => (
                      <button
                        key={head}
                        type="button"
                        onClick={() =>
                          handleRectSeatsChange(selectedElement.seatsLongSide || 3, head)
                        }"""

new_head = """                  <div className="grid grid-cols-2 gap-1">
                    {[-1, -2].map((head) => (
                      <button
                        key={head}
                        type="button"
                        onClick={() =>
                          handleRectSeatsChange(0, head)
                        }"""
content = content.replace(old_head, new_head)

old_normal_head = """                  <div className="grid grid-cols-3 gap-1 mb-1">
                    {[0, 1, 2].map((head) => (
                      <button
                        key={head}
                        type="button"
                        onClick={() =>
                          handleRectSeatsChange(selectedElement.seatsLongSide || 3, head)
                        }"""

new_normal_head = """                  <div className="grid grid-cols-3 gap-1 mb-1">
                    {[0, 1, 2].map((head) => (
                      <button
                        key={head}
                        type="button"
                        onClick={() => {
                          const currentLong = selectedElement.seatsLongSide !== undefined ? selectedElement.seatsLongSide : 3;
                          handleRectSeatsChange(currentLong === 0 && head === 0 ? 1 : currentLong, head);
                        }}"""
content = content.replace(old_normal_head, new_normal_head)

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(content)
