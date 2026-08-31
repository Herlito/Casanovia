import os
import re

directory = 'src/components/private'

# Match the label div before an h1 or h2
label_regex = re.compile(
    r'<div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full.*?</div>\s*(<h[12])',
    re.DOTALL
)

label_regex_2 = re.compile(
    r'<span className="text-\[10px\] font-bold uppercase tracking-widest px-2\.5 py-0\.5 rounded-full.*?</span>\s*(<h[12]|<span)',
    re.DOTALL
)

# Match the p tag after h1 or h2
desc_regex = re.compile(
    r'(</h[12]>)\s*<p className="text-xs sm:text-sm text-\[#7A7268\](?: leading-relaxed)?">.*?</p>',
    re.DOTALL
)

desc_regex_2 = re.compile(
    r'(</h[12]>)\s*<p className="text-xs sm:text-sm text-gray-600(?: leading-relaxed)?">.*?</p>',
    re.DOTALL
)

for filename in os.listdir(directory):
    if filename.endswith(".tsx"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            content = f.read()
        
        new_content = label_regex.sub(r'\1', content)
        new_content = label_regex_2.sub(r'\1', new_content)
        new_content = desc_regex.sub(r'\1', new_content)
        new_content = desc_regex_2.sub(r'\1', new_content)
        
        if new_content != content:
            print(f"Modified {filename}")
            with open(filepath, 'w') as f:
                f.write(new_content)

