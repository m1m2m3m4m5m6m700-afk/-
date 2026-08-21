import { useEffect } from 'react';
import { ImageCompressor } from './index';

export function EnglishImageCompressorPage() {
  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    return () => {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    };
  }, []);

  return <ImageCompressor locale="en" />;
}

export function ArabicImageCompressorPage() {
  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    return () => {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    };
  }, []);

  return <ImageCompressor locale="ar" />;
}
