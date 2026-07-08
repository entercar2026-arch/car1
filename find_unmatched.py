with open('src/components/AdminDashboard.tsx', 'r') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    for j, char in enumerate(line):
        if char == '{':
            stack.append((i+1, j+1))
        elif char == '}':
            if stack:
                stack.pop()
            else:
                print(f"Unmatched }} at line {i+1} col {j+1}")

if stack:
    print(f"Unmatched {{ at lines: {stack}")
