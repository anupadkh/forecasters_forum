import cv2
import numpy as np
import argparse
import os
import sys

# --- Global Navigation State ---
win_w, win_h = 1280, 720
scale = 1.0
x_offset, y_offset = 0.0, 0.0
is_panning = False
start_pan_x, start_pan_y = 0, 0
needs_update = True

# --- Global Logic State ---
points = []
crop_counter = 1
original_image = None
display_image = None
output_dir = ""  # New variable to store the save location

def extract_rectangle(pts):
    """Extracts a standard right-angled crop based on the 4 clicked points."""
    global original_image, crop_counter, output_dir
    
    # Get the perfect right-angled boundaries based on the 4 clicks
    x_coords = [p[0] for p in pts]
    y_coords = [p[1] for p in pts]
    
    min_x, max_x = min(x_coords), max(x_coords)
    min_y, max_y = min(y_coords), max(y_coords)
    
    # Ensure coordinates do not go outside the image borders
    h, w = original_image.shape[:2]
    min_x, min_y = max(0, min_x), max(0, min_y)
    max_x, max_y = min(w, max_x), min(h, max_y)

    # Standard NumPy array slicing to crop the rectangle
    cropped_image = original_image[min_y:max_y, min_x:max_x]

    # Save the output to the newly created folder
    output_filename = os.path.join(output_dir, f"{crop_counter}.png")
    cv2.imwrite(output_filename, cropped_image)
    print(f"--> Saved {output_filename}")
    
    # Show preview in a small window (optional)
    preview_h, preview_w = cropped_image.shape[:2]
    if preview_w > 0 and preview_h > 0:
        preview_scale = min(400 / preview_w, 400 / preview_h)
        preview_scale = min(1.0, preview_scale) # Don't stretch small crops
        patch_disp = cv2.resize(cropped_image, (int(preview_w * preview_scale), int(preview_h * preview_scale)))
        cv2.imshow("Last Extraction (Preview)", patch_disp)
    
    crop_counter += 1

def render_view():
    global display_image, scale, x_offset, y_offset, win_w, win_h
    
    M = np.array([
        [scale, 0, -x_offset * scale],
        [0, scale, -y_offset * scale]
    ], dtype=np.float32)

    canvas = cv2.warpAffine(display_image, M, (win_w, win_h))
    cv2.imshow("Mouse Window", canvas)

def mouse_callback(event, x, y, flags, param):
    global scale, x_offset, y_offset, is_panning, start_pan_x, start_pan_y
    global points, display_image, needs_update

    img_x = int((x / scale) + x_offset)
    img_y = int((y / scale) + y_offset)

    if event == cv2.EVENT_LBUTTONDOWN:
        points.append((img_x, img_y))
        
        radius = max(2, int(4 / scale))
        cv2.circle(display_image, (img_x, img_y), radius, (0, 255, 0), -1)

        if len(points) == 4:
            thickness = max(1, int(2 / scale))
            
            # Find the lowest/highest x,y coordinates to make a perfect rectangle
            x_coords = [p[0] for p in points]
            y_coords = [p[1] for p in points]
            min_x, max_x = min(x_coords), max(x_coords)
            min_y, max_y = min(y_coords), max(y_coords)
            
            # Draw the red right-angled rectangle on the display image
            cv2.rectangle(display_image, (min_x, min_y), (max_x, max_y), (0, 0, 255), thickness)
            
            # Extract and save
            extract_rectangle(points)
            points = []
            
        needs_update = True

    # --- PANNING ---
    elif event == cv2.EVENT_RBUTTONDOWN:
        is_panning = True
        start_pan_x, start_pan_y = x, y

    elif event == cv2.EVENT_MOUSEMOVE:
        if is_panning:
            dx = (start_pan_x - x) / scale
            dy = (start_pan_y - y) / scale
            x_offset += dx
            y_offset += dy
            start_pan_x, start_pan_y = x, y
            needs_update = True

    elif event == cv2.EVENT_RBUTTONUP:
        is_panning = False

    # --- ZOOMING ---
    elif event == getattr(cv2, 'EVENT_MOUSEWHEEL', 10):
        if flags > 0:
            new_scale = scale * 1.25
        else:
            new_scale = scale / 1.25

        x_offset = img_x - (x / new_scale)
        y_offset = img_y - (y / new_scale)
        scale = new_scale
        needs_update = True

# --- Main Application ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract axis-aligned rectangular patches.")
    parser.add_argument("image_path", type=str, help="Path to the input image file")
    args = parser.parse_args()

    # 1. Resolve full path
    full_image_path = os.path.abspath(args.image_path)
    
    # 2. Extract folder path and file name
    img_dir = os.path.dirname(full_image_path)           # e.g., C:\Photos
    img_filename = os.path.basename(full_image_path)     # e.g., document.jpg
    img_name_no_ext = os.path.splitext(img_filename)[0]  # e.g., document
    
    # 3. Create the new output directory
    output_dir = os.path.join(img_dir, img_name_no_ext)
    os.makedirs(output_dir, exist_ok=True)               # Creates folder if it doesn't exist
    
    print(f"Output folder created/verified at: {output_dir}")

    # 4. Load the image
    original_image = cv2.imread(full_image_path)

    if original_image is None:
        print(f"Error: Could not load image at '{full_image_path}'")
        sys.exit(1)

    display_image = original_image.copy()

    # Calculate initial fit
    h, w = original_image.shape[:2]
    scale = min(win_w / w, win_h / h)
    scale = min(1.0, scale)
    x_offset = (w - (win_w / scale)) / 2
    y_offset = (h - (win_h / scale)) / 2

    cv2.namedWindow("Mouse Window", cv2.WINDOW_AUTOSIZE)
    cv2.setMouseCallback("Mouse Window", mouse_callback)

    print("\n--- INSTRUCTIONS ---")
    print("LEFT CLICK:          Place 4 points to form a perfect right-angled crop")
    print("RIGHT-CLICK & DRAG:  Pan around the image")
    print("SCROLL WHEEL:        Zoom In / Out")
    print("'c' KEY:             Clear current points & reset drawings")
    print("'q' or 'ESC' KEY:    Quit")
    print("--------------------\n")

    while True:
        if needs_update:
            render_view()
            needs_update = False
        
        key = cv2.waitKey(15) & 0xFF
        
        if key == ord('q') or key == 27:
            break
            
        elif key == ord('c'):
            display_image = original_image.copy()
            points = []
            needs_update = True
            
        elif key == ord('+') or key == ord('='):
            img_x = (win_w / 2 / scale) + x_offset
            img_y = (win_h / 2 / scale) + y_offset
            scale *= 1.25
            x_offset = img_x - (win_w / 2 / scale)
            y_offset = img_y - (win_h / 2 / scale)
            needs_update = True
            
        elif key == ord('-') or key == ord('_'):
            img_x = (win_w / 2 / scale) + x_offset
            img_y = (win_h / 2 / scale) + y_offset
            scale /= 1.25
            x_offset = img_x - (win_w / 2 / scale)
            y_offset = img_y - (win_h / 2 / scale)
            needs_update = True

    cv2.destroyAllWindows()