import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

old_str = """          {/* Desktop Close modal (hidden on mobile) */}
          <button
            onClick={onClose}
            className="hidden md:flex p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. ERROR NOTICE / PDF ERROR BANNER */}"""

new_str = """          {/* Desktop Close modal (hidden on mobile) */}
          <button
            onClick={onClose}
            className="hidden md:flex p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      </div>

      {/* 2. ERROR NOTICE / PDF ERROR BANNER */}"""

text = text.replace(old_str, new_str)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
