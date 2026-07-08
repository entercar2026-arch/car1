import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    text = f.read()

text = text.replace("    img.src = dataUrl;\n  });\n// Optimized", "    img.src = dataUrl;\n  });\n};\n// Optimized")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(text)

