import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

# I want to conditionally hide the select box.
# Currently:
#                     {/* Assignment Action Row */}
#                     <div className="flex items-center justify-between pt-1 border-t border-[#F0EAE1] gap-2">
#                       {isAssigned ? (

regex = re.compile(
    r'\{\/\* Assignment Action Row \*\/\}\s*<div className="flex items-center justify-between pt-1 border-t border-\[\#F0EAE1\] gap-2">',
    re.DOTALL
)

replacement = """{/* Assignment Action Row */}
                    {(isSelected || isAssigned || guest.rsvpStatus !== 'confirmed') && (
                    <div className="flex items-center justify-between pt-1 border-t border-[#F0EAE1] gap-2">"""

content = regex.sub(replacement, content)

# Close the condition after the Assignment Action Row ends
# Let's find the end.
#                       ) : (
#                         <div className="flex items-center space-x-1.5 w-full">
#                           <select
# ...
#                           </select>
#                         </div>
#                       )}
#                     </div>
end_regex = re.compile(
    r'</select>\s*</div>\s*\)\}\s*</div>',
    re.DOTALL
)

end_replacement = """</select>
                        </div>
                      )}
                    </div>
                    )}"""

content = end_regex.sub(end_replacement, content)

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)

