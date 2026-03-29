export const runtime = 'edge';
export const alt = 'AI Job Risk Calculator - Will AI Take Your Job?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const IMAGE_URL = 'https://lh3.googleusercontent.com/d/1fzx8tXCsus1SUc1A4Gsjl9UmlLR3r4bg';

export default async function Image() {
  const res = await fetch(IMAGE_URL);
  const imageData = await res.arrayBuffer();

  return new Response(imageData, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
