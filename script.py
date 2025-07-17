# upload_to_sftp.py

import os
import paramiko
from stat import S_ISDIR

SFTP_HOST = os.environ["SFTP_HOST"]
SFTP_PORT = int(os.getenv("SFTP_PORT", 22))
SFTP_USERNAME = os.environ["SFTP_USERNAME"]
SFTP_KEY_PATH = os.environ["SFTP_KEY_PATH"]
LOCAL_DIR = "api-portal/static"
REMOTE_DIR = "/code/web/sites/default/files/static"

def sftp_upload_dir(sftp, local_dir, remote_dir):
    try:
        sftp.chdir(remote_dir)
    except IOError:
        sftp.mkdir(remote_dir)
        sftp.chdir(remote_dir)

    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + "/" + item

        if os.path.isdir(local_path):
            try:
                sftp.listdir(remote_path)
            except IOError:
                sftp.mkdir(remote_path)
            sftp_upload_dir(sftp, local_path, remote_path)
        else:
            sftp.put(local_path, remote_path)

def main():
    key = paramiko.RSAKey.from_private_key_file(SFTP_KEY_PATH)
    transport = paramiko.Transport((SFTP_HOST, SFTP_PORT))
    transport.connect(username=SFTP_USERNAME, pkey=key)

    sftp = paramiko.SFTPClient.from_transport(transport)
    sftp_upload_dir(sftp, LOCAL_DIR, REMOTE_DIR)
    sftp.close()
    transport.close()

if __name__ == "__main__":
    main()
