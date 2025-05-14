from livereload import Server
import os

server = Server()

# Watch HTML files
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.html'):
            server.watch(os.path.join(root, file))
        elif file.endswith('.css'):
            server.watch(os.path.join(root, file))
        elif file.endswith('.js'):
            server.watch(os.path.join(root, file))

# Serve the current directory
server.serve(port=4200, host='localhost', root='.')
