import { useEffect, useMemo, useRef, useState } from 'react';
import { compressImage, type CompressionFormat } from './engine';

const formatLabels: Record<CompressionFormat, string> = {
  'image/webp': 'WebP',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
};

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function extensionFor(format: CompressionFormat) {
  return format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
}

export function ImageCompressor({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  const isArabic = locale === 'ar';
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [format, setFormat] = useState<CompressionFormat>('image/webp');
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ blob: Blob; width: number; height: number } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    if (!downloadUrl) return;
    return () => URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  const savings = useMemo(() => {
    if (!file || !result) return 0;
    return Math.max(0, Math.round((1 - result.blob.size / file.size) * 100));
  }, [file, result]);

  const process = async (nextFile = file) => {
    if (!nextFile) return;
    setBusy(true);
    setError('');
    setResult(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    try {
      const compressed = await compressImage(nextFile, {
        quality,
        format,
        maxWidth: maxWidth ? Number(maxWidth) : undefined,
        maxHeight: maxHeight ? Number(maxHeight) : undefined,
      });
      setResult({ blob: compressed.blob, width: compressed.width, height: compressed.height });
      setDownloadUrl(URL.createObjectURL(compressed.blob));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Compression failed');
    } finally {
      setBusy(false);
    }
  };

  const selectFile = (nextFile: File | undefined) => {
    if (!nextFile) return;
    setFile(nextFile);
    setResult(null);
    setError('');
  };

  const title = isArabic ? 'ضغط الصور أونلاين' : 'Compress Images Online';
  const description = isArabic
    ? 'قلّل حجم صور JPG وPNG وWebP بسرعة مع التحكم في الجودة والمقاسات. المعالجة تتم داخل المتصفح.'
    : 'Reduce JPG, PNG, and WebP file size in your browser with quality and dimension controls.';

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="image-tool-shell">
      <div className="image-tool-container">
        <header className="image-tool-header">
          <div>
            <p className="image-tool-eyebrow">FLIXO · IMAGE TOOLS</p>
            <h1>{title}</h1>
            <p className="image-tool-lead">{description}</p>
          </div>
          <a className="language-link" href={isArabic ? '/en/image-compressor' : '/ar/image-compressor'}>
            {isArabic ? 'English' : 'العربية'}
          </a>
        </header>

        <section className="compressor-grid" aria-label={isArabic ? 'أداة ضغط الصور' : 'Image compression tool'}>
          <div className="compressor-card">
            <label className="upload-zone" htmlFor="image-file">
              <span className="upload-title">{file ? file.name : isArabic ? 'اختر صورة للبدء' : 'Choose an image to start'}</span>
              <span className="upload-subtitle">JPG · PNG · WebP · GIF · BMP · SVG</span>
            </label>
            <input
              ref={inputRef}
              id="image-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
              className="sr-only"
              onChange={(event) => selectFile(event.target.files?.[0])}
            />

            <div className="control-grid">
              <label>
                <span>{isArabic ? 'الصيغة' : 'Output format'}</span>
                <select value={format} onChange={(event) => setFormat(event.target.value as CompressionFormat)}>
                  {Object.entries(formatLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                <span>{isArabic ? 'الجودة' : 'Quality'} ({Math.round(quality * 100)}%)</span>
                <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
              </label>
              <label>
                <span>{isArabic ? 'أقصى عرض' : 'Max width'}</span>
                <input inputMode="numeric" placeholder="Auto" value={maxWidth} onChange={(event) => setMaxWidth(event.target.value.replace(/\D/g, ''))} />
              </label>
              <label>
                <span>{isArabic ? 'أقصى ارتفاع' : 'Max height'}</span>
                <input inputMode="numeric" placeholder="Auto" value={maxHeight} onChange={(event) => setMaxHeight(event.target.value.replace(/\D/g, ''))} />
              </label>
            </div>

            <button className="primary-button" type="button" disabled={!file || busy} onClick={() => void process()}>
              {busy ? (isArabic ? 'جارٍ الضغط…' : 'Compressing…') : isArabic ? 'ضغط الصورة' : 'Compress image'}
            </button>
            {error && <p role="alert" className="error-box">{error}</p>}
          </div>

          <aside className="result-card" aria-live="polite">
            <p className="image-tool-eyebrow">{isArabic ? 'النتيجة' : 'RESULT'}</p>
            {result && file ? (
              <>
                <div className="result-number">{savings}%</div>
                <p className="result-caption">{isArabic ? 'تقليل في الحجم' : 'smaller file size'}</p>
                <dl className="stats-list">
                  <div><dt>{isArabic ? 'قبل' : 'Before'}</dt><dd>{formatBytes(file.size)}</dd></div>
                  <div><dt>{isArabic ? 'بعد' : 'After'}</dt><dd>{formatBytes(result.blob.size)}</dd></div>
                  <div><dt>{isArabic ? 'الأبعاد' : 'Dimensions'}</dt><dd>{result.width} × {result.height}</dd></div>
                  <div><dt>{isArabic ? 'الصيغة' : 'Format'}</dt><dd>{formatLabels[format]}</dd></div>
                </dl>
                <a className="download-button" href={downloadUrl} download={`flixo-compressed.${extensionFor(format)}`}>
                  {isArabic ? 'تنزيل الصورة' : 'Download image'}
                </a>
              </>
            ) : (
              <div className="empty-result">{isArabic ? 'ستظهر هنا إحصاءات الصورة الناتجة بعد المعالجة.' : 'Your verified output statistics will appear here.'}</div>
            )}
          </aside>
        </section>

        <section className="content-section">
          <h2>{isArabic ? 'ضغط الصور بدون رفعها إلى خادم' : 'Compress images without uploading them'}</h2>
          <p>
            {isArabic
              ? 'تُعالج الصور داخل متصفحك. اختر الجودة والصيغة والمقاس، ثم احصل على ملف جديد جاهز للتنزيل.'
              : 'Images are processed in your browser. Choose a quality level, output format, and optional dimensions, then download a new file.'}
          </p>
        </section>

        <section className="faq-section">
          <h2>{isArabic ? 'أسئلة شائعة' : 'Frequently asked questions'}</h2>
          <details><summary>{isArabic ? 'ما الصيغ المدعومة؟' : 'Which image formats are supported?'}</summary><p>{isArabic ? 'يمكنك إدخال JPG وPNG وWebP وGIF وBMP وSVG، ثم إخراج JPG أو PNG أو WebP.' : 'You can input JPG, PNG, WebP, GIF, BMP, and SVG, then export to JPG, PNG, or WebP.'}</p></details>
          <details><summary>{isArabic ? 'هل يتم حفظ صوري؟' : 'Are my images stored?'}</summary><p>{isArabic ? 'هذه النسخة تعالج الصورة داخل المتصفح ولا تحتاج إلى رفعها إلى خادم لمعالجة الضغط.' : 'This version processes the image in the browser and does not need to upload it to a server for compression.'}</p></details>
          <details><summary>{isArabic ? 'هل يمكنني تحديد حجم الصورة؟' : 'Can I resize while compressing?'}</summary><p>{isArabic ? 'نعم، يمكنك تحديد أقصى عرض أو ارتفاع وسيتم الحفاظ على نسبة الأبعاد.' : 'Yes. Set an optional maximum width or height and the original aspect ratio is preserved.'}</p></details>
        </section>
      </div>
    </main>
  );
}
