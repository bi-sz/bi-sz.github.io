/**
 * Aeons 이미지 웹용 리사이즈·압축 (원본 덮어쓰기)
 * 실행: npx --yes -p sharp node scripts/optimize-aeons-images.mjs
 */
import sharp from "sharp";
import { stat, rename, unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AEONS_DIR = path.join(__dirname, "..", "image", "aeons");

/** @type {{ name: string, maxWidth?: number, maxHeight?: number, quality?: number }[]} */
const TARGETS = [
    { name: "main3.png", maxWidth: 512, maxHeight: 512 },
    { name: "cover.png", maxWidth: 512 },
    { name: "red&yellow.png", maxWidth: 512 },
    { name: "green&blue.png", maxWidth: 512 },
    { name: "neme2.jpg", maxWidth: 512, quality: 85 },
    { name: "graveHP.png", maxWidth: 900 },
    { name: "nemeHP.png", maxWidth: 900 },
    { name: "mainBG.jpg", maxWidth: 1200, quality: 82 },
];

async function optimizeOne({ name, maxWidth, maxHeight, quality }) {
    const filePath = path.join(AEONS_DIR, name);
    try {
        await stat(filePath);
    } catch {
        console.warn("skip (missing):", name);
        return;
    }

    const before = (await stat(filePath)).size;
    const img = sharp(filePath);
    const meta = await img.metadata();

    let pipeline = img.rotate();
    const w = meta.width || 0;
    const h = meta.height || 0;
    const needsResize =
        (maxWidth && w > maxWidth) || (maxHeight && h > maxHeight);

    if (needsResize) {
        pipeline = pipeline.resize({
            width: maxWidth,
            height: maxHeight,
            fit: "inside",
            withoutEnlargement: true,
        });
    }

    const ext = path.extname(name).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") {
        pipeline = pipeline.jpeg({ quality: quality ?? 85, mozjpeg: true });
    } else if (ext === ".png") {
        pipeline = pipeline.png({ compressionLevel: 9, effort: 10 });
    } else if (ext === ".webp") {
        pipeline = pipeline.webp({ quality: quality ?? 85 });
    }

    const tmpPath = filePath + ".tmp";
    const buf = await pipeline.toBuffer();
    await sharp(buf).toFile(tmpPath);
    try {
        await unlink(filePath);
    } catch {
        /* ignore */
    }
    await rename(tmpPath, filePath);
    const after = (await stat(filePath)).size;
    const pct = before ? Math.round((1 - after / before) * 100) : 0;
    console.log(
        `${name}: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB (${pct}% smaller)`
    );
}

async function main() {
    for (const target of TARGETS) {
        await optimizeOne(target);
    }
    console.log("done");
}

main().catch(function (err) {
    console.error(err);
    process.exit(1);
});
