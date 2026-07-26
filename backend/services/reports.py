import pandas as pd
from fpdf import FPDF
import io
from utils.firebase_client import get_firestore_db

class ReportGenerator:
    def __init__(self):
        self.db = get_firestore_db()

    def generate_csv_report(self, data_type: str = "violations") -> str:
        """
        Fetches data from Firestore and returns CSV string.
        """
        if not self.db:
            return "No Database Connection"
        
        docs = self.db.collection(data_type.capitalize()).stream()
        data = [doc.to_dict() for doc in docs]
        
        df = pd.DataFrame(data)
        return df.to_csv(index=False)

    def generate_pdf_report(self, data_type: str = "violations") -> bytes:
        """
        Generates a basic PDF report for violations/alerts.
        """
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Safety Report: {data_type.capitalize()}", ln=True, align="C")
        
        if self.db:
            docs = self.db.collection(data_type.capitalize()).limit(50).stream()
            for doc in docs:
                item = doc.to_dict()
                # Basic string representation for the PDF
                line = " | ".join([f"{k}: {v}" for k, v in item.items()][:5])
                pdf.cell(200, 10, txt=line, ln=True)
                
        return pdf.output(dest='S').encode('latin1')

report_generator = ReportGenerator()
