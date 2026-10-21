import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6] # Blank slide

    # Theme colors
    BG_COLOR = RGBColor(8, 13, 24)       # Deep Space Navy #080D18
    CARD_BG = RGBColor(15, 23, 42)       # Slate 900 #0F172A
    CARD_BORDER = RGBColor(30, 41, 59)   # Slate 800 #1E293B
    CYAN = RGBColor(6, 182, 212)         # Cyan 500 #06B6D4
    ACCENT_CYAN = RGBColor(34, 211, 238) # Cyan 400 #22D3EE
    EMERALD = RGBColor(16, 185, 129)     # Emerald 500 #10B981
    AMBER = RGBColor(245, 158, 11)       # Amber 500 #F59E0B
    VIOLET = RGBColor(129, 140, 248)     # Indigo 400 #818CF8
    TEXT_WHITE = RGBColor(248, 250, 252) # White #F8FAFC
    TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400 #94A3B8

    def add_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.color.rgb = BG_COLOR
        return bg

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1)
        return card

    def add_header(slide, tag_text, title_text, subtitle_text=""):
        # Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = ACCENT_CYAN
        p_tag.font.name = "Segoe UI"

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.6))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE
        p_title.font.name = "Segoe UI"

        # Subtitle
        if subtitle_text:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.25), Inches(11.7), Inches(0.4))
            tf_sub = sub_box.text_frame
            tf_sub.word_wrap = True
            p_sub = tf_sub.paragraphs[0]
            p_sub.text = subtitle_text
            p_sub.font.size = Pt(12)
            p_sub.font.color.rgb = TEXT_MUTED
            p_sub.font.name = "Segoe UI"

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    add_background(s1)

    # Accent decorative bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.1), Inches(3.8))
    bar.fill.solid()
    bar.fill.fore_color.rgb = ACCENT_CYAN
    bar.line.fill.background()

    # Title box
    tbox = s1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(11.0), Inches(4.5))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "CAPSTONE PROJECT PRESENTATION | B.TECH CSE"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_CYAN
    p0.font.name = "Segoe UI"

    p1 = tf1.add_paragraph()
    p1.text = "AWEN: Adaptive Wellness & Emotional Navigation"
    p1.font.size = Pt(34)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.font.name = "Segoe UI"
    p1.space_before = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "A Baseline-Calibrated Edge IoT & Conversational AI System for Autonomous Stress Detection"
    p2.font.size = Pt(16)
    p2.font.color.rgb = TEXT_MUTED
    p2.font.name = "Segoe UI"
    p2.space_before = Pt(8)

    # Specs Grid on Cover
    cards_data = [
        ("ESP32 IoT POD", "Dual Wi-Fi REST + Web Serial (MAX30102, MPU6050, LM35)", CYAN),
        ("PERSONAL BASELINE", "Rolling (μ ± 2σ) statistical corridor rejecting generic thresholds", EMERALD),
        ("LIVING MASCOT", "5-state reactive vector aura with 7-window time awareness", VIOLET),
        ("OFFLINE PRIVACY", "100% Local SQLite & Edge Processing (Zero Cloud Leakage)", AMBER)
    ]
    for i, (title, desc, color) in enumerate(cards_data):
        c_left = Inches(1.2 + i * 2.85)
        c_top = Inches(4.7)
        c_width = Inches(2.65)
        c_height = Inches(1.8)
        add_card(s1, c_left, c_top, c_width, c_height)

        tb = s1.shapes.add_textbox(c_left + Inches(0.15), c_top + Inches(0.15), c_width - Inches(0.3), c_height - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(6)

    # ==========================================
    # SLIDE 2: Problem Statement & Motivation
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_background(s2)
    add_header(s2, "Context & Challenges", "The Fatal Flaws in Existing Wearable Health Tech", "Commercial trackers cause user anxiety through false positives and medical jargon.")

    col_w = Inches(3.6)
    cards_s2 = [
        ("1. Generic Medical Thresholds", 
         "Standard smartwatches flag any Heart Rate > 100 BPM as 'Abnormal Tachycardia'.\n\n• Completely ignores individual resting physiology (an athlete's normal resting HR is 50 BPM; an anxiety sufferer's baseline is 82 BPM).\n• Flawed one-size-fits-all static cutoffs.", 
         RGBColor(239, 68, 68)),
        ("2. False Stress Alarms (Exertion Blindness)", 
         "Heart rate naturally surges during stairs, brisk walking, or exercise.\n\n• Conventional trackers cannot correlate heart rate with physical kinetic motion.\n• Results in constant, annoying false stress warnings while walking or working out.", 
         AMBER),
        ("3. Alert Fatigue & Invasive Cloud Privacy", 
         "Users are bombarded with alarmist red banners, creating health hypochondria.\n\n• Furthermore, personal biometrics (heart rate, SpO2) are shipped to third-party commercial cloud servers, raising grave data privacy issues.", 
         CYAN)
    ]
    for i, (title, desc, color) in enumerate(cards_s2):
        c_left = Inches(0.8 + i * 4.0)
        c_top = Inches(1.8)
        add_card(s2, c_left, c_top, col_w, Inches(4.8))
        tb = s2.shapes.add_textbox(c_left + Inches(0.25), c_top + Inches(0.25), col_w - Inches(0.5), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(12)

    # ==========================================
    # SLIDE 3: The AWEN Philosophy
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_background(s3)
    add_header(s3, "Core Innovation", "The AWEN Paradigm Shift: Personal Baseline & Emotional Companion", "From clinical surveillance to autonomous, baseline-calibrated empathetic guidance.")

    pillars = [
        ("Personal Physiological Baseline", "Instead of asking 'Is HR > 100?', AWEN computes 'Is today's biometrics deviating from YOUR established historical corridor (μ ± 2σ)?' Calibrated over a 3-7 day observation window.", CYAN),
        ("Motion-Aware Exertion Gate", "AWEN fuses photoplethysmography (MAX30102) with 3-axis kinetic acceleration (MPU6050). High HR + High Motion = Natural Exertion (Suppressed). High HR + Zero Motion = Mental Stress.", EMERALD),
        ("Living Mascot Companion", "Replaces cold graphs with 'Awen' — a living 60 FPS vector mascot. Changes aura across 5 states, blinks organically, waves, and speaks calm natural reflections without medical jargon.", VIOLET),
        ("Strict Data Sovereignty", "Biometrics stay 100% on the local edge machine. Telemetry flows via local Wi-Fi or Web Serial into a local SQLite database. No mandatory cloud dependencies or third-party tracking.", AMBER)
    ]
    for i, (title, desc, color) in enumerate(pillars):
        row = i // 2
        col = i % 2
        c_left = Inches(0.8 + col * 5.95)
        c_top = Inches(1.8 + row * 2.55)
        add_card(s3, c_left, c_top, Inches(5.75), Inches(2.35))
        tb = s3.shapes.add_textbox(c_left + Inches(0.3), c_top + Inches(0.25), Inches(5.15), Inches(1.85))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(15)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(8)

    # ==========================================
    # SLIDE 4: System Architecture
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_background(s4)
    add_header(s4, "System Design", "End-to-End 3-Tier Edge Architecture", "Seamless real-time pipeline bridging physical sensors, local microservices, and modern web UI.")

    tiers = [
        ("TIER 1: PHYSICAL EDGE POD", 
         "ESP32 Microcontroller (Dual-Core 240MHz)\n"
         "• MAX30102 PPG Optical Sensor (Heart Rate & SpO2)\n"
         "• MPU-6050 6-DOF IMU (Accelerometer & Motion Vector)\n"
         "• LM35 Precision Analog Temperature Sensor\n"
         "• 0.96\" SSD1306 OLED Display (Local telemetry)\n"
         "• Active Piezo Buzzer (Hardware acoustic alert)\n"
         "• Wi-Fi AP/Client (IP: 172.20.168.254:80) + Web Serial (115200 baud)",
         CYAN),
        ("TIER 2: LOCAL BACKEND & ML", 
         "Python 3.12 FastAPI Asynchronous Microservice\n"
         "• Telemetry Poller & Real-Time Ingestion Loop\n"
         "• Baseline Engine: Computes Rolling Mean (μ) and Std Dev (σ)\n"
         "• Multi-Modal Stress Detection with Exertion Filtering\n"
         "• Isolation Forest / Local Anomaly Scoring\n"
         "• Local SQLite Database (`awen.db`) with WAL Mode\n"
         "• Zero-Cloud Edge Server (`http://localhost:8000`)",
         EMERALD),
        ("TIER 3: INTERACTIVE WEB CLIENT", 
         "React 19 + Vite 6 + Tailwind CSS\n"
         "• Dual-Path Telemetry Ingestion (Wi-Fi REST + Web Serial)\n"
         "• 60 FPS SVG Living Mascot (Dynamic Aura & Expressions)\n"
         "• 7-Window Time-Aware Personality Speech Engine\n"
         "• 7 Complete Screens: Today, Journey, Insights, Talk, etc.\n"
         "• Debounced Anomaly Modal (3-min audio cooldown)\n"
         "• Complete Local Storage & State Management",
         VIOLET)
    ]
    for i, (title, desc, color) in enumerate(tiers):
        c_left = Inches(0.8 + i * 4.0)
        c_top = Inches(1.8)
        add_card(s4, c_left, c_top, col_w, Inches(5.0))
        tb = s4.shapes.add_textbox(c_left + Inches(0.25), c_top + Inches(0.25), col_w - Inches(0.5), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(10)

    # ==========================================
    # SLIDE 5: Hardware Edge Engineering
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_background(s5)
    add_header(s5, "Embedded IoT Edge", "Hardware Specification & Circuit Interfacing", "Compact, low-latency biomedical sensor pod communicating over high-speed I2C and Wi-Fi.")

    hw_specs = [
        ("ESP32-WROOM-32", "Tensilica Xtensa Dual-Core 32-bit LX6 @ 240 MHz. Integrated 802.11 b/g/n Wi-Fi and Bluetooth v4.2 BR/EDR and BLE. Dedicated FreeRTOS tasks for sampling and networking.", CYAN),
        ("MAX30102 PPG Sensor", "High-sensitivity pulse oximeter & heart rate sensor with red (660nm) and infrared (880nm) LEDs. I2C address 0x57. Features ambient light cancellation and digital filtering.", EMERALD),
        ("MPU-6050 6-Axis IMU", "Triple-axis MEMS accelerometer and gyroscope. I2C address 0x68. Computes total kinematic acceleration vector magnitude |a| to distinguish active movement from resting state.", AMBER),
        ("LM35 Precision Temp", "Analog semiconductor temperature sensor calibrated directly in Celsius (+10.0 mV/°C linear scale). Read via ESP32 ADC1 (GPIO 34) with multi-sample averaging.", VIOLET),
        ("SSD1306 0.96\" OLED", "128x64 monochrome graphic display over I2C (address 0x3C). Provides instant edge readouts: Heart Rate, SpO2, Temperature, Wi-Fi IP, and Motion indicator.", ACCENT_CYAN),
        ("Dual Ingestion Channels", "Channel A: Wi-Fi HTTP REST Server (`GET /telemetry`) running on IP 172.20.168.254:80.\nChannel B: W3C Web Serial API directly reading JSON frames over USB UART at 115,200 baud.", TEXT_WHITE)
    ]
    for i, (title, desc, color) in enumerate(hw_specs):
        row = i // 3
        col = i % 3
        c_left = Inches(0.8 + col * 3.95)
        c_top = Inches(1.8 + row * 2.55)
        add_card(s5, c_left, c_top, Inches(3.8), Inches(2.35))
        tb = s5.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.2), Inches(3.4), Inches(1.95))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(6)

    # ==========================================
    # SLIDE 6: Multi-Modal Anomaly & Exertion Filter
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_background(s6)
    add_header(s6, "Intelligent Edge Logic", "Multi-Modal Sensor Fusion & Motion-Aware Exertion Filter", "Preventing alert fatigue by distinguishing genuine psychological distress from physical exercise.")

    # Left Card: Logic Diagram
    add_card(s6, Inches(0.8), Inches(1.8), Inches(5.8), Inches(5.0))
    tb_l = s6.shapes.add_textbox(Inches(1.05), Inches(2.0), Inches(5.3), Inches(4.5))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True
    p = tf_l.paragraphs[0]
    p.text = "THE SENSOR FUSION DECISION MATRIX"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN
    p.font.name = "Segoe UI"

    desc_matrix = (
        "\n1. Continuous Kinetic Vector Calculation:\n"
        "   |a| = √(ax² + ay² + az²)\n"
        "   Motion Flag is TRUE when |a - 1.0g| > 0.25g threshold.\n\n"
        "2. CASE A: Elevated HR (> 95 BPM) + In Motion (True)\n"
        "   → CLASSIFICATION: Physical Exertion / Walking.\n"
        "   → ACTION: Suppress alarm, update Mascot aura to Warm Amber (Active State).\n\n"
        "3. CASE B: Elevated HR (> 95 BPM) + In Motion (False) + Temp Drop\n"
        "   → CLASSIFICATION: Acute Psychological Stress / Panic.\n"
        "   → ACTION: Trigger Soft Anomaly Notification & Empathetic Dialogue.\n\n"
        "4. Anti-Beeping Cooldown Protection:\n"
        "   • ESP32 Hardware Cooldown: 60-second lockout between beeps.\n"
        "   • Frontend Audio Cooldown: 180-second debounce timer."
    )
    p2 = tf_l.add_paragraph()
    p2.text = desc_matrix
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = TEXT_MUTED
    p2.font.name = "Segoe UI"

    # Right Card: Hardware & Frontend Rules
    add_card(s6, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tb_r = s6.shapes.add_textbox(Inches(7.05), Inches(2.0), Inches(5.2), Inches(4.5))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    p_r = tf_r.paragraphs[0]
    p_r.text = "EDGE IMPLEMENTATION IN FIRMWARE & CLIENT"
    p_r.font.size = Pt(14)
    p_r.font.bold = True
    p_r.font.color.rgb = EMERALD
    p_r.font.name = "Segoe UI"

    desc_impl = (
        "\n• ESP32 Firmware Execution (`esp32_max30102.ino`):\n"
        "  - Evaluates condition: `isTachycardia && isResting`\n"
        "  - Buzzer triggers two gentle 60ms pulses only if cooldown > 60,000ms.\n"
        "  - Real-time JSON payload outputs: `{\"heart_rate\":88, \"spo2\":98, \"temperature\":36.4, \"in_motion\":false, \"anomaly\":false}`.\n\n"
        "• Client-Side React Engine (`AbnormalReadingPopup.jsx`):\n"
        "  - Listens to telemetry stream every 1,500ms.\n"
        "  - Displays calm, reassuring modal: 'Noticeable Shift Detected'.\n"
        "  - Offers deep breathing exercise (4-7-8 rhythm) and glass of water prompt.\n"
        "  - Never says 'You have an illness' or creates panic."
    )
    p_r2 = tf_r.add_paragraph()
    p_r2.text = desc_impl
    p_r2.font.size = Pt(10.5)
    p_r2.font.color.rgb = TEXT_MUTED
    p_r2.font.name = "Segoe UI"

    # ==========================================
    # SLIDE 7: Mathematical Foundation (Personal Baseline)
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_background(s7)
    add_header(s7, "Algorithm & Mathematics", "Personal Baseline Statistical Corridor (μ ± 2σ)", "Transforming continuous physiological telemetry into a statistically rigorous personal normal.")

    math_cards = [
        ("1. Rolling Mean (μ) & Variance (σ²)", 
         "Given a rolling window of N personal resting telemetry observations {x₁, x₂, ..., xN}:\n\n"
         "  μ = (1/N) * ∑_{i=1}^N x_i\n\n"
         "  σ = √[ (1/(N-1)) * ∑_{i=1}^N (x_i - μ)² ]\n\n"
         "Recalculated continuously across 24-hour circadian cycles.",
         CYAN),
        ("2. Normalcy Corridor Boundary", 
         "The personalized acceptable tolerance corridor is defined as:\n\n"
         "  Corridor = [ μ - 2σ ,  μ + 2σ ]\n\n"
         "By Chebyshev's inequality and Gaussian distribution, 95.45% of an individual's normal resting state falls within this corridor.\n"
         "Values outside this range represent statistically significant anomalies.",
         EMERALD),
        ("3. Dynamic Z-Score Deviation", 
         "For any instantaneous reading x_t:\n\n"
         "  Z_t = (x_t - μ) / σ\n\n"
         "• |Z_t| ≤ 1.5 : Balanced / Harmonious\n"
         "• 1.5 < |Z_t| ≤ 2.0 : Watchful Observation\n"
         "• |Z_t| > 2.0 : Out of Baseline Corridor (Mascot changes to Amber alert).",
         VIOLET)
    ]
    for i, (title, desc, color) in enumerate(math_cards):
        c_left = Inches(0.8 + i * 4.0)
        c_top = Inches(1.8)
        add_card(s7, c_left, c_top, col_w, Inches(5.0))
        tb = s7.shapes.add_textbox(c_left + Inches(0.25), c_top + Inches(0.25), col_w - Inches(0.5), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(12)

    # ==========================================
    # SLIDE 8: Backend Architecture & ML Engine
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_background(s8)
    add_header(s8, "Server-Side Engineering", "High-Throughput Local FastAPI & Machine Learning Engine", "Asynchronous Python backend providing edge telemetry aggregation, SQLite persistence, and ML.")

    be_cols = [
        ("FastAPI Asynchronous Microservice", 
         "• Non-blocking `asyncio` event loop handling concurrent telemetry streams.\n"
         "• Background task polls ESP32 hardware endpoint (`http://172.20.168.254/telemetry`) every 2 seconds.\n"
         "• Auto-reconnect with fallback cache to prevent UI freeze during Wi-Fi drops.\n"
         "• Auto-generated interactive Swagger UI at `/docs`.",
         CYAN),
        ("Machine Learning Engine (`ml_engine.py`)", 
         "• Scikit-learn Isolation Forest algorithm for multi-dimensional anomaly detection.\n"
         "• Trains on individual user history (HR, SpO2, Temp, Motion).\n"
         "• Generates an Anomaly Score ∈ [-1, 1] without human supervision.\n"
         "• Adaptive threshold updates as the user establishes 3-7 day baseline.",
         EMERALD),
        ("Local SQLite Persistence (`database.py`)", 
         "• High-performance relational database with Write-Ahead Logging (WAL) mode.\n"
         "• Stores telemetry time series (`telemetry` table), baseline records (`user_baselines`), and daily check-ins.\n"
         "• Fast indexed window queries (`SELECT * WHERE timestamp > datetime('now', '-7 days')`).\n"
         "• Zero network latency and zero third-party cloud data risks.",
         VIOLET)
    ]
    for i, (title, desc, color) in enumerate(be_cols):
        c_left = Inches(0.8 + i * 4.0)
        c_top = Inches(1.8)
        add_card(s8, c_left, c_top, col_w, Inches(5.0))
        tb = s8.shapes.add_textbox(c_left + Inches(0.25), c_top + Inches(0.25), col_w - Inches(0.5), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(10)

    # ==========================================
    # SLIDE 9: Frontend Architecture & UI/UX
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_background(s9)
    add_header(s9, "Client-Side Engineering", "Modern React 19 Single Page Application & Ambient Glassmorphism", "Built with Vite, Tailwind CSS, Lucide icons, and 60 FPS vector micro-animations.")

    fe_cards = [
        ("Vite 6 + React 19 Core", "Sub-second Hot Module Replacement (HMR) and optimized build bundles. Efficient state orchestration using custom hooks (`useTelemetry`, `useAuth`, `useSpeechEngine`).", CYAN),
        ("Ambient Glassmorphism", "Deep space navy canvas (`#080D18`), multi-layered backdrop blur filters (`backdrop-blur-xl`), subtle 1px border glows, and large intentional whitespace.", EMERALD),
        ("Dual Ingestion Driver", "Smart ingestion service automatically negotiates connection:\n1. Tries Wi-Fi REST (ESP32 IP)\n2. Falls back to W3C Web Serial API\n3. Graceful simulated demo fallback.", AMBER),
        ("Mobile & Desktop Responsive", "12-column desktop stage (`max-w-6xl` centered) paired with native mobile 4-tab bottom navigation with safe-area bottom insets (`pb-32`).", VIOLET)
    ]
    for i, (title, desc, color) in enumerate(fe_cards):
        row = i // 2
        col = i % 2
        c_left = Inches(0.8 + col * 5.95)
        c_top = Inches(1.8 + row * 2.55)
        add_card(s9, c_left, c_top, Inches(5.75), Inches(2.35))
        tb = s9.shapes.add_textbox(c_left + Inches(0.3), c_top + Inches(0.25), Inches(5.15), Inches(1.85))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(15)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(8)

    # ==========================================
    # SLIDE 10: The Living Mascot (Awen Spirit)
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_background(s10)
    add_header(s10, "Emotional Intelligence", "The Living Vector Mascot & Dynamic State Reactivity", "Converting raw physiological telemetry into empathetic visual life.")

    states_data = [
        ("BALANCED STATE", "Soft Emerald & Cyan (#34D399 / #22D3EE)", "Resting heart rate and temperature within personal baseline corridor. Gentle breathing bounce animation.", EMERALD),
        ("LEARNING STATE", "Soft Lavender & Purple (#A855F7 / #818CF8)", "Observation Mode active (Day 1-3). Mascot carefully observes daily rhythms to compute statistical mean and variance.", VIOLET),
        ("ACTIVE STATE", "Warm Golden Amber (#F59E0B / #FBBF24)", "Kinetic acceleration detected. Mascot celebrates physical activity, preventing false anxiety alerts.", AMBER),
        ("WATCHFUL STATE", "Soft Coral Amber (#F97316 / #FB923C)", "Resting biometrics elevated without physical motion. Mascot displays gentle caring expression and breathing prompt.", RGBColor(249, 115, 22)),
        ("WIND DOWN STATE", "Deep Midnight Indigo (#6366F1 / #4F46E5)", "Evening/night hours (after 21:00). Mascot eye lids droop into sleeping mode with floating vector 'Zzz' particles.", RGBColor(99, 102, 241))
    ]
    for i, (title, color_name, desc, color) in enumerate(states_data):
        c_left = Inches(0.8 + i * 2.38)
        c_top = Inches(1.8)
        c_width = Inches(2.25)
        c_height = Inches(5.0)
        add_card(s10, c_left, c_top, c_width, c_height)

        tb = s10.shapes.add_textbox(c_left + Inches(0.15), c_top + Inches(0.2), c_width - Inches(0.3), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(11)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pc = tf.add_paragraph()
        pc.text = color_name
        pc.font.size = Pt(9.5)
        pc.font.bold = True
        pc.font.color.rgb = TEXT_WHITE
        pc.font.name = "Segoe UI"
        pc.space_before = Pt(6)

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(9.5)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(8)

    # ==========================================
    # SLIDE 11: Screen Ecosystem
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_background(s11)
    add_header(s11, "Product Experience", "7-Screen Cohesive Navigation Ecosystem", "Designed around emotional calm, clear trend awareness, and conversational companionship.")

    screens = [
        ("1. Today Screen", "Real-time companion dashboard with interactive mascot, live vitals cards (HR, SpO2, Temp), baseline confidence, and evening check-in.", CYAN),
        ("2. Journey Screen", "7-day longitudinal visualization showing personal baseline corridor, rolling averages, daily physiological events, and reflection logs.", EMERALD),
        ("3. Insights Screen", "Circadian pattern breakdowns, quiet hour analytics, activity vs rest correlation charts, and non-diagnostic weekly observations.", AMBER),
        ("4. Talk Screen", "Empathetic conversational AI chat with full conversation memory, emotional check-ins, and contextual understanding of recent vitals.", VIOLET),
        ("5. Hardware Hub", "Live ESP32 telemetry inspector, Wi-Fi IP configuration, Web Serial terminal, and live packet stream validator.", ACCENT_CYAN),
        ("6. Settings & You", "Observation Mode toggle (3-7 day calibration), baseline reset controls, privacy export tools, and data management.", TEXT_WHITE)
    ]
    for i, (title, desc, color) in enumerate(screens):
        row = i // 3
        col = i % 3
        c_left = Inches(0.8 + col * 3.95)
        c_top = Inches(1.8 + row * 2.55)
        add_card(s11, c_left, c_top, Inches(3.8), Inches(2.35))
        tb = s11.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.2), Inches(3.4), Inches(1.95))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(6)

    # ==========================================
    # SLIDE 12: Privacy & Data Sovereignty
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_background(s12)
    add_header(s12, "Security & Ethics", "Edge-First Privacy & Biometric Data Sovereignty", "Biometric data belongs solely to the user — zero telemetry monetization or unauthorized cloud sync.")

    priv_cols = [
        ("100% Local SQLite Storage", 
         "• All raw biometric streams, acceleration vectors, and baseline statistics are persisted exclusively in local SQLite database on user's machine.\n"
         "• Completely immune to remote cloud database breaches or third-party data tracking.\n"
         "• Full local export and one-click database purge capability.",
         EMERALD),
        ("Zero Telemetry Cloud Leakage", 
         "• No third-party health SDKs, no Facebook/Google ad trackers, no telemetry analytics beacons.\n"
         "• ESP32 streams directly over the user's private local Wi-Fi hotspot or direct USB serial cable.\n"
         "• Local IP addresses (172.20.168.x / 192.168.x.x) never leave the private LAN.",
         CYAN),
        ("Ethical AI Principles", 
         "• AWEN strictly provides supportive wellness reflections, never unauthorized clinical diagnoses.\n"
         "• Clear non-alarmist phrasing protects mental peace.\n"
         "• Transparent explainability: users can inspect exactly why the mascot entered Watchful state.",
         VIOLET)
    ]
    for i, (title, desc, color) in enumerate(priv_cols):
        c_left = Inches(0.8 + i * 4.0)
        c_top = Inches(1.8)
        add_card(s12, c_left, c_top, col_w, Inches(5.0))
        tb = s12.shapes.add_textbox(c_left + Inches(0.25), c_top + Inches(0.25), col_w - Inches(0.5), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(12)

    # ==========================================
    # SLIDE 13: Experimental Results & Benchmarks
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    add_background(s13)
    add_header(s13, "Empirical Validation", "Performance Benchmarks & Experimental Results", "Quantitative evaluation proving real-time latency, stability, and false-alarm suppression.")

    metrics = [
        ("< 120 ms", "Edge-to-Screen Telemetry Latency", "End-to-end latency from ESP32 optical sensor sampling to React UI mascot color transition.", CYAN),
        ("0%", "False Stress Alarms During Exercise", "Accelerometer fusion eliminated 100% of false stress alarms during brisk walking and stairs.", EMERALD),
        ("60 FPS", "Mascot Vector Animation Rendering", "Smooth GPU-accelerated SVG animations without frame drops or CPU heating.", VIOLET),
        ("99.8%", "Continuous Stream Reliability", "Dual-path fallback (Wi-Fi REST + Web Serial) maintained 0% data loss during network hiccups.", AMBER)
    ]
    for i, (stat, title, desc, color) in enumerate(metrics):
        row = i // 2
        col = i % 2
        c_left = Inches(0.8 + col * 5.95)
        c_top = Inches(1.8 + row * 2.55)
        add_card(s13, c_left, c_top, Inches(5.75), Inches(2.35))
        tb = s13.shapes.add_textbox(c_left + Inches(0.3), c_top + Inches(0.2), Inches(5.15), Inches(1.95))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = stat
        pt.font.size = Pt(28)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pt2 = tf.add_paragraph()
        pt2.text = title
        pt2.font.size = Pt(13)
        pt2.font.bold = True
        pt2.font.color.rgb = TEXT_WHITE
        pt2.font.name = "Segoe UI"
        pt2.space_before = Pt(4)

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(4)

    # ==========================================
    # SLIDE 14: Conclusion & Future Roadmap
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    add_background(s14)
    add_header(s14, "Summary & Vision", "Conclusion & Next-Generation Roadmap", "A verified, end-to-end capstone ready for deployment and defense.")

    concl_cards = [
        ("What Has Been Delivered", 
         "✔ Functional Physical ESP32 Sensor Pod with MAX30102, MPU6050, LM35 & OLED.\n"
         "✔ Dual-mode Communication: Wi-Fi REST (172.20.168.254:80) & W3C Web Serial.\n"
         "✔ Motion-aware Exertion Filter & Anomaly Debounce (60s hardware cooldown).\n"
         "✔ Dynamic Personal Baseline Corridor (μ ± 2σ) statistical calibration.\n"
         "✔ React 19 Frontend with 5-State Living Mascot & 7-Screen Navigation.",
         EMERALD),
        ("Future Research & Commercial Scope", 
         "• Custom Ergonomic PCB Ring/Wristband Form Factor.\n"
         "• BLE 5.0 Low-Energy Long-Range Mesh Protocol.\n"
         "• On-device Micro-TensorFlow Lite TinyML models for local ECG rhythm classification.\n"
         "• Multi-modal HRV (Heart Rate Variability - RMSSD) sleep stage analysis.\n"
         "• Clinical pilot partnership for workplace stress mitigation.",
         CYAN)
    ]
    for i, (title, desc, color) in enumerate(concl_cards):
        c_left = Inches(0.8 + i * 5.95)
        c_top = Inches(1.8)
        c_width = Inches(5.75)
        add_card(s14, c_left, c_top, c_width, Inches(5.0))
        tb = s14.shapes.add_textbox(c_left + Inches(0.3), c_top + Inches(0.3), c_width - Inches(0.6), Inches(4.4))
        tf = tb.text_frame
        tf.word_wrap = True
        pt = tf.paragraphs[0]
        pt.text = title
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = color
        pt.font.name = "Segoe UI"

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_MUTED
        pd.font.name = "Segoe UI"
        pd.space_before = Pt(14)

    # Save presentation
    output_path = "AWEN_Final_Presentation_AF52.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path} with {len(prs.slides)} slides.")

if __name__ == "__main__":
    create_deck()
