const express = require("express");
const path = require("path");
const app = express();

// Ganti 'my-angular-app' dengan nama folder build Anda di dalam folder dist
const distPath = path.join(__dirname, "dist", "teman-curhatmu", "browser");

// Serve file statis dari folder build
app.use(express.static(distPath));

// Untuk semua route yang tidak dikenali, kirim index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const port = 4200;
app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
