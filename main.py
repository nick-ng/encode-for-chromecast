import subprocess

# ffmpeg -i "$file" -vcodec libx264 -crf 18 -acodec copy "$dst"

# ffmpeg -i "$file" -vcodec libx264 -vf scale=-1:720 -crf 18 -acodec copy "$dst"


subprocess.run([
    "ffmpeg",
    "-i test-videos/Agatha.Christie\'s.Poirot.S01E01.1080p.Bluray.2.0.x265-LION\[UTR\].mkv",
    "-c:v",
    "libx264",
    "-q:v",
    "18",
    "-vf",
    "scale=-2:720",
    "-preset",
    "ultrafast",
    "-c:a",
    "copy",
    "test-videos/Agatha.Christie\'s.Poirot.S01E01.1080p.Bluray.2.0.x265-LION\[UTR\].ccc.mp4"
])


print('Hello World')


# ffmpeg -i test-videos/Agatha.Christie\'s.Poirot.S01E01.1080p.Bluray.2.0.x265-LION\[UTR\].mkv -c:v libx264 -q:v 30 -vf scale=-2:720 -preset veryfast -c:a copy test-videos/Agatha.Christie\'s.Poirot.S01E01.1080p.Bluray.2.0.x265-LION\[UTR\].cc.mp4
