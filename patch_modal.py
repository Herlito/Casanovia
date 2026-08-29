import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# 1. Add imports
text = text.replace("RefreshCw\n} from 'lucide-react';", "RefreshCw,\n  Undo2,\n  Redo2\n} from 'lucide-react';")

# 2. Add History State and Logic
hook_insertion = """  const [scaleCalibration, setScaleCalibration] = useState({
    isCalibrated: false,
    pixelDistance: 50,
    realMeters: 1.0,
    pixelsPerMeter: 50.0,
  });

  // History State for Undo/Redo
  const [history, setHistory] = useState<{
    past: FloorPlanElement[][];
    future: FloorPlanElement[][];
  }>({ past: [], future: [] });
  const isUndoRedo = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.past.length <= 1) return prev;
      const newPast = [...prev.past];
      const currentState = newPast.pop()!;
      const previousState = newPast[newPast.length - 1];

      isUndoRedo.current = true;
      setElements(previousState);

      return {
        past: newPast,
        future: [currentState, ...prev.future]
      };
    });
  };

  const handleRedo = () => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const newFuture = [...prev.future];
      const nextState = newFuture.shift()!;

      isUndoRedo.current = true;
      setElements(nextState);

      return {
        past: [...prev.past, nextState],
        future: newFuture
      };
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHistory((prev) => {
        if (prev.past.length > 0) {
          const lastState = prev.past[prev.past.length - 1];
          if (JSON.stringify(lastState) === JSON.stringify(elements)) {
            return prev;
          }
        } else if (prev.past.length === 0 && elements.length === 0) {
          return prev;
        }

        const newPast = [...prev.past, elements].slice(-11);
        return {
          past: newPast,
          future: []
        };
      });
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [elements]);
"""

text = text.replace("""  const [scaleCalibration, setScaleCalibration] = useState({
    isCalibrated: false,
    pixelDistance: 50,
    realMeters: 1.0,
    pixelsPerMeter: 50.0,
  });""", hook_insertion)

# 3. Add Buttons to UI
buttons_insertion = """        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          
          {/* Undo / Redo */}
          <div className="flex items-center space-x-1 mr-1">
            <button
              onClick={handleUndo}
              disabled={history.past.length <= 1}
              className="p-1.5 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-[#2D2A26] transition-colors shadow-2xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={history.future.length === 0}
              className="p-1.5 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-[#2D2A26] transition-colors shadow-2xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Sync Tables & Guests button */}"""

text = text.replace("""        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          
                    {/* Sync Tables & Guests button */}""", buttons_insertion)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)

print("Modal patched!")
