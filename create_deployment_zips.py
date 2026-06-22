import os
import zipfile

def zipdir(path, ziph, exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = []
    
    for root, dirs, files in os.walk(path):
        # Exclude directories
        dirs[:] = [d for d in dirs if not any(d.startswith(ex) or d == ex for ex in exclude_dirs)]
        
        for file in files:
            # Skip python cache files and sqlite database if you don't want to deploy it
            if file.endswith('.pyc') or file == 'db.sqlite3':
                continue
                
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, path)
            ziph.write(file_path, arcname)

print("Creating frontend_deploy.zip...")
with zipfile.ZipFile('frontend_deploy.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('construction_frontend/dist', zipf)

print("Creating backend_deploy.zip...")
backend_excludes = ['venv', 'venv_fixed', 'venv_new', 'venv_standard', 'venv_win', 'env', '__pycache__', '.git', '.pytest_cache']
with zipfile.ZipFile('backend_deploy.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('construction_backend', zipf, exclude_dirs=backend_excludes)

print("Deployment ZIP files created successfully!")
