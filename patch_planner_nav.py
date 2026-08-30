import re

with open('src/components/private/PlannerDashboard.tsx', 'r') as f:
    text = f.read()

# Locate the end of the left/center section inside the header
search_str = "              )}\n            </div>\n          </div>\n        </div>\n      </header>"
insert_str = """              )}
            </div>

            {/* Nav Tabs - flex-wrap allows responsive adjustment to wrap onto the next row on mobile devices */}
            <nav className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 w-full sm:w-auto">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === 'floorplan') {
                        setShowFloorPlanModal(true);
                      } else if (tab.id === 'public') {
                        setViewMode('public');
                      } else {
                        setActiveTab(tab.id as PlannerDashboardTab);
                      }
                    }}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#8B3A4A] text-white shadow-xs font-semibold ring-1 ring-white/30'
                        : 'text-stone-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>"""

if search_str in text:
    text = text.replace(search_str, insert_str)
else:
    print("search_str NOT FOUND")

with open('src/components/private/PlannerDashboard.tsx', 'w') as f:
    f.write(text)
