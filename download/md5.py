import sys
import hashlib
import requests

def file_md5(filename):
    with open(sys.argv[1], 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def load_md5_table():
    md5s = {}
    for line in requests.get("http://download.thinkbroadband.com/MD5SUMS", stream=True).raw:
        md5, filename = line.decode().strip().split('  ')
        md5s[filename] = md5
    return md5s

md5s = load_md5_table()
filename = sys.argv[1]

md5 = file_md5(filename)

assert md5s[filename] == md5

print(f"File {filename} is correct")
