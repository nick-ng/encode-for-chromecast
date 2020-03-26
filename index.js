const fs = require("fs");
const { spawnSync } = require("child_process");
const { join } = require("path");
const flattenDeep = require("lodash/flattenDeep");

const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi"];
const START_PATH = "/home/nickng/share/rpi/videos/Poirot/Season 01";
const DRY_RUN = false;
const LOG_FILE = "./log.log";

const join2 = (path1, path2) => (path1 ? join(path1, path2) : path2);

const removeExtension = filename => filename.replace(/\.(\w|\d)+$/, "");

const isVideo = filename =>
  VIDEO_EXTENSIONS.some(extension => filename.endsWith(extension));

const isDirectory = dirname => fs.statSync(dirname).isDirectory();

const getAllFiles = startDirname => {
  if (isDirectory(startDirname)) {
    const filelist = fs.readdirSync(startDirname);

    return flattenDeep(
      filelist.map(fileOrDir => {
        const newFileOrDir = join2(startDirname, fileOrDir);
        if (isDirectory(newFileOrDir)) {
          return getAllFiles(newFileOrDir);
        }

        return newFileOrDir;
      })
    );
  }

  return [startDirname];
};

const getAllVideos = startDirname => getAllFiles(startDirname).filter(isVideo);

const getUnconvertedVideos = startDirname => {
  const videos = getAllVideos(startDirname).filter(
    name => !name.endsWith(".encoding.mp4")
  );
  const convertedVideoNames = videos
    .filter(v => v.endsWith(".cc.mp4"))
    .map(v => v.replace(/\.cc\.mp4$/, ""));
  return videos.filter(
    video => !convertedVideoNames.includes(removeExtension(video))
  );
};

//ffmpeg -i test-videos/Agatha.Christie\'s.Poirot.S01E01.1080p.Bluray.2.0.x265-LION\[UTR\].mkv -c:v libx264 -q:v 30 -vf scale=-2:720 -c:a copy test-videos/Agatha.Christie\'s.Poirot.S01E01.1080p.Bluray.2.0.x265-LION\[UTR\].cc.mp4

// const ffmpeg = spawnSync("ffmpeg", [
//   "-threads",
//   "1",
//   "-y",
//   "-i",
//   "test-videos/Agatha.Christie's.Poirot.S01E01.1080p.Bluray.2.0.x265-LION[UTR].mkv", // input video file
//   "-c:v",
//   "libx264",
//   "-q:v",
//   "30",
//   "-vf",
//   "scale=-2:720",
//   "-preset",
//   "veryfast", // slow is probably the most economical
//   "-c:a",
//   "copy",
//   "test-videos/Agatha.Christie's.Poirot.S01E01.1080p.Bluray.2.0.x265-LION[UTR].a.mp4" // output video file
// ]);

const log = message => {
  console.log(`${new Date()}:`, message);
  fs.appendFileSync(
    LOG_FILE,
    `${new Date()}: ${message}
`
  );
};

const encodeVideoA = pathToFile => {
  log(`Processing ${pathToFile}`);
  const a = removeExtension(pathToFile);
  log(`a ${a}`);

  // 30 Encode video
  spawnSync("ffmpeg", [
    "-threads",
    "1",
    "-y",
    "-i",
    pathToFile, // input video file
    "-c:v",
    "libx264",
    "-q:v",
    "30",
    "-vf",
    "scale=-2:720",
    "-preset",
    "slow", // slow is probably the most economical
    "-c:a",
    "copy",
    `${a}.encoding.mp4` // output video file
  ]);
  log(`Encoded ${a}.encoding.mp4`);

  // 40 Rename file from .encoding to .cc.mp4
  fs.renameSync(`${a}.encoding.mp4`, `${a}.cc.mp4`);
  log(`Renamed ${`${a}.cc.mp4`}`);
};

const runner = () => {
  // 10 Get all videos
  const unconvertedVideos = getUnconvertedVideos(START_PATH);

  if (DRY_RUN) {
    console.log("unconvertedVideos", unconvertedVideos);
    return;
  }

  // 20 For each video
  unconvertedVideos.forEach(encodeVideoA);
};

runner();
