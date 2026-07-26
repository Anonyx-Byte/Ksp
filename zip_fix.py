import os
import zipfile

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, path).replace('\\', '/')
            ziph.write(file_path, rel_path)

zip_path = r'C:\Users\anony\OneDrive\Desktop\iris-standalone.zip'
source_dir = r'c:\Users\anony\OneDrive\Desktop\Ireuka\iris-ksp\deploy-pkg'

if os.path.exists(zip_path):
    os.remove(zip_path)

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir(source_dir, zipf)
print('Zip created with forward slashes!')
