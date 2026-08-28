const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', 'utf8');

const useEffectBlock = `  useEffect(() => {
    if (!isOpen || !activeWeddingId) return;

    let isMounted = true;

    const loadPlan = async () => {
      let loadedElements = null;
      let loadedData = null;

      try {
        // Try Firestore
        const docRef = doc(db, 'floor_plans', activeWeddingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && isMounted) {
          loadedData = docSnap.data();
          loadedElements = loadedData.elements;
        }
      } catch (err) {
        console.info('[FloorPlan] Firestore read note (using local fallback):', err);
      }

      if (!loadedElements && isMounted) {
        // Try Local Storage fallback
        try {
          const localData = localStorage.getItem(\`casanovia_floor_plan_\${activeWeddingId}\`);
          if (localData) {
            loadedData = JSON.parse(localData);
            loadedElements = loadedData.elements;
          }
        } catch (err) {}
      }

      if (isMounted) {
        if (loadedElements) {
          // We have a saved plan
          if (autoSync) {
            setElements(buildFloorPlanFromWedding(tables, guests, loadedElements));
          } else {
            setElements(loadedElements);
          }
          if (loadedData.backgroundImageUrl) setBackgroundImageUrl(loadedData.backgroundImageUrl);
          if (loadedData.backgroundFileName) setBackgroundFileName(loadedData.backgroundFileName);
          if (loadedData.backgroundOpacity !== undefined) setBackgroundOpacity(loadedData.backgroundOpacity);
          if (loadedData.scale) setScaleCalibration(loadedData.scale);
          if (loadedData.gridSnap !== undefined) setGridSnap(loadedData.gridSnap);
          if (loadedData.gridSize) setGridSize(loadedData.gridSize);
          if (loadedData.canvasWidth) setCanvasWidth(loadedData.canvasWidth);
          if (loadedData.canvasHeight) setCanvasHeight(loadedData.canvasHeight);
        } else {
          // NO saved plan
          if (autoSync) {
            setElements(buildFloorPlanFromWedding(tables, guests));
          } else {
            setElements([]);
          }
        }
      }
    };

    loadPlan();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeWeddingId, tables, guests, autoSync]);`;

code = code.replace(/  useEffect\(\(\) => \{[\s\S]*?  \}, \[isOpen, activeWeddingId, tables, guests\]\);/, useEffectBlock);

fs.writeFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', code);
