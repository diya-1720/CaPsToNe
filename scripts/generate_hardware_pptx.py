import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_hardware_deck():
    prs = Presentation()
    # 16:9 Widescreen format
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # ==========================================
    # NEO-BRUTALIST COLOR PALETTE
    # High-contrast black outlines, solid offset shadows, vibrant pastel fills
    # ==========================================
    BG_BASE = RGBColor(246, 246, 240)       # Crisp Off-White / Cream Canvas
    CARD_WHITE = RGBColor(255, 255, 255)    # Pure White #FFFFFF
    BLACK = RGBColor(17, 17, 17)            # Solid High-Contrast Black #111111
    DARK_TEXT = RGBColor(17, 24, 39)        # Near-black slate for maximum readability
    MUTED_TEXT = RGBColor(75, 85, 99)       # Medium Slate for secondary notes

    # Vibrant Neo-Brutalist Pastels & Electric Accents
    NEO_YELLOW = RGBColor(255, 214, 10)     # Electric Yellow #FFD60A
    NEO_YELLOW_BG = RGBColor(254, 243, 199) # Warm Amber Soft #FEF3C7
    NEO_GREEN = RGBColor(34, 197, 94)       # Emerald Green #22C55E
    NEO_GREEN_BG = RGBColor(220, 252, 231)  # Mint Soft #DCFCE7
    NEO_CYAN = RGBColor(14, 165, 233)       # Sky Cyan #0EA5E9
    NEO_CYAN_BG = RGBColor(224, 242, 254)   # Cyan Soft #E0F2FE
    NEO_CORAL = RGBColor(244, 63, 94)       # Rose / Coral #F43F5E
    NEO_CORAL_BG = RGBColor(254, 226, 226)  # Rose Soft #FEE2E2
    NEO_PURPLE = RGBColor(168, 85, 247)     # Lavender Purple #A855F7
    NEO_PURPLE_BG = RGBColor(243, 232, 255) # Purple Soft #F3E8FF
    NEO_ORANGE_BG = RGBColor(255, 237, 213) # Orange Soft #FFEDD5

    def add_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_BASE
        bg.line.fill.background()
        return bg

    def add_brutalist_card(slide, left, top, width, height, bg_color=CARD_WHITE, has_shadow=True, border_width=Pt(2.5)):
        if has_shadow:
            shadow = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left + Inches(0.065), top + Inches(0.065), width, height)
            shadow.fill.solid()
            shadow.fill.fore_color.rgb = BLACK
            shadow.line.fill.background()

        card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = BLACK
        card.line.width = border_width
        return card

    def add_pill_badge(slide, left, top, width, height, text, bg_color=NEO_YELLOW, font_size=Pt(11)):
        # Hard shadow
        s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left + Inches(0.04), top + Inches(0.04), width, height)
        s.fill.solid()
        s.fill.fore_color.rgb = BLACK
        s.line.fill.background()

        b = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
        b.fill.solid()
        b.fill.fore_color.rgb = bg_color
        b.line.color.rgb = BLACK
        b.line.width = Pt(1.8)
        
        tf = b.text_frame
        tf.word_wrap = False
        tf.margin_top = Pt(2)
        tf.margin_bottom = Pt(2)
        tf.margin_left = Pt(4)
        tf.margin_right = Pt(4)
        p = tf.paragraphs[0]
        p.text = text.upper()
        p.font.size = font_size
        p.font.bold = True
        p.font.color.rgb = BLACK
        p.font.name = "Arial Black"
        p.alignment = PP_ALIGN.CENTER
        return b

    def add_header(slide, tag_text, title_text, subtitle_text="", tag_color=NEO_YELLOW):
        tag_width = Inches(len(tag_text) * 0.125 + 0.6)
        add_pill_badge(slide, Inches(0.8), Inches(0.32), tag_width, Inches(0.35), tag_text, bg_color=tag_color, font_size=Pt(11))

        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.76), Inches(11.733), Inches(1.15))
        tf_header = header_box.text_frame
        tf_header.word_wrap = True
        tf_header.margin_top = Pt(0)
        tf_header.margin_bottom = Pt(0)
        tf_header.margin_left = Pt(0)
        tf_header.margin_right = Pt(0)

        p_title = tf_header.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(25)
        p_title.font.bold = True
        p_title.font.color.rgb = BLACK
        p_title.font.name = "Arial Black"

        if subtitle_text:
            p_sub = tf_header.add_paragraph()
            p_sub.text = subtitle_text
            p_sub.font.size = Pt(13)
            p_sub.font.bold = True
            p_sub.font.color.rgb = DARK_TEXT
            p_sub.font.name = "Arial"
            p_sub.space_before = Pt(3)

    def add_bullet(tf, bold_prefix, text_content, font_size=Pt(13.5), space_before=Pt(6)):
        p = tf.add_paragraph()
        p.space_before = space_before
        
        run_dot = p.add_run()
        run_dot.text = "▪ "
        run_dot.font.bold = True
        run_dot.font.size = font_size
        run_dot.font.color.rgb = BLACK
        run_dot.font.name = "Arial"

        if bold_prefix:
            run_prefix = p.add_run()
            run_prefix.text = bold_prefix + ": "
            run_prefix.font.bold = True
            run_prefix.font.size = font_size
            run_prefix.font.color.rgb = BLACK
            run_prefix.font.name = "Arial Black"

        run_text = p.add_run()
        run_text.text = text_content
        run_text.font.bold = False
        run_text.font.size = font_size
        run_text.font.color.rgb = DARK_TEXT
        run_text.font.name = "Arial"

    # =========================================================================
    # SLIDE 1: Title Slide (Neo-Brutalist Hardware Showcase Poster)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_background(s1)

    # College Banner Header Card
    add_brutalist_card(s1, Inches(0.8), Inches(0.35), Inches(11.733), Inches(1.05), bg_color=CARD_WHITE)
    banner_path = os.path.join("figures", "college_header.jpeg")
    if not os.path.exists(banner_path):
        banner_path = "image2.jpeg"
    if os.path.exists(banner_path):
        s1.shapes.add_picture(banner_path, Inches(0.9), Inches(0.40), width=Inches(11.533), height=Inches(0.95))

    # Main Project Title Card
    main_top = Inches(1.55)
    main_h = Inches(2.35)
    add_brutalist_card(s1, Inches(0.8), main_top, Inches(11.733), main_h, bg_color=NEO_YELLOW_BG)

    tbox1 = s1.shapes.add_textbox(Inches(1.05), main_top + Inches(0.16), Inches(11.233), main_h - Inches(0.32))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True

    p_badge = tf1.paragraphs[0]
    p_badge.text = "CAPSTONE PROJECT • DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING (DATA SCIENCE)"
    p_badge.font.size = Pt(11.5)
    p_badge.font.bold = True
    p_badge.font.color.rgb = BLACK
    p_badge.font.name = "Arial Black"

    p_title = tf1.add_paragraph()
    p_title.text = "AWEN: Smart IoT Hardware & Biometric Sensing"
    p_title.font.size = Pt(30)
    p_title.font.bold = True
    p_title.font.color.rgb = BLACK
    p_title.font.name = "Arial Black"
    p_title.space_before = Pt(4)

    p_sub = tf1.add_paragraph()
    p_sub.text = "Multi-Sensor Edge Architecture: ESP32 + MAX30100 + MPU-6050 + LM35DZ + OLED + Buzzer"
    p_sub.font.size = Pt(14.5)
    p_sub.font.bold = True
    p_sub.font.color.rgb = DARK_TEXT
    p_sub.font.name = "Arial"
    p_sub.space_before = Pt(5)

    # 4 Bottom Feature Cards with Spec Badges
    info_cards = [
        ("ESP32 DUAL-CORE", "Tensilica 240MHz master controller handling multi-sensor I2C telemetry & digital filtering.", "240 MHz • 520 KB", NEO_GREEN_BG),
        ("SENSORS SUITE", "MAX30100 optical PPG/SpO2, MPU-6050 6-axis kinematics & LM35DZ skin temperature.", "3 In-Line Sensors", NEO_CYAN_BG),
        ("LOCAL INTERFACES", "0.96\" I2C OLED local display + Active Piezo buzzer for instant offline alarms.", "I2C 0x3C • GPIO 25", NEO_ORANGE_BG),
        ("PERSONAL NORMAL", "On-device physiological baseline eliminates false stress triggers during walking.", "Edge AI • Private", NEO_PURPLE_BG)
    ]
    for i, (title, desc, spec_pill, bg_c) in enumerate(info_cards):
        c_left = Inches(0.8 + i * 2.98)
        c_top = Inches(4.08)
        c_width = Inches(2.78)
        c_height = Inches(2.15)
        add_brutalist_card(s1, c_left, c_top, c_width, c_height, bg_color=bg_c)

        tb = s1.shapes.add_textbox(c_left + Inches(0.16), c_top + Inches(0.14), c_width - Inches(0.32), c_height - Inches(0.28))
        tf = tb.text_frame
        tf.word_wrap = True
        
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11.5)
        pd.font.bold = True
        pd.font.color.rgb = DARK_TEXT
        pd.font.name = "Arial"
        pd.space_before = Pt(8)

        # Spec pill at bottom of card
        add_pill_badge(s1, c_left + Inches(0.16), c_top + Inches(1.68), c_width - Inches(0.32), Inches(0.32), spec_pill, bg_color=CARD_WHITE, font_size=Pt(9.5))

    # Academic Meta Footer Card
    add_brutalist_card(s1, Inches(0.8), Inches(6.42), Inches(11.733), Inches(0.68), bg_color=CARD_WHITE)
    t_meta = s1.shapes.add_textbox(Inches(1.0), Inches(6.46), Inches(11.333), Inches(0.58))
    tf_m = t_meta.text_frame
    tf_m.word_wrap = True
    p_meta = tf_m.paragraphs[0]
    p_meta.text = "PROJECT GROUP: AF52  |  DEPARTMENT OF CSE (DATA SCIENCE)  |  SJCEM, PALGHAR  |  ACADEMIC YEAR: 2026–2027"
    p_meta.font.size = Pt(11)
    p_meta.font.bold = True
    p_meta.font.color.rgb = BLACK
    p_meta.font.name = "Arial Black"
    p_meta.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 2: Project Objectives (Hardware-Centric Focus)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_background(s2)
    add_header(s2, "Hardware Objectives", "Key Engineering Objectives of AWEN Hardware", "Designed to deliver non-invasive, continuous, edge-computed physiological telemetry.")

    obj_cards = [
        ("1. Multi-Modal Synchronous Sensing",
         "Implement reliable physical transduction of vital physiological signals on a wearable edge platform.",
         [
             ("PPG & SpO2 Capture", "Continuous 100 Hz sampling of infrared and red optical absorbance."),
             ("Peripheral Skin Temperature", "Precision ±0.5°C thermal monitoring via analog LM35DZ."),
             ("6-DOF Kinematic Tracking", "3-axis acceleration and rotational rate via MPU-6050 at 50 Hz.")
         ],
         NEO_CYAN_BG),
        ("2. Real-Time Motion Artifact Cancellation",
         "Resolve the critical failure mode of existing commercial fitness bands: false stress alarms during exercise.",
         [
             ("Kinematic Filtering", "Cross-correlate heart rate spikes with inertial acceleration magnitudes."),
             ("Activity Awareness", "Identify walking, running, and stair climbing in real-time on ESP32."),
             ("Zero False Panic", "Suppress stress warnings when tachycardia is caused by physical exertion.")
         ],
         NEO_YELLOW_BG),
        ("3. Autonomous Edge Feedback & Privacy",
         "Ensure total device autonomy and zero commercial cloud data harvesting.",
         [
             ("Local OLED & Buzzer", "Direct visual and auditory feedback without needing a smartphone."),
             ("Edge State Computing", "Personal moving baseline computed locally on ESP32 / local host."),
             ("100% Private Health Pod", "Zero sensitive biometric streams uploaded to third-party ad networks.")
         ],
         NEO_GREEN_BG)
    ]

    col_w = Inches(3.7)
    for i, (title, intro, bullets, bg_c) in enumerate(obj_cards):
        c_left = Inches(0.8 + i * 4.01)
        c_top = Inches(2.1)
        c_height = Inches(4.9)
        add_brutalist_card(s2, c_left, c_top, col_w, c_height, bg_color=bg_c)

        tb = s2.shapes.add_textbox(c_left + Inches(0.22), c_top + Inches(0.22), col_w - Inches(0.44), c_height - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(16)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        p_intro = tf.add_paragraph()
        p_intro.text = intro
        p_intro.font.size = Pt(12.5)
        p_intro.font.bold = True
        p_intro.font.color.rgb = DARK_TEXT
        p_intro.font.name = "Arial"
        p_intro.space_before = Pt(8)

        for b_prefix, b_text in bullets:
            add_bullet(tf, b_prefix, b_text, font_size=Pt(12), space_before=Pt(8))

    # =========================================================================
    # SLIDE 3: System Architecture & Hardware Working Principle
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_background(s3)
    add_header(s3, "System Working", "Hardware Architecture & Working Principle", "Synchronous multi-sensor acquisition, edge signal conditioning, and dual feedback loops.")

    # Left: 4-step execution flow
    left_w = Inches(6.0)
    stages = [
        ("STAGE 1: TRANSDUCTION", "MAX30100 captures PPG optical pulses, MPU-6050 tracks 6-DOF motion, LM35DZ generates analog voltage proportional to body temp.", NEO_GREEN_BG),
        ("STAGE 2: I2C BUS MULTIPLEXING", "ESP32 acts as I2C Master (SDA GPIO 21, SCL GPIO 22) polling digital sensors at 100 Hz and reading ADC1_CH6 (GPIO 34) at 1 Hz.", NEO_CYAN_BG),
        ("STAGE 3: EDGE PREPROCESSING", "DC drift filter isolates pulse waves, dynamic peak detection computes BPM/SpO2, and MPU motion threshold gates stress alerts.", NEO_YELLOW_BG),
        ("STAGE 4: LOCAL DISPLAY & ALERTS", "Real-time vitals rendered on 0.96\" OLED; buzzer pulses on acute threshold anomalies; serial JSON streamed to dashboard.", NEO_CORAL_BG)
    ]
    for i, (st_title, st_desc, bg_c) in enumerate(stages):
        c_top = Inches(2.05 + i * 1.25)
        add_brutalist_card(s3, Inches(0.8), c_top, left_w, Inches(1.15), bg_color=bg_c)
        tb = s3.shapes.add_textbox(Inches(0.95), c_top + Inches(0.1), left_w - Inches(0.3), Inches(0.95))
        tf = tb.text_frame
        tf.word_wrap = True
        
        pt = tf.paragraphs[0]
        pt.text = st_title
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pd = tf.add_paragraph()
        pd.text = st_desc
        pd.font.size = Pt(11.5)
        pd.font.bold = True
        pd.font.color.rgb = DARK_TEXT
        pd.font.name = "Arial"
        pd.space_before = Pt(3)

    # Right: Prototype Photo Card
    proto_card_left = Inches(7.1)
    proto_card_w = Inches(5.433)
    proto_card_h = Inches(4.9)
    add_brutalist_card(s3, proto_card_left, Inches(2.05), proto_card_w, proto_card_h, bg_color=CARD_WHITE)
    
    if os.path.exists("figures/hardware/prototype.jpg"):
        s3.shapes.add_picture("figures/hardware/prototype.jpg", proto_card_left + Inches(0.15), Inches(2.2), width=proto_card_w - Inches(0.3), height=Inches(3.7))

    cap_box = s3.shapes.add_textbox(proto_card_left + Inches(0.15), Inches(6.0), proto_card_w - Inches(0.3), Inches(0.8))
    tf_cap = cap_box.text_frame
    tf_cap.word_wrap = True
    p_cap_t = tf_cap.paragraphs[0]
    p_cap_t.text = "PROTOTYPE: Assembled AWEN Breadboard Circuit"
    p_cap_t.font.size = Pt(12)
    p_cap_t.font.bold = True
    p_cap_t.font.color.rgb = BLACK
    p_cap_t.font.name = "Arial Black"
    p_cap_d = tf_cap.add_paragraph()
    p_cap_d.text = "ESP32 WROOM-32, active OLED displaying PPG waveform, finger on optical sensor, MPU-6050 & LM35DZ."
    p_cap_d.font.size = Pt(10.5)
    p_cap_d.font.color.rgb = MUTED_TEXT

    # =========================================================================
    # SLIDE 4: Core Controller — ESP-32 Microcontroller
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_background(s4)
    add_header(s4, "Microcontroller Core", "ESP-32 Dev Module (WROOM-32): The Brain of AWEN", "High-performance dual-core SoC driving simultaneous sensor polling and digital signal processing.")

    col_img_w = Inches(4.4)
    add_brutalist_card(s4, Inches(0.8), Inches(2.1), col_img_w, Inches(4.9), bg_color=CARD_WHITE)
    if os.path.exists("figures/hardware/esp32.jpg"):
        s4.shapes.add_picture("figures/hardware/esp32.jpg", Inches(0.95), Inches(2.25), width=col_img_w - Inches(0.3), height=Inches(3.45))
    
    add_pill_badge(s4, Inches(0.95), Inches(5.82), col_img_w - Inches(0.3), Inches(0.36), "ESP-WROOM-32 (30-PIN)", bg_color=NEO_YELLOW, font_size=Pt(11))

    lbl4 = s4.shapes.add_textbox(Inches(0.95), Inches(6.25), col_img_w - Inches(0.3), Inches(0.65))
    tf_lbl4 = lbl4.text_frame
    tf_lbl4.word_wrap = True
    p_l4 = tf_lbl4.paragraphs[0]
    p_l4.text = "Hardware I2C Master @ 400kHz | 12-Bit SAR ADC"
    p_l4.font.size = Pt(11)
    p_l4.font.bold = True
    p_l4.font.color.rgb = DARK_TEXT
    p_l4.alignment = PP_ALIGN.CENTER

    spec_w = Inches(7.033)
    esp_specs = [
        ("Dual-Core Tensilica Xtensa 32-bit LX6 @ 240 MHz",
         [
             ("Asymmetric Task Concurrency", "Core 0 handles continuous 100 Hz high-speed I2C sensor sampling; Core 1 executes baseline algorithms and serial streaming."),
             ("Memory Resources", "520 KB on-chip SRAM guarantees zero buffer underrun during peak telemetry bursts.")
         ],
         NEO_YELLOW_BG),
        ("Hardware Peripheral Interfaces & Low-Noise ADC",
         [
             ("Shared Hardware I2C Bus", "Pin GPIO 21 (SDA) & GPIO 22 (SCL) concurrently drive MAX30100, MPU-6050, and OLED."),
             ("Precision 12-Bit ADC Channel", "Pin GPIO 34 (ADC1_CH6) reads continuous analog skin temperature voltage from LM35DZ.")
         ],
         NEO_CYAN_BG),
        ("Dual-Mode Telemetry & Edge Autonomy",
         [
             ("USB Serial & Wireless Ready", "Transmits robust JSON telemetry at 115200 baud; integrated BLE/Wi-Fi ready for mobile syncing."),
             ("Ultra-Low Latency Alerting", "Direct hardware GPIO 25 trigger delivers instantaneous alert buzzing within < 2 milliseconds.")
         ],
         NEO_GREEN_BG)
    ]
    for i, (title, bullets, bg_c) in enumerate(esp_specs):
        c_top = Inches(2.1 + i * 1.66)
        add_brutalist_card(s4, Inches(5.5), c_top, spec_w, Inches(1.52), bg_color=bg_c)
        tb = s4.shapes.add_textbox(Inches(5.7), c_top + Inches(0.12), spec_w - Inches(0.4), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        for b_prefix, b_text in bullets:
            add_bullet(tf, b_prefix, b_text, font_size=Pt(12), space_before=Pt(4))

    # =========================================================================
    # SLIDE 5: Biometric Sensor — MAX30100 Pulse Oximeter & Heart Rate
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_background(s5)
    add_header(s5, "PPG Optical Sensor", "MAX30100: Pulse Oximetry & Heart Rate (PPG)", "Photoplethysmographic sensor combining dual LEDs, photodetector, and optical processing.")

    add_brutalist_card(s5, Inches(0.8), Inches(2.1), col_img_w, Inches(4.9), bg_color=CARD_WHITE)
    if os.path.exists("figures/hardware/max30100.jpg"):
        s5.shapes.add_picture("figures/hardware/max30100.jpg", Inches(0.95), Inches(2.25), width=col_img_w - Inches(0.3), height=Inches(3.45))
    
    add_pill_badge(s5, Inches(0.95), Inches(5.82), col_img_w - Inches(0.3), Inches(0.36), "MAX30100 PPG (ADDR: 0x57)", bg_color=NEO_PURPLE, font_size=Pt(11))

    lbl5 = s5.shapes.add_textbox(Inches(0.95), Inches(6.25), col_img_w - Inches(0.3), Inches(0.65))
    tf_lbl5 = lbl5.text_frame
    tf_lbl5.word_wrap = True
    p_l5 = tf_lbl5.paragraphs[0]
    p_l5.text = "Dual Wavelength: 660nm (Red) & 880nm (IR)"
    p_l5.font.size = Pt(11)
    p_l5.font.bold = True
    p_l5.font.color.rgb = DARK_TEXT
    p_l5.alignment = PP_ALIGN.CENTER

    max_specs = [
        ("Dual Optical Wavelengths & Hemoglobin Absorption",
         [
             ("Red LED (660 nm)", "Highly absorbed by deoxygenated hemoglobin (Hb); sensitive to oxygenation changes."),
             ("Infrared LED (880 nm)", "Highly absorbed by oxygenated hemoglobin (HbO2); provides reference transmission.")
         ],
         NEO_PURPLE_BG),
        ("Photoplethysmography (PPG) Working Principle",
         [
             ("Micro-Vascular Volumetric Pulsing", "Each cardiac ventricular contraction pumps blood into peripheral capillaries, modulating reflected light."),
             ("R-to-R Peak Calculation", "ESP32 edge algorithm tracks systolic peaks to derive instantaneous Heart Rate (BPM) in real time.")
         ],
         NEO_GREEN_BG),
        ("Integrated Signal Conditioning & Noise Rejection",
         [
             ("Ambient Light Cancellation", "On-chip analog front-end cancels 50/60 Hz artificial room lighting flicker."),
             ("High-Resolution 16-Bit ADC", "Over-samples raw photodiode current with programmable sample rates (50 Hz to 1 kHz).")
         ],
         NEO_YELLOW_BG)
    ]
    for i, (title, bullets, bg_c) in enumerate(max_specs):
        c_top = Inches(2.1 + i * 1.66)
        add_brutalist_card(s5, Inches(5.5), c_top, spec_w, Inches(1.52), bg_color=bg_c)
        tb = s5.shapes.add_textbox(Inches(5.7), c_top + Inches(0.12), spec_w - Inches(0.4), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        for b_prefix, b_text in bullets:
            add_bullet(tf, b_prefix, b_text, font_size=Pt(12), space_before=Pt(4))

    # =========================================================================
    # SLIDE 6: Motion Sensor — MPU-6050 6-Axis Motion Tracking (IMU)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_background(s6)
    add_header(s6, "Inertial Kinematics", "MPU-6050: Motion Tracking & False-Alarm Prevention", "6-DOF IMU combining 3-axis accelerometer and 3-axis gyroscope on a single silicon die.")

    add_brutalist_card(s6, Inches(0.8), Inches(2.1), col_img_w, Inches(4.9), bg_color=CARD_WHITE)
    if os.path.exists("figures/hardware/mpu6050.jpg"):
        s6.shapes.add_picture("figures/hardware/mpu6050.jpg", Inches(0.95), Inches(2.25), width=col_img_w - Inches(0.3), height=Inches(3.45))
    
    add_pill_badge(s6, Inches(0.95), Inches(5.82), col_img_w - Inches(0.3), Inches(0.36), "MPU-6050 IMU (ADDR: 0x68)", bg_color=NEO_CYAN, font_size=Pt(11))

    lbl6 = s6.shapes.add_textbox(Inches(0.95), Inches(6.25), col_img_w - Inches(0.3), Inches(0.65))
    tf_lbl6 = lbl6.text_frame
    tf_lbl6.word_wrap = True
    p_l6 = tf_lbl6.paragraphs[0]
    p_l6.text = "±2g Accelerometer & ±250°/s Gyroscope"
    p_l6.font.size = Pt(11)
    p_l6.font.bold = True
    p_l6.font.color.rgb = DARK_TEXT
    p_l6.alignment = PP_ALIGN.CENTER

    mpu_specs = [
        ("6 Degrees of Freedom (6-DOF) Architecture",
         [
             ("3-Axis MEMS Accelerometer", "Measures static gravity vector and dynamic acceleration (X, Y, Z axes) with 16-bit resolution."),
             ("3-Axis Angular Gyroscope", "Tracks rotational velocity to capture arm swings and gestures during physical activities.")
         ],
         NEO_CYAN_BG),
        ("The Kinematic Context Engine (Solving Watch Flaws)",
         [
             ("The Problem with Generic Watches", "When climbing stairs or walking, HR increases naturally, triggering false 'High Stress' alarms."),
             ("AWEN's Dynamic Contextualization", "If acceleration magnitude |A| > 1.25g, AWEN tags heart rate rise as ACTIVE EXERCISE, not mental stress.")
         ],
         NEO_YELLOW_BG),
        ("Digital Motion Processor (DMP) & I2C Bus",
         [
             ("Fast I2C Communication", "Operates seamlessly on the shared 400 kHz bus at device address 0x68."),
             ("Interrupt-Driven Thresholding", "Wakes ESP32 algorithms only when significant motion changes occur, optimizing battery draw.")
         ],
         NEO_GREEN_BG)
    ]
    for i, (title, bullets, bg_c) in enumerate(mpu_specs):
        c_top = Inches(2.1 + i * 1.66)
        add_brutalist_card(s6, Inches(5.5), c_top, spec_w, Inches(1.52), bg_color=bg_c)
        tb = s6.shapes.add_textbox(Inches(5.7), c_top + Inches(0.12), spec_w - Inches(0.4), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        for b_prefix, b_text in bullets:
            add_bullet(tf, b_prefix, b_text, font_size=Pt(12), space_before=Pt(4))

    # =========================================================================
    # SLIDE 7: Temperature Sensor — LM35 Precision Analog Temp Sensor
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_background(s7)
    add_header(s7, "Analog Thermometry", "LM35DZ: Precision Peripheral Skin Temperature", "Linear Celsius temperature sensor calibrated directly in degrees Celsius.")

    add_brutalist_card(s7, Inches(0.8), Inches(2.1), col_img_w, Inches(4.9), bg_color=CARD_WHITE)
    if os.path.exists("figures/hardware/lm35.jpg"):
        s7.shapes.add_picture("figures/hardware/lm35.jpg", Inches(0.95), Inches(2.25), width=col_img_w - Inches(0.3), height=Inches(3.45))
    
    add_pill_badge(s7, Inches(0.95), Inches(5.82), col_img_w - Inches(0.3), Inches(0.36), "LM35DZ TEMP SENSOR", bg_color=NEO_YELLOW, font_size=Pt(11))

    lbl7 = s7.shapes.add_textbox(Inches(0.95), Inches(6.25), col_img_w - Inches(0.3), Inches(0.65))
    tf_lbl7 = lbl7.text_frame
    tf_lbl7.word_wrap = True
    p_l7 = tf_lbl7.paragraphs[0]
    p_l7.text = "Linear +10 mV/°C | TO-92 3-Pin Analog IC"
    p_l7.font.size = Pt(11)
    p_l7.font.bold = True
    p_l7.font.color.rgb = DARK_TEXT
    p_l7.alignment = PP_ALIGN.CENTER

    lm_specs = [
        ("Direct Linear Calibration (+10 mV per °C)",
         [
             ("True Celsius Linear Output", "Output voltage is directly proportional to temperature (e.g., 360 mV = 36.0°C; 375 mV = 37.5°C)."),
             ("Zero Look-Up Tables", "Unlike thermistors (NTC) which require complex Steinhart-Hart polynomial curves, LM35 provides exact linear math.")
         ],
         NEO_ORANGE_BG),
        ("Why Peripheral Skin Temperature Matters for Stress",
         [
             ("Sympathetic Vasoconstriction", "During acute sympathetic nervous arousal (stress/panic), peripheral capillaries constrict."),
             ("Finger Temperature Dip", "A sudden drop in skin temperature accompanied by resting tachycardia is a classic physiological marker of stress.")
         ],
         NEO_CORAL_BG),
        ("Precision Interfacing with ESP32 ADC",
         [
             ("ADC Channel 34 Connection", "VOUT pin is wired directly to ESP32 ADC1_CH6 (GPIO 34), bypassing Wi-Fi ADC2 conflicts."),
             ("Oversampling & Moving Average", "Firmware takes 32 successive analog samples every second to cancel environmental noise and thermal flutter.")
         ],
         NEO_GREEN_BG)
    ]
    for i, (title, bullets, bg_c) in enumerate(lm_specs):
        c_top = Inches(2.1 + i * 1.66)
        add_brutalist_card(s7, Inches(5.5), c_top, spec_w, Inches(1.52), bg_color=bg_c)
        tb = s7.shapes.add_textbox(Inches(5.7), c_top + Inches(0.12), spec_w - Inches(0.4), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        for b_prefix, b_text in bullets:
            add_bullet(tf, b_prefix, b_text, font_size=Pt(12), space_before=Pt(4))

    # =========================================================================
    # SLIDE 8: Output Interfaces — SSD1306 OLED & Active Piezo Buzzer
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_background(s8)
    add_header(s8, "Output Actuators", "Local Interaction: SSD1306 OLED & Active Piezo Buzzer", "Immediate tactile, auditory, and visual feedback without requiring an active smartphone app.")

    col2_w = Inches(5.7)
    
    # Left Column: OLED Display
    add_brutalist_card(s8, Inches(0.8), Inches(2.1), col2_w, Inches(4.9), bg_color=CARD_WHITE)
    if os.path.exists("figures/hardware/oled.jpg"):
        s8.shapes.add_picture("figures/hardware/oled.jpg", Inches(0.95), Inches(2.25), width=col2_w - Inches(0.3), height=Inches(2.4))
    
    add_pill_badge(s8, Inches(0.95), Inches(4.78), col2_w - Inches(0.3), Inches(0.34), "SSD1306 0.96\" OLED (0x3C)", bg_color=NEO_CYAN, font_size=Pt(10.5))

    tb_oled = s8.shapes.add_textbox(Inches(0.95), Inches(5.18), col2_w - Inches(0.3), Inches(1.75))
    tf_oled = tb_oled.text_frame
    tf_oled.word_wrap = True
    add_bullet(tf_oled, "Resolution", "128 x 64 pixels with high-contrast organic LED self-illumination.", font_size=Pt(12), space_before=Pt(2))
    add_bullet(tf_oled, "Real-Time Telemetry", "Live readout of BPM, SpO2 (%), Body Temp (°C), and dynamic AWEN mascot expression.", font_size=Pt(12), space_before=Pt(4))
    add_bullet(tf_oled, "Zero Power in Black", "OLED pixels turn completely off for true blacks, conserving precious battery power.", font_size=Pt(12), space_before=Pt(4))

    # Right Column: Active Buzzer
    add_brutalist_card(s8, Inches(6.833), Inches(2.1), col2_w, Inches(4.9), bg_color=CARD_WHITE)
    if os.path.exists("figures/hardware/buzzer.jpg"):
        s8.shapes.add_picture("figures/hardware/buzzer.jpg", Inches(6.983), Inches(2.25), width=col2_w - Inches(0.3), height=Inches(2.4))
    
    add_pill_badge(s8, Inches(6.983), Inches(4.78), col2_w - Inches(0.3), Inches(0.34), "ACTIVE PIEZO BUZZER (GPIO 25)", bg_color=NEO_CORAL, font_size=Pt(10.5))

    tb_buz = s8.shapes.add_textbox(Inches(6.983), Inches(5.18), col2_w - Inches(0.3), Inches(1.75))
    tf_buz = tb_buz.text_frame
    tf_buz.word_wrap = True
    add_bullet(tf_buz, "Internal Oscillator", "Built-in 2.3 kHz oscillating circuit triggers instant tone upon HIGH digital signal.", font_size=Pt(12), space_before=Pt(2))
    add_bullet(tf_buz, "Direct GPIO Drive", "Controlled via ESP32 GPIO 25 without external driver transistor (low current draw < 20mA).", font_size=Pt(12), space_before=Pt(4))
    add_bullet(tf_buz, "Smart Sound Patterns", "Gentle single chime for state change; rhythmic triple pulse for critical hypoxia (SpO2 < 90%).", font_size=Pt(12), space_before=Pt(4))

    # =========================================================================
    # SLIDE 9: Circuit Interconnect, Pinout & Hardware Schematic
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_background(s9)
    add_header(s9, "Pinout & Wiring", "Hardware Interconnect & GPIO Pin Mapping", "Complete schematic interconnecting all 5 modules to ESP32 with zero pin conflicts.")

    schem_w = Inches(5.7)
    add_brutalist_card(s9, Inches(0.8), Inches(2.1), schem_w, Inches(4.9), bg_color=CARD_WHITE)
    if os.path.exists("figures/fig8_circuit_schematic.png"):
        s9.shapes.add_picture("figures/fig8_circuit_schematic.png", Inches(0.95), Inches(2.25), width=schem_w - Inches(0.3), height=Inches(4.5))

    table_w = Inches(5.733)
    c_right = Inches(6.8)
    
    pins_data = [
        ("MAX30100 PPG SENSOR", "I2C SDA → GPIO 21 | SCL → GPIO 22 | VIN → 3.3V | GND → GND (Addr: 0x57)", NEO_PURPLE_BG),
        ("MPU-6050 6-AXIS IMU", "I2C SDA → GPIO 21 | SCL → GPIO 22 | VCC → 3.3V | GND → GND (Addr: 0x68)", NEO_CYAN_BG),
        ("SSD1306 0.96\" OLED", "I2C SDA → GPIO 21 | SCL → GPIO 22 | VCC → 3.3V | GND → GND (Addr: 0x3C)", NEO_YELLOW_BG),
        ("LM35DZ TEMPERATURE", "VOUT → GPIO 34 (ADC1_CH6 Analog In) | VCC → 3.3V/5V | GND → GND", NEO_ORANGE_BG),
        ("ACTIVE PIEZO BUZZER", "POSITIVE (+) → GPIO 25 (Digital Output) | NEGATIVE (-) → Common GND", NEO_CORAL_BG)
    ]
    for i, (m_title, m_pinout, bg_c) in enumerate(pins_data):
        c_top = Inches(2.1 + i * 0.98)
        add_brutalist_card(s9, c_right, c_top, table_w, Inches(0.9), bg_color=bg_c)
        tb = s9.shapes.add_textbox(c_right + Inches(0.18), c_top + Inches(0.08), table_w - Inches(0.36), Inches(0.74))
        tf = tb.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = m_title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        pd = tf.add_paragraph()
        pd.text = m_pinout
        pd.font.size = Pt(11.5)
        pd.font.bold = True
        pd.font.color.rgb = DARK_TEXT
        pd.font.name = "Arial"
        pd.space_before = Pt(2)

    # =========================================================================
    # SLIDE 10: Firmware Algorithm & Edge Preprocessing Logic
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_background(s10)
    add_header(s10, "Firmware Engineering", "ESP32 Embedded Firmware Pipeline & Signal Processing", "How raw microvolt pulses and capacitance signals are converted into accurate vitals on edge.")

    proc_cards = [
        ("1. Multi-Rate Sensor Polling",
         "Timer-driven asynchronous interrupts manage non-blocking telemetry acquisition.",
         [
             ("100 Hz Optical Pulse Loop", "Reads Red and IR FIFO registers from MAX30100 to capture subtle capillary pressure waves."),
             ("50 Hz Motion Kinematics", "Pulls X/Y/Z accelerometer vectors from MPU-6050 to track active limb movement."),
             ("1 Hz Thermal Averaging", "Performs 32-sample burst oversampling on LM35DZ output to eliminate ADC conversion jitter.")
         ],
         NEO_CYAN_BG),
        ("2. Real-Time DC Drift & Peak Detection",
         "Digital filtering algorithms run directly on the ESP32 Tensilica dual-core MCU.",
         [
             ("DC Drift Removal Filter", "High-pass IIR filter strips static tissue and baseline skin absorption drift."),
             ("Dynamic Systolic Peak Finder", "Adaptive threshold detects genuine cardiac contractions and calculates R-to-R interval (BPM)."),
             ("Oxygen Saturation Ratio", "Computes (AC_red / DC_red) / (AC_ir / DC_ir) ratio to evaluate real-time SpO2 percentage.")
         ],
         NEO_YELLOW_BG),
        ("3. Context-Aware Stress State Engine",
         "Eliminates false alarms through sensor fusion before generating user notifications.",
         [
             ("Physiological Cross-Check", "High HR + Zero Motion (|A| < 1.05g) = WATCHFUL (Mental Stress Detected)."),
             ("Exercise Suppression", "High HR + Active Motion (|A| > 1.30g) = ACTIVE (Physical Exercise, No Alarm)."),
             ("Local Actuation", "Refreshes OLED screen every 200ms and pulses buzzer only during genuine physiological anomalies.")
         ],
         NEO_GREEN_BG)
    ]
    for i, (title, intro, bullets, bg_c) in enumerate(proc_cards):
        c_left = Inches(0.8 + i * 4.01)
        c_top = Inches(2.1)
        c_height = Inches(4.9)
        add_brutalist_card(s10, c_left, c_top, col_w, c_height, bg_color=bg_c)

        tb = s10.shapes.add_textbox(c_left + Inches(0.22), c_top + Inches(0.22), col_w - Inches(0.44), c_height - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(16)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        p_intro = tf.add_paragraph()
        p_intro.text = intro
        p_intro.font.size = Pt(12)
        p_intro.font.bold = True
        p_intro.font.color.rgb = DARK_TEXT
        p_intro.font.name = "Arial"
        p_intro.space_before = Pt(6)

        for b_prefix, b_text in bullets:
            add_bullet(tf, b_prefix, b_text, font_size=Pt(11.5), space_before=Pt(6))

    # =========================================================================
    # SLIDE 11: Real-World Applications of AWEN Hardware System
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_background(s11)
    add_header(s11, "Field Deployments", "Real-World Applications of AWEN Hardware System", "Transforming wearable health monitoring across diverse high-stress and healthcare domains.")

    app_cards = [
        ("1. Cognitive Burnout & Student Stress",
         [
             ("Subconscious Stress Detection", "Detects prolonged elevated heart rate with dropped skin temperature during sedentary desk work."),
             ("Gentle Haptic/Buzzer Cue", "Provides discreet buzzer chimes prompting the user to take a 2-minute respiratory reset."),
             ("Productivity Preservation", "Helps prevent chronic mental exhaustion and burnout before physical symptoms manifest.")
         ],
         NEO_YELLOW_BG),
        ("2. Elderly Remote Care & Nocturnal Watch",
         [
             ("Hypoxia Warning System", "Auditory buzzer alarm sounds immediately if blood oxygen saturation drops below 92% SpO2."),
             ("Restless Sleep & Fall Detection", "MPU-6050 accelerometer flags sudden impact shock or abnormal overnight restlessness."),
             ("Zero Smartphone Dependency", "Caregivers can inspect vitals directly on the high-visibility glowing OLED display.")
         ],
         NEO_CORAL_BG),
        ("3. High-Stress Industrial & Shift Workers",
         [
             ("Fatigue Early Warning", "Correlates micro-fluctuations in heart rate variability and peripheral cooling with cognitive fatigue."),
             ("Motion Context Validation", "Distinguishes between physical tool operation and sympathetic anxiety spikes."),
             ("Accident Prevention", "Enables proactive mandatory rest rotations before critical operational errors occur.")
         ],
         NEO_CYAN_BG),
        ("4. Edge-First Data Privacy Compliance",
         [
             ("Zero Commercial Cloud Leakage", "All physiological processing and baselines remain strictly on the local hardware/host."),
             ("GDPR / HIPAA Compatible", "No centralized databases storing biometric signatures susceptible to data breaches."),
             ("Accessible Low-Cost Healthcare", "Built with commodity hardware under Rs 1,500 ($18 USD), democratizing vital monitoring.")
         ],
         NEO_GREEN_BG)
    ]
    card_w2 = Inches(5.7)
    card_h2 = Inches(2.35)
    positions = [
        (Inches(0.8), Inches(2.1)),
        (Inches(6.833), Inches(2.1)),
        (Inches(0.8), Inches(4.65)),
        (Inches(6.833), Inches(4.65))
    ]
    for i, (title, bullets, bg_c) in enumerate(app_cards):
        cx, cy = positions[i]
        add_brutalist_card(s11, cx, cy, card_w2, card_h2, bg_color=bg_c)
        tb = s11.shapes.add_textbox(cx + Inches(0.18), cy + Inches(0.12), card_w2 - Inches(0.36), card_h2 - Inches(0.24))
        tf = tb.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = BLACK
        pt.font.name = "Arial Black"

        for b_prefix, b_text in bullets:
            add_bullet(tf, b_prefix, b_text, font_size=Pt(11.5), space_before=Pt(3))

    # =========================================================================
    # SLIDE 12: Summary, Hardware Advantages & Future Roadmap
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_background(s12)
    add_header(s12, "Summary & Future Scope", "Hardware Summary & Future Enhancements", "Robust, low-cost physiological telemetry platform ready for next-generation miniaturization.")

    col_sum_w = Inches(5.7)

    # Left: Core Hardware Achievements
    add_brutalist_card(s12, Inches(0.8), Inches(2.1), col_sum_w, Inches(4.15), bg_color=NEO_GREEN_BG)
    tb_sum = s12.shapes.add_textbox(Inches(1.0), Inches(2.2), col_sum_w - Inches(0.4), Inches(3.9))
    tf_sum = tb_sum.text_frame
    tf_sum.word_wrap = True
    pt_s = tf_sum.paragraphs[0]
    pt_s.text = "Key Hardware Achievements"
    pt_s.font.size = Pt(16)
    pt_s.font.bold = True
    pt_s.font.color.rgb = BLACK
    pt_s.font.name = "Arial Black"

    add_bullet(tf_sum, "100% Functional Multi-Sensor Sync", "Synchronously streams optical PPG (MAX30100), 6-DOF motion (MPU-6050), and skin temp (LM35DZ).", font_size=Pt(12), space_before=Pt(8))
    add_bullet(tf_sum, "Real-Time Motion Filtered", "Completely eliminates false stress notifications during physical walking or exercise.", font_size=Pt(12), space_before=Pt(7))
    add_bullet(tf_sum, "Zero Latency Local Feedback", "Instantaneous OLED vital rendering and active piezo auditory warning without phone app.", font_size=Pt(12), space_before=Pt(7))
    add_bullet(tf_sum, "Ultra Low Bill of Materials (BOM)", "Complete wearable sensing pod constructed under Rs 1,500, offering immense scalability.", font_size=Pt(12), space_before=Pt(7))

    # Right: Future Hardware Roadmap
    add_brutalist_card(s12, Inches(6.833), Inches(2.1), col_sum_w, Inches(4.15), bg_color=NEO_YELLOW_BG)
    tb_fut = s12.shapes.add_textbox(Inches(7.033), Inches(2.2), col_sum_w - Inches(0.4), Inches(3.9))
    tf_fut = tb_fut.text_frame
    tf_fut.word_wrap = True
    pt_f = tf_fut.paragraphs[0]
    pt_f.text = "Future Hardware Enhancements"
    pt_f.font.size = Pt(16)
    pt_f.font.bold = True
    pt_f.font.color.rgb = BLACK
    pt_f.font.name = "Arial Black"

    add_bullet(tf_fut, "Sensor Upgrade: MAX30102", "Transition to next-gen MAX30102 with integrated glass cover and higher optical SNR.", font_size=Pt(12), space_before=Pt(8))
    add_bullet(tf_fut, "Electrodermal Activity (GSR / EDA)", "Integrate galvanic skin response electrodes to directly quantify sympathetic sweat gland activity.", font_size=Pt(12), space_before=Pt(7))
    add_bullet(tf_fut, "Rechargeable Power Management", "Implement 3.7V 500mAh LiPo battery with TP4056 micro-USB charging and MCP1700 LDO regulator.", font_size=Pt(12), space_before=Pt(7))
    add_bullet(tf_fut, "Custom Wearable Wristband PCB", "Design custom 2-layer rigid-flex PCB and snap-fit 3D printed ergonomic wrist casing.", font_size=Pt(12), space_before=Pt(7))

    # Bottom Takeaway Card
    add_brutalist_card(s12, Inches(0.8), Inches(6.42), Inches(11.733), Inches(0.68), bg_color=CARD_WHITE)
    t_take = s12.shapes.add_textbox(Inches(1.0), Inches(6.46), Inches(11.333), Inches(0.58))
    tf_take = t_take.text_frame
    tf_take.word_wrap = True
    p_take = tf_take.paragraphs[0]
    p_take.text = "AWEN TAKEAWAY: Moving from generic cutoff alarms to continuous, motion-aware personal baseline intelligence."
    p_take.font.size = Pt(11.5)
    p_take.font.bold = True
    p_take.font.color.rgb = BLACK
    p_take.font.name = "Arial Black"
    p_take.alignment = PP_ALIGN.CENTER

    # Save presentation
    output_filename = "AWEN_Hardware_Presentation_AF52.pptx"
    prs.save(output_filename)
    print(f"Presentation saved successfully as '{output_filename}' with {len(prs.slides)} slides.")

if __name__ == "__main__":
    build_hardware_deck()
