import os
import re

files_to_modify = [
    'expenses/models.py',
    'hr/models.py',
    'materials/models.py',
    'reports/models.py',
    'tenders/models.py',
    'vehicles/models.py'
]

field_str = "    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, null=True, blank=True)\n"

for fpath in files_to_modify:
    full_path = os.path.join('construction_backend', fpath)
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple heuristic: add after the first field definition of a class
    # Better: regex to match `class X(models.Model):` and insert field
    new_content = re.sub(r'(class \w+\(models\.Model\):.*?)(?=\n    \w+ = models\.)', r'\1\n' + field_str, content, flags=re.DOTALL)
    
    # fallback for models with nested classes like Status
    # We can just match `class X(models.Model):` and any inner classes, then insert.
    lines = content.split('\n')
    out_lines = []
    for line in lines:
        out_lines.append(line)
        if line.startswith('class ') and '(models.Model)' in line:
            # We found a model class. We will just append the field right after the class declaration
            # But what if there are inner classes?
            # It's okay to put field before inner classes.
            out_lines.append(field_str.rstrip())
            
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out_lines))

print("Modified models.")
