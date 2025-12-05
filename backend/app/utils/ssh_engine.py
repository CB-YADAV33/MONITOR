# backend/app/utils/ssh_engine.py

import subprocess
from urllib.parse import quote

def open_ssh_session(ip: str, username: str = "admin", password: str = None, port: int = 22):
    """
    Opens SSH session to the device using PuTTY.
    - ip: Device IP
    - username: SSH username
    - password: Optional password (putty can prompt if not provided)
    - port: SSH port (default 22)
    """

    putty_path = r"C:\Program Files\PuTTY\putty.exe"  # Change if your PuTTY path is different

    # Construct PuTTY command
    cmd = [putty_path, "-ssh", f"{username}@{ip}", "-P", str(port)]

    # If password is provided, use -pw option
    if password:
        cmd.extend(["-pw", password])

    try:
        subprocess.Popen(cmd)
        print(f"PuTTY SSH session opened for {ip}")
    except Exception as e:
        print(f"Failed to open SSH session for {ip}: {e}")
