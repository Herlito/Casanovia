import re

with open('src/components/private/PlannerDashboard.tsx', 'r') as f:
    text = f.read()

# 1. Update navTabs
old_nav_tabs = """  const navTabs: { id: PlannerDashboardTab | 'floorplan'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'panel', label: 'Panel', icon: LayoutDashboard },
    { id: 'guests', label: 'Invitados', icon: Users },
    { id: 'seating', label: 'Mesas', icon: UtensilsCrossed },
    { id: 'floorplan', label: 'Planos', icon: Map },
    { id: 'vendors', label: 'Proveedores', icon: Building2 },
    { id: 'budget', label: 'Presupuesto', icon: DollarSign },
    { id: 'timeline', label: 'Cronograma', icon: Clock },
    { id: 'checklist', label: 'Tareas', icon: CheckSquare },
    { id: 'settings', label: isPlannerOrAdmin ? 'Ajustes' : 'Ajustes Boda', icon: Settings },
  ];"""

new_nav_tabs = """  const navTabs: { id: PlannerDashboardTab | 'floorplan' | 'public'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'panel', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: isPlannerOrAdmin ? 'Ajustes' : 'Ajustes Boda', icon: Settings },
    { id: 'checklist', label: 'Tareas', icon: CheckSquare },
    { id: 'guests', label: 'Invitados', icon: Users },
    { id: 'seating', label: 'Mesas', icon: UtensilsCrossed },
    { id: 'floorplan', label: 'Plano', icon: Map },
    { id: 'timeline', label: 'Cronograma', icon: Clock },
    { id: 'vendors', label: 'Proveedores', icon: Building2 },
    { id: 'budget', label: 'Presupuesto', icon: DollarSign },
    { id: 'public', label: 'Web Invitados', icon: ExternalLink },
  ];"""

text = text.replace(old_nav_tabs, new_nav_tabs)

# 2. Delete horizontal nav
import ast
import re

horizontal_nav_start = text.find('            {/* Nav Tabs - flex-wrap')
horizontal_nav_end = text.find('            </nav>') + len('            </nav>')
text = text[:horizontal_nav_start] + text[horizontal_nav_end:]

# 3. Update the vertical sidebar
# Currently it has the navTabs map and then a bottom section for "Ir a web de invitados".
# Since we added 'public' to navTabs, we can remove the bottom section, or keep the bottom section separated but still part of the ordered list? The user says: "cambia el orden de los botones, así: ... y ir a web de invitados". We will include it in the map and remove the bottom part.

sidebar_bottom_start = text.find('          <div className="pt-4 border-t border-[#F0EAE1] w-full flex flex-col items-center space-y-2">')
sidebar_bottom_end = text.find('          </div>\\n        </aside>', sidebar_bottom_start)
# we need to be careful with string matching
text = re.sub(r'          <div className="pt-4 border-t border\[#F0EAE1\] w-full flex flex-col items-center space-y-2">.*?          </div>\n', '', text, flags=re.DOTALL)

# Update onClick in sidebar
old_click = """                  onClick={() => {
                    if (tab.id === 'floorplan') {
                      setShowFloorPlanModal(true);
                    } else {
                      setActiveTab(tab.id as PlannerDashboardTab);
                    }
                  }}"""
new_click = """                  onClick={() => {
                    if (tab.id === 'floorplan') {
                      setShowFloorPlanModal(true);
                    } else if (tab.id === 'public') {
                      setViewMode('public');
                    } else {
                      setActiveTab(tab.id as PlannerDashboardTab);
                    }
                  }}"""
text = text.replace(old_click, new_click)

with open('src/components/private/PlannerDashboard.tsx', 'w') as f:
    f.write(text)
