from pypdf import PdfReader

def load_file(file):
    reader = PdfReader(file.file)
    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text()

        if text:
            pages.append({
                "page_number" : page_number,
                "text" : text.strip()
            })
    return pages  


