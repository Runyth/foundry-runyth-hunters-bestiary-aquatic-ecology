# Reproducible Build

Use Node 22.13+ and Python 3. `npm run build` validates source and content, executes Node tests, and creates deterministic ZIPs with sorted entries and fixed timestamps. Repeating the build from an unchanged tree must produce byte-identical archives. The source archive excludes `dist/`; extracting it and running the build reproduces the install archive.