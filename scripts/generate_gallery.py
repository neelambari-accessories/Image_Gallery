import os
 import json

ROOT = "images"
 gallery = []

if os.path.exists(ROOT):
 for category in sorted(os.listdir(ROOT)):
 cat_path = os.path.join(ROOT, category)

 if not os.path.isdir(cat_path):
 continue

 folders = []

 for folder in sorted(os.listdir(cat_path)):
 folder_path = os.path.join(cat_path, folder)

 if not os.path.isdir(folder_path):
 continue

 images = []

 for file in sorted(os.listdir(folder_path)):
 if file.lower().endswith(
 (".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg")
 ):
 images.append({
 "name": file,
 "path": f"images/{category}/{folder}/{file}"
 })

 folders.append({
 "folderName": folder,
 "images": images
 })

 gallery.append({
 "category": category,
 "folders": folders
 })

with open("gallery.json", "w", encoding="utf-8") as f:
 json.dump(gallery, f, indent=2)
