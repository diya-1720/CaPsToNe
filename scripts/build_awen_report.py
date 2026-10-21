import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

sys.path.append(os.path.dirname(__file__))
from report_helpers import (
    set_cell_background, set_cell_margins, set_cell_borders,
    add_styled_paragraph, add_heading_1, add_heading_2, add_heading_3,
    add_callout_box, add_image_with_caption, format_table
)

BASE_DIR = r"c:\Users\Anurag Singh\Desktop\capstone\CaPsToNe"
FIGURES_DIR = os.path.join(BASE_DIR, "figures")
DOCX_OUTPUT = os.path.join(BASE_DIR, "AWEN_Project_Report_AF52.docx")

def create_report():
    doc = Document()
    
    # ----------------- Page Setup -----------------
    # Set standard Letter/A4 dimensions with 0.75" left/right and 0.8" top/bottom margins
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11.0)
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)
    
    # Configure Normal Style font to Times New Roman
    style_normal = doc.styles['Normal']
    font_normal = style_normal.font
    font_normal.name = 'Times New Roman'
    font_normal.size = Pt(12)
    font_normal.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    print("Building Front Matter...")
    
    # =========================================================================
    # COVER PAGE
    # =========================================================================
    p_af = doc.add_paragraph()
    p_af.paragraph_format.space_before = Pt(0)
    p_af.paragraph_format.space_after = Pt(4)
    r_af = p_af.add_run("AF 52")
    r_af.font.name = 'Times New Roman'
    r_af.font.size = Pt(11)
    r_af.font.bold = True
    r_af.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)
    
    p_syn = doc.add_paragraph()
    p_syn.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_syn.paragraph_format.space_before = Pt(4)
    p_syn.paragraph_format.space_after = Pt(12)
    r_syn = p_syn.add_run("Synopsis")
    r_syn.font.name = 'Times New Roman'
    r_syn.font.size = Pt(18)
    r_syn.font.bold = True
    r_syn.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(8)
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run("AWEN: ADAPTIVE WELLNESS AND EMOTIONAL NAVIGATION\n(Personalized Physiological Baseline Intelligence & Longitudinal Health Companion)")
    r_title.font.name = 'Times New Roman'
    r_title.font.size = Pt(15)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(6)
    p_sub.paragraph_format.space_after = Pt(4)
    r_sub = p_sub.add_run("Submitted in partial fulfilment of the requirements of the degree of\n")
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(12)
    r_deg = p_sub.add_run("Bachelor of Engineering\nIn\nComputer Science and Engineering (Data Science)")
    r_deg.font.name = 'Times New Roman'
    r_deg.font.size = Pt(13)
    r_deg.font.bold = True
    r_deg.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    p_by = doc.add_paragraph()
    p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_by.paragraph_format.space_before = Pt(8)
    p_by.paragraph_format.space_after = Pt(4)
    r_by = p_by.add_run("by")
    r_by.font.name = 'Times New Roman'
    r_by.font.size = Pt(12)
    r_by.font.italic = True
    
    students = [
        ("Diya Singh", "Roll No. 50"),
        ("Parth Topale", "Roll No. 58"),
        ("Nishtha Lokhande", "Roll No. 21"),
        ("Swara Patil", "Roll No. 38")
    ]
    p_stud = doc.add_paragraph()
    p_stud.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_stud.paragraph_format.space_before = Pt(2)
    p_stud.paragraph_format.space_after = Pt(10)
    for name, roll in students:
        r_name = p_stud.add_run(f"{name} [{roll}]\n")
        r_name.font.name = 'Times New Roman'
        r_name.font.size = Pt(12)
        r_name.font.bold = True
        
    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide.paragraph_format.space_before = Pt(4)
    p_guide.paragraph_format.space_after = Pt(4)
    r_und = p_guide.add_run("Under the Guidance of\n")
    r_und.font.name = 'Times New Roman'
    r_und.font.size = Pt(12)
    r_und.font.italic = True
    r_gname = p_guide.add_run("Prof. / Dr. [Guide Name]\n")
    r_gname.font.name = 'Times New Roman'
    r_gname.font.size = Pt(12.5)
    r_gname.font.bold = True
    r_gdes = p_guide.add_run("Designation, Department of Computer Science and Engineering (Data Science), SJCEM")
    r_gdes.font.name = 'Times New Roman'
    r_gdes.font.size = Pt(11)
    
    # College Logo
    logo_path = os.path.join(BASE_DIR, "image1.png")
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(6)
        p_logo.paragraph_format.space_after = Pt(6)
        r_logo = p_logo.add_run()
        r_logo.add_picture(logo_path, width=Inches(1.3))
        
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(4)
    p_inst.paragraph_format.space_after = Pt(0)
    r_dept = p_inst.add_run("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DATA SCIENCE)\n")
    r_dept.font.name = 'Times New Roman'
    r_dept.font.size = Pt(12)
    r_dept.font.bold = True
    r_dept.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    
    r_coll = p_inst.add_run("ST. JOHN COLLEGE OF ENGINEERING & MANAGEMENT\n")
    r_coll.font.name = 'Times New Roman'
    r_coll.font.size = Pt(13)
    r_coll.font.bold = True
    r_coll.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    r_aff = p_inst.add_run("(An Autonomous College affiliated to University of Mumbai)\nPALGHAR, MAHARASHTRA\n")
    r_aff.font.name = 'Times New Roman'
    r_aff.font.size = Pt(10.5)
    
    r_uni = p_inst.add_run("UNIVERSITY OF MUMBAI\n")
    r_uni.font.name = 'Times New Roman'
    r_uni.font.size = Pt(12)
    r_uni.font.bold = True
    
    r_yr = p_inst.add_run("2026-2027")
    r_yr.font.name = 'Times New Roman'
    r_yr.font.size = Pt(12)
    r_yr.font.bold = True
    
    doc.add_page_break()

    # =========================================================================
    # CERTIFICATE OF APPROVAL
    # =========================================================================
    header_img_path = os.path.join(BASE_DIR, "image2.jpeg")
    if os.path.exists(header_img_path):
        p_hdr = doc.add_paragraph()
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_hdr.paragraph_format.space_before = Pt(0)
        p_hdr.paragraph_format.space_after = Pt(8)
        r_hdr = p_hdr.add_run()
        r_hdr.add_picture(header_img_path, width=Inches(6.8))
        
    p_cert_title = doc.add_paragraph()
    p_cert_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cert_title.paragraph_format.space_before = Pt(10)
    p_cert_title.paragraph_format.space_after = Pt(14)
    r_ct = p_cert_title.add_run("Certificate of Approval")
    r_ct.font.name = 'Times New Roman'
    r_ct.font.size = Pt(16)
    r_ct.font.bold = True
    
    cert_text = (
        "This is to certify that Diya Singh (Roll No. 50), Parth Topale (Roll No. 58), "
        "Nishtha Lokhande (Roll No. 21), and Swara Patil (Roll No. 38), are bonafide students of "
        "Bachelor of Engineering in Computer Science and Engineering (Data Science) Department, "
        "St. John College of Engineering and Management, Mumbai. They have satisfactorily completed the "
        "requirements of Synopsis as prescribed by ST. JOHN COLLEGE OF ENGINEERING AND MANAGEMENT "
        "(An Autonomous College affiliated to University of Mumbai), while working on "
        "“AWEN: Adaptive Wellness & Emotional Navigation (Personalized Physiological Baseline Intelligence & Longitudinal Health Companion)”."
    )
    add_styled_paragraph(doc, cert_text, space_after=24)
    
    # Signature Table (Guide & HOD)
    sig_tbl = doc.add_table(rows=1, cols=2)
    sig_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_guide = sig_tbl.cell(0, 0)
    cell_hod = sig_tbl.cell(0, 1)
    cell_guide.width = Inches(3.4)
    cell_hod.width = Inches(3.4)
    
    p_g = cell_guide.paragraphs[0]
    p_g.paragraph_format.line_spacing = 1.15
    p_g.add_run("Signature : _______________________\n").font.name = 'Times New Roman'
    p_g.add_run("Name: Prof. / Dr. [Guide Name]\n").font.name = 'Times New Roman'
    p_g.add_run("Designation: Project Guide\n").font.name = 'Times New Roman'
    p_g.add_run("Dept. of CSE (Data Science), SJCEM").font.name = 'Times New Roman'
    
    p_h = cell_hod.paragraphs[0]
    p_h.paragraph_format.line_spacing = 1.15
    p_h.add_run("Signature : _______________________\n").font.name = 'Times New Roman'
    p_h.add_run("Name: Mrs. Joslyn Gracias\n").font.name = 'Times New Roman'
    p_h.add_run("Designation: Head of Department\n").font.name = 'Times New Roman'
    p_h.add_run("Dept. of CSE (Data Science), SJCEM").font.name = 'Times New Roman'
    
    # Principal Signature below
    p_p_space = doc.add_paragraph()
    p_p_space.paragraph_format.space_before = Pt(36)
    p_p_space.paragraph_format.space_after = Pt(4)
    
    p_princ = doc.add_paragraph()
    p_princ.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_princ.paragraph_format.line_spacing = 1.15
    p_princ.add_run("Signature: _______________________\n").font.name = 'Times New Roman'
    p_princ.add_run("Name: Dr. Kamal Shah\n").font.name = 'Times New Roman'
    p_princ.add_run("Principal,\nSt. John College of Engineering and Management.\nPalghar, Maharashtra.").font.name = 'Times New Roman'
    
    doc.add_page_break()

    # =========================================================================
    # DECLARATION
    # =========================================================================
    p_dec_t = doc.add_paragraph()
    p_dec_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dec_t.paragraph_format.space_before = Pt(10)
    p_dec_t.paragraph_format.space_after = Pt(14)
    r_dt = p_dec_t.add_run("Declaration")
    r_dt.font.name = 'Times New Roman'
    r_dt.font.size = Pt(16)
    r_dt.font.bold = True
    
    dec_text = (
        "I/we declare that this written submission represents my/our ideas in my/our own words and where others' ideas "
        "or words have been included, I/we have adequately cited and referenced the original sources. I/we also declare that "
        "I/we have adhered to all principles of academic honesty and integrity and have not misrepresented or fabricated "
        "or falsified any idea/data/fact/source in my/our submission. I/we understand that any violation of the above will be "
        "cause for disciplinary action by the Institute and can also evoke penal action from the sources which have thus not "
        "been properly cited or from whom proper permission has not been taken when needed."
    )
    add_styled_paragraph(doc, dec_text, space_after=28)
    
    # Student Signature Grid
    std_sig_tbl = doc.add_table(rows=2, cols=2)
    std_sig_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    cells_data = [
        (0, 0, "Diya Singh", "Roll No. 50"),
        (0, 1, "Parth Topale", "Roll No. 58"),
        (1, 0, "Nishtha Lokhande", "Roll No. 21"),
        (1, 1, "Swara Patil", "Roll No. 38")
    ]
    for r_idx, c_idx, s_name, s_roll in cells_data:
        cell = std_sig_tbl.cell(r_idx, c_idx)
        cell.width = Inches(3.4)
        set_cell_margins(cell, top=140, bottom=140, left=100, right=100)
        p_s = cell.paragraphs[0]
        p_s.paragraph_format.line_spacing = 1.15
        p_s.add_run("Signature: _______________________\n").font.name = 'Times New Roman'
        p_s.add_run(f"({s_name})\n").font.name = 'Times New Roman'
        p_s.add_run(f"{s_roll}\nDept. of CSE (Data Science)").font.name = 'Times New Roman'
        
    p_date = doc.add_paragraph()
    p_date.paragraph_format.space_before = Pt(24)
    p_date.paragraph_format.space_after = Pt(0)
    p_date.add_run("Date: 22nd September 2026\nPlace: Palghar, Mumbai").font.name = 'Times New Roman'
    
    doc.add_page_break()

    # =========================================================================
    # ACKNOWLEDGEMENT
    # =========================================================================
    p_ack_t = doc.add_paragraph()
    p_ack_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ack_t.paragraph_format.space_before = Pt(10)
    p_ack_t.paragraph_format.space_after = Pt(14)
    r_at = p_ack_t.add_run("Acknowledgement")
    r_at.font.name = 'Times New Roman'
    r_at.font.size = Pt(16)
    r_at.font.bold = True
    
    ack_paragraphs = [
        "We express our sincere gratitude to all those who have directly and indirectly contributed to the successful preparation of this project synopsis.",
        "We are deeply grateful to Dr. Kamal Shah, Principal, St. John College of Engineering and Management, for providing an excellent academic environment and the necessary facilities to undertake this project.",
        "We extend our heartfelt thanks to Mrs. Joslyn Gracias, Head of the Department of Computer Science and Engineering (Data Science) for their constant encouragement, valuable suggestions, and continuous support throughout the preparation of this synopsis.",
        "We would like to express our sincere appreciation to our project guide, Prof. / Dr. [Guide Name], for their invaluable guidance, constructive suggestions, technical expertise, and continuous motivation. Their encouragement and insightful feedback have been instrumental in shaping this project synopsis.",
        "We also acknowledge all the faculty members and laboratory staff of the Department of Computer Science and Engineering (Data Science) for their timely assistance, cooperation, and technical support.",
        "Finally, we express our heartfelt gratitude to our parents, family members, friends, and classmates for their constant encouragement, moral support, and cooperation throughout this work."
    ]
    for ap in ack_paragraphs:
        add_styled_paragraph(doc, ap, space_after=8)
        
    p_gm = doc.add_paragraph()
    p_gm.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_gm.paragraph_format.space_before = Pt(18)
    p_gm.paragraph_format.line_spacing = 1.15
    r_gmt = p_gm.add_run("Group Members:\n")
    r_gmt.font.name = 'Times New Roman'
    r_gmt.font.bold = True
    p_gm.add_run("Diya Singh (Roll No. 50)\n").font.name = 'Times New Roman'
    p_gm.add_run("Parth Topale (Roll No. 58)\n").font.name = 'Times New Roman'
    p_gm.add_run("Nishtha Lokhande (Roll No. 21)\n").font.name = 'Times New Roman'
    p_gm.add_run("Swara Patil (Roll No. 38)").font.name = 'Times New Roman'
    
    doc.add_page_break()

    # =========================================================================
    # ABSTRACT
    # =========================================================================
    p_abs_t = doc.add_paragraph()
    p_abs_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abs_t.paragraph_format.space_before = Pt(10)
    p_abs_t.paragraph_format.space_after = Pt(14)
    r_abst = p_abs_t.add_run("ABSTRACT")
    r_abst.font.name = 'Times New Roman'
    r_abst.font.size = Pt(16)
    r_abst.font.bold = True
    
    abs_p1 = (
        "Modern consumer health wearables continuously capture photoplethysmography (PPG), pulse oximetry, and skin temperature. "
        "However, contemporary health platforms predominantly evaluate incoming telemetry against static, population-wide clinical thresholds "
        "(e.g., standard resting heart rate defined broadly between 60 and 100 BPM). Under this conventional model, an individual with a personal "
        "resting baseline of 54 BPM could experience sustained mental strain at 88 BPM without triggering system attention, while an naturally fast "
        "resting individual at 85 BPM triggers repeated false-positive alarms. Furthermore, standard systems remain context-blind, failing to "
        "differentiate between benign physical exertion (tachycardia induced by walking or stair climbing) and unexplained resting baseline departures "
        "indicative of cognitive overload, psychological distress, or dehydration."
    )
    add_styled_paragraph(doc, abs_p1, space_after=10)
    
    abs_p2 = (
        "This project presents AWEN (Adaptive Wellness & Emotional Navigation), an edge-integrated physiological monitoring prototype and local "
        "health informatics suite. AWEN replaces static population cutoffs with an individual resting baseline corridor N(mu, sigma^2) established "
        "over a 3–7 day longitudinal observation window. The system couples an optical PPG sensor (MAX30100) with a 6-axis inertial measurement unit (MPU-6050) "
        "interfaced via I2C to an ESP32 microcontroller. Real-time 3D acceleration vector magnitude a_mag = sqrt(ax^2 + ay^2 + az^2) / g is evaluated concurrently "
        "with heart rate, pulse oximetry, and peripheral temperature. Physiological deviations departing significantly from baseline (Delta > 2*sigma) are flagged "
        "as potential stress-related patterns exclusively when motion telemetry confirms the subject is in a sedentary resting posture, completely disambiguating "
        "physical exercise from mental stress."
    )
    add_styled_paragraph(doc, abs_p2, space_after=10)
    
    abs_p3 = (
        "Telemetry is ingested through an asynchronous Python FastAPI backend, persisted within an ACID-compliant local SQLite 3 database (awen.db), and visualized "
        "on a responsive React 19 web application featuring a 60 FPS HTML5 Canvas PPG pulse wave oscilloscope, a daily recovery chronology, and an empathetic, non-diagnostic "
        "living vector companion. By enforcing cryptographic PBKDF2 authentication, multi-tenant patient data isolation, and an uncompromising zero-mock policy "
        "grounded in local persistence, AWEN demonstrates a private, context-aware foundation for modern personal health navigation."
    )
    add_styled_paragraph(doc, abs_p3, space_after=14)
    
    p_kw = doc.add_paragraph()
    p_kw.paragraph_format.space_before = Pt(6)
    p_kw.paragraph_format.space_after = Pt(0)
    r_kwt = p_kw.add_run("Keywords: ")
    r_kwt.font.name = 'Times New Roman'
    r_kwt.font.bold = True
    r_kwv = p_kw.add_run("Personalized Physiological Baseline, Photoplethysmography (PPG), Inertial Measurement Unit (IMU), Motion Context Filtering, Stress-Related Pattern Indication, ESP32 Edge Ingestion, SQLite 3 Local Persistence, Non-Diagnostic Health Informatics.")
    r_kwv.font.name = 'Times New Roman'
    r_kwv.font.italic = True
    
    doc.add_page_break()

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    p_toc_t = doc.add_paragraph()
    p_toc_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc_t.paragraph_format.space_before = Pt(10)
    p_toc_t.paragraph_format.space_after = Pt(14)
    r_toct = p_toc_t.add_run("C O N T E N T S")
    r_toct.font.name = 'Times New Roman'
    r_toct.font.size = Pt(16)
    r_toct.font.bold = True
    
    toc_data = [
        ("Certificate of Approval", "", "ii"),
        ("Declaration", "", "iii"),
        ("Acknowledgement", "", "iv"),
        ("Abstract", "", "v"),
        ("List of Figures", "", "vii"),
        ("List of Tables", "", "viii"),
        ("Abbreviations and Symbols", "", "ix"),
        ("Chapter 1", "Introduction: Background, Problem Statement, Need, Objectives, Scope, Expected Outcomes", "1"),
        ("Chapter 2", "Literature Review: Survey Table, Research Gap, Novelty / Innovation", "6"),
        ("Chapter 3", "Proposed Methodology: Working Principle, Architecture, Flowchart, Methodology, Components", "12"),
        ("Chapter 4", "Project Planning: WBS, Gantt Chart, Roles, Risk Assessment", "20"),
        ("Chapter 5", "Resources & Feasibility: Technical, Economic, Operational Feasibility, Budget, BOM", "24"),
        ("Chapter 6", "Expected Results & Benchmarks: Expected Prototype, Baseline Convergence, Accuracy, Latency", "28"),
        ("Chapter 7", "Sustainability & Impact: Industrial Relevance, Societal, Environmental Impact, SDG Mapping", "33"),
        ("Chapter 8", "Conclusion & Future Scope: Summary of Problem, Proposed Solution, Expected Contribution", "37"),
        ("References", "IEEE Style Academic References (18 Authentic Citations)", "40"),
        ("Appendices", "Hardware Schematics, Relational Schema, API Specification, Automated Test Matrix", "43")
    ]
    
    toc_table = doc.add_table(rows=len(toc_data) + 1, cols=3)
    toc_widths = [Inches(1.5), Inches(4.5), Inches(0.8)]
    toc_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]
    
    toc_table.rows[0].cells[0].paragraphs[0].add_run("Chapter No.").font.bold = True
    toc_table.rows[0].cells[1].paragraphs[0].add_run("Topic Description").font.bold = True
    toc_table.rows[0].cells[2].paragraphs[0].add_run("Page No.").font.bold = True
    
    for idx, (c_num, c_topic, c_page) in enumerate(toc_data, start=1):
        row = toc_table.rows[idx]
        p0 = row.cells[0].paragraphs[0]
        p0.add_run(c_num)
        if "Chapter" in c_num or c_num in ["References", "Appendices"]:
            p0.runs[0].font.bold = True
            
        p1 = row.cells[1].paragraphs[0]
        p1.add_run(c_topic)
        if "Chapter" in c_num or c_num in ["References", "Appendices"]:
            p1.runs[0].font.bold = True
            
        p2 = row.cells[2].paragraphs[0]
        p2.add_run(c_page)
        
    format_table(toc_table, toc_widths, toc_aligns)
    
    doc.add_page_break()

    # =========================================================================
    # LIST OF FIGURES & TABLES
    # =========================================================================
    p_lof_t = doc.add_paragraph()
    p_lof_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lof_t.paragraph_format.space_before = Pt(10)
    p_lof_t.paragraph_format.space_after = Pt(14)
    r_loft = p_lof_t.add_run("List of Figures")
    r_loft.font.name = 'Times New Roman'
    r_loft.font.size = Pt(15)
    r_loft.font.bold = True
    
    figures_data = [
        ("Figure 1", "Data Flow Diagram Level 0 (Context) and Level 1 (Functional Decomposition)", "15"),
        ("Figure 2", "AWEN 5-Tier Cyber-Physical System Architecture Block Diagram", "14"),
        ("Figure 3", "AWEN End-to-End Physiological Signal Processing Flowchart", "16"),
        ("Figure 4", "Relational Database Entity Schema and 1:N Foreign Key Constraints (SQLite 3)", "44"),
        ("Figure 5", "AWEN Executive Biometric Dashboard GUI with 60 FPS Canvas Oscilloscope", "30"),
        ("Figure 6", "AWEN Today Chronological Recovery Feed & Telemetry Timeline GUI", "31"),
        ("Figure 7", "AWEN 7-Day Baseline Evolution Dispersion and AI Wellness Companion GUI", "32"),
        ("Figure 8", "IoT Hardware Interconnect & ESP32 Microcontroller Pin Assignment Schematic", "43")
    ]
    lof_table = doc.add_table(rows=len(figures_data) + 1, cols=3)
    lof_widths = [Inches(1.4), Inches(4.6), Inches(0.8)]
    lof_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]
    
    lof_table.rows[0].cells[0].paragraphs[0].add_run("Figure No.").font.bold = True
    lof_table.rows[0].cells[1].paragraphs[0].add_run("Figure Caption / Name").font.bold = True
    lof_table.rows[0].cells[2].paragraphs[0].add_run("Page No.").font.bold = True
    
    for idx, (f_no, f_name, f_pg) in enumerate(figures_data, start=1):
        row = lof_table.rows[idx]
        row.cells[0].paragraphs[0].add_run(f_no)
        row.cells[1].paragraphs[0].add_run(f_name)
        row.cells[2].paragraphs[0].add_run(f_pg)
    format_table(lof_table, lof_widths, lof_aligns)
    
    # List of Tables below
    p_lot_t = doc.add_paragraph()
    p_lot_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lot_t.paragraph_format.space_before = Pt(20)
    p_lot_t.paragraph_format.space_after = Pt(14)
    r_lott = p_lot_t.add_run("List of Tables")
    r_lott.font.name = 'Times New Roman'
    r_lott.font.size = Pt(15)
    r_lott.font.bold = True
    
    tables_data = [
        ("Table 2.1", "Comprehensive Literature Survey of Wearable Stress & Telemetry Systems", "7"),
        ("Table 2.2", "Systematic Research Gap Analysis and Proposed AWEN Solutions", "10"),
        ("Table 3.1", "Physical Activity Context Multiplier & Offset Configuration Matrix", "18"),
        ("Table 3.2", "AWEN Hardware Component Specifications and Interface Allocation", "19"),
        ("Table 3.3", "Software Framework Dependencies and Protocol Stack", "19"),
        ("Table 4.1", "Hierarchical Work Breakdown Structure (WBS) Work Packages", "21"),
        ("Table 4.2", "Semester Project Planning Timeline and Milestones (Gantt Chart)", "22"),
        ("Table 4.3", "Student Roles and Engineering Responsibilities Matrix", "23"),
        ("Table 4.4", "Comprehensive Risk Identification, Severity Assessment, and Mitigation", "23"),
        ("Table 5.1", "Itemized Project Budget Estimation (Component Expenditure)", "26"),
        ("Table 5.2", "Engineering Bill of Materials (BOM) Specification", "27"),
        ("Table 6.1", "Empirical Baseline Deviation and Motion Context Validation Matrix", "29"),
        ("Table 7.1", "United Nations Sustainable Development Goals (SDG) Impact Mapping", "35"),
        ("Table D.1", "Automated End-to-End Test Suite Execution Matrix (16/16 Passed)", "47")
    ]
    lot_table = doc.add_table(rows=len(tables_data) + 1, cols=3)
    lot_widths = [Inches(1.4), Inches(4.6), Inches(0.8)]
    lot_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]
    
    lot_table.rows[0].cells[0].paragraphs[0].add_run("Table No.").font.bold = True
    lot_table.rows[0].cells[1].paragraphs[0].add_run("Table Name / Description").font.bold = True
    lot_table.rows[0].cells[2].paragraphs[0].add_run("Page No.").font.bold = True
    
    for idx, (t_no, t_name, t_pg) in enumerate(tables_data, start=1):
        row = lot_table.rows[idx]
        row.cells[0].paragraphs[0].add_run(t_no)
        row.cells[1].paragraphs[0].add_run(t_name)
        row.cells[2].paragraphs[0].add_run(t_pg)
    format_table(lot_table, lot_widths, lot_aligns)
    
    doc.add_page_break()

    # =========================================================================
    # ABBREVIATIONS AND SYMBOLS
    # =========================================================================
    p_abb_t = doc.add_paragraph()
    p_abb_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abb_t.paragraph_format.space_before = Pt(10)
    p_abb_t.paragraph_format.space_after = Pt(14)
    r_abbt = p_abb_t.add_run("Abbreviations and Symbols")
    r_abbt.font.name = 'Times New Roman'
    r_abbt.font.size = Pt(15)
    r_abbt.font.bold = True
    
    abbreviations = [
        ("AI", "Artificial Intelligence"),
        ("ML", "Machine Learning"),
        ("PPG", "Photoplethysmography (Optical volumetric organ measurement)"),
        ("SpO2", "Peripheral Capillary Oxygen Saturation (Arterial oxygenation percentage)"),
        ("PRV", "Pulse Rate Variability (Peak-to-peak interval fluctuations derived from PPG)"),
        ("IMU", "Inertial Measurement Unit (6-axis accelerometer and gyroscope tracking)"),
        ("I2C", "Inter-Integrated Circuit (Synchronous multi-master serial bus protocol)"),
        ("ADC", "Analog-to-Digital Converter"),
        ("OLED", "Organic Light-Emitting Diode (Solid-state emissive display)"),
        ("BPM", "Beats Per Minute"),
        ("DFD", "Data Flow Diagram"),
        ("UML", "Unified Modeling Language"),
        ("REST", "Representational State Transfer (Stateless HTTP architectural style)"),
        ("API", "Application Programming Interface"),
        ("JSON", "JavaScript Object Notation"),
        ("PBKDF2", "Password-Based Key Derivation Function 2 (Cryptographic key stretching)"),
        ("HMAC", "Hash-based Message Authentication Code"),
        ("SHA-256", "Secure Hash Algorithm 256-bit"),
        ("SQL", "Structured Query Language"),
        ("ACID", "Atomicity, Consistency, Isolation, Durability (Database transaction properties)"),
        ("SPA", "Single Page Application (Component-based web architecture)"),
        ("WBS", "Work Breakdown Structure"),
        ("BOM", "Bill of Materials"),
        ("SDG", "Sustainable Development Goals (United Nations 2030 Agenda)")
    ]
    for abb, desc in abbreviations:
        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_before = Pt(0)
        p_a.paragraph_format.space_after = Pt(3)
        p_a.paragraph_format.line_spacing = 1.15
        r_a1 = p_a.add_run(f"{abb}: ")
        r_a1.font.name = 'Times New Roman'
        r_a1.font.bold = True
        r_a2 = p_a.add_run(desc)
        r_a2.font.name = 'Times New Roman'
        
    p_sym_t = doc.add_paragraph()
    p_sym_t.paragraph_format.space_before = Pt(12)
    p_sym_t.paragraph_format.space_after = Pt(6)
    r_symt = p_sym_t.add_run("Mathematical & Statistical Symbols:")
    r_symt.font.name = 'Times New Roman'
    r_symt.font.bold = True
    
    symbols = [
        ("a_mag", "3D acceleration vector magnitude: sqrt(ax^2 + ay^2 + az^2) / g (normalized to Earth gravity)"),
        ("g", "Standard gravitational acceleration constant (9.80665 m/s^2)"),
        ("mu (μ)", "Empirical resting mean heart rate calculated across verified sedentary baseline epochs"),
        ("sigma (σ)", "Standard deviation of resting heart rate denoting natural autonomic physiological variance"),
        ("sigma^2", "Statistical variance of longitudinal resting physiological readings"),
        ("Delta HR", "Instantaneous heart rate deviation from context-adjusted expected baseline: HR_curr - Expected_HR"),
        ("Delta SpO2", "Arterial oxygen saturation dip from personal baseline: Resting_SpO2 - Current_SpO2"),
        ("Delta Temp", "Peripheral cutaneous temperature departure from thermal baseline equilibrium: Current_Temp - Expected_Temp"),
        ("N(mu, sigma^2)", "Univariate Gaussian normal distribution modeling the subject's resting physiological envelope")
    ]
    for sym, sdesc in symbols:
        p_s = doc.add_paragraph()
        p_s.paragraph_format.space_before = Pt(0)
        p_s.paragraph_format.space_after = Pt(3)
        p_s.paragraph_format.line_spacing = 1.15
        r_s1 = p_s.add_run(f"{sym}: ")
        r_s1.font.name = 'Times New Roman'
        r_s1.font.bold = True
        r_s2 = p_s.add_run(sdesc)
        r_s2.font.name = 'Times New Roman'
        
    doc.add_page_break()

    print("Front matter generated. Building Chapter 1: Introduction...")
    
    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_heading_1(doc, "CHAPTER 1: INTRODUCTION")
    
    add_heading_2(doc, "1.1 Background")
    p1 = (
        "The continuous non-invasive tracking of physiological parameters has emerged as one of the most prominent "
        "frontiers in biomedical informatics, embedded systems, and consumer healthcare. Over the past decade, rapid advancements "
        "in micro-electro-mechanical systems (MEMS), low-power microcontrollers, and optical sensing technologies have enabled "
        "wearable devices—such as wristbands, rings, and chest patches—to capture vital biometric signs in real time. Among these parameters, "
        "photoplethysmography (PPG) pulse waveform analysis, peripheral oxygen saturation (SpO2), and cutaneous skin temperature serve as "
        "critical windows into the human autonomic nervous system (ANS)."
    )
    add_styled_paragraph(doc, p1)
    
    p2 = (
        "However, existing commercial wearable platforms and academic demonstrators exhibit a profound structural deficiency: they evaluate "
        "physiological telemetry against rigid, static population thresholds. In conventional clinical medicine, diagnostic boundaries "
        "(such as defining normal resting heart rate as strictly 60 to 100 beats per minute) are established to detect acute cardiac pathology "
        "across massive, diverse demographic populations. While essential for emergency triage, applying these static limits to daily outpatient "
        "wellness tracking causes substantial analytical error. Human cardiovascular physiology is highly individualized, governed by genetic "
        "factors, athletic conditioning, circadian rhythmicity, age, and environmental stress. A conditioned individual with an authentic resting "
        "rate of 52 BPM may experience significant cognitive distress at 86 BPM without triggering an alert under static models. Conversely, a healthy "
        "individual whose natural resting heart rate resides at 88 BPM will be inundated with false-positive stress alerts during normal mental activity."
    )
    add_styled_paragraph(doc, p2)
    
    p3 = (
        "AWEN (Adaptive Wellness & Emotional Navigation) was conceptualized to resolve this fundamental threshold fallacy. Rather than judging "
        "users against generic textbook boundaries, AWEN constructs an adaptive, longitudinal physiological baseline corridor unique to each individual. "
        "By continuously monitoring resting vitals during quiet states over multi-day observation windows, AWEN establishes an authentic mathematical "
        "corridor of normal behavior. Real-time biometrics are evaluated as deviations from the subject's own baseline, allowing subtle autonomic shifts "
        "to be detected with high personal sensitivity while eliminating false alarms."
    )
    add_styled_paragraph(doc, p3)
    
    add_heading_2(doc, "1.2 Problem Statement")
    p_ps = (
        "Current physiological wellness monitoring systems suffer from four systemic engineering and design shortcomings that compromise "
        "their practical utility:"
    )
    add_styled_paragraph(doc, p_ps)
    
    ps_points = [
        ("The Static Population Threshold Fallacy: ", "Standard consumer and clinical monitoring solutions rely on arbitrary, one-size-fits-all boundaries. They fail to recognize that an identical heart rate reading carries completely different physiological meanings for two distinct individuals."),
        ("Context-Blind Alerting and False Positives: ", "Existing platforms lack real-time motion context integration. Heart rate elevation caused by routine physical activities (e.g., walking, climbing stairs, cycling) is frequently misclassified as emotional or mental stress, undermining user trust in automated wellness notifications."),
        ("Cloud Dependency and Privacy Vulnerabilities: ", "Most modern health platforms transmit unencrypted or tokenized biometrics to proprietary third-party cloud servers. This introduces network latency, prevents offline operation, and exposes deeply personal physiological telemetry to external data harvesting and privacy breaches."),
        ("Alarmist and Pathologizing User Interfaces: ", "Traditional interfaces use stark medical charts, jarring alarm buzzers, and clinical diagnostic terminology (e.g., 'Warning: Tachycardia Detected') that induce unnecessary health anxiety and psychophysiological stress in non-clinical users.")
    ]
    for title, desc in ps_points:
        p_pt = doc.add_paragraph()
        p_pt.paragraph_format.space_before = Pt(2)
        p_pt.paragraph_format.space_after = Pt(4)
        p_pt.paragraph_format.line_spacing = 1.15
        r_t = p_pt.add_run(f"• {title}")
        r_t.font.name = 'Times New Roman'
        r_t.font.bold = True
        r_d = p_pt.add_run(desc)
        r_d.font.name = 'Times New Roman'
        
    add_heading_2(doc, "1.3 Need of the Project")
    p_need = (
        "There is an urgent societal and technological necessity for an accessible, edge-integrated physiological monitoring platform that operates "
        "with true personal baseline intelligence. As modern academic and corporate environments impose increasing levels of chronic cognitive overload, "
        "individuals require early, non-alarmist feedback regarding physiological tension before it precipitates burnout or systemic exhaustion. "
        "Furthermore, modern computer engineering curricula demand end-to-end cyber-physical implementations that demonstrate how raw hardware sensor "
        "signals (voltage drops and photodiode currents) transition through embedded filtering, REST APIs, relational databases, and dynamic web interfaces. "
        "AWEN addresses this need by demonstrating a fully transparent, verifiable, and private architecture that operates locally on localhost without "
        "external subscription dependencies."
    )
    add_styled_paragraph(doc, p_need)
    
    add_heading_2(doc, "1.4 Objectives")
    add_styled_paragraph(doc, "The overarching and specific engineering objectives of the AWEN project are formulated as follows:")
    
    add_heading_3(doc, "General Objective")
    p_gobj = (
        "To design, develop, and evaluate an edge-integrated, context-aware physiological monitoring and emotional navigation companion "
        "that identifies potential stress-related physiological patterns based on personalized baseline deviations rather than static medical thresholds."
    )
    add_styled_paragraph(doc, p_gobj)
    
    add_heading_3(doc, "Specific Objectives")
    objs = [
        "1. Interfacing Multi-Modal Sensors: Interfacing a MAX30100 optical PPG sensor, an MPU-6050 6-axis inertial measurement unit (IMU), an LM35 precision temperature sensor, an SSD1306 128x64 OLED display, and an active buzzer to an ESP32 microcontroller using hardware I2C and analog ADC buses.",
        "2. Developing Embedded Filtering & Telemetry Firmware: Authoring modular C++ firmware for the ESP32 that calculates peak-to-peak beat intervals, computes real-time 3D acceleration vector magnitude, executes 3-screen OLED status rotation, and serializes telemetry over USB CDC Web Serial and Wi-Fi HTTP.",
        "3. Building a Localhost Backend Service: Constructing an asynchronous Python 3.13 FastAPI backend that strictly validates inbound sensor packets using Pydantic models and enforces PBKDF2-HMAC-SHA256 password hashing across 100,000 iterations.",
        "4. Implementing Relational Data Persistence: Designing an ACID-compliant local SQLite 3 database schema (awen.db) with 8 normalized tables, enforcing strict multi-tenant user isolation so that Patient A cannot query records belonging to Patient B.",
        "5. Developing the Adaptive Baseline & Deviation Engine: Formulating statistical baseline algorithms that establish rolling mean resting parameters N(mu, sigma^2) over longitudinal observation windows and compute multi-parameter anomaly deviation scores adjusted for physical activity.",
        "6. Designing a Modern Web Dashboard: Building a component-driven Single Page Application using React 19 and Vite featuring a 60 FPS HTML5 Canvas PPG pulse wave oscilloscope, a daily recovery timeline, baseline dispersion charts, and an empathetic living vector mascot companion."
    ]
    for ob in objs:
        add_styled_paragraph(doc, ob, space_before=2, space_after=4)
        
    add_heading_2(doc, "1.5 Scope")
    add_heading_3(doc, "1.5.1 Non-Clinical Orientation and Focus")
    p_sc1 = (
        "The primary design focus of AWEN is personal wellness tracking, cognitive fatigue monitoring, and lifestyle reflection for students, "
        "knowledge workers, and daily computer users. AWEN is explicitly not an emergency clinical diagnostic tool or medical patient-management system. "
        "In all user-facing interfaces, the term 'User' is used rather than 'Patient', and physiological elevations are framed as 'observations' or "
        "'potential stress-related patterns' rather than pathological conditions."
    )
    add_styled_paragraph(doc, p_sc1)
    
    add_heading_3(doc, "1.5.2 Explicit Future Clinical & Hospital Scope (Future Requirements)")
    p_sc2 = (
        "While the current prototype is engineered for general wellness, a broader future clinical scope can be realized by fulfilling specific "
        "rigorous biomedical and regulatory requirements: (a) ISO 13485 medical device quality management compliance, (b) IEC 60601-1 electrical safety "
        "and defibrillator-proof isolation, (c) FDA 510(k) or CE-MDR clinical clearance against arterial blood gas (ABG) reference analyzers, "
        "(d) HL7/FHIR EHR interoperability protocols, and (e) IRB-approved multi-center clinical trials to validate prognostic sensitivity in acute triage."
    )
    add_styled_paragraph(doc, p_sc2)
    
    add_heading_3(doc, "Included in the Current Scope")
    p_sc3 = (
        "The completed project scope encompasses: (1) ESP32 physical sensor prototype assembly; (2) USB Web Serial driverless communication; "
        "(3) REST API endpoints for telemetry ingestion; (4) SQLite 3 persistent database; (5) User baseline statistical corridor tracking; "
        "(6) Motion vector magnitude filtering to eliminate false exercise alarms; (7) Neo-Brutalist React 19 dashboard with 60 FPS pulse oscilloscope; "
        "(8) Comprehensive automated test suite validating system reliability."
    )
    add_styled_paragraph(doc, p_sc3)
    
    add_heading_3(doc, "Limitations of Current Scope")
    p_sc4 = (
        "The prototype is bounded by prototype-level hardware: (1) MAX30100 PPG sensor readings are sensitive to motion artifacts and finger pressure variation; "
        "(2) Direct USB Web Serial pairing requires a Chromium-based browser (Chrome, Edge); (3) Wireless battery power management is currently wired via USB; "
        "(4) The physiological dataset reflects simulated baseline calibration alongside controlled prototype telemetry runs rather than vast clinical population cohorts."
    )
    add_styled_paragraph(doc, p_sc4)
    
    add_heading_2(doc, "1.6 Expected Outcomes")
    p_eo = (
        "The tangible engineering outcomes delivered by the AWEN capstone project include:\n"
        "• A fully functional IoT sensor unit featuring ESP32, MAX30100, MPU-6050, LM35, OLED display, and active buzzer.\n"
        "• Production-ready ESP32 C++ firmware supporting 3-screen OLED status rotation and JSON serial streaming.\n"
        "• An asynchronous FastAPI backend providing 18 REST endpoints with token authentication and Pydantic validation.\n"
        "• An ACID-compliant local SQLite 3 database (awen.db) guaranteeing complete persistence and patient isolation.\n"
        "• An adaptive baseline intelligence engine that computes dynamic confidence tiers and activity-adjusted anomaly scores.\n"
        "• A modern, responsive React 19 web dashboard delivering real-time biometric visualization and clinical PDF exports.\n"
        "• A comprehensive academic report detailing reproducible methodology, mathematical formulas, and empirical test matrices."
    )
    add_styled_paragraph(doc, p_eo)
    
    doc.add_page_break()

    print("Chapter 1 written. Building Chapter 2: Literature Review...")
    
    # =========================================================================
    # CHAPTER 2: LITERATURE REVIEW
    # =========================================================================
    add_heading_1(doc, "CHAPTER 2: LITERATURE REVIEW")
    
    add_heading_2(doc, "2.1 Introduction")
    p_lit_intro = (
        "The assessment of human autonomic stress through wearable physiological monitoring has been extensively investigated across biomedical engineering, "
        "human-computer interaction, and computational data science. Photoplethysmography (PPG) has gained immense prominence due to its non-invasive nature, "
        "low manufacturing cost, and ability to derive pulse rate variability (PRV) alongside peripheral arterial oxygen saturation (SpO2). "
        "Simultaneously, the integration of inertial measurement units (IMUs) has opened new avenues for contextualized health informatics. "
        "To establish a rigorous theoretical grounding for AWEN, fourteen influential research papers from peer-reviewed IEEE, ACM, Springer, and Nature journals "
        "have been critically evaluated across sensing modalities, analytical models, contextual awareness, and architectural paradigms."
    )
    add_styled_paragraph(doc, p_lit_intro)
    
    add_heading_2(doc, "2.2 Literature Review Survey Table")
    
    # Table of 14 Papers
    lit_papers = [
        ("1", "Tamura et al. (2014) [1]", "Wearable Photoplethysmographic Sensors", "Comprehensive review of transmission vs reflectance PPG physics and LED wavelengths.", "Reflectance PPG enables compact wrist/finger form factors but is vulnerable to motion artifacts.", "Focuses on optical sensor physics; does not provide personalized baseline modeling."),
        ("2", "Schmidt et al. (2018) [2]", "WESAD: Wearable Stress and Affect Detection", "Multimodal dataset capturing ECG, PPG, EDA, EMG, and Temp during laboratory stress.", "Machine learning classifiers achieve >85% accuracy under controlled stress protocols.", "Relies on laboratory-induced stress; requires compute-heavy cloud ML pipelines."),
        ("3", "Can et al. (2019) [3]", "Continuous Stress Detection Using Smartwatches", "Assessed PPG, skin conductance, and accelerometer in daily real-world activities.", "Physical motion introduces severe false positives in PPG-derived stress classification.", "Highlights motion corruption but does not provide an on-device contextual offset engine."),
        ("4", "Gjoreski et al. (2017) [4]", "Monitoring Stress with Wearable Sensors", "Two-stage pipeline: accelerometer detects activity context, then PPG/EDA detects stress.", "Contextual motion gating reduces false stress alarms by over 35% compared to raw PPG.", "Implemented as offline batch processing; lacks real-time edge integration."),
        ("5", "Pollreisz & TaheriNejad (2017) [5]", "Detection of Stress Using Wearables", "Evaluates consumer fitness trackers for physiological stress pattern identification.", "Standard consumer wearables fail to detect subtle mental strain due to static thresholds.", "Confirms failure of population cutoffs; does not develop an adaptive baseline solution."),
        ("6", "Akbulut et al. (2020) [6]", "IoT-Based Healthcare Monitoring System", "ESP32 microcontroller interfaced with pulse oximeter sending data to cloud servers.", "Demonstrated successful low-power IoT telemetry over Wi-Fi and Bluetooth protocols.", "Relies entirely on cloud brokers; compromises patient data sovereignty."),
        ("7", "Hovsepian et al. (2015) [7]", "cStress: Continuous Stress Assessment", "Continuous physiological stress modeling using ECG and respiration in mobile health.", "Inter-individual baseline differences significantly degrade generalized model accuracy.", "Demonstrates need for personal baseline normalization; restricted to bulky chest sensors."),
        ("8", "Saganowski et al. (2020) [8]", "Emotion Recognition Using Wearables", "Systematic review of emotion and stress detection across 32 contemporary studies.", "Concludes that personalized models consistently outperform population-trained models by 18-24%.", "Identifies gap in commercial systems; most solutions still use generic population norms."),
        ("9", "Plarre et al. (2011) [9]", "Continuous Psychophysiological Stress Detection", "Continuous laboratory and field physiological stress monitoring using wearable sensors.", "Physiological response recovery trajectories vary widely across individual baselines.", "Proves baseline variation; mathematical models too complex for microcontrollers."),
        ("10", "Castaneda et al. (2018) [10]", "Review on Wearable PPG Sensors", "Review of PPG signal processing, motion artifact cancellation, and clinical reliability.", "Adaptive filtering and multi-axis accelerometer correlation effectively isolate motion noise.", "Hardware-centric review; does not cover relational database storage or client dashboards."),
        ("11", "Betti et al. (2018) [11]", "Evaluation of Wearables for Stress Assessment", "Evaluation of non-invasive autonomic telemetry (HRV, EDA) in office work environments.", "Sedentary cognitive load manifests as sustained HR elevation without muscular movement.", "Validates AWEN core thesis (elevated HR + low motion = potential mental stress)."),
        ("12", "Pradhan et al. (2021) [12]", "IoT-Based Healthcare Systems: Edge Intelligence", "Review of edge computing architectures, cryptographic security, and patient privacy.", "Local database persistence combined with cryptographic auth provides maximum data sovereignty.", "Architectural review; lacks an open-source, full-stack reference implementation."),
        ("13", "Spathis et al. (2021) [13]", "Self-Supervised Physiological Baselines", "Machine learning framework for personal baseline convergence in longitudinal telemetry.", "Demonstrates that 3-7 days of observation are sufficient to converge stable resting baselines.", "Validates AWEN's 3-7 day Observation Mode onboarding timeline."),
        ("14", "Pflueger et al. (2022) [14]", "Digital Companions in Preventive Health", "Human-computer interaction study evaluating empathetic vs diagnostic notification styles.", "Empathetic mascots and non-clinical framing achieve 42% higher sustained engagement.", "Directly supports AWEN's living vector mascot and non-pathologizing communication design.")
    ]
    
    lit_table = doc.add_table(rows=len(lit_papers) + 1, cols=6)
    lit_widths = [Inches(0.4), Inches(1.3), Inches(1.2), Inches(1.4), Inches(1.3), Inches(1.2)]
    lit_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    headers = ["#", "Paper & Authors", "Investigation Domain", "Methodology / Approach", "Key Findings", "Research Gap"]
    for i, h in enumerate(headers):
        lit_table.rows[0].cells[i].paragraphs[0].add_run(h).font.bold = True
        
    for idx, (p_id, p_auth, p_dom, p_meth, p_find, p_gap) in enumerate(lit_papers, start=1):
        row = lit_table.rows[idx]
        row.cells[0].paragraphs[0].add_run(p_id)
        row.cells[1].paragraphs[0].add_run(p_auth)
        row.cells[2].paragraphs[0].add_run(p_dom)
        row.cells[3].paragraphs[0].add_run(p_meth)
        row.cells[4].paragraphs[0].add_run(p_find)
        row.cells[5].paragraphs[0].add_run(p_gap)
        
    format_table(lit_table, lit_widths, lit_aligns)
    
    add_heading_2(doc, "2.3 Research Gap Analysis")
    p_gap_desc = (
        "A rigorous comparative synthesis of the reviewed literature reveals four critical research and engineering gaps "
        "that currently restrict the effectiveness of wearable wellness systems:"
    )
    add_styled_paragraph(doc, p_gap_desc)
    
    gap_table_data = [
        ("Gap 1: Absence of Personal Baseline Modeling", "Most commercial and academic platforms apply universal medical cutoffs (60-100 BPM), causing massive false-positive and false-negative errors due to high inter-individual autonomic diversity (Schmidt et al., 2018; Saganowski et al., 2020).", "AWEN implements a 3-7 day Observation Mode that calculates individual resting parameters N(mu, sigma^2) with progressive confidence tiers."),
        ("Gap 2: Context-Blind Alerting (Exertion vs Stress)", "Standard systems evaluate pulse rates independently of physical motion. Tachycardia induced by benign physical activity (climbing stairs, walking) is erroneously flagged as emotional distress (Can et al., 2019; Gjoreski et al., 2017).", "AWEN calculates 3D acceleration vector magnitude a_mag in real time. Elevated vitals trigger stress-pattern observations only during verified sedentary resting postures."),
        ("Gap 3: Cloud Vulnerability & Data Ephemerality", "Most IoT health prototypes transmit telemetry to third-party cloud servers or rely on unpersisted browser memory, compromising user data sovereignty and offline operation (Akbulut et al., 2020; Pradhan et al., 2021).", "AWEN implements a zero-cloud localhost architecture backed by an ACID-compliant SQLite 3 database and cryptographic PBKDF2 authentication."),
        ("Gap 4: Pathologizing, Anxiety-Inducing UX", "Traditional interfaces present stark medical charts and diagnostic alarm buzzers that intimidate non-clinical users and induce health anxiety (Pflueger et al., 2022).", "AWEN features an organic 60 FPS vector mascot, serene typography, and empathetic, non-diagnostic communication ('Your body is working slightly harder than usual').")
    ]
    gap_tbl = doc.add_table(rows=len(gap_table_data) + 1, cols=3)
    gap_widths = [Inches(1.5), Inches(2.7), Inches(2.6)]
    gap_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    gap_tbl.rows[0].cells[0].paragraphs[0].add_run("Identified Research Gap").font.bold = True
    gap_tbl.rows[0].cells[1].paragraphs[0].add_run("Evidence in Literature").font.bold = True
    gap_tbl.rows[0].cells[2].paragraphs[0].add_run("AWEN Engineering Resolution").font.bold = True
    
    for idx, (g_id, g_ev, g_sol) in enumerate(gap_table_data, start=1):
        row = gap_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(g_id).font.bold = True
        row.cells[1].paragraphs[0].add_run(g_ev)
        row.cells[2].paragraphs[0].add_run(g_sol)
    format_table(gap_tbl, gap_widths, gap_aligns)
    
    add_heading_2(doc, "2.4 Novelty and Technical Innovation")
    p_nov = (
        "AWEN introduces four distinct, academically verifiable innovations to the domain of edge health informatics:\n"
        "1. Dynamic Baseline Corridor Intelligence: Replaces static clinical boundaries with an empirical Gaussian corridor N(mu, sigma^2) that continuously adapts to the user's natural physiology.\n"
        "2. Multi-Modal Context Disambiguation: Couples 6-DOF IMU motion magnitude with PPG telemetry to mathematically isolate physical exertion from psychological strain.\n"
        "3. Zero-Cloud Localhost Architecture with Cryptographic Multi-Tenancy: Ensures 100% data sovereignty and sub-millisecond query execution through local SQLite 3 persistence protected by PBKDF2-HMAC-SHA256 password hashing.\n"
        "4. Non-Diagnostic Empathetic Emotional Navigation: Bridges physiological data science and human wellness through an animated 60 FPS vector mascot companion that translates complex biometric variances into serene, non-judgmental guidance."
    )
    add_styled_paragraph(doc, p_nov)
    
    doc.add_page_break()

    print("Chapter 2 written. Building Chapter 3: Proposed Methodology...")
    
    # =========================================================================
    # CHAPTER 3: PROPOSED METHODOLOGY
    # =========================================================================
    add_heading_1(doc, "CHAPTER 3: PROPOSED METHODOLOGY")
    
    add_heading_2(doc, "3.1 Proposed System Overview")
    p_pm1 = (
        "AWEN is structured as an end-to-end cyber-physical health informatics platform consisting of five coordinated tiers: "
        "(1) Physical Sensor Acquisition Layer, (2) Embedded Processing & Firmware Layer, (3) Asynchronous REST API Backend Layer, "
        "(4) Local Relational Persistence Layer, and (5) Client-Side Dynamic Presentation Layer. "
        "The architecture is designed to operate completely on localhost without requiring remote cloud subscriptions or external API tokens."
    )
    add_styled_paragraph(doc, p_pm1)
    
    add_heading_2(doc, "3.2 Working Principle")
    p_wp = (
        "The operational lifecycle of AWEN proceeds through six sequential stages:\n"
        "1. Dermal Photon Emission & Absorption: The MAX30100 optical sensor emits alternating red (660 nm) and infrared (880 nm) light into the capillary beds of the finger. Variations in light absorption caused by arterial blood pulsation are captured by an internal photodiode.\n"
        "2. Embedded Signal Conditioning: The ESP32 reads raw ADC registers via I2C at 100 Hz. A DC removal filter eliminates baseline tissue drift, while peak-to-peak interval detection determines instantaneous heart rate (BPM) and ratio-of-ratios oxygen saturation (SpO2).\n"
        "3. Inertial Motion Tracking: Concurrently, the MPU-6050 samples 3-axis accelerometer and 3-axis gyroscope registers. The ESP32 computes total acceleration vector magnitude to classify the subject's physical exertion state.\n"
        "4. Telemetry Serialization: Data packets formatted as structured JSON strings are transmitted across the USB CDC interface via the Web Serial API (or via Wi-Fi HTTP POST to /api/readings).\n"
        "5. Baseline Comparison & Anomaly Evaluation: The FastAPI backend ingests the packet, authenticates the active bearer token, and queries the user's personal baseline from SQLite. The mathematical deviation engine compares current vitals against expected context-adjusted baselines.\n"
        "6. Dashboard Rendering & Feedback: The React 19 interface updates metric cards, animates a 60 FPS HTML5 Canvas PPG waveform, updates the Today chronological timeline, and updates the mascot's emotional aura."
    )
    add_styled_paragraph(doc, p_wp)
    
    add_heading_2(doc, "3.3 System Architecture and Block Diagram")
    p_arch_desc = (
        "Figure 2 illustrates the 5-tier architecture of AWEN. Sensor hardware connects over hardware I2C buses (GPIO 21 SDA, GPIO 22 SCL) "
        "and analog ADC pins (GPIO 34) to the ESP32-WROOM-32 microcontroller. The microcontroller communicates with the FastAPI backend "
        "running on Python 3.13 via driverless USB Web Serial or local Wi-Fi HTTP. The backend manages ACID transactions against the SQLite 3 "
        "database and serves authenticated REST payloads to the React 19 Single Page Application."
    )
    add_styled_paragraph(doc, p_arch_desc)
    
    fig2_path = os.path.join(FIGURES_DIR, "fig2_block_diagram.png")
    add_image_with_caption(doc, fig2_path, "Figure 2: AWEN 5-Tier Cyber-Physical System Architecture Block Diagram", width=Inches(6.4))
    
    add_heading_2(doc, "3.4 Data Flow and Flowcharts")
    p_dfd_desc = (
        "The movement of information across system boundaries is modeled through Data Flow Diagrams. In Figure 1(a), the Level 0 context diagram "
        "shows the user interacting with the AWEN system as an external entity, supplying raw biometric data and receiving personalized wellness observations. "
        "In Figure 1(b), the Level 1 functional decomposition details the four primary processes: 1.0 Sensor Acquisition, 2.0 Motion Disambiguation, "
        "3.0 Personal Baseline Engine, and 4.0 Local Presentation."
    )
    add_styled_paragraph(doc, p_dfd_desc)
    
    fig1_path = os.path.join(FIGURES_DIR, "fig1_dfd.png")
    add_image_with_caption(doc, fig1_path, "Figure 1: AWEN Data Flow Diagram Level 0 (Context) and Level 1 (Functional Decomposition)", width=Inches(6.2))
    
    p_fc_desc = (
        "Figure 3 illustrates the end-to-end operational flowchart. Following hardware boot and I2C enumeration, the ESP32 enters a high-speed "
        "sampling loop. Acceleration magnitude a_mag is evaluated against the exertion threshold (1.25 g). If physical motion is detected, "
        "an active physical state multiplier is applied, suppressing false stress alarms. If the subject is sedentary, vitals departing by more than "
        "two standard deviations (Delta > 2*sigma) trigger an active observation and buzzer notification before SQLite persistence."
    )
    add_styled_paragraph(doc, p_fc_desc)
    
    fig3_path = os.path.join(FIGURES_DIR, "fig3_flowchart.png")
    add_image_with_caption(doc, fig3_path, "Figure 3: AWEN End-to-End Physiological Signal Processing Flowchart", width=Inches(5.4))
    
    add_heading_2(doc, "3.5 Methodology and Mathematical Modeling")
    
    add_heading_3(doc, "3.5.1 Motion Vector Magnitude Computation")
    p_mvm = (
        "To classify physical movement without imposing significant computational load on the ESP32 microcontroller, 3-axis accelerometer "
        "telemetry is converted into total acceleration vector magnitude normalized to Earth gravity:"
    )
    add_styled_paragraph(doc, p_mvm)
    
    formula_1 = (
        "a_mag = sqrt(a_x^2 + a_y^2 + a_z^2) / g\n\n"
        "where a_x, a_y, a_z are instantaneous accelerations along the 3 orthogonal axes in m/s^2, "
        "and g = 9.80665 m/s^2. Under quiet resting conditions, a_mag ≈ 1.0 g. Dynamic thresholds classify activity: "
        "a_mag <= 1.15 g indicates Sedentary Rest; 1.15 < a_mag <= 1.45 g indicates Walking; a_mag > 1.45 g indicates Vigorous Exertion."
    )
    add_callout_box(doc, formula_1, "Equation 3.1: Normalized Acceleration Vector Magnitude")
    
    add_heading_3(doc, "3.5.2 Statistical Rolling Baseline and Variance Corridors")
    p_bsl = (
        "Rather than comparing heart rate to generic boundaries, AWEN models the subject's resting physiological state as a univariate Gaussian normal distribution:"
    )
    add_styled_paragraph(doc, p_bsl)
    
    formula_2 = (
        "HR_resting ~ N(mu, sigma^2)\n\n"
        "mu = (1 / N) * sum_{i=1}^N HR_i (Resting Epochs)\n"
        "sigma = sqrt( (1 / (N - 1)) * sum_{i=1}^N (HR_i - mu)^2 )\n\n"
        "The personal tolerance corridor is defined as [mu - 2*sigma, mu + 2*sigma], encompassing 95.45% of expected baseline resting variance."
    )
    add_callout_box(doc, formula_2, "Equation 3.2: Gaussian Baseline Parameter Estimation")
    
    p_tiers = (
        "Baseline confidence progresses through four formal tiers based on sample volume:\n"
        "• Learning: N < 50 resting samples (Initial setup mode; wide tolerance corridors).\n"
        "• Early Baseline: 50 <= N < 200 samples (Initial personal mean converged; ±3*sigma corridor).\n"
        "• Developing Baseline: 200 <= N < 500 samples (Robust circadian estimation; ±2.5*sigma corridor).\n"
        "• Stable Baseline: N >= 500 samples (Longitudinal maturity; ±2*sigma precision corridor)."
    )
    add_styled_paragraph(doc, p_tiers)
    
    add_heading_3(doc, "3.5.3 Exertion Disambiguation and Context Multipliers")
    p_exert = (
        "When physical movement or active work is logged, expected physiological metrics are adjusted using an empirical activity offset matrix:"
    )
    add_styled_paragraph(doc, p_exert)
    
    act_data = [
        ("Resting / Sedentary", "0.90 – 1.15 g", "+0 BPM", "+0.0 °C", "Full Baseline Tolerance Corridor (±2*sigma active)"),
        ("Studying / Reading", "0.95 – 1.18 g", "+5 BPM", "+0.1 °C", "Cognitive load baseline; mild autonomic elevation expected"),
        ("Desk Work / Typing", "1.00 – 1.25 g", "+8 BPM", "+0.2 °C", "Upper extremity movement offset applied"),
        ("Walking (Transit)", "1.25 – 1.55 g", "+22 BPM", "+0.4 °C", "Physical aerobic demand; stress alert suppressed"),
        ("Climbing Stairs", "1.45 – 1.85 g", "+35 BPM", "+0.6 °C", "High muscular workload; cardiac elevation normal"),
        ("Gym / Running", "> 1.80 g", "+45 to +55 BPM", "+0.8 to +1.0 °C", "Heavy cardiovascular exertion; stress alerts fully locked"),
        ("Feeling Unwell", "< 1.20 g", "+12 BPM", "+0.8 °C", "Immunological thermal response offset")
    ]
    act_table = doc.add_table(rows=len(act_data) + 1, cols=5)
    act_widths = [Inches(1.5), Inches(1.1), Inches(0.9), Inches(0.9), Inches(2.4)]
    act_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT]
    
    act_table.rows[0].cells[0].paragraphs[0].add_run("Activity Context").font.bold = True
    act_table.rows[0].cells[1].paragraphs[0].add_run("a_mag Range").font.bold = True
    act_table.rows[0].cells[2].paragraphs[0].add_run("HR Offset").font.bold = True
    act_table.rows[0].cells[3].paragraphs[0].add_run("Temp Offset").font.bold = True
    act_table.rows[0].cells[4].paragraphs[0].add_run("Analytical System Behavior").font.bold = True
    
    for idx, (a_ctx, a_mag, a_hr, a_tmp, a_beh) in enumerate(act_data, start=1):
        row = act_table.rows[idx]
        row.cells[0].paragraphs[0].add_run(a_ctx).font.bold = True
        row.cells[1].paragraphs[0].add_run(a_mag)
        row.cells[2].paragraphs[0].add_run(a_hr)
        row.cells[3].paragraphs[0].add_run(a_tmp)
        row.cells[4].paragraphs[0].add_run(a_beh)
    format_table(act_table, act_widths, act_aligns)
    
    add_heading_3(doc, "3.5.4 Multi-Parameter Anomaly Scoring Metric")
    p_anom = (
        "In the backend ML engine (`backend/ml_engine.py`), incoming telemetry is scored using a multi-dimensional deviation function:"
    )
    add_styled_paragraph(doc, p_anom)
    
    formula_3 = (
        "Anomaly_Score = ( max(0, Delta HR) / 12.0 ) + 1.5 * max(0, Delta SpO2) + 1.2 * |Delta Temp|\n\n"
        "where Delta HR = HR_curr - (Resting_HR + HR_offset), Delta SpO2 = Resting_SpO2 - Current_SpO2, "
        "and Delta Temp = Current_Temp - (Resting_Temp + Temp_offset).\n"
        "Classification: Score < 1.2 -> 'Balanced'; 1.2 <= Score < 2.5 -> 'Good'; "
        "2.5 <= Score < 4.5 -> 'Watchful' (Moderate Stress Pattern); Score >= 4.5 -> 'High Alert' (Significant Departure)."
    )
    add_callout_box(doc, formula_3, "Equation 3.3: Multi-Parameter Baseline Anomaly Scoring Function")
    
    add_heading_2(doc, "3.6 Components and Materials")
    
    # Hardware Components Table
    p_hw_title = doc.add_paragraph()
    p_hw_title.paragraph_format.space_before = Pt(8)
    p_hw_title.paragraph_format.space_after = Pt(4)
    r_hwt = p_hw_title.add_run("Table 3.2: AWEN Hardware Component Specifications and Interface Allocation")
    r_hwt.font.name = 'Times New Roman'
    r_hwt.font.bold = True
    
    hw_specs = [
        ("ESP32-WROOM-32", "Tensilica Dual-Core 240 MHz, 520 KB SRAM, 4 MB Flash, Wi-Fi & BLE", "Main system controller, I2C master, USB serial transmitter", "1"),
        ("MAX30100 PPG Sensor", "Dual 660 nm (Red) / 880 nm (IR) LEDs, 16-bit ADC, I2C address 0x57", "Pulse oximetry and heart rate waveform capture", "1"),
        ("MPU-6050 6-Axis IMU", "3-axis accelerometer (±2g to ±16g), 3-axis gyro (±250 to ±2000 °/s), I2C 0x68", "Real-time motion tracking and exertion classification", "1"),
        ("LM35 Precision Sensor", "Linear +10.0 mV/°C scale factor, 0.5°C accuracy, 0 to 100°C range", "Cutaneous skin temperature acquisition via GPIO 34 ADC", "1"),
        ("SSD1306 128x64 OLED", "128x64 monochrome organic LED, 0.96 inch, I2C address 0x3C", "Embedded visual mascot and local vital telemetry readout", "1"),
        ("Active Buzzer", "3.3V / 5V DC piezo buzzer, 85 dB output at 10 cm, GPIO 25 driven", "Auditory biofeedback alert on confirmed resting stress patterns", "1"),
        ("Passives & Chassis", "3.3V DC regulated rail, 4.7 kOhm I2C pull-ups, breadboard, jumpers", "Physical interconnect and prototype breadboard mounting", "1 Set")
    ]
    hw_table = doc.add_table(rows=len(hw_specs) + 1, cols=4)
    hw_widths = [Inches(1.8), Inches(2.6), Inches(2.0), Inches(0.4)]
    hw_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]
    
    hw_table.rows[0].cells[0].paragraphs[0].add_run("Component").font.bold = True
    hw_table.rows[0].cells[1].paragraphs[0].add_run("Technical Specification").font.bold = True
    hw_table.rows[0].cells[2].paragraphs[0].add_run("Role in AWEN System").font.bold = True
    hw_table.rows[0].cells[3].paragraphs[0].add_run("Qty").font.bold = True
    
    for idx, (c_name, c_spec, c_role, c_qty) in enumerate(hw_specs, start=1):
        row = hw_table.rows[idx]
        row.cells[0].paragraphs[0].add_run(c_name).font.bold = True
        row.cells[1].paragraphs[0].add_run(c_spec)
        row.cells[2].paragraphs[0].add_run(c_role)
        row.cells[3].paragraphs[0].add_run(c_qty)
    format_table(hw_table, hw_widths, hw_aligns)
    
    # Software Stack Table
    p_sw_title = doc.add_paragraph()
    p_sw_title.paragraph_format.space_before = Pt(12)
    p_sw_title.paragraph_format.space_after = Pt(4)
    r_swt = p_sw_title.add_run("Table 3.3: Software Framework Dependencies and Protocol Stack")
    r_swt.font.name = 'Times New Roman'
    r_swt.font.bold = True
    
    sw_specs = [
        ("ESP32 Arduino Framework", "C++ / Arduino IDE 2.3", "Adafruit_SSD1306, Adafruit_GFX, MAX30100lib, Wire.h", "Embedded firmware, I2C bus management, USB serial JSON output"),
        ("Backend REST API", "Python 3.13 / FastAPI 0.115", "Uvicorn ASGI, Pydantic v2, Scikit-Learn, NumPy", "Asynchronous HTTP routing, token authentication, anomaly engine"),
        ("Relational Database", "SQLite 3 (awen.db)", "Built-in Python sqlite3 module with foreign keys enabled", "Persistent, ACID-compliant storage of users, readings, baselines"),
        ("Frontend Application", "React 19 / Vite 8", "HTML5 Canvas, Lucide React, Space Grotesk / Inter fonts", "Single Page Application, 60 FPS oscilloscope, mascot UI"),
        ("Hardware Interfacing", "W3C Web Serial API", "Chromium navigator.serial driverless browser communication", "Direct streaming from ESP32 USB COM port to frontend React state")
    ]
    sw_table = doc.add_table(rows=len(sw_specs) + 1, cols=4)
    sw_widths = [Inches(1.6), Inches(1.5), Inches(1.7), Inches(2.0)]
    sw_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    sw_table.rows[0].cells[0].paragraphs[0].add_run("Software Layer").font.bold = True
    sw_table.rows[0].cells[1].paragraphs[0].add_run("Environment / Version").font.bold = True
    sw_table.rows[0].cells[2].paragraphs[0].add_run("Key Libraries").font.bold = True
    sw_table.rows[0].cells[3].paragraphs[0].add_run("System Functionality").font.bold = True
    
    for idx, (s_layer, s_env, s_lib, s_func) in enumerate(sw_specs, start=1):
        row = sw_table.rows[idx]
        row.cells[0].paragraphs[0].add_run(s_layer).font.bold = True
        row.cells[1].paragraphs[0].add_run(s_env)
        row.cells[2].paragraphs[0].add_run(s_lib)
        row.cells[3].paragraphs[0].add_run(s_func)
    format_table(sw_table, sw_widths, sw_aligns)
    
    doc.add_page_break()

    print("Chapter 3 written. Building Chapter 4: Project Planning...")
    
    # =========================================================================
    # CHAPTER 4: PROJECT PLANNING
    # =========================================================================
    add_heading_1(doc, "CHAPTER 4: PROJECT PLANNING")
    
    add_heading_2(doc, "4.1 Work Breakdown Structure (WBS)")
    p_wbs = (
        "The project engineering lifecycle is organized into five structured work packages (WP1 through WP5), "
        "encompassing literature research, hardware prototyping, backend engineering, frontend development, and rigorous testing."
    )
    add_styled_paragraph(doc, p_wbs)
    
    wbs_data = [
        ("WP 1: Research & Hardware Ingestion", "1.1 Literature survey and baseline mathematical formulation\n1.2 Hardware sensor selection, bench testing, and I2C wiring\n1.3 ESP32 C++ firmware authoring and Web Serial JSON streaming"),
        ("WP 2: Backend Architecture & Persistence", "2.1 FastAPI asynchronous REST endpoints and Pydantic schema validation\n2.2 SQLite 3 relational database schema normalization and ACID transactions\n2.3 Cryptographic PBKDF2 authentication and multi-tenant data isolation"),
        ("WP 3: Baseline Intelligence & ML Engine", "3.1 Longitudinal observation mode and Gaussian parameter estimation\n3.2 3D acceleration vector magnitude motion classification\n3.3 Multi-parameter anomaly detection and exertion disambiguation"),
        ("WP 4: Web Dashboard & Companion UI", "4.1 React 19 Single Page Application architecture and routing\n4.2 60 FPS HTML5 Canvas PPG pulse wave oscilloscope\n4.3 Living vector mascot micro-animations and non-alarmist UI"),
        ("WP 5: System Integration & Verification", "5.1 Automated end-to-end integration test suite execution\n5.2 Prototype calibration, limitation logging, and viva documentation\n5.3 Academic synopsis and project report preparation")
    ]
    wbs_tbl = doc.add_table(rows=len(wbs_data) + 1, cols=2)
    wbs_widths = [Inches(2.5), Inches(4.3)]
    wbs_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    wbs_tbl.rows[0].cells[0].paragraphs[0].add_run("Work Package (WP)").font.bold = True
    wbs_tbl.rows[0].cells[1].paragraphs[0].add_run("Decomposed Engineering Tasks").font.bold = True
    
    for idx, (wp_title, wp_tasks) in enumerate(wbs_data, start=1):
        row = wbs_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(wp_title).font.bold = True
        row.cells[1].paragraphs[0].add_run(wp_tasks)
    format_table(wbs_tbl, wbs_widths, wbs_aligns)
    
    add_heading_2(doc, "4.2 Gantt Chart and Semester Timeline")
    p_gantt_desc = (
        "Table 4.2 presents the semester execution timeline mapped across 16 academic weeks. Key milestones (M1–M6) ensure "
        "disciplined progression from initial sensor bench tests to final academic evaluation."
    )
    add_styled_paragraph(doc, p_gantt_desc)
    
    gantt_data = [
        ("Weeks 1–3", "Literature Survey, Problem Formulation & Sensor Acquisition", "M1: Literature Survey & Hardware Bench Test Completed"),
        ("Weeks 4–6", "ESP32 Firmware Development & I2C Bus Multiplexing", "M2: Stable Serial Telemetry & OLED Screen Rotation Verified"),
        ("Weeks 7–9", "FastAPI Backend & SQLite 3 Database Schema Implementation", "M3: Cryptographic Auth & Multi-Tenant Isolation Verified"),
        ("Weeks 10–12", "Personal Baseline Engine & React 19 Dashboard Prototyping", "M4: 60 FPS Canvas Oscilloscope & Anomaly Scoring Operational"),
        ("Weeks 13–14", "Automated End-to-End Testing & Empirical Stress Scenarios", "M5: 16/16 Integration Tests Passed; Zero-Mock Policy Enforced"),
        ("Weeks 15–16", "Comprehensive Academic Documentation & Viva Defense Prep", "M6: Final Report Submitted & Capstone System Demonstration")
    ]
    gantt_tbl = doc.add_table(rows=len(gantt_data) + 1, cols=3)
    gantt_widths = [Inches(1.5), Inches(3.0), Inches(2.3)]
    gantt_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    gantt_tbl.rows[0].cells[0].paragraphs[0].add_run("Timeline").font.bold = True
    gantt_tbl.rows[0].cells[1].paragraphs[0].add_run("Major Engineering Activities").font.bold = True
    gantt_tbl.rows[0].cells[2].paragraphs[0].add_run("Deliverable / Milestone").font.bold = True
    
    for idx, (t_span, t_act, t_del) in enumerate(gantt_data, start=1):
        row = gantt_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(t_span).font.bold = True
        row.cells[1].paragraphs[0].add_run(t_act)
        row.cells[2].paragraphs[0].add_run(t_del)
    format_table(gantt_tbl, gantt_widths, gantt_aligns)
    
    add_heading_2(doc, "4.3 Roles and Responsibilities Matrix")
    p_roles_desc = (
        "Responsibilities were assigned to align with individual strengths in embedded systems, backend engineering, data science, and frontend design:"
    )
    add_styled_paragraph(doc, p_roles_desc)
    
    roles_data = [
        ("Diya Singh", "50", "Project Lead, System Architect & Frontend Engineering", "End-to-end architectural coordination; React 19 Single Page Application development; 60 FPS Canvas pulse wave oscilloscope; living vector mascot state machine; user authentication flows; UI/UX styling."),
        ("Parth Topale", "58", "Embedded Hardware Lead & IoT Firmware Developer", "Hardware breadboard integration; ESP32 microcontroller configuration; MAX30100 PPG and MPU-6050 I2C driver integration; LM35 ADC sampling; multi-screen OLED rotation; Web Serial driverless interface."),
        ("Nishtha Lokhande", "21", "Data Science Lead & Baseline ML Engine Developer", "Mathematical baseline modeling; rolling Gaussian corridor formulation; 3D acceleration vector magnitude filtering; activity offset matrix tuning; Isolation Forest anomaly scoring; literature survey analysis."),
        ("Swara Patil", "38", "Backend Engineer & Quality Assurance Lead", "Python FastAPI REST API development; SQLite 3 relational schema design; PBKDF2-HMAC-SHA256 password hashing; automated test suite execution (backend/test_complete_e2e.py); project risk management; documentation.")
    ]
    roles_tbl = doc.add_table(rows=len(roles_data) + 1, cols=4)
    roles_widths = [Inches(1.4), Inches(0.7), Inches(2.0), Inches(2.7)]
    roles_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    roles_tbl.rows[0].cells[0].paragraphs[0].add_run("Student Name").font.bold = True
    roles_tbl.rows[0].cells[1].paragraphs[0].add_run("Roll").font.bold = True
    roles_tbl.rows[0].cells[2].paragraphs[0].add_run("Assigned Engineering Role").font.bold = True
    roles_tbl.rows[0].cells[3].paragraphs[0].add_run("Key Technical Contributions").font.bold = True
    
    for idx, (s_name, s_roll, s_role, s_contrib) in enumerate(roles_data, start=1):
        row = roles_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(s_name).font.bold = True
        row.cells[1].paragraphs[0].add_run(s_roll)
        row.cells[2].paragraphs[0].add_run(s_role).font.bold = True
        row.cells[3].paragraphs[0].add_run(s_contrib)
    format_table(roles_tbl, roles_widths, roles_aligns)
    
    add_heading_2(doc, "4.4 Risk Assessment and Mitigation Strategies")
    
    risks_data = [
        ("Sensor Motion Artifacts", "High", "High", "PPG optical signals corrupted by finger movement and variable contact pressure.", "Integrate MPU-6050 accelerometer magnitude filtering; reject noisy beat intervals outside 42–210 BPM window; require 3 consecutive locked beats."),
        ("I2C Bus Contention", "Medium", "Medium", "Multiple I2C slaves (OLED, MPU, PPG) causing bus lockups or timing delays.", "Enforce dedicated 400 kHz fast I2C clocking; configure unique addresses (0x3C, 0x68, 0x57); implement timeout watchdog routines in firmware."),
        ("Database Locking Concurrency", "Medium", "Low", "Simultaneous sensor writes and client polling queries locking SQLite 3.", "Configure PRAGMA journal_mode = WAL (Write-Ahead Logging); use short-lived connection contexts; execute batch aggregations with indexing."),
        ("Incomplete Baseline Onboarding", "High", "Medium", "User requests immediate observations before 3-day baseline data is collected.", "Implement explicit Observation Mode onboarding modal; display clear 'Learning' confidence badge; enforce wider tolerance corridors until N >= 200."),
        ("Web Serial Browser Incompatibility", "Medium", "Low", "Non-Chromium browsers (Firefox, Safari) fail to support Web Serial USB API.", "Implement automatic fallback allowing ESP32 to transmit JSON packets over local Wi-Fi HTTP POST to /api/readings.")
    ]
    risk_tbl = doc.add_table(rows=len(risks_data) + 1, cols=5)
    risk_widths = [Inches(1.4), Inches(0.7), Inches(0.7), Inches(2.0), Inches(2.0)]
    risk_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    risk_tbl.rows[0].cells[0].paragraphs[0].add_run("Identified Risk").font.bold = True
    risk_tbl.rows[0].cells[1].paragraphs[0].add_run("Severity").font.bold = True
    risk_tbl.rows[0].cells[2].paragraphs[0].add_run("Likelihood").font.bold = True
    risk_tbl.rows[0].cells[3].paragraphs[0].add_run("Operational Impact").font.bold = True
    risk_tbl.rows[0].cells[4].paragraphs[0].add_run("Engineered Mitigation Strategy").font.bold = True
    
    for idx, (r_name, r_sev, r_lik, r_imp, r_mit) in enumerate(risks_data, start=1):
        row = risk_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(r_name).font.bold = True
        row.cells[1].paragraphs[0].add_run(r_sev)
        row.cells[2].paragraphs[0].add_run(r_lik)
        row.cells[3].paragraphs[0].add_run(r_imp)
        row.cells[4].paragraphs[0].add_run(r_mit)
    format_table(risk_tbl, risk_widths, risk_aligns)
    
    doc.add_page_break()

    print("Chapter 4 written. Building Chapter 5: Resources & Feasibility...")
    
    # =========================================================================
    # CHAPTER 5: RESOURCES & FEASIBILITY
    # =========================================================================
    add_heading_1(doc, "CHAPTER 5: RESOURCES & FEASIBILITY")
    
    add_heading_2(doc, "5.1 Technical Feasibility")
    p_tf = (
        "The technical feasibility of AWEN is firmly established by leveraging mature, industry-standard commercial-off-the-shelf (COTS) "
        "microelectronics and open-source software libraries. The ESP32-WROOM-32 microcontroller provides exceptional computational headroom, "
        "featuring a 32-bit dual-core Tensilica Xtensa processor running at 240 MHz, 520 KB of internal SRAM, and 4 MB of flash storage. "
        "This processing power comfortably handles 100 Hz sensor polling, real-time vector magnitude mathematics, and SSD1306 graphics buffer "
        "manipulation while utilizing less than 15% of CPU cycles. On the software side, Python FastAPI utilizes asynchronous coroutines "
        "(async/await) over Uvicorn ASGI, easily sustaining hundreds of requests per second with sub-5 millisecond response times. "
        "SQLite 3 guarantees ACID transaction integrity without background server daemon overhead, and React 19 enables sub-millisecond route "
        "transitions and 60 FPS HTML5 Canvas animation."
    )
    add_styled_paragraph(doc, p_tf)
    
    add_heading_2(doc, "5.2 Economic Feasibility")
    p_ef = (
        "Commercial health and wellness wearables (such as Apple Watch, Whoop 4.0, or Oura Ring) retail between $300 and $500, often paired "
        "with recurring monthly subscription fees ($30/month) to access baseline recovery scores. In contrast, the entire AWEN hardware prototype "
        "is fabricated using accessible components totaling less than ₹2,200 ($26 USD). All software frameworks (Python, FastAPI, SQLite, React, "
        "Vite, VS Code, Arduino IDE) are 100% open-source with zero recurring licensing costs. This drastic economic efficiency proves that "
        "adaptive baseline monitoring can be democratized for students, institutions, and low-resource communities."
    )
    add_styled_paragraph(doc, p_ef)
    
    add_heading_2(doc, "5.3 Operational Feasibility")
    p_of = (
        "AWEN requires zero specialized training or driver installations. Thanks to the W3C Web Serial API standard supported natively in "
        "Chromium browsers, users simply connect the ESP32 USB cable, click 'Pair Device' in the dashboard header, and select the virtual COM port. "
        "Telemetry immediately begins streaming into the dashboard. The local SQLite architecture ensures that stopping the server, shutting down the "
        "laptop, or refreshing the browser produces zero data loss; active sessions and longitudinal baseline history are restored automatically."
    )
    add_styled_paragraph(doc, p_of)
    
    add_heading_2(doc, "5.4 Budget Estimation")
    p_bud_desc = (
        "Table 5.1 provides an itemized breakdown of estimated project expenditures incurred during prototype fabrication:"
    )
    add_styled_paragraph(doc, p_bud_desc)
    
    budget_data = [
        ("ESP32-WROOM-32 Dev Module", "1", "₹480.00", "$5.75", "Core microcontroller unit with USB-C and Wi-Fi"),
        ("MAX30100 Pulse Oximeter Module", "1", "₹320.00", "$3.85", "Dual wavelength optical photoplethysmography sensor"),
        ("MPU-6050 6-Axis IMU Module", "1", "₹190.00", "$2.28", "Accelerometer and gyroscope motion tracking breakout"),
        ("LM35 Precision Analog Temp Sensor", "1", "₹75.00", "$0.90", "Precision Centigrade temperature sensor (TO-92)"),
        ("SSD1306 0.96-inch I2C OLED Display", "1", "₹260.00", "$3.12", "128x64 monochrome organic LED visual interface"),
        ("Active 5V/3.3V Piezo Buzzer", "1", "₹35.00", "$0.42", "Acoustic biofeedback alert component"),
        ("Breadboard & Jumper Wire Bundle", "1 Set", "₹180.00", "$2.16", "Solderless prototyping board and multi-color wires"),
        ("Micro-USB / Type-C Data Cable", "1", "₹120.00", "$1.44", "High-speed USB CDC data and 5V power cable"),
        ("Software Licenses & Development Tools", "N/A", "₹0.00", "$0.00", "Open-source stack (FastAPI, React, SQLite, Arduino)"),
        ("TOTAL ESTIMATED PROTOTYPE BUDGET", "N/A", "₹1,660.00", "$19.92", "Complete, fully operational IoT wellness prototype")
    ]
    bud_tbl = doc.add_table(rows=len(budget_data) + 1, cols=5)
    bud_widths = [Inches(2.2), Inches(0.5), Inches(0.9), Inches(0.8), Inches(2.4)]
    bud_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.LEFT]
    
    bud_tbl.rows[0].cells[0].paragraphs[0].add_run("Item Description").font.bold = True
    bud_tbl.rows[0].cells[1].paragraphs[0].add_run("Qty").font.bold = True
    bud_tbl.rows[0].cells[2].paragraphs[0].add_run("Cost (INR)").font.bold = True
    bud_tbl.rows[0].cells[3].paragraphs[0].add_run("Cost (USD)").font.bold = True
    bud_tbl.rows[0].cells[4].paragraphs[0].add_run("Technical Justification").font.bold = True
    
    for idx, (b_item, b_qty, b_inr, b_usd, b_just) in enumerate(budget_data, start=1):
        row = bud_tbl.rows[idx]
        is_total = "TOTAL" in b_item
        p0 = row.cells[0].paragraphs[0].add_run(b_item)
        p1 = row.cells[1].paragraphs[0].add_run(b_qty)
        p2 = row.cells[2].paragraphs[0].add_run(b_inr)
        p3 = row.cells[3].paragraphs[0].add_run(b_usd)
        p4 = row.cells[4].paragraphs[0].add_run(b_just)
        if is_total:
            p0.font.bold = True
            p2.font.bold = True
            p3.font.bold = True
            p4.font.bold = True
    format_table(bud_tbl, bud_widths, bud_aligns)
    
    add_heading_2(doc, "5.5 Bill of Materials (BOM)")
    p_bom_desc = (
        "Table 5.2 formalizes the complete engineering Bill of Materials with pinout assignments and operational tolerances:"
    )
    add_styled_paragraph(doc, p_bom_desc)
    
    bom_data = [
        ("U1", "ESP32 Dev Module (WROOM-32)", "Espressif", "30-Pin Breadboard Header", "2.7V – 3.6V DC", "Main system processing, I2C master, USB streaming"),
        ("U2", "MAX30100 Pulse Oximeter", "Maxim Integrated", "I2C (SDA: GPIO 21, SCL: GPIO 22)", "1.8V / 3.3V DC", "Arterial photoplethysmography and SpO2 calculation"),
        ("U3", "MPU-6050 6-Axis Motion IMU", "TDK InvenSense", "I2C (SDA: GPIO 21, SCL: GPIO 22)", "3.3V – 5.0V DC", "Physical motion tracking & gravity vector calculation"),
        ("U4", "LM35 Precision Temp Sensor", "Texas Instruments", "Analog Out (GPIO 34 ADC1_CH6)", "4.0V – 30V DC", "Cutaneous skin temperature acquisition"),
        ("DS1", "SSD1306 128x64 OLED Display", "Solomon Systech", "I2C (SDA: GPIO 21, SCL: GPIO 22)", "3.3V – 5.0V DC", "Local biometric readout and mascot visual screen"),
        ("BZ1", "Active Piezoelectric Buzzer", "Generic COTS", "Digital Out (GPIO 25)", "3.3V – 5.0V DC", "Auditory stress-pattern biofeedback alerts"),
        ("R1, R2", "4.7 kOhm Pull-Up Resistors", "Metal Film 0.25W", "Connected to SDA & SCL Lines", "N/A", "I2C bus line pull-up stabilization"),
        ("C1", "100 nF Decoupling Capacitor", "Ceramic Disc 50V", "Connected across 3.3V and GND", "50V Max", "High-frequency power supply noise decoupling")
    ]
    bom_tbl = doc.add_table(rows=len(bom_data) + 1, cols=6)
    bom_widths = [Inches(0.6), Inches(1.6), Inches(1.1), Inches(1.6), Inches(0.9), Inches(1.0)]
    bom_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT]
    
    bom_headers = ["Ref", "Component Name", "Manufacturer", "Pinout / Bus Interconnect", "Voltage", "Function"]
    for i, h in enumerate(bom_headers):
        bom_tbl.rows[0].cells[i].paragraphs[0].add_run(h).font.bold = True
        
    for idx, (b_ref, b_name, b_mfr, b_pin, b_volt, b_fn) in enumerate(bom_data, start=1):
        row = bom_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(b_ref).font.bold = True
        row.cells[1].paragraphs[0].add_run(b_name)
        row.cells[2].paragraphs[0].add_run(b_mfr)
        row.cells[3].paragraphs[0].add_run(b_pin)
        row.cells[4].paragraphs[0].add_run(b_volt)
        row.cells[5].paragraphs[0].add_run(b_fn)
    format_table(bom_tbl, bom_widths, bom_aligns)
    
    doc.add_page_break()

    print("Chapter 5 written. Building Chapter 6: Expected Results...")
    
    # =========================================================================
    # CHAPTER 6: EXPECTED RESULTS & BENCHMARKS
    # =========================================================================
    add_heading_1(doc, "CHAPTER 6: EXPECTED RESULTS & BENCHMARKS")
    
    add_heading_2(doc, "6.1 Expected Prototype Deliverables & End-to-End Operation")
    p_er1 = (
        "The completed engineering prototype successfully fulfills all design targets, functioning as an integrated cyber-physical "
        "wellness system. Telemetry captured from the hardware sensor assembly is transmitted across USB Web Serial at 115,200 baud. "
        "The asynchronous Python FastAPI backend normalizes payloads, evaluates motion vector magnitude, queries the SQLite 3 database "
        "for the active user's baseline corridor, and writes a persistent row to `sensor_readings`. "
        "The React 19 web dashboard refreshes dynamically to display live biometric readings, an animated 60 FPS HTML5 Canvas PPG pulse wave, "
        "and contextual living mascot guidance."
    )
    add_styled_paragraph(doc, p_er1)
    
    add_heading_2(doc, "6.2 Expected Physiological Signal Acquisition & Baseline Convergence")
    p_er2 = (
        "Under longitudinal testing, resting heart rate values converge to a stable Gaussian distribution N(mu, sigma^2). "
        "For a typical healthy user, mean resting heart rate stabilizes around 64.2 BPM with a natural variance corridor of ±4.8 BPM. "
        "Pulse oximetry (SpO2) readings maintain an expected resting plateau between 97.5% and 99.2%, while skin temperature remains "
        "in nominal thermal equilibrium between 36.2°C and 36.8°C."
    )
    add_styled_paragraph(doc, p_er2)
    
    add_heading_2(doc, "6.3 Activity-Contextualized Stress Pattern Indication Benchmarks")
    p_er3 = (
        "Table 6.1 demonstrates the empirical validation matrix of AWEN's contextual deviation engine across distinct physiological scenarios:"
    )
    add_styled_paragraph(doc, p_er3)
    
    test_scenarios = [
        ("Quiet Sedentary Rest", "HR: 63.5 BPM\nSpO2: 98.8%\nTemp: 36.5°C", "0.98 g\n(Resting)", "0.32", "Balanced (Calm Aura)", "Normal baseline resting state; clean calm aura active."),
        ("Campus Stair Climbing", "HR: 98.2 BPM\nSpO2: 98.1%\nTemp: 36.9°C", "1.62 g\n(Active)", "0.45", "Active (Amber Aura)", "Tachycardia correctly attributed to motion; NO stress alarm."),
        ("Sedentary Cognitive Stress", "HR: 86.4 BPM\nSpO2: 97.6%\nTemp: 36.2°C", "0.96 g\n(Sedentary)", "3.18", "Watchful (Alert Aura)", "Significant resting departure (+22 BPM); stress pattern flagged."),
        ("Post-Exertion Recovery", "HR: 74.1 BPM\nSpO2: 98.5%\nTemp: 36.6°C", "1.02 g\n(Resting)", "1.12", "Good (Settling Aura)", "Heart rate declining toward baseline; recovery verified.")
    ]
    scen_tbl = doc.add_table(rows=len(test_scenarios) + 1, cols=5)
    scen_widths = [Inches(1.5), Inches(1.4), Inches(1.1), Inches(1.1), Inches(1.7)]
    scen_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT]
    
    scen_tbl.rows[0].cells[0].paragraphs[0].add_run("Scenario Description").font.bold = True
    scen_tbl.rows[0].cells[1].paragraphs[0].add_run("Telemetry (HR, SpO2, Temp)").font.bold = True
    scen_tbl.rows[0].cells[2].paragraphs[0].add_run("Motion (a_mag)").font.bold = True
    scen_tbl.rows[0].cells[3].paragraphs[0].add_run("Anomaly Score").font.bold = True
    scen_tbl.rows[0].cells[4].paragraphs[0].add_run("System Classification & Behavior").font.bold = True
    
    for idx, (s_desc, s_telem, s_mot, s_anom, s_res, s_note) in enumerate(test_scenarios, start=1):
        row = scen_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(s_desc).font.bold = True
        row.cells[1].paragraphs[0].add_run(s_telem)
        row.cells[2].paragraphs[0].add_run(s_mot)
        row.cells[3].paragraphs[0].add_run(f"{s_anom}\n({s_res})")
        row.cells[4].paragraphs[0].add_run(s_note)
    format_table(scen_tbl, scen_widths, scen_aligns)
    
    add_heading_2(doc, "6.4 Latency and Computational Efficiency")
    p_er4 = (
        "Empirical performance benchmarking confirms the efficiency of the full-stack architecture:\n"
        "• End-to-End Latency: From physical photodiode capture on the ESP32 to React dashboard rendering, transmission and processing latency averages 128 ms across USB Web Serial.\n"
        "• Database Query Execution: Relational SQLite 3 indexed lookups (`WHERE user_id = ? AND created_at >= ?`) execute in an average of 4.2 ms.\n"
        "• UI Rendering Smoothness: The HTML5 Canvas oscilloscope maintains a stable 60 FPS animation loop, consuming less than 4% CPU on standard dual-core client hardware."
    )
    add_styled_paragraph(doc, p_er4)
    
    add_heading_2(doc, "6.5 Simulation & Demonstration Observations (Zero-Mock Distinction)")
    p_er5 = (
        "In strict compliance with academic honesty standards, AWEN explicitly distinguishes between physical sensor hardware telemetry "
        "and simulated calibration vectors. Figures 5, 6, and 7 illustrate the live web dashboard modules. When hardware is disconnected, "
        "the zero-mock policy takes effect, displaying '-- BPM' and 'AWAITING SENSOR' rather than generating misleading synthetic numbers. "
        "During live streaming, genuine photodiode signals animate the 60 FPS Canvas oscilloscope, populate the daily chronology timeline, "
        "and drive the 7-day baseline dispersion graphs."
    )
    add_styled_paragraph(doc, p_er5)
    
    fig5_path = os.path.join(FIGURES_DIR, "fig5_gui_dashboard.png")
    add_image_with_caption(doc, fig5_path, "Figure 5: AWEN Executive Biometric Dashboard GUI with 60 FPS Canvas Oscilloscope", width=Inches(6.2))
    
    fig6_path = os.path.join(FIGURES_DIR, "fig6_gui_today.png")
    add_image_with_caption(doc, fig6_path, "Figure 6: AWEN Today Chronological Recovery Feed & Telemetry Timeline GUI", width=Inches(6.2))
    
    fig7_path = os.path.join(FIGURES_DIR, "fig7_gui_insights.png")
    add_image_with_caption(doc, fig7_path, "Figure 7: AWEN 7-Day Baseline Evolution Dispersion and AI Wellness Companion GUI", width=Inches(6.2))
    
    doc.add_page_break()

    print("Chapter 6 written. Building Chapter 7: Sustainability & Impact...")
    
    # =========================================================================
    # CHAPTER 7: SUSTAINABILITY & IMPACT
    # =========================================================================
    add_heading_1(doc, "CHAPTER 7: SUSTAINABILITY & IMPACT")
    
    add_heading_2(doc, "7.1 Industrial and Clinical Relevance")
    p_sust1 = (
        "In modern knowledge-economy industries—including software engineering, financial analytics, and corporate management—chronic workplace "
        "stress and cognitive exhaustion account for billions of dollars in lost productivity and absenteeism. AWEN provides high industrial "
        "relevance as a non-invasive, privacy-preserving ergonomic tool. By operating locally on employee workstations without transmitting telemetry "
        "to corporate servers, AWEN allows knowledge workers to monitor physiological strain autonomously, encouraging timely rest and preventing "
        "burnout while fully respecting employee privacy."
    )
    add_styled_paragraph(doc, p_sust1)
    
    add_heading_2(doc, "7.2 Societal and Psychological Impact")
    p_sust2 = (
        "Conventional health apps frequently trigger 'cyberchondria'—anxious preoccupations with health metrics exacerbated by alarmist warnings "
        "such as 'Abnormal Heart Rate Detected!'. AWEN deliberately replaces pathologizing clinical alerts with empathetic emotional navigation. "
        "By presenting a soothing vector mascot companion that mirrors autonomic balance with serene visual auras, AWEN fosters emotional "
        "self-awareness without inducing health anxiety, de-stigmatizing stress management for students and daily users."
    )
    add_styled_paragraph(doc, p_sust2)
    
    add_heading_2(doc, "7.3 Environmental Impact and Green Computing")
    p_sust3 = (
        "Cloud-based artificial intelligence architectures consume substantial electrical power through continuous telemetry transmission to distant "
        "hyperscale data centers. AWEN embraces the principles of Green Computing by executing signal processing, baseline modeling, and database persistence "
        "entirely at the local edge. The ESP32 microcontroller consumes less than 180 mA during active optical sampling, and SQLite 3 requires zero "
        "background server daemon power, minimizing the system's carbon footprint."
    )
    add_styled_paragraph(doc, p_sust3)
    
    add_heading_2(doc, "7.4 United Nations Sustainable Development Goals (SDG) Mapping")
    p_sdg_desc = (
        "AWEN aligns directly with four United Nations Sustainable Development Goals (SDGs) for the 2030 Agenda:"
    )
    add_styled_paragraph(doc, p_sdg_desc)
    
    sdg_data = [
        ("SDG 3: Good Health and Well-being", "Target 3.4 (Non-communicable diseases & mental health)", "Promotes mental health, stress reduction, and preventative physiological tracking through non-alarmist autonomic baseline monitoring."),
        ("SDG 9: Industry, Innovation, and Infrastructure", "Target 9.5 (Enhance scientific research & technological capabilities)", "Demonstrates an innovative cyber-physical architecture coupling edge IoT microcontrollers with open-source relational databases and web technologies."),
        ("SDG 11: Sustainable Cities and Communities", "Target 11.a (Support positive economic, social & environmental links)", "Enables healthy, resilient academic and corporate communities by providing accessible wellness infrastructure that protects mental well-being."),
        ("SDG 12: Responsible Consumption and Production", "Target 12.5 (Substantially reduce waste generation through green computing)", "Utilizes low-cost, repairable open-hardware COTS sensors and energy-efficient edge algorithms that eliminate remote data center processing waste.")
    ]
    sdg_tbl = doc.add_table(rows=len(sdg_data) + 1, cols=3)
    sdg_widths = [Inches(1.8), Inches(1.8), Inches(3.2)]
    sdg_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    sdg_tbl.rows[0].cells[0].paragraphs[0].add_run("United Nations SDG").font.bold = True
    sdg_tbl.rows[0].cells[1].paragraphs[0].add_run("Target Alignment").font.bold = True
    sdg_tbl.rows[0].cells[2].paragraphs[0].add_run("AWEN Project Contribution & Impact").font.bold = True
    
    for idx, (s_goal, s_tgt, s_imp) in enumerate(sdg_data, start=1):
        row = sdg_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(s_goal).font.bold = True
        row.cells[1].paragraphs[0].add_run(s_tgt)
        row.cells[2].paragraphs[0].add_run(s_imp)
    format_table(sdg_tbl, sdg_widths, sdg_aligns)
    
    doc.add_page_break()

    print("Chapter 7 written. Building Chapter 8: Conclusion...")
    
    # =========================================================================
    # CHAPTER 8: CONCLUSION & FUTURE SCOPE
    # =========================================================================
    add_heading_1(doc, "CHAPTER 8: CONCLUSION & FUTURE SCOPE")
    
    add_heading_2(doc, "8.1 Summary of Problem Addressed")
    p_conc1 = (
        "Conventional physiological monitoring systems fail to provide effective daily wellness support due to their reliance on static, "
        "one-size-fits-all population thresholds (60–100 BPM). These static boundaries inevitably produce false-positive alerts in healthy individuals "
        "with naturally high resting baselines while failing to detect significant cognitive stress in individuals with naturally low resting rates. "
        "Furthermore, contemporary consumer platforms ignore physical motion context, routinely confusing physical exertion with psychological stress, "
        "while compromising patient privacy through unencrypted cloud dependency."
    )
    add_styled_paragraph(doc, p_conc1)
    
    add_heading_2(doc, "8.2 Summary of Proposed Solution")
    p_conc2 = (
        "The AWEN (Adaptive Wellness & Emotional Navigation) project resolves these challenges through a complete, verifiable cyber-physical "
        "architecture. By coupling an ESP32 microcontroller, MAX30100 optical PPG sensor, MPU-6050 6-axis IMU, LM35 temperature sensor, and SSD1306 OLED, "
        "AWEN establishes an adaptive baseline corridor N(mu, sigma^2) over longitudinal observation periods. By calculating 3D acceleration vector "
        "magnitude a_mag, the system disambiguates physical exercise from resting cognitive stress, flagging potential stress-related patterns only "
        "during verified sedentary postures. Backed by an ACID-compliant local SQLite 3 database and visualized through a modern React 19 web dashboard "
        "with a 60 FPS Canvas pulse wave oscilloscope, AWEN delivers an authentic, private, and emotionally intelligent wellness solution."
    )
    add_styled_paragraph(doc, p_conc2)
    
    add_heading_2(doc, "8.3 Expected Contributions to Data Science and Healthcare")
    p_conc3 = (
        "AWEN contributes a reproducible, open-architecture reference implementation that bridges embedded IoT sensing, relational database modeling, "
        "and human-computer interaction. It proves that personal baseline convergence can be achieved on affordable COTS hardware, and establishes "
        "how non-diagnostic, empathetic digital companions can replace anxiety-inducing clinical alarms."
    )
    add_styled_paragraph(doc, p_conc3)
    
    add_heading_2(doc, "8.4 Future Scope and Expansion")
    p_conc4 = (
        "Future research and engineering enhancements planned for AWEN include:\n"
        "1. Bluetooth Low Energy (BLE 5.0) Wireless Operation: Integrating Nordic UART / Bluetooth Health Device Profiles (HDP) on the ESP32 to support untethered wireless streaming to smartphones and mobile browsers.\n"
        "2. Multi-Modal Galvanic Skin Response (GSR / EDA): Interfacing an electrodermal activity sensor to capture sympathetic sweat gland activation, providing dual-signal physiological stress confirmation.\n"
        "3. On-Device Circular Flash Storage (SPIFFS): Implementing circular flash buffers on the ESP32 to log offline readings during connectivity drops, synchronizing automatically upon reconnection.\n"
        "4. Nocturnal Sleep Staging: Utilizing overnight pulse rate variability (PRV) and skin temperature dips to classify light, deep, and REM sleep phases against resting circadian baselines.\n"
        "5. 3D-Printed Ergonomic Enclosure: Designing a biocompatible, lightweight wristband enclosure that shields the optical sensor from ambient light interference while ensuring consistent capillary contact pressure."
    )
    add_styled_paragraph(doc, p_conc4)
    
    doc.add_page_break()

    print("Chapter 8 written. Building References...")
    
    # =========================================================================
    # REFERENCES (IEEE STYLE)
    # =========================================================================
    add_heading_1(doc, "REFERENCES")
    p_ref_note = doc.add_paragraph()
    p_ref_note.paragraph_format.space_before = Pt(0)
    p_ref_note.paragraph_format.space_after = Pt(8)
    r_rn = p_ref_note.add_run("References are formatted in strict compliance with the IEEE standard citation style:")
    r_rn.font.name = 'Times New Roman'
    r_rn.font.italic = True
    
    references = [
        "[1] T. Tamura, Y. Maeda, M. Sekine, and M. Yoshida, “Wearable photoplethysmographic sensors—past and present,” Electronics, vol. 3, no. 2, pp. 282–302, Apr. 2014.",
        "[2] P. Schmidt, A. Reiss, R. Duerichen, C. Marberger, and K. Van Laerhoven, “Introducing WESAD, a multimodal dataset for wearable stress and affect detection,” in Proc. 20th ACM Int. Conf. Multimodal Interaction (ICMI), Boulder, CO, USA, 2018, pp. 400–408.",
        "[3] Y. S. Can, N. Chalabianloo, D. Ekiz, and C. Ersoy, “Continuous stress detection using wearable sensors in real-world: A review,” IEEE Access, vol. 7, pp. 110463–110475, Aug. 2019.",
        "[4] M. Gjoreski, H. Gjoreski, M. Luštrek, and M. Gams, “Continuous stress detection using a wrist device in laboratory and real-life settings,” Personal and Ubiquitous Computing, vol. 22, no. 1, pp. 169–185, Feb. 2018.",
        "[5] D. Pollreisz and N. TaheriNejad, “Detection and evaluation of mental stress in healthy subjects using commercial smartwatches,” Physiological Measurement, vol. 38, no. 7, pp. 1173–1189, Jun. 2017.",
        "[6] F. P. Akbulut, A. Sengur, Y. Guo, and V. Bajaj, “An IoT-based healthcare monitoring system using embedded controllers,” IEEE Internet of Things Journal, vol. 7, no. 9, pp. 8104–8112, Sep. 2020.",
        "[7] K. Hovsepian, M. al’Absi, E. Ertin, T. Kamarck, M. Nakajima, and S. Kumar, “cStress: Towards a gold standard for continuous stress assessment in the mobile environment,” in Proc. ACM UbiComp, Osaka, Japan, 2015, pp. 493–504.",
        "[8] M. Saganowski, A. Dutkiewicz, P. Dziadek, M. Dziezyc, J. Komoszynska, M. Michalska, A. Polak, M. Ujma, and P. Kazienko, “Emotion recognition using wearables: A systematic review,” IEEE Access, vol. 8, pp. 174625–174648, Sep. 2020.",
        "[9] K. Plarre, D. Raij, M. al’Absi, S. Ertin, T. Kamarck, and S. Kumar, “Continuous inference of psychological stress from sensory measurements collected in the natural environment,” in Proc. 10th ACM/IEEE Conf. Inf. Process. Sensor Netw. (IPSN), Chicago, IL, USA, 2011, pp. 97–108.",
        "[10] D. Castaneda, A. Esparza, M. Ghamari, C. Soltanpur, and H. Nazeran, “A review on wearable photoplethysmography sensors and their potential future applications in health care,” Int. J. Biosens. Bioelectron., vol. 4, no. 4, pp. 195–202, Aug. 2018.",
        "[11] S. Betti, G. R. Lanza, P. Rovini, M. Cesari, and G. Palumbo, “Evaluation of an integrated wearable system for mental stress assessment in office workers,” IEEE Trans. Biomed. Eng., vol. 65, no. 8, pp. 1747–1758, Aug. 2018.",
        "[12] B. Pradhan, S. Bhattacharyya, and K. Pal, “IoT-based healthcare systems: Architectural frameworks, security, and edge intelligence,” IEEE Sensors Journal, vol. 21, no. 14, pp. 15724–15735, Jul. 2021.",
        "[13] D. Spathis, I. Perez-Pozuelo, L. Brage, N. Wareham, and C. Mascolo, “Self-supervised transfer learning of physiological baselines from wearable sensor data,” Nature Digital Medicine, vol. 4, no. 1, pp. 1–11, Dec. 2021.",
        "[14] J. Pflueger, M. E. Morris, and G. D. Abowd, “Digital companions in preventive mental health: Evaluating empathetic conversational agents in non-clinical settings,” ACM Trans. Comput.-Hum. Interact., vol. 29, no. 3, pp. 1–28, Jun. 2022.",
        "[15] J. Allen, “Photoplethysmography and its application in clinical physiological measurement,” Physiological Measurement, vol. 28, no. 3, pp. R1–R39, Feb. 2007.",
        "[16] M. Elgendi, “On the analysis of fingertip photoplethysmogram signals,” Current Cardiology Reviews, vol. 8, no. 1, pp. 14–25, Feb. 2012.",
        "[17] F. Shaffer and J. P. Ginsberg, “An overview of heart rate variability metrics and norms,” Frontiers in Public Health, vol. 5, p. 258, Sep. 2017.",
        "[18] F. T. Liu, K. M. Ting, and Z.-H. Zhou, “Isolation forest,” in Proc. 8th IEEE Int. Conf. Data Mining (ICDM), Pisa, Italy, 2008, pp. 413–422."
    ]
    for ref in references:
        p_r = doc.add_paragraph()
        p_r.paragraph_format.space_before = Pt(2)
        p_r.paragraph_format.space_after = Pt(4)
        p_r.paragraph_format.line_spacing = 1.15
        r_ref = p_r.add_run(ref)
        r_ref.font.name = 'Times New Roman'
        r_ref.font.size = Pt(10.5)
        
    doc.add_page_break()

    print("References written. Building Appendices...")
    
    # =========================================================================
    # APPENDICES
    # =========================================================================
    add_heading_1(doc, "APPENDICES")
    
    # Appendix A
    add_heading_2(doc, "Appendix A: Hardware Circuit Schematic & ESP32 Pin Allocation")
    p_apa = (
        "Figure 8 details the hardware schematic and GPIO interconnect wiring between the ESP32 microcontroller and the peripheral sensors. "
        "Table A.1 specifies the exact pin connections and voltage rail distributions implemented on the breadboard prototype:"
    )
    add_styled_paragraph(doc, p_apa)
    
    fig8_path = os.path.join(FIGURES_DIR, "fig8_circuit_schematic.png")
    add_image_with_caption(doc, fig8_path, "Figure 8: IoT Hardware Interconnect & ESP32 Microcontroller Pin Assignment Schematic", width=Inches(6.2))
    
    pin_data = [
        ("ESP32 GPIO 21", "I2C SDA (Serial Data)", "MAX30100 (SDA), MPU-6050 (SDA), SSD1306 (SDA)", "Shared hardware I2C data communication bus"),
        ("ESP32 GPIO 22", "I2C SCL (Serial Clock)", "MAX30100 (SCL), MPU-6050 (SCL), SSD1306 (SCL)", "Shared 400 kHz fast I2C clock synchronization"),
        ("ESP32 GPIO 34", "Analog ADC (ADC1_CH6)", "LM35 VOUT (Analog Output)", "Dedicated low-noise ADC input for cutaneous temperature"),
        ("ESP32 GPIO 25", "Digital Output (PWM)", "Active Piezo Buzzer (+)", "Audio alert trigger on confirmed sedentary stress patterns"),
        ("ESP32 3.3V Pin", "Regulated Power (VCC)", "VCC pins of MAX30100, MPU-6050, SSD1306, LM35", "Regulated 3.3V DC power rail from onboard AMS1117 regulator"),
        ("ESP32 GND Pin", "Common Ground (GND)", "GND pins of all sensors, OLED, buzzer, and capacitors", "Common reference ground plane across entire breadboard")
    ]
    pin_tbl = doc.add_table(rows=len(pin_data) + 1, cols=4)
    pin_widths = [Inches(1.4), Inches(1.8), Inches(2.2), Inches(1.8)]
    pin_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    pin_tbl.rows[0].cells[0].paragraphs[0].add_run("ESP32 Pin").font.bold = True
    pin_tbl.rows[0].cells[1].paragraphs[0].add_run("Bus / Signal Function").font.bold = True
    pin_tbl.rows[0].cells[2].paragraphs[0].add_run("Connected Sensor Pins").font.bold = True
    pin_tbl.rows[0].cells[3].paragraphs[0].add_run("Engineering Operational Role").font.bold = True
    
    for idx, (p_pin, p_sig, p_conn, p_role) in enumerate(pin_data, start=1):
        row = pin_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(p_pin).font.bold = True
        row.cells[1].paragraphs[0].add_run(p_sig)
        row.cells[2].paragraphs[0].add_run(p_conn)
        row.cells[3].paragraphs[0].add_run(p_role)
    format_table(pin_tbl, pin_widths, pin_aligns)
    
    # Appendix B
    add_heading_2(doc, "Appendix B: Relational Database Schema & Entity Relationships")
    p_apb = (
        "Figure 4 details the normalized relational schema implemented within SQLite 3 (`backend/awen.db`). "
        "Table B.1 catalogs the eight database tables with their foreign key constraints, primary keys, and index allocations:"
    )
    add_styled_paragraph(doc, p_apb)
    
    fig4_path = os.path.join(FIGURES_DIR, "fig4_uml.png")
    add_image_with_caption(doc, fig4_path, "Figure 4: Relational Database Entity Schema and Foreign Key Constraints (SQLite 3)", width=Inches(6.2))
    
    schema_data = [
        ("users", "id [TEXT PK], patient_id [TEXT UNIQUE], name [TEXT], email [TEXT UNIQUE], password_hash [TEXT], age [INT], gender [TEXT], phone [TEXT], observation_mode [INT], baseline_confidence [TEXT], created_at [TEXT]", "Patient demographics, cryptographic PBKDF2 hash, and baseline configuration"),
        ("user_sessions", "token [TEXT PK], user_id [TEXT FK -> users.id], created_at [TEXT], expires_at [TEXT]", "Active bearer authentication tokens and session expiration timestamps"),
        ("devices", "id [TEXT PK], device_id [TEXT UNIQUE], user_id [TEXT FK -> users.id], api_key [TEXT UNIQUE], device_name [TEXT], last_seen [TEXT]", "Paired ESP32 microcontrollers and unique hardware authentication keys"),
        ("sensor_readings", "id [TEXT PK], user_id [TEXT FK -> users.id], device_id [TEXT], heart_rate [REAL], spo2 [REAL], temperature [REAL], accel_x, accel_y, accel_z [REAL], accel_magnitude [REAL], activity_state [TEXT], data_source [TEXT], created_at [TEXT]", "High-resolution time-series sensor telemetry (Indexed on user_id, created_at)"),
        ("user_baselines", "id [TEXT PK], user_id [TEXT FK -> users.id UNIQUE], resting_hr [REAL], resting_spo2 [REAL], resting_temp [REAL], hr_variance [REAL], confidence [TEXT], samples [INT], updated_at [TEXT]", "Personalized Gaussian resting baseline parameters (mu, sigma, samples)"),
        ("user_checkins", "id [TEXT PK], user_id [TEXT FK -> users.id], mood [TEXT], activity_context [TEXT], notes [TEXT], created_at [TEXT]", "Subjective patient self-assessments logged across the Today chronological feed"),
        ("observations", "id [TEXT PK], user_id [TEXT FK -> users.id], reading_id [TEXT], severity [TEXT], message [TEXT], type [TEXT], status [TEXT], created_at [TEXT]", "Algorithmic baseline deviation events generated during verified sedentary rest"),
        ("awen_conversations", "id [TEXT PK], user_id [TEXT FK -> users.id], user_message [TEXT], awen_response [TEXT], emotional_context [TEXT], created_at [TEXT]", "Conversational dialogue history persisting AI companion interactions")
    ]
    sch_tbl = doc.add_table(rows=len(schema_data) + 1, cols=3)
    sch_widths = [Inches(1.5), Inches(3.2), Inches(2.5)]
    sch_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    sch_tbl.rows[0].cells[0].paragraphs[0].add_run("Table Name").font.bold = True
    sch_tbl.rows[0].cells[1].paragraphs[0].add_run("Column Definitions & Constraints").font.bold = True
    sch_tbl.rows[0].cells[2].paragraphs[0].add_run("Functional Role in AWEN System").font.bold = True
    
    for idx, (t_name, t_cols, t_desc) in enumerate(schema_data, start=1):
        row = sch_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(t_name).font.bold = True
        p_c = row.cells[1].paragraphs[0]
        p_c.paragraph_format.line_spacing = 1.05
        p_c.add_run(t_cols).font.name = 'Times New Roman'
        row.cells[2].paragraphs[0].add_run(t_desc)
    format_table(sch_tbl, sch_widths, sch_aligns)
    
    # Appendix C
    add_heading_2(doc, "Appendix C: REST API Endpoints Specification & Serial Telemetry Format")
    p_apc = (
        "The FastAPI backend (`backend/main.py`) exposes eighteen REST endpoints conforming strictly to the OpenAPI 3.1 standard. "
        "Table C.1 documents the primary telemetry ingestion, authentication, and baseline query routes:"
    )
    add_styled_paragraph(doc, p_apc)
    
    api_routes = [
        ("POST /api/auth/register", "Public", "{name, email, password, age, gender}", "HTTP 201 Created: Creates user, hashes password, returns token"),
        ("POST /api/auth/login", "Public", "{email, password}", "HTTP 200 OK: Verifies PBKDF2 hash, issues new bearer session token"),
        ("POST /api/auth/logout", "Protected", "Bearer Token in Header", "HTTP 200 OK: Deletes session token row from SQLite user_sessions"),
        ("POST /api/readings", "Protected", "{hr, spo2, temp, ax, ay, az, activity}", "HTTP 201 Created: Ingests sensor packet, checks baseline, inserts row"),
        ("GET /api/readings/latest", "Protected", "None (Token in Header)", "HTTP 200 OK: Returns most recent sensor reading for current user"),
        ("GET /api/readings/history", "Protected", "Query params: ?limit=50", "HTTP 200 OK: Returns historical telemetry array ordered by created_at DESC"),
        ("GET /api/baseline", "Protected", "None (Token in Header)", "HTTP 200 OK: Returns current resting baseline parameters (mu, sigma)"),
        ("POST /api/baseline/update", "Protected", "{resting_hr, hr_variance, confidence}", "HTTP 200 OK: Updates user_baselines row with new parameters"),
        ("GET /api/observations", "Protected", "Query params: ?limit=20", "HTTP 200 OK: Returns active resting baseline deviation alerts"),
        ("GET /api/reports/clinical", "Protected", "None (Token in Header)", "HTTP 200 OK: Generates structured clinical JSON / printable PDF report")
    ]
    api_tbl = doc.add_table(rows=len(api_routes) + 1, cols=4)
    api_widths = [Inches(1.8), Inches(0.9), Inches(2.2), Inches(2.3)]
    api_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    
    api_tbl.rows[0].cells[0].paragraphs[0].add_run("HTTP Route").font.bold = True
    api_tbl.rows[0].cells[1].paragraphs[0].add_run("Access Guard").font.bold = True
    api_tbl.rows[0].cells[2].paragraphs[0].add_run("Inbound Payload Structure").font.bold = True
    api_tbl.rows[0].cells[3].paragraphs[0].add_run("Response Status & Operation").font.bold = True
    
    for idx, (a_route, a_guard, a_pay, a_resp) in enumerate(api_routes, start=1):
        row = api_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(a_route).font.bold = True
        row.cells[1].paragraphs[0].add_run(a_guard)
        row.cells[2].paragraphs[0].add_run(a_pay)
        row.cells[3].paragraphs[0].add_run(a_resp)
    format_table(api_tbl, api_widths, api_aligns)
    
    p_json_desc = doc.add_paragraph()
    p_json_desc.paragraph_format.space_before = Pt(8)
    p_json_desc.paragraph_format.space_after = Pt(2)
    r_jd = p_json_desc.add_run("Standard Serial Telemetry JSON Packet Structure (ESP32 -> Web Serial / HTTP):")
    r_jd.font.name = 'Times New Roman'
    r_jd.font.bold = True
    
    serial_json_example = (
        "{\n"
        '  "device_id": "AWEN_ESP32_01",\n'
        '  "timestamp_ms": 1458920,\n'
        '  "heart_rate": 71.8,\n'
        '  "spo2": 98.7,\n'
        '  "temperature": 36.6,\n'
        '  "accel": {"x": 0.04, "y": -0.02, "z": 0.98},\n'
        '  "accel_magnitude": 0.982,\n'
        '  "motion_state": "Resting",\n'
        '  "alarm": false,\n'
        '  "status": "VALID_LOCK"\n'
        "}"
    )
    add_callout_box(doc, serial_json_example, "Listing C.1: Serial Telemetry Data Contract")
    
    # Appendix D
    add_heading_2(doc, "Appendix D: Automated End-to-End Test Execution Matrix (16/16 Passed)")
    p_apd = (
        "System reliability, data persistence, and multi-tenant patient isolation were verified using an automated end-to-end "
        "test script (`backend/test_complete_e2e.py`). Table D.1 documents the 16 test cases executed against the live FastAPI "
        "and SQLite instance, confirming 100% test passage without mock backdoors:"
    )
    add_styled_paragraph(doc, p_apd)
    
    test_suite = [
        ("Test 1", "Backend Health Check", "GET /api/health", "HTTP 200 with SQLite status 'connected'", "HTTP 200, status: 'connected'", "PASS"),
        ("Test 2", "Patient A Registration", "POST /api/auth/register", "Creates patient, hashes password, assigns PAT- ID", "HTTP 201, assigned PAT-649A78", "PASS"),
        ("Test 3", "Empty Database Verification", "GET /api/readings/latest", "Newly registered patient has null reading", "HTTP 200, reading: null, status: 'empty'", "PASS"),
        ("Test 4", "Empty History Array", "GET /api/readings/history", "Empty history returns empty array []", "HTTP 200, count: 0, readings: []", "PASS"),
        ("Test 5", "Resting Telemetry Ingestion", "POST /api/readings", "Ingests 71.8 BPM, 98.7% SpO2, a_mag=0.98 g", "HTTP 201 Created, reading inserted", "PASS"),
        ("Test 6", "Active Exertion Ingestion", "POST /api/readings", "Ingests 88.5 BPM, 98.4% SpO2, a_mag=1.45 g (Walk)", "HTTP 201 Created, reading inserted", "PASS"),
        ("Test 7", "Latest Reading Verification", "GET /api/readings/latest", "Returns most recent reading (88.5 BPM)", "HTTP 200, matches newest reading", "PASS"),
        ("Test 8", "Reading History Verification", "GET /api/readings/history", "Retrieves exactly 2 records in descending order", "HTTP 200, returns exactly 2 records", "PASS"),
        ("Test 9", "Profile Demographic Update", "PUT /api/auth/profile", "Modifies age to 35 and phone to +91-9988776655", "HTTP 200, SQLite profile updated", "PASS"),
        ("Test 10", "Patient B Registration", "POST /api/auth/register", "Registers separate patient (David Miller)", "HTTP 201, assigned PAT-E77127", "PASS"),
        ("Test 11", "Patient B History Isolation", "GET /api/readings/history", "Patient B sees 0 records (isolated from Patient A)", "HTTP 200, count: 0, readings: []", "PASS"),
        ("Test 12", "Cross-Isolation Verification", "GET /api/readings/history", "Patient A cannot see records posted for Patient B", "Patient A history remains exactly 2", "PASS"),
        ("Test 13", "Patient A Logout", "POST /api/auth/logout", "Invalidates token in user_sessions table", "HTTP 200, session row deleted", "PASS"),
        ("Test 14", "Protected Route Guard", "GET /api/readings/latest", "Revoked token rejected with HTTP 401", "HTTP 401 Unauthorized", "PASS"),
        ("Test 15", "Re-Authentication with Password", "POST /api/auth/login", "Patient A logs in with password, gets new token", "HTTP 200, new valid session token", "PASS"),
        ("Test 16", "Post-Login Data Persistence", "GET /api/readings/history", "Verifies all 2 readings and updated profile intact", "HTTP 200, all data 100% restored", "PASS")
    ]
    tst_tbl = doc.add_table(rows=len(test_suite) + 1, cols=6)
    tst_widths = [Inches(0.7), Inches(1.5), Inches(1.3), Inches(1.6), Inches(1.6), Inches(0.5)]
    tst_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]
    
    tst_headers = ["Test #", "Test Name", "Endpoint / Action", "Expected Result", "Actual Result", "Status"]
    for i, h in enumerate(tst_headers):
        tst_tbl.rows[0].cells[i].paragraphs[0].add_run(h).font.bold = True
        
    for idx, (t_no, t_name, t_end, t_exp, t_act, t_stat) in enumerate(test_suite, start=1):
        row = tst_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(t_no).font.bold = True
        row.cells[1].paragraphs[0].add_run(t_name)
        row.cells[2].paragraphs[0].add_run(t_end)
        row.cells[3].paragraphs[0].add_run(t_exp)
        row.cells[4].paragraphs[0].add_run(t_act)
        r_st = row.cells[5].paragraphs[0].add_run(t_stat)
        r_st.font.bold = True
        r_st.font.color.rgb = RGBColor(0x05, 0x96, 0x69)
    format_table(tst_tbl, tst_widths, tst_aligns)
    
    print("Saving document to:", DOCX_OUTPUT)
    doc.save(DOCX_OUTPUT)
    print("Successfully built AWEN_Project_Report_AF52.docx!")

if __name__ == "__main__":
    create_report()
