import re

with open('firestore.rules', 'r') as f:
    content = f.read()

new_rules = """
    // WeddingCraft Templates
    match /weddingcraft_templates/{templateId} {
      allow read: if true;
      allow create, update: if isValidId(templateId);
      allow delete: if isValidId(templateId);
    }

    // WeddingCraft Library
    match /weddingcraft_library/{elementId} {
      allow read: if true;
      allow create, update: if isValidId(elementId);
      allow delete: if isValidId(elementId);
    }
"""

content = content.replace("    // Test connection document", new_rules + "\n    // Test connection document")

with open('firestore.rules', 'w') as f:
    f.write(content)
