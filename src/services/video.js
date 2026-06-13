import fs from "fs";
import path from "path";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const OUTPUT_DIR = path.join(process.cwd(), "public", "outputs");
const TEMP_DIR = path.join(process.cwd(), "temp");

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

async function downloadFile(url, destPath) {
  const writer = fs.createWriteStream(destPath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function wrapText(text, maxChars) {
  const words = text.split(" ");
  let lines = [];
  let currentLine = "";

  for (let word of words) {
    if ((currentLine + word).length > maxChars) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines.join("\n");
}

// Function to process a single scene
function processScene(videoPath, audioPath, text, outputPath) {
  return new Promise((resolve, reject) => {
    // 1. Wrap text and write to a temporary file for FFmpeg to read
    const wrappedText = wrapText(text, 22);
    const textFilePath = outputPath + ".txt";
    fs.writeFileSync(textFilePath, wrappedText);

    // Escape path for ffmpeg (Windows paths like C:/ need C\:/)
    const safeTextPath = textFilePath.replace(/\\/g, "/").replace(/:/g, "\\:");

    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions([
        "-c:v libx264",
        "-preset veryfast",
        "-crf 23",
        "-c:a aac",
        "-b:a 128k",
        "-ar 44100", // Force audio sample rate
        "-ac 2", // Force stereo audio
        "-shortest", // stop when the shortest stream ends (usually the audio)
      ])
      .complexFilter([
        // Scale and crop to 9:16 (1080x1920)
        "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v_scaled]",
        // Add text overlay centered, reading from file
        `[v_scaled]drawtext=textfile='${safeTextPath}':fontcolor=white:fontsize=70:box=1:boxcolor=black@0.6:x=(w-text_w)/2:y=(h-text_h)/2+200[v_text]`,
      ])
      .outputOptions(["-map [v_text]", "-map 1:a"]) // Map the final video and the audio
      .save(outputPath)
      .on("end", () => {
        // Cleanup text file
        if (fs.existsSync(textFilePath)) fs.unlinkSync(textFilePath);
        resolve();
      })
      .on("error", (err) => {
        console.error("FFmpeg error on scene:", err);
        reject(err);
      });
  });
}

function concatVideos(sceneFiles, finalOutputPath) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    sceneFiles.forEach((file) => {
      command.input(file);
    });

    command
      .on("end", resolve)
      .on("error", (err) => {
        console.error("Concat error:", err);
        reject(err);
      })
      .mergeToFile(finalOutputPath, TEMP_DIR);
  });
}

export const videoService = {
  async stitchVideo(jobId, scenes) {
    console.log(`[VideoService] Starting stitch job: ${jobId}`);
    const sceneOutputFiles = [];
    
    try {
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        if (!scene.videoUrl || !scene.text) continue;

        console.log(`[VideoService] Processing scene ${i + 1}/${scenes.length}`);
        
        const videoPath = path.join(TEMP_DIR, `${jobId}_scene_${i}.mp4`);
        const audioPath = path.join(TEMP_DIR, `${jobId}_scene_${i}.mp3`);
        const sceneOutput = path.join(TEMP_DIR, `${jobId}_scene_${i}_out.mp4`);

        // Generate TTS URL
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          scene.text
        )}&tl=en&total=1&idx=0&textlen=${scene.text.length}&client=tw-ob&prev=input&ttsspeed=1`;

        // Download Video & Audio
        console.log(`[VideoService] Downloading assets for scene ${i + 1}...`);
        await Promise.all([
          downloadFile(scene.videoUrl, videoPath),
          downloadFile(ttsUrl, audioPath),
        ]);

        console.log(`[VideoService] Rendering scene ${i + 1}...`);
        await processScene(videoPath, audioPath, scene.text, sceneOutput);
        
        sceneOutputFiles.push(sceneOutput);
      }

      if (sceneOutputFiles.length === 0) {
        throw new Error("No scenes were successfully rendered.");
      }

      console.log(`[VideoService] Concatenating ${sceneOutputFiles.length} scenes...`);
      const finalFileName = `${jobId}.mp4`;
      const finalOutputPath = path.join(OUTPUT_DIR, finalFileName);

      await concatVideos(sceneOutputFiles, finalOutputPath);
      console.log(`[VideoService] Job ${jobId} completed! Video saved at ${finalOutputPath}`);

      // Cleanup temp files
      [...sceneOutputFiles].forEach(f => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      });
      // Also cleanup raw downloaded files
      scenes.forEach((_, i) => {
        const v = path.join(TEMP_DIR, `${jobId}_scene_${i}.mp4`);
        const a = path.join(TEMP_DIR, `${jobId}_scene_${i}.mp3`);
        if (fs.existsSync(v)) fs.unlinkSync(v);
        if (fs.existsSync(a)) fs.unlinkSync(a);
      });

      return `/outputs/${finalFileName}`;
    } catch (err) {
      console.error("[VideoService] Error stitching video:", err);
      throw err;
    }
  },
};
