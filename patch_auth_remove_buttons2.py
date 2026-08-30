import re

with open('src/components/modals/AuthModal.tsx', 'r') as f:
    text = f.read()

# I want to remove this block:
text = re.sub(
    r'<div className="pt-2 border-t border-\[#EFEAE2\] space-y-2">.*?</form>',
    '</form>',
    text,
    flags=re.DOTALL
)

with open('src/components/modals/AuthModal.tsx', 'w') as f:
    f.write(text)
