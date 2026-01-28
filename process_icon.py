import os
from PIL import Image, ImageDraw, ImageChops

def extract_and_upscale_icon(input_path, output_path, target_size=(1024, 1024), corner_radius=180):
    """
    1. Extract the actual icon shape from the image (non-white area for JPG) using threshold
    2. Upscale it to 1024x1024
    3. Apply rounded corner transparency
    """
    try:
        # 1. Open image
        img = Image.open(input_path).convert("RGB")
        
        # 2. Find the bounding box of non-white pixels
        # Create a white background image
        bg = Image.new("RGB", img.size, (255, 255, 255))
        
        # Difference
        diff = ImageChops.difference(img, bg)
        
        # Convert to grayscale
        diff = diff.convert("L")
        
        # Threshold: anything with difference > 20 becomes white (255), else black (0)
        # 20 is a safe threshold to ignore JPG compression noise usually
        threshold = 20
        mask = diff.point(lambda x: 255 if x > threshold else 0)
        
        bbox = mask.getbbox()
        
        if bbox:
            # Crop to the actual icon content
            icon = img.crop(bbox)
            print(f"Extracted icon from bbox: {bbox}, size: {icon.size}")
            
            # 3. Make it square by padding if needed
            w, h = icon.size
            max_side = max(w, h)
            
            # Create a square transparent canvas
            # Convert icon to RGBA for pasting
            icon = icon.convert("RGBA")
            square_icon = Image.new("RGBA", (max_side, max_side), (255, 255, 255, 0))
            
            # Paste the icon centered
            paste_x = (max_side - w) // 2
            paste_y = (max_side - h) // 2
            square_icon.paste(icon, (paste_x, paste_y))
            
            # 4. Upscale to target size (1024x1024)
            upscaled = square_icon.resize(target_size, Image.Resampling.LANCZOS)
            print(f"Upscaled to: {target_size}")
            
            # 5. Apply rounded corner mask
            mask_img = Image.new("L", target_size, 0)
            draw = ImageDraw.Draw(mask_img)
            draw.rounded_rectangle((0, 0, target_size[0], target_size[1]), radius=corner_radius, fill=255)
            
            # 6. Create final output with transparency
            output = Image.new("RGBA", target_size, (0, 0, 0, 0))
            output.paste(upscaled, (0, 0), mask=mask_img)
            
            # 7. Save
            output.save(output_path, "PNG")
            print(f"✅ Icon saved: {output_path} ({target_size[0]}x{target_size[1]})")
        else:
            print(f"❌ Could not find non-white icon content in {input_path}")
            
    except Exception as e:
        print(f"❌ Error processing {input_path}: {e}")

if __name__ == "__main__":
    src = "/Users/malife/.gemini/antigravity/brain/a35d2a46-52d0-4719-83e5-15ac06864d38/uploaded_media_1769585838605.jpg"
    assets_dir = "/Users/malife/daily-schedule-app/assets"
    
    # Process all icon files
    files = ["icon.png", "splash-icon.png", "adaptive-icon.png"]
    for f in files:
        extract_and_upscale_icon(src, os.path.join(assets_dir, f))
        
    # Favicon (smaller)
    extract_and_upscale_icon(src, os.path.join(assets_dir, "favicon.png"), target_size=(512, 512), corner_radius=90)
