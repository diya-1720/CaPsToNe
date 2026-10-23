import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6] # Blank slide

    # ==========================================
    # NEO-BRUTALIST COLOR PALETTE
    # Light off-white base, pure black 2.5pt borders, vibrant accent blocks
    # ==========================================
    BG_BASE = RGBColor(244, 244, 239)        # Off-White #F4F4EF
    CARD_WHITE = RGBColor(255, 255, 255)     # Pure White #FFFFFF
    BLACK = RGBColor(17, 17, 17)             # Solid Black #111111
    DARK_TEXT = RGBColor(30, 41, 59)         # Slate 800 #1E293B
    MUTED_TEXT = RGBColor(71, 85, 105)       # Slate 600 #475569
    
    # Neo-Brutalist Block Accents
    NEO_GREEN = RGBColor(50, 232, 117)       # Electric Green #32E875
    NEO_GREEN_BG = RGBColor(220, 252, 231)   # Mint Soft #DCFCE7
    NEO_YELLOW = RGBColor(255, 208, 39)      # Electric Yellow #FFD027
    NEO_YELLOW_BG = RGBColor(254, 243, 199)  # Amber Soft #FEF3C7
    NEO_CYAN = RGBColor(56, 189, 248)        # Sky Cyan #38BDF8
    NEO_CYAN_BG = RGBColor(224, 242, 254)    # Cyan Soft #E0F2FE
    NEO_RED = RGBColor(255, 92, 92)          # Neo Coral #FF5C5C
    NEO_RED_BG = RGBColor(254, 226, 226)     # Rose Soft #FEE2E2
    NEO_PURPLE = RGBColor(192, 132, 252)     # Neo Lavender #C084FC
    NEO_PURPLE_BG = RGBColor(243, 232, 255)  # Purple Soft #F3E8FF

    def add_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_BASE
        bg.line.fill.background()
        return bg

    def add_brutalist_card(slide, left, top, width, height, bg_color=CARD_WHITE, has_shadow=True):
        # Neo-Brutalist offset hard drop shadow (4px ~ 0.05 inches)
        if has_shadow:
            shadow = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left + Inches(0.06), top + Inches(0.06), width, height)
            shadow.fill.solid()
            shadow.fill.fore_color.rgb = BLACK
            shadow.line.fill.background()
        
        # Main card surface with thick solid black border
        card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = BLACK
        card.line.width = Pt(2.5)
        return card

    def add_header(slide, tag_text, title_text, subtitle_text=""):
        # Neo-Brutalist Tag Badge
        tag_width = Inches(len(tag_text) * 0.12 + 0.5)
        tag_box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.35), tag_width, Inches(0.35))
        tag_box.fill.solid()
        tag_box.fill.fore_color.rgb = NEO_YELLOW
        tag_box.line.color.rgb = BLACK
        tag_box.line.width = Pt(2.0)
        
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = False
        tf_tag.margin_top = Pt(2)
        tf_tag.margin_bottom = Pt(2)
        tf_tag.margin_left = Pt(4)
        tf_tag.margin_right = Pt(4)
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.font.size = Pt(10.5)
        p_tag.font.bold = True
        p_tag.font.color.rgb = BLACK
        p_tag.font.name = "Arial"
        p_tag.alignment = PP_ALIGN.CENTER

        # Single Header Box for Title + Subtitle: PREVENTS ALL TEXT COLLISION & OVERLAP
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.78), Inches(11.733), Inches(1.25))
        tf_header = header_box.text_frame
        tf_header.word_wrap = True
        tf_header.margin_top = Pt(0)
        tf_header.margin_bottom = Pt(0)
        tf_header.margin_left = Pt(0)
        tf_header.margin_right = Pt(0)

        p_title = tf_header.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = BLACK
        p_title.font.name = "Arial Black"

        if subtitle_text:
            p_sub = tf_header.add_paragraph()
            p_sub.text = subtitle_text
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = DARK_TEXT
            p_sub.font.name = "Arial"
            p_sub.space_before = Pt(3)

    # ==========================================
    # SLIDE 1: Title Slide (Neo-Brutalist Poster)
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    add_background(s1)

    # Top Tag
    tag1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.55), Inches(3.2), Inches(0.40))
    tag1.fill.solid()
    tag1.fill.fore_color.rgb = NEO_YELLOW
    tag1.line.color.rgb = BLACK
    tag1.line.width = Pt(2.0)
    p_t1 = tag1.text_frame.paragraphs[0]
    p_t1.text = "CAPSTONE | B.TECH CSE"
    p_t1.font.size = Pt(12)
    p_t1.font.bold = True
    p_t1.font.color.rgb = BLACK
    p_t1.font.name = "Arial Black"
    p_t1.alignment = PP_ALIGN.CENTER

    # Main Big Title Box
    tbox = s1.shapes.add_textbox(Inches(0.8), Inches(1.15), Inches(11.733), Inches(2.3))
    tf1 = tbox.text_frame
    tf1.word_wrap = True
    tf1.margin_left = Pt(0)
    tf1.margin_right = Pt(0)
    tf1.margin_top = Pt(0)
    tf1.margin_bottom = Pt(0)

    p_main = tf1.paragraphs[0]
    p_main.text = "AWEN: Smart Health & Stress Companion"
    p_main.font.size = Pt(34)
    p_main.font.bold = True
    p_main.font.color.rgb = BLACK
    p_main.font.name = "Arial Black"

    p_sub1 = tf1.add_paragraph()
    p_sub1.text = "A smart wearable pod that learns YOUR personal normal and stops annoying false stress alarms."
    p_sub1.font.size = Pt(16)
    p_sub1.font.color.rgb = DARK_TEXT
    p_sub1.font.name = "Arial"
    p_sub1.space_before = Pt(6)

    # 4 Neo-Brutalist Feature Cards
    cards_data = [
        ("ESP32 HARDWARE POD", "Reads your pulse, blood oxygen (SpO2), skin temperature, and motion in real time.", NEO_GREEN_BG),
        ("PERSONAL NORMAL", "Compares your body to YOUR OWN baseline, not to a generic one-size-fits-all medical cutoff.", NEO_YELLOW_BG),
        ("SMART MOTION FILTER", "Knows when you are walking or exercising so you never get false stress alarms.", NEO_CYAN_BG),
        ("100% PRIVATE & SAFE", "Saved right on your own laptop in local SQLite. Zero biometric data leaves your machine.", NEO_PURPLE_BG)
    ]
    for i, (title, desc, bg_c) in enumerate(cards_data):
        c_left = Inches(0.8 + i * 2.95)
        c_top = Inches(3.85)
        c_width = Inches(2.8)
        c_height = Inches(2.9)
        add_brutalist_card(s1, c_left, c_top, c_width, c_height, bg_color=bg_c)

        tb = s1.shapes.add_textbox(c_left + Inches(0.18), c_top + Inches(0.18), c_width - Inches(0.36), c_height - Inches(0.36))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(4)
        tf.margin_bottom = Pt(4)
        tf.margin_left = Pt(4)
        tf.margin_right = Pt(4)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11.5)
        pd.font.color.rgb = DARK_TEXT
        pd.font.name = "Arial"
        pd.space_before = Pt(8)

    # ==========================================
    # SLIDE 2: The Real Problem (Why Existing Watches Fail)
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_background(s2)
    add_header(s2, "The Real Problem", "Why Do Normal Fitness Watches Annoy Users?", "Current smartwatches compare everyone to generic averages and cause unnecessary panic.")

    col_w = Inches(3.7)
    cards_s2 = [
        ("1. Generic 100 BPM Rule", 
         "Standard watches flag any heart rate over 100 BPM as dangerous tachycardia.",
         [
             "• Ignores individual physiology: An athlete rests at 50 BPM, while a student rests at 80 BPM.",
             "• A single fixed medical cutoff cannot fit both people!"
         ],
         NEO_RED_BG),
        ("2. Walking = False Stress Alarm", 
         "When you climb stairs or walk quickly, your heart naturally beats faster.",
         [
             "• Watches are motion-blind: They cannot tell if you are moving or sitting still.",
             "• They falsely beep: 'You are stressed!' when you were just walking!"
         ],
         NEO_YELLOW_BG),
        ("3. Scary Warnings & Cloud Leaks", 
         "Sudden red alarms create anxiety and fear instead of helping you feel calm.",
         [
             "• Alarms trigger acute panic loops rather than gentle guidance.",
             "• In addition, private biometrics get shipped to commercial cloud servers for monetization."
         ],
         NEO_CYAN_BG)
    ]
    for i, (title, intro, bullets, bg_c) in enumerate(cards_s2):
        c_left = Inches(0.8 + i * 4.0)
        c_top = Inches(2.15)
        c_height = Inches(4.8)
        add_brutalist_card(s2, c_left, c_top, col_w, c_height, bg_color=bg_c)
        
        tb = s2.shapes.add_textbox(c_left + Inches(0.22), c_top + Inches(0.22), col_w - Inches(0.44), c_height - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(4)
        tf.margin_bottom = Pt(4)
        tf.margin_left = Pt(4)
        tf.margin_right = Pt(4)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(16)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        p_intro = tf.add_paragraph()
        p_intro.text = intro
        p_intro.font.size = Pt(12)
        p_intro.font.color.rgb = DARK_TEXT
        p_intro.font.name = "Arial"
        p_intro.space_before = Pt(8)

        for b in bullets:
            pb = tf.add_paragraph()
            pb.text = b
            pb.font.size = Pt(11.5)
            pb.font.color.rgb = DARK_TEXT
            pb.font.name = "Arial"
            pb.space_before = Pt(6)

    # ==========================================
    # SLIDE 3: The Big Idea (The AWEN Difference)
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_background(s3)
    add_header(s3, "Our Solution", "The AWEN Difference: Personal Normal + Caring Mascot", "Instead of hospital alarms, AWEN acts as an empathetic personal companion.")

    pillars = [
        ("1. We Learn YOUR Personal Normal", "Over the first 3 to 7 days, AWEN observes your daily routine and calculates YOUR personal normal range (μ ± 2σ). It asks: 'Is your body unusual for YOU?' instead of applying generic rules.", NEO_GREEN_BG),
        ("2. Smart Motion Filter (No False Alarms)", "We connect an optical pulse sensor AND an MPU-6050 motion sensor. If your pulse rises while walking, AWEN knows it is healthy exertion and stays completely quiet.", NEO_YELLOW_BG),
        ("3. Living Friendly Mascot (Awen)", "Replaces scary hospital charts with 'Awen' — a friendly vector mascot that changes color with your body: Green when balanced, Yellow when active, and Amber when watchful.", NEO_CYAN_BG),
        ("4. 100% Private on Your Machine", "Zero cloud databases. All sensor readings and reflections stay safely in a local SQLite database (awen.db) on your own laptop. Complete data sovereignty guaranteed.", NEO_PURPLE_BG)
    ]
    for i, (title, desc, bg_c) in enumerate(pillars):
        row = i // 2
        col = i % 2
        c_left = Inches(0.8 + col * 5.95)
        c_top = Inches(2.15 + row * 2.45)
        add_brutalist_card(s3, c_left, c_top, Inches(5.75), Inches(2.25), bg_color=bg_c)
        
        tb = s3.shapes.add_textbox(c_left + Inches(0.25), c_top + Inches(0.2), Inches(5.25), Inches(1.85))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(2)
        tf.margin_bottom = Pt(2)
        tf.margin_left = Pt(2)
        tf.margin_right = Pt(2)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(15)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11.5)
        pd.font.color.rgb = DARK_TEXT
        pd.font.name = "Arial"
        pd.space_before = Pt(5)

    # ==========================================
    # SLIDE 4: How The Whole System Works (3 Steps)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_background(s4)
    add_header(s4, "System Overview", "How The Whole System Works in 3 Clear Steps", "From your finger to the local brain and your web browser.")

    tiers = [
        ("STEP 1: SENSOR POD (Wrist / Finger)", 
         "ESP32 Microcontroller Pod",
         [
             "• MAX30102: Reads pulse and oxygen (SpO2).",
             "• MPU-6050: 3-axis motion sensor checks movement.",
             "• LM35: Measures direct skin temperature.",
             "• OLED Screen: Live pulse right on your wrist.",
             "• Streams over local Wi-Fi or direct USB cable."
         ],
         NEO_GREEN_BG),
        ("STEP 2: LOCAL BRAIN (Python FastAPI)", 
         "Fast Local Server on Port 8000",
         [
             "• Ingests sensor data every second in real time.",
             "• Calculates your rolling personal normal (μ ± 2σ).",
             "• Runs Isolation Forest ML to detect real stress.",
             "• Stores all history in local SQLite (awen.db).",
             "• 100% offline, zero internet connection needed."
         ],
         NEO_YELLOW_BG),
        ("STEP 3: WEB APP (React 19 Dashboard)", 
         "Modern Interactive Interface",
         [
             "• Live 60 FPS pulse waveform oscilloscope.",
             "• Living Mascot responds dynamically to vitals.",
             "• 7-Day Journey displays your baseline corridor.",
             "• Empathetic check-ins and breathing guides.",
             "• Free of confusing medical jargon."
         ],
         NEO_CYAN_BG)
    ]
    for i, (title, subhead, bullets, bg_c) in enumerate(tiers):
        c_left = Inches(0.8 + i * 4.0)
        c_top = Inches(2.15)
        c_height = Inches(4.8)
        add_brutalist_card(s4, c_left, c_top, col_w, c_height, bg_color=bg_c)
        
        tb = s4.shapes.add_textbox(c_left + Inches(0.22), c_top + Inches(0.22), col_w - Inches(0.44), c_height - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(4)
        tf.margin_bottom = Pt(4)
        tf.margin_left = Pt(4)
        tf.margin_right = Pt(4)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14.5)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        ps = tf.add_paragraph()
        ps.text = subhead
        ps.font.size = Pt(12)
        ps.font.bold = True
        ps.font.color.rgb = DARK_TEXT
        ps.font.name = "Arial"
        ps.space_before = Pt(6)

        for b in bullets:
            pb = tf.add_paragraph()
            pb.text = b
            pb.font.size = Pt(11)
            pb.font.color.rgb = DARK_TEXT
            pb.font.name = "Arial"
            pb.space_before = Pt(4)

    # ==========================================
    # SLIDE 5: Hardware Edge Engineering
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_background(s5)
    add_header(s5, "Hardware Pod", "The Physical Sensors We Connected & Programmed", "Real biomedical and motion hardware communicating over high-speed I2C.")

    hw_specs = [
        ("ESP32 Microcontroller", "Dual-core 240MHz chip with built-in Wi-Fi and Bluetooth. Handles sensor reading and web streaming simultaneously.", NEO_GREEN_BG),
        ("MAX30102 Pulse & SpO2", "High-precision optical sensor. Uses red (660nm) and infrared (880nm) light to read pulse and SpO2 at I2C address 0x57.", NEO_YELLOW_BG),
        ("MPU-6050 Motion Sensor", "3-axis accelerometer and gyro at I2C address 0x68. Computes total movement vector |a| to know when the user is moving.", NEO_CYAN_BG),
        ("LM35 Temperature", "Measures skin temperature directly in Celsius (+10 mV/°C) via ESP32 analog pin GPIO 34 with noise filtering.", NEO_RED_BG),
        ("SSD1306 OLED Screen", "Mini 0.96-inch display on the pod showing live pulse, Wi-Fi IP, and motion status at I2C address 0x3C.", NEO_PURPLE_BG),
        ("Dual Wi-Fi + USB Link", "Streams over local Wi-Fi (IP: 10.201.146.254:80) or direct USB cable with zero configuration required.", CARD_WHITE)
    ]
    for i, (title, desc, bg_c) in enumerate(hw_specs):
        row = i // 3
        col = i % 3
        c_left = Inches(0.8 + col * 3.95)
        c_top = Inches(2.15 + row * 2.45)
        add_brutalist_card(s5, c_left, c_top, Inches(3.75), Inches(2.25), bg_color=bg_c)
        
        tb = s5.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.18), Inches(3.35), Inches(1.85))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(2)
        tf.margin_bottom = Pt(2)
        tf.margin_left = Pt(2)
        tf.margin_right = Pt(2)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = DARK_TEXT
        pd.font.name = "Arial"
        pd.space_before = Pt(4)

    # ==========================================
    # SLIDE 6: Solving False Alarms (Motion Filter Logic)
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_background(s6)
    add_header(s6, "Smart Logic", "How We Stopped False Alarms & Constant Beeping", "Distinguishing healthy exercise from genuine emotional distress.")

    # Left Card
    add_brutalist_card(s6, Inches(0.8), Inches(2.15), Inches(5.75), Inches(4.8), bg_color=NEO_YELLOW_BG)
    tb_l = s6.shapes.add_textbox(Inches(1.02), Inches(2.35), Inches(5.3), Inches(4.4))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True
    tf_l.margin_top = Pt(2)
    tf_l.margin_bottom = Pt(2)
    tf_l.margin_left = Pt(2)
    tf_l.margin_right = Pt(2)
    
    p = tf_l.paragraphs[0]
    p.text = "THE SENSOR FUSION DECISION"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = BLACK
    p.font.name = "Arial Black"

    cases_l = [
        ("1. CASE A: Fast Pulse + MOVING (Walking / Stairs)", [
            "→ Classification: Healthy Physical Exertion.",
            "→ Action: SILENCE! Do not disturb the user.",
            "→ Mascot: Turns Golden Amber (Active Mode)."
        ]),
        ("2. CASE B: Fast Pulse + SITTING STILL (No Motion)", [
            "→ Classification: Possible Emotional Stress or Panic.",
            "→ Action: Gentle check-in: 'Are you feeling okay?'",
            "→ Mascot: Turns Caring Amber + offers 4-7-8 breathing."
        ])
    ]
    for case_title, case_pts in cases_l:
        p_c = tf_l.add_paragraph()
        p_c.text = case_title
        p_c.font.size = Pt(12)
        p_c.font.bold = True
        p_c.font.color.rgb = BLACK
        p_c.font.name = "Arial"
        p_c.space_before = Pt(8)
        for pt_text in case_pts:
            p_sub = tf_l.add_paragraph()
            p_sub.text = pt_text
            p_sub.font.size = Pt(11)
            p_sub.font.color.rgb = DARK_TEXT
            p_sub.font.name = "Arial"
            p_sub.space_before = Pt(2)

    # Right Card
    add_brutalist_card(s6, Inches(6.8), Inches(2.15), Inches(5.75), Inches(4.8), bg_color=NEO_GREEN_BG)
    tb_r = s6.shapes.add_textbox(Inches(7.02), Inches(2.35), Inches(5.3), Inches(4.4))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    tf_r.margin_top = Pt(2)
    tf_r.margin_bottom = Pt(2)
    tf_r.margin_left = Pt(2)
    tf_r.margin_right = Pt(2)
    
    p_r = tf_r.paragraphs[0]
    p_r.text = "ANTI-BEEPING PROTECTION"
    p_r.font.size = Pt(16)
    p_r.font.bold = True
    p_r.font.color.rgb = BLACK
    p_r.font.name = "Arial Black"

    points_r = [
        ("• Why Did Buzzers Usually Keep Beeping?", [
            "When heart rate rises, it takes several minutes to settle down. A normal loop would beep every single second!"
        ]),
        ("• How We Fixed It:", [
            "1. Hardware Lockout: Firmware enforces 60s cooldown so buzzer cannot beep repeatedly.",
            "2. Frontend Audio Debounce: Web audio chime enforces a 3-minute cooldown.",
            "3. Non-Alarmist Phrasing: Never says 'You are sick', only offers supportive calm."
        ])
    ]
    for h_text, b_texts in points_r:
        p_h = tf_r.add_paragraph()
        p_h.text = h_text
        p_h.font.size = Pt(12)
        p_h.font.bold = True
        p_h.font.color.rgb = BLACK
        p_h.font.name = "Arial"
        p_h.space_before = Pt(8)
        for b_text in b_texts:
            p_sub = tf_r.add_paragraph()
            p_sub.text = b_text
            p_sub.font.size = Pt(11)
            p_sub.font.color.rgb = DARK_TEXT
            p_sub.font.name = "Arial"
            p_sub.space_before = Pt(2)

    # ==========================================
    # SLIDE 7: The Math Behind Personal Normal (Made Simple)
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_background(s7)
    add_header(s7, "Mathematical Foundation", "The Math Behind Personal Normal (Made Simple)", "Why personal statistics work better than arbitrary medical numbers.")

    math_cards = [
        ("1. Personal Average (μ)", 
         "The mathematical center of YOUR quiet resting state.",
         "Formula: μ = Average of your resting readings",
         "Continuously updates as your cardiovascular fitness improves or routines change.",
         NEO_GREEN_BG),
        ("2. Personal Variance (σ)", 
         "Measures how much your pulse naturally swings up and down during calm periods.",
         "Individual Baseline Range: ±3 to ±7 BPM",
         "Some people naturally fluctuate by ±3 BPM; others naturally fluctuate by ±7 BPM. Captures individual autonomic nervous tone.",
         NEO_YELLOW_BG),
        ("3. Normal Comfort Zone", 
         "Your personalized safe zone corridor:",
         "Band: [ μ - 2σ , μ + 2σ ]",
         "In statistics, 95.45% of your normal resting readings fall inside this band. Only true anomalies lie outside!",
         NEO_CYAN_BG)
    ]
    for i, (title, desc1, formula, desc2, bg_c) in enumerate(math_cards):
        c_left = Inches(0.8 + i * 4.0)
        c_top = Inches(2.15)
        c_height = Inches(4.8)
        add_brutalist_card(s7, c_left, c_top, col_w, c_height, bg_color=bg_c)
        
        tb = s7.shapes.add_textbox(c_left + Inches(0.22), c_top + Inches(0.22), col_w - Inches(0.44), c_height - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(4)
        tf.margin_bottom = Pt(4)
        tf.margin_left = Pt(4)
        tf.margin_right = Pt(4)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(16)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pd1 = tf.add_paragraph()
        pd1.text = desc1
        pd1.font.size = Pt(12)
        pd1.font.color.rgb = DARK_TEXT
        pd1.font.name = "Arial"
        pd1.space_before = Pt(8)

        pf = tf.add_paragraph()
        pf.text = formula
        pf.font.size = Pt(12.5)
        pf.font.bold = True
        pf.font.color.rgb = BLACK
        pf.font.name = "Arial"
        pf.space_before = Pt(8)

        pd2 = tf.add_paragraph()
        pd2.text = desc2
        pd2.font.size = Pt(11.5)
        pd2.font.color.rgb = DARK_TEXT
        pd2.font.name = "Arial"
        pd2.space_before = Pt(8)

    # ==========================================
    # SLIDE 8: Software & AI Engine
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_background(s8)
    add_header(s8, "Software Engine", "FastAPI Local Microservice & Isolation Forest AI", "High-speed local processing with zero cloud lag and zero cloud dependencies.")

    be_cols = [
        ("FastAPI Microservice", 
         [
             "• High-speed local Python server on Port 8000.",
             "• Polls the ESP32 sensor pod automatically.",
             "• Ultra-low response latency under 5 milliseconds.",
             "• Interactive API docs available at /docs."
         ],
         NEO_GREEN_BG),
        ("Isolation Forest AI", 
         [
             "• Unsupervised Machine Learning via Scikit-Learn.",
             "• Learns your normal patterns without manual labeling.",
             "• Spots multi-dimensional anomalies (HR + SpO2 + Temp + Motion).",
             "• Calibrated dynamically during observation mode."
         ],
         NEO_YELLOW_BG),
        ("Local SQLite Database", 
         [
             "• Embedded local database: backend/awen.db.",
             "• Write-Ahead Logging (WAL) enables high concurrency.",
             "• Complete patient privacy with PBKDF2 authentication.",
             "• 100% offline, zero cloud reliance."
         ],
         NEO_CYAN_BG)
    ]
    for i, (title, bullets, bg_c) in enumerate(be_cols):
        c_left = Inches(0.8 + i * 4.0)
        c_top = Inches(2.15)
        c_height = Inches(4.8)
        add_brutalist_card(s8, c_left, c_top, col_w, c_height, bg_color=bg_c)
        
        tb = s8.shapes.add_textbox(c_left + Inches(0.22), c_top + Inches(0.22), col_w - Inches(0.44), c_height - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(4)
        tf.margin_bottom = Pt(4)
        tf.margin_left = Pt(4)
        tf.margin_right = Pt(4)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(16)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        for b in bullets:
            pb = tf.add_paragraph()
            pb.text = b
            pb.font.size = Pt(11.5)
            pb.font.color.rgb = DARK_TEXT
            pb.font.name = "Arial"
            pb.space_before = Pt(6)

    # ==========================================
    # SLIDE 9: Modern Frontend & Neo-Brutalism
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_background(s9)
    add_header(s9, "Frontend Design", "React 19, Tailwind & High-Contrast Neo-Brutalism", "Designed for maximum clarity, readability, and zero clutter.")

    fe_cards = [
        ("React 19 & Vite 6", "Built with modern React hooks and lightning-fast Vite bundling. Instant state transitions and zero interface lag.", NEO_GREEN_BG),
        ("Neo-Brutalist Visual Design", "Thick 2.5px solid black borders, hard offset shadows, high-contrast text, and spacious layouts that are easy on the eyes.", NEO_YELLOW_BG),
        ("Live 60 FPS Pulse Waveform", "Canvas oscilloscope draws your actual arterial pulse wave in real time as your blood flows.", NEO_CYAN_BG),
        ("Driverless Web Serial Connect", "Plug in the USB cable and click 'Connect' — communicates directly inside Chrome or Edge with zero driver installs.", NEO_PURPLE_BG)
    ]
    for i, (title, desc, bg_c) in enumerate(fe_cards):
        row = i // 2
        col = i % 2
        c_left = Inches(0.8 + col * 5.95)
        c_top = Inches(2.15 + row * 2.45)
        add_brutalist_card(s9, c_left, c_top, Inches(5.75), Inches(2.25), bg_color=bg_c)
        
        tb = s9.shapes.add_textbox(c_left + Inches(0.25), c_top + Inches(0.2), Inches(5.25), Inches(1.85))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(2)
        tf.margin_bottom = Pt(2)
        tf.margin_left = Pt(2)
        tf.margin_right = Pt(2)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(15)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11.5)
        pd.font.color.rgb = DARK_TEXT
        pd.font.name = "Arial"
        pd.space_before = Pt(5)

    # ==========================================
    # SLIDE 10: Meet Awen (Living Vector Mascot)
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_background(s10)
    add_header(s10, "Living Mascot", "Meet Awen: 5 Simple Colors That Show How You Feel", "A living vector mascot that changes color with your body.")

    states_data = [
        ("BALANCED", "Green (#32E875)", "Resting heart rate inside your normal comfort zone. Gentle breathing animation.", NEO_GREEN_BG),
        ("LEARNING", "Lavender (#C084FC)", "Observation Mode active (Day 1-3). Learning your daily habits.", NEO_PURPLE_BG),
        ("ACTIVE", "Yellow (#FFD027)", "Movement detected. Awen celebrates healthy exercise and walking.", NEO_YELLOW_BG),
        ("WATCHFUL", "Amber (#F97316)", "Resting pulse is high without motion. Awen offers a calm breathing check-in.", NEO_RED_BG),
        ("WIND DOWN", "Indigo (#818CF8)", "Evening time (after 21:00). Awen gets sleepy to remind you to rest.", NEO_CYAN_BG)
    ]
    for i, (title, color_name, desc, bg_c) in enumerate(states_data):
        c_left = Inches(0.8 + i * 2.38)
        c_top = Inches(2.15)
        c_width = Inches(2.22)
        c_height = Inches(4.8)
        add_brutalist_card(s10, c_left, c_top, c_width, c_height, bg_color=bg_c)

        tb = s10.shapes.add_textbox(c_left + Inches(0.14), c_top + Inches(0.18), c_width - Inches(0.28), c_height - Inches(0.36))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(2)
        tf.margin_bottom = Pt(2)
        tf.margin_left = Pt(2)
        tf.margin_right = Pt(2)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pc = tf.add_paragraph()
        pc.text = color_name
        pc.font.size = Pt(11)
        pc.font.bold = True
        pc.font.color.rgb = DARK_TEXT
        pc.font.name = "Arial"
        pc.space_before = Pt(4)

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = DARK_TEXT
        pd.font.name = "Arial"
        pd.space_before = Pt(6)

    # ==========================================
    # SLIDE 11: Screen Ecosystem
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_background(s11)
    add_header(s11, "User Experience", "The 7 Clean Screens in Our Application", "Every screen is simple, focused, and free of medical jargon.")

    screens = [
        ("1. Today Screen", "Live vitals (Heart Rate, SpO2, Temp), mascot stage, 7-day corridor ribbon, and evening check-in.", NEO_GREEN_BG),
        ("2. Journey Screen", "7-day trend chart showing your custom baseline band and how your body changes over time.", NEO_YELLOW_BG),
        ("3. Insights Screen", "Simple graphs showing your quiet hours, active hours, and sleep consistency.", NEO_CYAN_BG),
        ("4. Talk Screen", "Empathetic AI companion you can chat with anytime for stress relief and reflections.", NEO_PURPLE_BG),
        ("5. Hardware Hub", "Live ESP32 telemetry inspector, Wi-Fi configuration (10.201.146.254), and USB serial monitor.", CARD_WHITE),
        ("6. Settings & You", "Toggle observation calibration, reset your baseline, and manage your private data.", NEO_RED_BG)
    ]
    for i, (title, desc, bg_c) in enumerate(screens):
        row = i // 3
        col = i % 3
        c_left = Inches(0.8 + col * 3.95)
        c_top = Inches(2.15 + row * 2.45)
        add_brutalist_card(s11, c_left, c_top, Inches(3.75), Inches(2.25), bg_color=bg_c)
        
        tb = s11.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.18), Inches(3.35), Inches(1.85))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(2)
        tf.margin_bottom = Pt(2)
        tf.margin_left = Pt(2)
        tf.margin_right = Pt(2)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = DARK_TEXT
        pd.font.name = "Arial"
        pd.space_before = Pt(4)

    # ==========================================
    # SLIDE 12: Privacy & Data Sovereignty
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_background(s12)
    add_header(s12, "Data Security", "100% Private: Your Data Never Leaves Your Computer", "Biometric data belongs to the user, not commercial advertisers.")

    priv_cols = [
        ("1. 100% Local SQLite Storage", 
         [
             "• All sensor feeds and check-ins stay on your own laptop.",
             "• Zero danger of cloud database hacks or leaks.",
             "• You can export or delete your database with one click."
         ],
         NEO_GREEN_BG),
        ("2. Zero Cloud Leakage", 
         [
             "• No third-party health trackers or advertising beacons.",
             "• The ESP32 communicates purely across your local Wi-Fi or USB.",
             "• Zero internet connection required to operate."
         ],
         NEO_CYAN_BG),
        ("3. Safe & Ethical AI", 
         [
             "• AWEN strictly provides supportive wellness reflections, never unauthorized medical diagnoses.",
             "• Calm, reassuring tone prevents medical panic."
         ],
         NEO_YELLOW_BG)
    ]
    for i, (title, bullets, bg_c) in enumerate(priv_cols):
        c_left = Inches(0.8 + i * 4.0)
        c_top = Inches(2.15)
        c_height = Inches(4.8)
        add_brutalist_card(s12, c_left, c_top, col_w, c_height, bg_color=bg_c)
        
        tb = s12.shapes.add_textbox(c_left + Inches(0.22), c_top + Inches(0.22), col_w - Inches(0.44), c_height - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(4)
        tf.margin_bottom = Pt(4)
        tf.margin_left = Pt(4)
        tf.margin_right = Pt(4)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(15)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        for b in bullets:
            pb = tf.add_paragraph()
            pb.text = b
            pb.font.size = Pt(11.5)
            pb.font.color.rgb = DARK_TEXT
            pb.font.name = "Arial"
            pb.space_before = Pt(6)

    # ==========================================
    # SLIDE 13: Results & Benchmarks
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    add_background(s13)
    add_header(s13, "Experimental Validation", "Testing Results: Fast, Accurate & Zero False Alarms", "Proven through real hardware experiments and physical movement tests.")

    metrics = [
        ("< 120 ms", "Super Fast Latency", "From optical sensor sampling on your finger to live screen update over local Wi-Fi.", NEO_GREEN_BG),
        ("0%", "False Alarms During Exercise", "Accelerometer motion gate eliminated 100% of false alarms during stair climbing and walking.", NEO_YELLOW_BG),
        ("60 FPS", "Smooth Vector Mascot", "GPU-accelerated vector SVG animations with less than 2% CPU usage.", NEO_CYAN_BG),
        ("99.8%", "Stream Stability", "Dual-path fallback (Wi-Fi + USB Serial) guarantees zero data dropouts.", NEO_PURPLE_BG)
    ]
    for i, (stat, title, desc, bg_c) in enumerate(metrics):
        row = i // 2
        col = i % 2
        c_left = Inches(0.8 + col * 5.95)
        c_top = Inches(2.15 + row * 2.45)
        add_brutalist_card(s13, c_left, c_top, Inches(5.75), Inches(2.25), bg_color=bg_c)
        
        tb = s13.shapes.add_textbox(c_left + Inches(0.25), c_top + Inches(0.18), Inches(5.25), Inches(1.9))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(2)
        tf.margin_bottom = Pt(2)
        tf.margin_left = Pt(2)
        tf.margin_right = Pt(2)
        
        pt = tf.paragraphs[0]
        pt.text = stat
        pt.font.size = Pt(28)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pt2 = tf.add_paragraph()
        pt2.text = title
        pt2.font.size = Pt(13.5)
        pt2.font.bold = True
        pt2.font.color.rgb = BLACK
        pt2.font.name = "Arial Black"
        pt2.space_before = Pt(2)

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = DARK_TEXT
        pd.font.name = "Arial"
        pd.space_before = Pt(3)

    # ==========================================
    # SLIDE 14: Conclusion & Future Scope
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    add_background(s14)
    add_header(s14, "Conclusion & Future", "Conclusion & Next-Generation Roadmap", "A verified capstone project setting a new standard for empathetic health technology.")

    concl_cards = [
        ("What Has Been Delivered & Verified", 
         [
             "✔ Working ESP32 Sensor Pod with MAX30102, MPU-6050, LM35 & OLED.",
             "✔ Dual-Path Streaming: Local Wi-Fi (10.201.146.254) + Web Serial USB.",
             "✔ Motion-aware Exertion Filter & 60s buzzer cooldown.",
             "✔ Dynamic Personal Baseline Corridor (μ ± 2σ) statistical calculation.",
             "✔ React 19 Frontend with 5-State Living Mascot & 7-Screen Ecosystem."
         ],
         NEO_GREEN_BG),
        ("Future Commercial & Research Roadmap", 
         [
             "• Smart Ring Form Factor: Miniaturized multi-layer flex PCB.",
             "• Bluetooth Low Energy (BLE 5.0): Low-power wireless sync.",
             "• TinyML On-Device Models: Running TensorFlow Lite micro-models on chip.",
             "• Sleep Stage Tracking: Measuring autonomic recovery and RMSSD HRV overnight.",
             "• University Campus Pilot: Helping students manage exam stress."
         ],
         NEO_CYAN_BG)
    ]
    for i, (title, bullets, bg_c) in enumerate(concl_cards):
        c_left = Inches(0.8 + i * 5.95)
        c_top = Inches(2.15)
        c_width = Inches(5.75)
        c_height = Inches(4.8)
        add_brutalist_card(s14, c_left, c_top, c_width, c_height, bg_color=bg_c)
        
        tb = s14.shapes.add_textbox(c_left + Inches(0.25), c_top + Inches(0.22), c_width - Inches(0.5), c_height - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Pt(4)
        tf.margin_bottom = Pt(4)
        tf.margin_left = Pt(4)
        tf.margin_right = Pt(4)
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(15)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        for b in bullets:
            pb = tf.add_paragraph()
            pb.text = b
            pb.font.size = Pt(11.2)
            pb.font.color.rgb = DARK_TEXT
            pb.font.name = "Arial"
            pb.space_before = Pt(5)

    output_path = "AWEN_Final_Presentation_AF52.pptx"
    prs.save(output_path)
    print(f"Neo-Brutalist Presentation saved successfully to {output_path} with {len(prs.slides)} slides.")

if __name__ == "__main__":
    create_deck()
