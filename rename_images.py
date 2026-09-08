import os
import re
from pathlib import Path
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk

# Configuration
IMAGE_DIR = Path("./images/icons4")
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_PREVIEW_SIZE = (600, 500)


def sanitize_filename(name: str) -> str:
    """Removes invalid characters for Windows/Linux filenames."""
    clean = re.sub(r'[*`\\/*?:"<>|\n\r]', "", name).strip()
    return clean[:120]


class ImageRenamerDialog:
    def __init__(self, root: tk.Tk, file_path: Path):
        self.root = root
        self.file_path = file_path
        self.result = None  # Stores final input, or None if skipped

        self.window = tk.Toplevel(root)
        self.window.title(f"Rename: {file_path.name}")
        self.window.protocol("WM_DELETE_WINDOW", self.on_skip)
        self.window.resizable(False, False)

        self._build_ui()
        self._load_image()

        # Center on screen and wait for user interaction
        self.window.lift()
        self.window.grab_set()
        root.wait_window(self.window)

    def _build_ui(self):
        # Image Display Area
        self.img_label = tk.Label(self.window)
        self.img_label.pack(padx=12, pady=(12, 6))

        # Input Frame
        input_frame = tk.Frame(self.window)
        input_frame.pack(padx=12, pady=6, fill="x")

        lbl = tk.Label(input_frame, text="New filename (extension kept automatically):")
        lbl.pack(anchor="w")

        self.entry = tk.Entry(input_frame, font=("Segoe UI", 10), width=45)
        self.entry.insert(0, self.file_path.stem)
        self.entry.select_range(0, tk.END)
        self.entry.pack(fill="x", pady=4)
        self.entry.focus_set()

        # Keyboard shortcuts
        self.entry.bind("<Return>", lambda event: self.on_save())
        self.entry.bind("<Escape>", lambda event: self.on_skip())

        # Buttons Frame
        btn_frame = tk.Frame(self.window)
        btn_frame.pack(padx=12, pady=(4, 12), fill="x")

        save_btn = tk.Button(
            btn_frame,
            text="Save & Next (Enter)",
            command=self.on_save,
            bg="#007acc",
            fg="white",
            padx=10,
        )
        save_btn.pack(side="right", padx=(6, 0))

        skip_btn = tk.Button(
            btn_frame, text="Skip (Esc)", command=self.on_skip, padx=10
        )
        skip_btn.pack(side="right")

    def _load_image(self):
        try:
            with Image.open(self.file_path) as img:
                # Resize proportionally to fit inside preview dimensions
                img.thumbnail(MAX_PREVIEW_SIZE, Image.Resampling.LANCZOS)
                self.photo = ImageTk.PhotoImage(img)
                self.img_label.config(image=self.photo)
        except Exception as e:
            self.img_label.config(
                text=f"Failed to load image preview:\n{e}", fg="red"
            )

    def on_save(self):
        val = self.entry.get().strip()
        if val:
            self.result = val
            self.window.destroy()

    def on_skip(self):
        self.result = None
        self.window.destroy()


def process_images(directory: Path):
    root = tk.Tk()
    root.withdraw()

    images = [
        p
        for p in directory.iterdir()
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not images:
        print(f"No supported images found in: {directory.resolve()}")
        return

    print(f"Found {len(images)} images to process.")

    for file_path in images:
        dialog = ImageRenamerDialog(root, file_path)

        if dialog.result is None:
            print(f"Skipped: {file_path.name}")
            continue

        new_stem = sanitize_filename(dialog.result)
        if not new_stem:
            print(f"Skipped (invalid name): {file_path.name}")
            continue

        extension = file_path.suffix.lower()
        new_path = directory / f"{new_stem}{extension}"

        if new_path == file_path:
            print(f"Unchanged: {file_path.name}")
            continue

        # Prevent file collisions
        counter = 1
        while new_path.exists():
            new_path = directory / f"{new_stem}_{counter}{extension}"
            counter += 1

        try:
            file_path.rename(new_path)
            print(f"Renamed: {file_path.name} -> {new_path.name}")
        except OSError as e:
            print(f"Error renaming {file_path.name}: {e}")

    messagebox.showinfo("Done", "All images processed!", parent=root)
    root.destroy()


if __name__ == "__main__":
    if not IMAGE_DIR.exists():
        IMAGE_DIR.mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {IMAGE_DIR.resolve()}")
    else:
        process_images(IMAGE_DIR)