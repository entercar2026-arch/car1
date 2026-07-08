import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    text = f.read()

text = text.replace("          reader.readAsDataURL(file);\n        });\n      setIsUploading", "          reader.readAsDataURL(file);\n        });\n      }\n      setIsUploading")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(text)

