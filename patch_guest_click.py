import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

# Make the guest card clickable
regex = re.compile(
    r'(<div\s+key=\{guest\.id\}\s+draggable=\{isDraggable\}\s+onDragStart=\{[^}]+\}\s+onDragEnd=\{[^}]+\}\s+className=\{`p-3 rounded-2xl border transition-all space-y-2[^`]+`\})',
    re.DOTALL
)

replacement = r'\1\n                    onClick={() => toggleSelectGuest(guest.id)}'
content = regex.sub(replacement, content)

# But wait, stop propagation on the checkbox and any inner buttons if needed.
# For the checkbox:
content = content.replace(
    'onChange={() => toggleSelectGuest(guest.id)}',
    'onChange={() => toggleSelectGuest(guest.id)}\n                          onClick={(e) => e.stopPropagation()}'
)

# For unassign button:
content = content.replace(
    'onClick={() => handleUnassignGuest(guest.id)}',
    'onClick={(e) => { e.stopPropagation(); handleUnassignGuest(guest.id); }}'
)

# For confirm RSVP button:
content = content.replace(
    'onClick={() => updateGuest(guest.id, {',
    'onClick={(e) => { e.stopPropagation(); updateGuest(guest.id, {'
)
content = content.replace(
    'confirmedPasses: guest.confirmedPasses || guest.totalPasses || 1,\n                            })}',
    'confirmedPasses: guest.confirmedPasses || guest.totalPasses || 1,\n                            }); }}'
)

# For select element:
content = content.replace(
    'onChange={(e) => handleAssignSingleGuest(guest.id, e.target.value)}',
    'onChange={(e) => handleAssignSingleGuest(guest.id, e.target.value)}\n                            onClick={(e) => e.stopPropagation()}'
)

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)
