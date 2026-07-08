import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    text = f.read()

# I will replace '  }\n  });\n// Optimized' with '  });\n};\n// Optimized'
# Actually wait, let's just write a script that replaces specific line ranges

def fix_line(lines, i, search, replace):
    if search in lines[i]:
        lines[i] = lines[i].replace(search, replace)
        
with open('src/components/AdminDashboard.tsx', 'r') as f:
    lines = f.readlines()
    
# Let's print out the exact problematic lines
print("116", repr(lines[116]))
print("117", repr(lines[117]))
print("427", repr(lines[427]))
print("428", repr(lines[428]))
print("503", repr(lines[503]))
print("504", repr(lines[504]))
print("531", repr(lines[531]))
print("555", repr(lines[555]))
print("600", repr(lines[600]))
print("601", repr(lines[601]))
print("617", repr(lines[617]))
print("618", repr(lines[618]))
print("622", repr(lines[622]))
print("946", repr(lines[946]))
print("1922", repr(lines[1922]))

