"""
=====================================================
ASPIRE APP — PYTHON WEBBSERVER
=====================================================

Kör den här filen för att starta Aspire-appen lokalt.

Instruktioner:
1. Se till att du är i mappen 'aspire-app'
2. Kör kommandot:  python server.py
3. Öppna Safari på din iPhone och gå till:
   http://DIN_DATORS_IP:8000

Hitta din IP-adress:
- Mac: Systeminställningar → Nätverk
- Windows: ipconfig i terminal

iPhone-tips:
- Tryck på dela-ikonen i Safari
- Välj "Lägg till på hemskärmen"
- Nu visas Aspire som en riktig app!
=====================================================
"""

import http.server
import socketserver
import socket


# ─── Inställningar ────────────────────────────────

PORT = 8000           # Porten appen körs på
HOST = "0.0.0.0"      # Lyssnar på alla nätverksgränssnitt


# ─── Hitta datorns IP-adress ──────────────────────

def hitta_ip():
    """Returnerar datorns lokala IP-adress i nätverket."""
    try:
        # Öppna en temporär anslutning för att hitta IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"


# ─── Starta servern ───────────────────────────────

class AspreHandler(http.server.SimpleHTTPRequestHandler):
    """
    Hanterar HTTP-förfrågningar.
    SimpleHTTPRequestHandler serverar filer från
    den mapp där server.py körs.
    """

    def log_message(self, format, *args):
        """Skriver ut ett enkelt loggmeddelande för varje besök."""
        print(f"  → {self.path}")


# ─── Kör programmet ───────────────────────────────

if __name__ == "__main__":

    ip = hitta_ip()

    print("")
    print("╔══════════════════════════════════════╗")
    print("║         ASPIRE APP — STARTAD         ║")
    print("╠══════════════════════════════════════╣")
    print(f"║  Dator:   http://localhost:{PORT}       ║")
    print(f"║  iPhone:  http://{ip}:{PORT}   ║")
    print("╠══════════════════════════════════════╣")
    print("║  Tryck CTRL+C för att stänga         ║")
    print("╚══════════════════════════════════════╝")
    print("")

    # Starta servern
    with socketserver.TCPServer((HOST, PORT), AspreHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("")
            print("  Servern stängd. Hej då!")
            print("")
