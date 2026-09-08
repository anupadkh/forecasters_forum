import os
import re
from pathlib import Path
from google import genai

# Configuration
IMAGE_DIR = Path("./images/icons")
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MODEL_ID = "gemini-3.6-flash"

# Initialize Gemini Client (automatically reads GEMINI_API_KEY from environment)
client = genai.Client()


def sanitize_filename(name: str) -> str:
    """Removes invalid characters, markdown formatting, and limits length."""
    clean = re.sub(r'[*`\\/*?:"<>|\n\r]', "", name).strip()
    return clean[:60]


def generate_filename(file_path: Path) -> str:
    """Uploads the image to Gemini and asks for a short filename."""
    prompt = (
        "Generate a short, descriptive, lowercase filename for this image separated by dashes. "
        "Do not include file extensions, markdown formatting, or preamble. "
        "Example: red-sports-car-front-view"
    )

    # Read the image bytes directly
    with open(file_path, "rb") as f:
        image_bytes = f.read()

    # Determine mime type
    ext = file_path.suffix.lower().replace(".", "")
    mime_type = f"image/{'jpeg' if ext in ['jpg', 'jpeg'] else ext}"

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=[
            genai.types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt,
        ],
    )
    return sanitize_filename(response.text)


def process_images(directory: Path):
    for file_path in directory.iterdir():
        if not file_path.is_file() or file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        print(f"Processing: {file_path.name}...")

        try:
            suggested_name = generate_filename(file_path)
            if not suggested_name:
                print(f"  Skipped: Model returned an empty name for {file_path.name}")
                continue

            target_extension = file_path.suffix.lower()
            new_file_path = directory / f"{suggested_name}{target_extension}"

            # Avoid overwriting existing files with the same generated name
            counter = 1
            while new_file_path.exists() and new_file_path != file_path:
                new_file_path = directory / f"{suggested_name}_{counter}{target_extension}"
                counter += 1

            file_path.rename(new_file_path)
            print(f"  Renamed to: {new_file_path.name}")

        except Exception as e:
            print(f"  Failed to process {file_path.name}: {e}")


if __name__ == "__main__":
    if not IMAGE_DIR.exists():
        os.makedirs(IMAGE_DIR)
        print(f"Created folder '{IMAGE_DIR}'. Place images there and rerun.")
    else:
        process_images(IMAGE_DIR)