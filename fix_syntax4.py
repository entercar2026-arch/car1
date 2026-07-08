import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    text = f.read()

text = text.replace("        });\n        await onAddCar({", "        });\n      } else {\n        await onAddCar({")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(text)

