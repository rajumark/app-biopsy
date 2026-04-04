Perfect — it looks like you’ve unpacked the JADX zip, and what you’re seeing (JAR files, README, and logos) is exactly what you should expect. Since you only want CLI usage, here’s how to proceed:

1. Go to the bin folder

Inside the extracted folder, there is a bin/ directory:

On Linux/macOS: use the jadx file
On Windows: use jadx.bat

These are the CLI executables.

2. Example command-line usage 
# Decompile an APK
jadx -d output_dir app.apk

# Decompile a single class
jadx --single-class com.example.MyClass app.apk -d out

# Show all CLI options
jadx --help
-d output_dir → output folder for the decompiled code
You can ignore the GUI files (jadx-gui or icons) entirely if you’re only using the CLI.
3. Java requirement

Make sure you have Java 11 or higher installed:

java -version
If not, install it (Windows: Oracle JDK 11+ x64, Linux/macOS: use your package manager).
4. Optional: add CLI to PATH

So you can run jadx from anywhere:

On Linux/macOS:
export PATH=/path/to/jadx/bin:$PATH
On Windows:
Add the path to jadx.bat in Environment Variables → PATH
