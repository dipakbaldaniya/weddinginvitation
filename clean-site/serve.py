"""Local preview server for the invitation, with browser caching turned off.

`python -m http.server` lets browsers reuse old copies of the page, so after
editing a file you may keep seeing the previous version. This server sends
`Cache-Control: no-store`, so every reload shows the current files.

Usage (from any folder):
    python serve.py            -> http://localhost:8080/
    python serve.py 9000       -> http://localhost:9000/
"""
import functools
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
SITE_DIR = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    handler = functools.partial(NoCacheHandler, directory=SITE_DIR)
    with http.server.ThreadingHTTPServer(('', PORT), handler) as server:
        print('Serving the invitation at http://localhost:%d/  (Ctrl+C to stop)' % PORT)
        server.serve_forever()
