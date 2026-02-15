from PIL import Image, ImageDraw

def create_icon(size):
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw owl-like icon
    # Body (brown circle)
    body_color = (139, 69, 19, 255)
    draw.ellipse([size*0.15, size*0.2, size*0.85, size*0.9], fill=body_color)
    
    # Eyes (white circles with black pupils)
    eye_size = size * 0.15
    left_eye_x = size * 0.35
    right_eye_x = size * 0.65
    eye_y = size * 0.4
    
    # White of eyes
    draw.ellipse([left_eye_x - eye_size/2, eye_y - eye_size/2, 
                  left_eye_x + eye_size/2, eye_y + eye_size/2], fill='white')
    draw.ellipse([right_eye_x - eye_size/2, eye_y - eye_size/2,
                  right_eye_x + eye_size/2, eye_y + eye_size/2], fill='white')
    
    # Pupils
    pupil_size = eye_size * 0.5
    draw.ellipse([left_eye_x - pupil_size/2, eye_y - pupil_size/2,
                  left_eye_x + pupil_size/2, eye_y + pupil_size/2], fill='black')
    draw.ellipse([right_eye_x - pupil_size/2, eye_y - pupil_size/2,
                  right_eye_x + pupil_size/2, eye_y + pupil_size/2], fill='black')
    
    # Beak (orange triangle)
    beak_top = size * 0.55
    beak_bottom = size * 0.65
    draw.polygon([
        (size * 0.5, beak_top),
        (size * 0.4, beak_bottom),
        (size * 0.6, beak_bottom)
    ], fill='orange')
    
    return img

# Create icons at different sizes
create_icon(16).save('icon16.png')
create_icon(48).save('icon48.png')
create_icon(128).save('icon128.png')

print("Icons created successfully!")
