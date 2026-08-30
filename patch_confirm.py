import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# Add state
state_injection = """  const [autoSync, setAutoSync] = useState<boolean>(false);
  const [syncConfirmAction, setSyncConfirmAction] = useState<'auto' | 'manual' | null>(null);"""
text = text.replace('  const [autoSync, setAutoSync] = useState<boolean>(false);', state_injection)

# Replace button click and checkbox change
old_sync_button = """          {/* Sync Tables & Guests button */}
          <div className="flex items-center bg-white border border-rose-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              onClick={handleSyncWithWedding}"""

new_sync_button = """          {/* Sync Tables & Guests button */}
          <div className="flex items-center bg-white border border-rose-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              onClick={() => setSyncConfirmAction('manual')}"""
text = text.replace(old_sync_button, new_sync_button)

old_checkbox = """                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}"""
new_checkbox = """                checked={autoSync}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSyncConfirmAction('auto');
                  } else {
                    setAutoSync(false);
                  }
                }}"""
text = text.replace(old_checkbox, new_checkbox)

# Inject the confirm modal HTML near the end, just before the PhpSqlModal
old_end = """      {/* 6. MODAL: PHP Endpoints & SQL Viewer */}
      <FloorPlanPhpSqlModal"""

confirm_modal = """      {/* CONFIRM MODAL FOR SYNC */}
      {syncConfirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2D2A26]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 max-w-[90vw] text-center border border-[#E8DCCF]">
            <h3 className="text-lg font-bold text-[#2D2A26] mb-2 font-serif">¿Está seguro/a?</h3>
            <p className="text-sm text-[#8C8276] mb-6">
              {syncConfirmAction === 'manual' 
                ? 'Esto actualizará las mesas en el plano para que coincidan con la lista de invitados actual. Puede alterar mesas existentes.' 
                : 'Esto habilitará la sincronización automática de mesas al cargar el plano en el futuro.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setSyncConfirmAction(null)}
                className="px-5 py-2.5 rounded-xl border border-[#E8DCCF] text-[#8C8276] font-semibold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                NO
              </button>
              <button 
                onClick={() => {
                  if (syncConfirmAction === 'manual') {
                    handleSyncWithWedding();
                  } else {
                    setAutoSync(true);
                  }
                  setSyncConfirmAction(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#8B3A4A] text-white font-semibold hover:bg-[#722F3D] transition-colors cursor-pointer shadow-md"
              >
                SÍ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: PHP Endpoints & SQL Viewer */}
      <FloorPlanPhpSqlModal"""
text = text.replace(old_end, confirm_modal)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
