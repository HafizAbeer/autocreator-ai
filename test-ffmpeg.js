const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const fs = require("fs");

fs.writeFileSync("test.txt", "Hello World\\nTesting 123");

ffmpeg()
  .input("color=c=black:s=1080x1920")
  .inputFormat("lavfi")
  .complexFilter([
    `drawtext=textfile='test.txt':fontcolor=white:fontsize=70:box=1:boxcolor=black@0.6:x=(w-text_w)/2:y=(h-text_h)/2+200[v_text]`
  ])
  .outputOptions(["-map [v_text]", "-t 1"])
  .save("test_out.mp4")
  .on("end", () => console.log("Success!"))
  .on("error", (err, stdout, stderr) => {
    console.error("Error:", err.message);
    console.error("STDERR:", stderr);
  });
