with open('src/components/AdminDashboard.tsx', 'r') as f:
    lines = f.readlines()

lines.insert(116, "};\n")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.writelines(lines)
