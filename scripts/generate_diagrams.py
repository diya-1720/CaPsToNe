import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image, ImageDraw, ImageFont

FIGURES_DIR = r"c:\Users\Anurag Singh\Desktop\capstone\CaPsToNe\figures"
os.makedirs(FIGURES_DIR, exist_ok=True)

# ----------------- Figure 1: Data Flow Diagram (DFD Level 0 & Level 1) -----------------
def generate_fig1_dfd():
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(11, 10), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    
    # Subplot 1: Level 0 Context Diagram
    ax1.set_facecolor('#F9FAFB')
    ax1.set_title("Figure 1(a): Data Flow Diagram Level 0 (Context Diagram)", fontsize=13, fontweight='bold', pad=15, color='#111827')
    ax1.set_xlim(0, 10)
    ax1.set_ylim(0, 5)
    ax1.axis('off')
    
    # User External Entity
    rect_user = patches.FancyBboxPatch((0.5, 1.8), 2.0, 1.4, boxstyle="round,pad=0.1", ec="#1E3A8A", fc="#DBEAFE", lw=2)
    ax1.add_patch(rect_user)
    ax1.text(1.5, 2.5, "USER\n(Subject)", ha="center", va="center", fontsize=10, fontweight="bold", color="#1E3A8A")
    
    # System Process 0
    circle_sys = patches.Circle((5.0, 2.5), 1.3, ec="#065F46", fc="#D1FAE5", lw=2.5)
    ax1.add_patch(circle_sys)
    ax1.text(5.0, 2.5, "0.0\nAWEN System\n(IoT + Local\nInformatics)", ha="center", va="center", fontsize=10, fontweight="bold", color="#065F46")
    
    # Data Store: Local SQLite
    rect_db = patches.FancyBboxPatch((7.6, 1.8), 2.0, 1.4, boxstyle="round,pad=0.1", ec="#92400E", fc="#FEF3C7", lw=2)
    ax1.add_patch(rect_db)
    ax1.text(8.6, 2.5, "D1: Local Database\n(SQLite 3\nawen.db)", ha="center", va="center", fontsize=10, fontweight="bold", color="#92400E")
    
    # Arrows Level 0
    ax1.annotate("", xy=(3.6, 2.8), xytext=(2.6, 2.8), arrowprops=dict(arrowstyle="->", color="#1E3A8A", lw=2))
    ax1.text(3.1, 3.0, "Vitals & Motion", ha="center", fontsize=8, color="#1E3A8A", fontweight="semibold")
    
    ax1.annotate("", xy=(2.6, 2.2), xytext=(3.6, 2.2), arrowprops=dict(arrowstyle="->", color="#065F46", lw=2))
    ax1.text(3.1, 1.9, "Wellness Trends & Alerts", ha="center", fontsize=8, color="#065F46", fontweight="semibold")
    
    ax1.annotate("", xy=(7.5, 2.8), xytext=(6.4, 2.8), arrowprops=dict(arrowstyle="->", color="#065F46", lw=2))
    ax1.text(6.95, 3.0, "Persist Telemetry", ha="center", fontsize=8, color="#065F46", fontweight="semibold")
    
    ax1.annotate("", xy=(6.4, 2.2), xytext=(7.5, 2.2), arrowprops=dict(arrowstyle="->", color="#92400E", lw=2))
    ax1.text(6.95, 1.9, "Baseline History", ha="center", fontsize=8, color="#92400E", fontweight="semibold")
    
    # Subplot 2: Level 1 Functional Pipeline
    ax2.set_facecolor('#F9FAFB')
    ax2.set_title("Figure 1(b): Data Flow Diagram Level 1 (Functional Decomposition)", fontsize=13, fontweight='bold', pad=15, color='#111827')
    ax2.set_xlim(0, 11)
    ax2.set_ylim(0, 6)
    ax2.axis('off')
    
    # Processes
    procs = [
        (1.2, 3.0, "1.0 Sensor\nAcquisition", "#DBEAFE", "#1E3A8A"),
        (3.8, 3.0, "2.0 Motion\nDisambiguation", "#E0E7FF", "#3730A3"),
        (6.4, 3.0, "3.0 Personal\nBaseline Engine", "#D1FAE5", "#065F46"),
        (9.0, 3.0, "4.0 Local\nPresentation", "#FCE7F3", "#9D174D")
    ]
    for x, y, label, fc, ec in procs:
        circ = patches.Circle((x, y), 0.9, ec=ec, fc=fc, lw=2)
        ax2.add_patch(circ)
        ax2.text(x, y, label, ha="center", va="center", fontsize=8.5, fontweight="bold", color=ec)
        
    # Arrows between processes
    ax2.annotate("", xy=(2.8, 3.0), xytext=(2.2, 3.0), arrowprops=dict(arrowstyle="->", color="#1E3A8A", lw=2))
    ax2.text(2.5, 3.25, "Raw HR, SpO2\nax, ay, az", ha="center", fontsize=7.5, color="#1F2937")
    
    ax2.annotate("", xy=(5.4, 3.0), xytext=(4.8, 3.0), arrowprops=dict(arrowstyle="->", color="#3730A3", lw=2))
    ax2.text(5.1, 3.25, "a_mag &\nActivity State", ha="center", fontsize=7.5, color="#1F2937")
    
    ax2.annotate("", xy=(8.0, 3.0), xytext=(7.4, 3.0), arrowprops=dict(arrowstyle="->", color="#065F46", lw=2))
    ax2.text(7.7, 3.25, "Deviation &\nAlert Pattern", ha="center", fontsize=7.5, color="#1F2937")
    
    # Database Box Below
    rect_db2 = patches.FancyBboxPatch((4.5, 0.4), 2.0, 1.1, boxstyle="round,pad=0.1", ec="#92400E", fc="#FEF3C7", lw=2)
    ax2.add_patch(rect_db2)
    ax2.text(5.5, 0.95, "D1: SQLite Database\n(sensor_readings,\nuser_baselines)", ha="center", va="center", fontsize=8, fontweight="bold", color="#92400E")
    
    # DB Connections
    ax2.annotate("", xy=(5.2, 1.6), xytext=(4.0, 2.0), arrowprops=dict(arrowstyle="->", color="#3730A3", lw=1.5, ls="--"))
    ax2.annotate("", xy=(6.2, 2.0), xytext=(5.8, 1.6), arrowprops=dict(arrowstyle="->", color="#065F46", lw=1.5, ls="--"))
    ax2.annotate("", xy=(8.8, 2.0), xytext=(6.6, 1.0), arrowprops=dict(arrowstyle="->", color="#9D174D", lw=1.5, ls="--"))
    
    plt.tight_layout()
    out_path = os.path.join(FIGURES_DIR, "fig1_dfd.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")

# ----------------- Figure 2: System Architecture Block Diagram -----------------
def generate_fig2_block_diagram():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.set_title("Figure 2: AWEN 5-Tier Cyber-Physical System Architecture", fontsize=14, fontweight='bold', pad=20, color='#0F172A')
    
    tiers = [
        ("TIER 1: SENSOR HARDWARE", 7.5, "#E2E8F0", "#334155", [
            ("MAX30100 Optical PPG\n(I2C: 0x57)", 1.8),
            ("MPU-6050 6-Axis IMU\n(I2C: 0x68)", 4.5),
            ("LM35 Precision Temp\n(ADC: GPIO 34)", 7.2),
            ("SSD1306 128x64 OLED\n& Buzzer (I2C: 0x3C)", 9.9)
        ]),
        ("TIER 2: EMBEDDED MICROCONTROLLER (ESP32-WROOM-32)", 5.6, "#DBEAFE", "#1E40AF", [
            ("I2C Bus Multiplexing (GPIO 21 SDA, 22 SCL)", 3.0),
            ("Motion Vector Calculation: a_mag = sqrt(ax^2+ay^2+az^2)/9.81", 6.0),
            ("OLED 3-Screen Display & USB CDC / Wi-Fi Serialization", 9.0)
        ]),
        ("TIER 3: BACKEND REST API (FastAPI / Python 3.13)", 3.7, "#FEF3C7", "#92400E", [
            ("Authentication Guard (PBKDF2-HMAC-SHA256 Token)", 3.0),
            ("Pydantic Schema Validation & Activity Offset Categorization", 6.0),
            ("Isolation Forest ML Engine & Baseline Deviation Analysis", 9.0)
        ]),
        ("TIER 4: LOCAL RELATIONAL DATABASE (SQLite 3 - awen.db)", 1.9, "#D1FAE5", "#065F46", [
            ("users & user_sessions (Patient Isolation)", 2.5),
            ("sensor_readings (Time-Series Telemetry)", 5.0),
            ("user_baselines (mu, sigma, confidence)", 7.5),
            ("observations & checkins (Audit Trail)", 10.0)
        ]),
        ("TIER 5: CLIENT PRESENTATION (React 19 / Vite SPA)", 0.2, "#FCE7F3", "#9D174D", [
            ("Biometric Dashboard & 60 FPS Pulse Wave Canvas Oscilloscope", 3.0),
            ("Today Recovery Timeline & 7-Day Journey Raw Inspection Table", 6.0),
            ("Insights Dispersion Chart, AI Companion & Clinical PDF Export", 9.0)
        ])
    ]
    
    for title, y_pos, fc, tc, blocks in tiers:
        # Tier bounding box
        rect = patches.FancyBboxPatch((0.4, y_pos), 11.2, 1.2, boxstyle="round,pad=0.1", ec=tc, fc=fc, lw=1.8)
        ax.add_patch(rect)
        ax.text(0.6, y_pos + 0.95, title, fontsize=9.5, fontweight='bold', color=tc)
        
        # Inner blocks
        for text, x_center in blocks:
            w = 10.4 / len(blocks)
            sub_rect = patches.FancyBboxPatch((x_center - w/2 + 0.1, y_pos + 0.15), w - 0.2, 0.7, boxstyle="round,pad=0.05", ec=tc, fc="#FFFFFF", lw=1)
            ax.add_patch(sub_rect)
            ax.text(x_center, y_pos + 0.5, text, ha="center", va="center", fontsize=7.5, color="#1E293B", fontweight="medium")
            
    # Connective arrows
    arrow_ys = [7.5, 5.6, 3.7, 1.9]
    arrow_texts = [
        "I2C Bus & Analog ADC Readouts (100 Hz)",
        "USB Web Serial (115200 Baud) OR Wi-Fi HTTP POST /api/readings",
        "ACID Relational Transactions (auth.uid isolated)",
        "Authenticated JSON REST API (Bearer Token Authorization)"
    ]
    for i, y in enumerate(arrow_ys):
        ax.annotate("", xy=(6.0, y), xytext=(6.0, y - 0.5), arrowprops=dict(arrowstyle="<->", color="#475569", lw=2))
        ax.text(6.15, y - 0.25, arrow_texts[i], fontsize=7, color="#475569", fontweight="semibold")

    plt.tight_layout()
    out_path = os.path.join(FIGURES_DIR, "fig2_block_diagram.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")

# ----------------- Figure 3: System Flowchart -----------------
def generate_fig3_flowchart():
    fig, ax = plt.subplots(figsize=(9, 11), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FAFAFA')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 14)
    ax.axis('off')
    
    ax.set_title("Figure 3: AWEN End-to-End Physiological Processing Flowchart", fontsize=13, fontweight='bold', pad=15, color='#0F172A')
    
    steps = [
        ("Power On & I2C Bus Enumeration (OLED 0x3C, MPU 0x68, MAX30100 0x57)", 13.0, "round"),
        ("Acquire Sensor Telemetry (PPG IR/Red, 3-Axis Accel, Temp)", 11.7, "rect"),
        ("Compute Motion Magnitude: a_mag = sqrt(ax^2+ay^2+az^2)/g", 10.4, "rect"),
        ("Is a_mag > 1.25 g? (Physical Exertion Active)", 9.1, "diamond"),
        ("Classify State: 'Walking' / 'Active'\nApply Activity Offsets (No Stress Alarm)", 7.8, "rect_branch_l"),
        ("Classify State: 'Resting' / 'Sedentary'\nQuery User Baseline: N(mu, sigma)", 7.8, "rect_branch_r"),
        ("Evaluate Deviation: Delta HR = HR_curr - Expected_HR", 6.2, "rect"),
        ("Is Delta HR > 2.0 * sigma && Sedentary?", 4.9, "diamond"),
        ("Flag 'Watchful' Stress-Related Pattern\nTrigger Active Buzzer & SQLite Observation", 3.4, "rect_alert"),
        ("Confirm 'Balanced' / 'Nominal' Baseline\nMaintain Clean Mascot Calm Aura", 3.4, "rect_calm"),
        ("Persist Record to SQLite (sensor_readings)\nStream to React Web Dashboard & OLED", 1.8, "rect"),
        ("Delay 2.8s / Next Sampling Epoch", 0.6, "round")
    ]
    
    # Drawing shapes
    # 1. Start
    rect = patches.FancyBboxPatch((2.0, 12.6), 6.0, 0.7, boxstyle="round,pad=0.1", ec="#1E40AF", fc="#DBEAFE", lw=1.8)
    ax.add_patch(rect)
    ax.text(5.0, 12.95, steps[0][0], ha="center", va="center", fontsize=8, fontweight="bold", color="#1E40AF")
    
    # 2. Acquire
    rect = patches.Rectangle((2.0, 11.3), 6.0, 0.7, ec="#334155", fc="#F1F5F9", lw=1.5)
    ax.add_patch(rect)
    ax.text(5.0, 11.65, steps[1][0], ha="center", va="center", fontsize=8, color="#1E293B")
    
    # 3. Compute
    rect = patches.Rectangle((2.0, 10.0), 6.0, 0.7, ec="#334155", fc="#F1F5F9", lw=1.5)
    ax.add_patch(rect)
    ax.text(5.0, 10.35, steps[2][0], ha="center", va="center", fontsize=8, color="#1E293B")
    
    # 4. Diamond 1
    diam1 = patches.Polygon([[5.0, 9.7], [7.2, 8.9], [5.0, 8.1], [2.8, 8.9]], ec="#B45309", fc="#FEF3C7", lw=1.8)
    ax.add_patch(diam1)
    ax.text(5.0, 8.9, "Is a_mag > 1.25 g?\n(Physical Motion)", ha="center", va="center", fontsize=7.5, fontweight="bold", color="#92400E")
    
    # 5. Left Branch (Exertion)
    rect_l = patches.Rectangle((0.5, 7.3), 3.8, 0.9, ec="#D97706", fc="#FFFBEB", lw=1.5)
    ax.add_patch(rect_l)
    ax.text(2.4, 7.75, steps[4][0], ha="center", va="center", fontsize=7.2, color="#92400E")
    
    # 6. Right Branch (Sedentary)
    rect_r = patches.Rectangle((5.7, 7.3), 3.8, 0.9, ec="#059669", fc="#ECFDF5", lw=1.5)
    ax.add_patch(rect_r)
    ax.text(7.6, 7.75, steps[5][0], ha="center", va="center", fontsize=7.2, color="#065F46")
    
    # 7. Merge to Deviation
    rect = patches.Rectangle((2.0, 5.8), 6.0, 0.7, ec="#334155", fc="#F1F5F9", lw=1.5)
    ax.add_patch(rect)
    ax.text(5.0, 6.15, steps[6][0], ha="center", va="center", fontsize=8, color="#1E293B")
    
    # 8. Diamond 2
    diam2 = patches.Polygon([[5.0, 5.4], [7.4, 4.6], [5.0, 3.8], [2.6, 4.6]], ec="#B91C1C", fc="#FEE2E2", lw=1.8)
    ax.add_patch(diam2)
    ax.text(5.0, 4.6, "Is Delta HR > 2*sigma\n&& Sedentary Rest?", ha="center", va="center", fontsize=7.5, fontweight="bold", color="#991B1B")
    
    # 9. Alert Box
    rect_alert = patches.Rectangle((0.5, 2.9), 3.8, 0.9, ec="#DC2626", fc="#FEF2F2", lw=1.5)
    ax.add_patch(rect_alert)
    ax.text(2.4, 3.35, steps[8][0], ha="center", va="center", fontsize=7.2, fontweight="bold", color="#B91C1C")
    
    # 10. Calm Box
    rect_calm = patches.Rectangle((5.7, 2.9), 3.8, 0.9, ec="#10B981", fc="#F0FDF4", lw=1.5)
    ax.add_patch(rect_calm)
    ax.text(7.6, 3.35, steps[9][0], ha="center", va="center", fontsize=7.2, fontweight="bold", color="#047857")
    
    # 11. Persist
    rect_persist = patches.Rectangle((2.0, 1.4), 6.0, 0.7, ec="#0D9488", fc="#CCFBF1", lw=1.5)
    ax.add_patch(rect_persist)
    ax.text(5.0, 1.75, steps[10][0], ha="center", va="center", fontsize=8, fontweight="bold", color="#0F766E")
    
    # 12. End / Loop
    rect_end = patches.FancyBboxPatch((3.0, 0.2), 4.0, 0.6, boxstyle="round,pad=0.1", ec="#475569", fc="#F1F5F9", lw=1.5)
    ax.add_patch(rect_end)
    ax.text(5.0, 0.5, steps[11][0], ha="center", va="center", fontsize=8, color="#334155")
    
    # Connecting Arrows
    ax.annotate("", xy=(5.0, 12.0), xytext=(5.0, 12.6), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    ax.annotate("", xy=(5.0, 10.7), xytext=(5.0, 11.3), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    ax.annotate("", xy=(5.0, 9.7), xytext=(5.0, 10.0), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    
    # Branching arrows from Diamond 1
    ax.annotate("", xy=(2.4, 8.2), xytext=(3.5, 8.9), arrowprops=dict(arrowstyle="->", color="#92400E", lw=1.5))
    ax.text(2.6, 8.7, "YES (Motion)", fontsize=7.5, color="#92400E", fontweight="bold")
    
    ax.annotate("", xy=(7.6, 8.2), xytext=(6.5, 8.9), arrowprops=dict(arrowstyle="->", color="#065F46", lw=1.5))
    ax.text(7.1, 8.7, "NO (Resting)", fontsize=7.5, color="#065F46", fontweight="bold")
    
    # Merge into Deviation
    ax.annotate("", xy=(4.0, 6.5), xytext=(2.4, 7.3), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.2))
    ax.annotate("", xy=(6.0, 6.5), xytext=(7.6, 7.3), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.2))
    
    ax.annotate("", xy=(5.0, 5.4), xytext=(5.0, 5.8), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    
    # Branching arrows from Diamond 2
    ax.annotate("", xy=(2.4, 3.8), xytext=(3.4, 4.6), arrowprops=dict(arrowstyle="->", color="#B91C1C", lw=1.5))
    ax.text(2.5, 4.3, "YES (Stress Pattern)", fontsize=7.5, color="#B91C1C", fontweight="bold")
    
    ax.annotate("", xy=(7.6, 3.8), xytext=(6.6, 4.6), arrowprops=dict(arrowstyle="->", color="#047857", lw=1.5))
    ax.text(7.1, 4.3, "NO (Baseline Met)", fontsize=7.5, color="#047857", fontweight="bold")
    
    # Merge into Persist
    ax.annotate("", xy=(4.0, 2.1), xytext=(2.4, 2.9), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.2))
    ax.annotate("", xy=(6.0, 2.1), xytext=(7.6, 2.9), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.2))
    
    ax.annotate("", xy=(5.0, 0.8), xytext=(5.0, 1.4), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
    
    plt.tight_layout()
    out_path = os.path.join(FIGURES_DIR, "fig3_flowchart.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")

# ----------------- Figure 4: UML & Relational Architecture -----------------
def generate_fig4_uml():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8.5)
    ax.axis('off')
    
    ax.set_title("Figure 4: AWEN Relational Database Entity Schema (SQLite 3)", fontsize=13, fontweight='bold', pad=15, color='#0F172A')
    
    # Schema Tables
    tables = [
        ("users (Entity Table)", 0.6, 5.0, 3.2, 2.8, [
            "id: TEXT [PK]",
            "patient_id: TEXT [UNIQUE]",
            "name: TEXT",
            "email: TEXT [UNIQUE]",
            "password_hash: TEXT",
            "age: INTEGER",
            "gender: TEXT",
            "observation_mode: INTEGER",
            "baseline_confidence: TEXT"
        ], "#1E3A8A", "#EFF6FF"),
        
        ("user_sessions", 4.4, 5.8, 3.2, 2.0, [
            "token: TEXT [PK]",
            "user_id: TEXT [FK -> users.id]",
            "created_at: TEXT",
            "expires_at: TEXT"
        ], "#3730A3", "#EEF2FF"),
        
        ("devices", 8.2, 5.8, 3.2, 2.0, [
            "id: TEXT [PK]",
            "device_id: TEXT [UNIQUE]",
            "user_id: TEXT [FK -> users.id]",
            "api_key: TEXT [UNIQUE]",
            "device_name: TEXT"
        ], "#065F46", "#ECFDF5"),
        
        ("sensor_readings", 0.6, 0.8, 3.4, 3.6, [
            "id: TEXT [PK]",
            "user_id: TEXT [FK -> users.id]",
            "heart_rate: REAL",
            "spo2: REAL",
            "temperature: REAL",
            "accel_x, accel_y, accel_z: REAL",
            "accel_magnitude: REAL",
            "activity_state: TEXT",
            "data_source: TEXT",
            "created_at: TEXT"
        ], "#92400E", "#FFFBEB"),
        
        ("user_baselines", 4.4, 0.8, 3.2, 2.8, [
            "id: TEXT [PK]",
            "user_id: TEXT [FK -> users.id]",
            "resting_hr: REAL",
            "resting_spo2: REAL",
            "resting_temp: REAL",
            "hr_variance: REAL",
            "confidence: TEXT",
            "samples: INTEGER"
        ], "#065F46", "#D1FAE5"),
        
        ("observations", 8.2, 2.8, 3.2, 2.0, [
            "id: TEXT [PK]",
            "user_id: TEXT [FK -> users.id]",
            "reading_id: TEXT [FK]",
            "severity: TEXT",
            "message: TEXT",
            "created_at: TEXT"
        ], "#B91C1C", "#FEF2F2"),
        
        ("user_checkins", 8.2, 0.5, 3.2, 1.8, [
            "id: TEXT [PK]",
            "user_id: TEXT [FK -> users.id]",
            "mood: TEXT",
            "activity_context: TEXT",
            "created_at: TEXT"
        ], "#6B21A8", "#FAF5FF")
    ]
    
    for title, x, y, w, h, cols, ec, fc in tables:
        rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08", ec=ec, fc=fc, lw=1.8)
        ax.add_patch(rect)
        # Header strip
        head = patches.FancyBboxPatch((x, y + h - 0.45), w, 0.45, boxstyle="round,pad=0.04", ec=ec, fc=ec, lw=1)
        ax.add_patch(head)
        ax.text(x + w/2, y + h - 0.22, title, ha="center", va="center", fontsize=8.5, fontweight="bold", color="#FFFFFF")
        
        # Columns
        col_y = y + h - 0.7
        for c in cols:
            ax.text(x + 0.15, col_y, c, fontsize=7.2, color="#1F2937", fontfamily="monospace")
            col_y -= 0.32
            
    # Foreign key connectors (1:N links)
    ax.annotate("", xy=(4.4, 6.8), xytext=(3.8, 6.8), arrowprops=dict(arrowstyle="->", color="#3730A3", lw=1.5))
    ax.text(4.1, 7.0, "1:N", fontsize=7, color="#3730A3", fontweight="bold")
    
    ax.annotate("", xy=(8.2, 6.8), xytext=(7.6, 6.8), arrowprops=dict(arrowstyle="->", color="#065F46", lw=1.5))
    ax.text(7.9, 7.0, "1:N", fontsize=7, color="#065F46", fontweight="bold")
    
    ax.annotate("", xy=(2.0, 4.4), xytext=(2.0, 5.0), arrowprops=dict(arrowstyle="->", color="#92400E", lw=1.5))
    ax.text(2.15, 4.7, "1:N", fontsize=7, color="#92400E", fontweight="bold")
    
    ax.annotate("", xy=(5.8, 3.6), xytext=(3.8, 5.2), arrowprops=dict(arrowstyle="->", color="#065F46", lw=1.5))
    ax.text(4.7, 4.4, "1:1", fontsize=7, color="#065F46", fontweight="bold")
    
    ax.annotate("", xy=(8.2, 3.8), xytext=(3.8, 5.5), arrowprops=dict(arrowstyle="->", color="#B91C1C", lw=1.5, ls="--"))
    ax.text(5.5, 4.9, "1:N", fontsize=7, color="#B91C1C", fontweight="bold")

    plt.tight_layout()
    out_path = os.path.join(FIGURES_DIR, "fig4_uml.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")

# ----------------- Figures 5, 6, 7: High Fidelity Mockups / Screen Diagrams -----------------
def generate_fig5_gui_dashboard():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    fig.patch.set_facecolor('#F4F4EF')
    ax.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')
    
    ax.set_title("Figure 5: AWEN Executive Biometric Dashboard GUI (Home Screen)", fontsize=12, fontweight='bold', pad=15, color='#0F172A')
    
    # Outer frame
    frame = patches.Rectangle((0.2, 0.2), 9.6, 5.4, ec="#0F172A", fc="#FAFAF9", lw=2)
    ax.add_patch(frame)
    
    # Navbar
    nav = patches.Rectangle((0.2, 5.0), 9.6, 0.6, ec="#0F172A", fc="#0F172A")
    ax.add_patch(nav)
    ax.text(0.5, 5.3, "AWEN  |  Executive Health Dashboard", color="#FFFFFF", fontsize=9, fontweight="bold", va="center")
    ax.text(6.8, 5.3, "Patient: Sarah Jenkins (PAT-649A78)  ● LIVE STREAM", color="#34D399", fontsize=7.5, va="center")
    
    # 4 Metric Cards
    metrics = [
        ("HEART RATE", "71.8", "BPM", "Resting Corridor (65 ± 5.2)", "#3B82F6", 0.6),
        ("OXYGEN (SpO2)", "98.7", "%", "Optimal Oxygenation", "#10B981", 2.9),
        ("BODY TEMP", "36.6", "°C", "Thermal Equilibrium", "#F59E0B", 5.2),
        ("MOTION VECTOR", "0.98", "g", "Sedentary Resting Posture", "#8B5CF6", 7.5)
    ]
    for label, val, unit, desc, col, x in metrics:
        card = patches.Rectangle((x, 3.2), 2.0, 1.5, ec="#0F172A", fc="#FFFFFF", lw=1.5)
        ax.add_patch(card)
        ax.text(x + 0.1, 4.45, label, fontsize=6.5, fontweight="bold", color="#64748B")
        ax.text(x + 0.1, 3.85, val, fontsize=18, fontweight="bold", color=col)
        ax.text(x + 1.2, 3.85, unit, fontsize=8, color="#64748B")
        ax.text(x + 0.1, 3.45, desc, fontsize=6, color="#475569")
        
    # Pulse Oscilloscope Box
    osc = patches.Rectangle((0.6, 0.6), 5.5, 2.3, ec="#0F172A", fc="#0F172A", lw=1.5)
    ax.add_patch(osc)
    ax.text(0.8, 2.65, "PHOTOPLETHYSMOGRAPHY (PPG) PULSE WAVE OSCILLOSCOPE — 60 FPS", color="#94A3B8", fontsize=6.5, fontweight="bold")
    
    # Waveform simulation
    import numpy as np
    x_wave = np.linspace(0.8, 5.9, 150)
    y_wave = 1.6 + 0.4 * np.sin(3 * x_wave * np.pi) * np.exp(-((x_wave % 1.0 - 0.5)**2)/0.03)
    ax.plot(x_wave, y_wave, color="#34D399", lw=2)
    
    # Mascot & Rhythm Status Card
    mascot_box = patches.Rectangle((6.4, 0.6), 3.1, 2.3, ec="#0F172A", fc="#FFFFFF", lw=1.5)
    ax.add_patch(mascot_box)
    ax.text(6.6, 2.65, "LIVING COMPANION: AWEN", color="#0F172A", fontsize=7, fontweight="bold")
    
    # Mascot vector circle
    mascot_circle = patches.Circle((7.95, 1.7), 0.55, ec="#8B5CF6", fc="#EDE9FE", lw=1.5)
    ax.add_patch(mascot_circle)
    # eyes
    ax.plot([7.8, 7.8], [1.75, 1.8], color="#6D28D9", lw=2)
    ax.plot([8.1, 8.1], [1.75, 1.8], color="#6D28D9", lw=2)
    # smile
    ax.plot([7.8, 7.95, 8.1], [1.6, 1.55, 1.6], color="#6D28D9", lw=1.5)
    
    ax.text(7.95, 0.95, "State: BALANCED (Resting Baseline)\n'Your rhythm is steady and serene.'", ha="center", fontsize=6.5, color="#4C1D95", fontweight="medium")

    plt.tight_layout()
    out_path = os.path.join(FIGURES_DIR, "fig5_gui_dashboard.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")

def generate_fig6_gui_today():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    fig.patch.set_facecolor('#F4F4EF')
    ax.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')
    
    ax.set_title("Figure 6: AWEN Today Recovery Chronology & Telemetry Timeline GUI", fontsize=12, fontweight='bold', pad=15, color='#0F172A')
    
    frame = patches.Rectangle((0.2, 0.2), 9.6, 5.4, ec="#0F172A", fc="#FAFAF9", lw=2)
    ax.add_patch(frame)
    
    nav = patches.Rectangle((0.2, 5.0), 9.6, 0.6, ec="#0F172A", fc="#0F172A")
    ax.add_patch(nav)
    ax.text(0.5, 5.3, "AWEN  |  Today Chronological Recovery Feed", color="#FFFFFF", fontsize=9, fontweight="bold", va="center")
    
    # Chronological Items
    items = [
        ("08:15 AM", "Morning Wakeup Check-in", "Resting Heart Rate: 62.4 BPM | SpO2: 99.1% | Temp: 36.4°C\nActivity: Resting | Subjective Mood: 'Refreshed'", "#10B981", 4.0),
        ("11:30 AM", "Campus Walk Exertion Event", "Active Heart Rate: 88.5 BPM | SpO2: 98.4% | Motion: 1.45 g\nContext: Walking (Active Multiplier applied — No Stress Flag)", "#3B82F6", 2.9),
        ("02:45 PM", "Cognitive Study Session (Baseline Departure)", "Elevated Heart Rate: 86.2 BPM | Motion: 0.96 g (Sedentary)\nContext: Study Session | Flag: Potential Stress Pattern (+18 BPM above baseline)", "#F59E0B", 1.8),
        ("05:30 PM", "Evening Guided Biofeedback Breathing", "Settling Heart Rate: 66.8 BPM | SpO2: 98.9% | Temp: 36.6°C\nContext: Post-relaxation recovery verified", "#8B5CF6", 0.7)
    ]
    for time_str, title, desc, col, y in items:
        rect = patches.Rectangle((0.6, y), 8.8, 0.95, ec="#CBD5E1", fc="#FFFFFF", lw=1.2)
        ax.add_patch(rect)
        tag = patches.Rectangle((0.6, y), 0.15, 0.95, fc=col, ec=col)
        ax.add_patch(tag)
        ax.text(0.9, y + 0.68, f"{time_str}  —  {title}", fontsize=7.5, fontweight="bold", color="#0F172A")
        ax.text(0.9, y + 0.25, desc, fontsize=6.5, color="#475569")

    plt.tight_layout()
    out_path = os.path.join(FIGURES_DIR, "fig6_gui_today.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")

def generate_fig7_gui_insights():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 5.5), dpi=300)
    fig.patch.set_facecolor('#F4F4EF')
    
    # Left: Insights Baseline Corridor
    ax1.set_facecolor('#FFFFFF')
    ax1.set_title("7-Day Personal Baseline Evolution & Dispersion", fontsize=10, fontweight='bold', color='#0F172A')
    
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    rhr = [66, 65, 64, 65, 63, 64, 65]
    err = [4.8, 5.0, 5.2, 5.1, 4.9, 5.2, 5.0]
    
    ax1.errorbar(days, rhr, yerr=err, fmt='o-', color='#2563EB', ecolor='#93C5FD', elinewidth=3, capsize=5, lw=2, label="Personal Baseline (mu ± sigma)")
    ax1.axhline(60, color='#94A3B8', linestyle='--', label="Static Clinical Boundary (60 BPM)")
    ax1.axhline(100, color='#94A3B8', linestyle='--', label="Static Clinical Boundary (100 BPM)")
    ax1.set_ylabel("Heart Rate (BPM)", fontsize=8)
    ax1.set_ylim(50, 110)
    ax1.legend(fontsize=7, loc="upper right")
    ax1.grid(True, linestyle=':', alpha=0.6)
    
    # Right: AI Companion Talk
    ax2.set_facecolor('#FFFFFF')
    ax2.set_title("AI Wellness Companion Interface (Non-Diagnostic)", fontsize=10, fontweight='bold', color='#0F172A')
    ax2.axis('off')
    
    chat_box = patches.Rectangle((0.05, 0.05), 0.9, 0.9, ec="#0F172A", fc="#FAFAF9", lw=1.5)
    ax2.add_patch(chat_box)
    
    # Dialog bubbles
    b1 = patches.FancyBboxPatch((0.1, 0.65), 0.75, 0.22, boxstyle="round,pad=0.03", ec="#CBD5E1", fc="#EDE9FE", lw=1)
    ax2.add_patch(b1)
    ax2.text(0.13, 0.76, "AWEN: 'I observed your heart rate was 18 BPM above\nyour normal resting baseline while you were studying.\nWould you like to try a 3-minute breathing reset?'", fontsize=7.2, color="#4C1D95")
    
    b2 = patches.FancyBboxPatch((0.25, 0.40), 0.65, 0.18, boxstyle="round,pad=0.03", ec="#CBD5E1", fc="#DBEAFE", lw=1)
    ax2.add_patch(b2)
    ax2.text(0.28, 0.49, "User: 'Yes please, I've been cramming for my viva\nand feeling quite fatigued.'", fontsize=7.2, color="#1E40AF")
    
    b3 = patches.FancyBboxPatch((0.1, 0.12), 0.75, 0.22, boxstyle="round,pad=0.03", ec="#CBD5E1", fc="#EDE9FE", lw=1)
    ax2.add_patch(b3)
    ax2.text(0.13, 0.23, "AWEN: 'Understood. Let's do the 4-7-8 rhythm together.\nInhale for 4... hold for 7... exhale for 8.'", fontsize=7.2, color="#4C1D95")
    
    plt.tight_layout()
    out_path = os.path.join(FIGURES_DIR, "fig7_gui_insights.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")

# ----------------- Figure 8: Circuit Schematic & Pin Interconnect -----------------
def generate_fig8_circuit_schematic():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#F8FAFC')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')
    
    ax.set_title("Figure 8: IoT Hardware Interconnect & ESP32 Pin Assignment Schematic", fontsize=12, fontweight='bold', pad=15, color='#0F172A')
    
    # ESP32 Box in center
    esp = patches.Rectangle((3.8, 1.5), 2.4, 4.2, ec="#1E3A8A", fc="#DBEAFE", lw=2)
    ax.add_patch(esp)
    ax.text(5.0, 5.3, "ESP32 Dev Module\n(WROOM-32)", ha="center", va="center", fontsize=9.5, fontweight="bold", color="#1E3A8A")
    
    # Left Sensors (I2C)
    # MAX30100
    p1 = patches.Rectangle((0.6, 4.6), 2.2, 1.2, ec="#065F46", fc="#D1FAE5", lw=1.5)
    ax.add_patch(p1)
    ax.text(1.7, 5.2, "MAX30100 PPG\n(I2C: 0x57)", ha="center", va="center", fontsize=8, fontweight="bold", color="#065F46")
    
    # MPU-6050
    p2 = patches.Rectangle((0.6, 2.8), 2.2, 1.2, ec="#3730A3", fc="#E0E7FF", lw=1.5)
    ax.add_patch(p2)
    ax.text(1.7, 3.4, "MPU-6050 6-Axis\n(I2C: 0x68)", ha="center", va="center", fontsize=8, fontweight="bold", color="#3730A3")
    
    # OLED
    p3 = patches.Rectangle((0.6, 1.0), 2.2, 1.2, ec="#92400E", fc="#FEF3C7", lw=1.5)
    ax.add_patch(p3)
    ax.text(1.7, 1.6, "SSD1306 OLED\n(I2C: 0x3C)", ha="center", va="center", fontsize=8, fontweight="bold", color="#92400E")
    
    # Right Peripherals
    # LM35
    p4 = patches.Rectangle((7.2, 4.2), 2.2, 1.2, ec="#B45309", fc="#FFEDD5", lw=1.5)
    ax.add_patch(p4)
    ax.text(8.3, 4.8, "LM35 Precision\nAnalog Temp", ha="center", va="center", fontsize=8, fontweight="bold", color="#9A3412")
    
    # Buzzer
    p5 = patches.Rectangle((7.2, 2.0), 2.2, 1.2, ec="#B91C1C", fc="#FEE2E2", lw=1.5)
    ax.add_patch(p5)
    ax.text(8.3, 2.6, "Active Piezo\nBuzzer (5V/3.3V)", ha="center", va="center", fontsize=8, fontweight="bold", color="#991B1B")
    
    # Wiring annotations
    # I2C Bus wires (Green for SDA, Blue for SCL)
    ax.annotate("", xy=(3.8, 4.2), xytext=(2.8, 5.0), arrowprops=dict(arrowstyle="-", color="#059669", lw=2))
    ax.annotate("", xy=(3.8, 4.0), xytext=(2.8, 3.4), arrowprops=dict(arrowstyle="-", color="#059669", lw=2))
    ax.annotate("", xy=(3.8, 3.8), xytext=(2.8, 1.8), arrowprops=dict(arrowstyle="-", color="#059669", lw=2))
    ax.text(3.3, 4.4, "I2C SDA (GPIO 21)\nI2C SCL (GPIO 22)", ha="center", fontsize=7, color="#059669", fontweight="bold")
    
    # LM35 to GPIO 34
    ax.annotate("", xy=(6.2, 4.2), xytext=(7.2, 4.8), arrowprops=dict(arrowstyle="->", color="#C2410C", lw=2))
    ax.text(6.7, 4.7, "VOUT -> GPIO 34\n(ADC1_CH6)", ha="center", fontsize=7, color="#C2410C", fontweight="bold")
    
    # Buzzer to GPIO 25
    ax.annotate("", xy=(7.2, 2.6), xytext=(6.2, 2.6), arrowprops=dict(arrowstyle="->", color="#DC2626", lw=2))
    ax.text(6.7, 2.8, "GPIO 25 -> (+)\nGND -> (-)", ha="center", fontsize=7, color="#DC2626", fontweight="bold")
    
    # Power Rail
    ax.text(5.0, 1.8, "Power: 3.3V Regulated DC\nCommon Ground (GND)", ha="center", fontsize=7, color="#475569", style="italic")

    plt.tight_layout()
    out_path = os.path.join(FIGURES_DIR, "fig8_circuit_schematic.png")
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")

if __name__ == "__main__":
    generate_fig1_dfd()
    generate_fig2_block_diagram()
    generate_fig3_flowchart()
    generate_fig4_uml()
    generate_fig5_gui_dashboard()
    generate_fig6_gui_today()
    generate_fig7_gui_insights()
    generate_fig8_circuit_schematic()
    print("All 8 figures successfully generated!")
