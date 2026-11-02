export interface Video { label: string; query: string; id?: string }

// Search links always work. If you find a video you trust, put its 11-character id in `id` and it will play inside the app.
export const VIDEOS: Record<string, Video[]> = {
  lines: [
    { label: 'Types of lines in engineering drawing', query: 'types of lines in engineering drawing BIS thick thin dashed chain' },
    { label: 'Dimensioning basics', query: 'dimensioning rules engineering drawing extension line leader arrowhead' },
  ],
  points: [
    { label: 'Projection of points: all quadrants', query: 'projection of points first angle engineering drawing quadrants' },
    { label: 'Point on HP / VP / both', query: 'projection of points in HP VP engineering graphics' },
  ],
  special: [
    { label: 'Line parallel and perpendicular to planes', query: 'projection of lines parallel perpendicular to HP VP engineering drawing' },
  ],
  inclined: [
    { label: 'Line inclined to one plane', query: 'projection of line inclined to HP parallel to VP engineering drawing' },
    { label: 'Line inclined to both planes', query: 'projection of lines inclined to both HP and VP trapezoid method' },
  ],
  derived: [
    { label: 'Find true length and inclination', query: 'projection of lines find true length inclination engineering graphics' },
  ],
};

VIDEOS.lettering = [
  { label: 'Lettering: capital letters and numerals', query: 'engineering drawing lettering single stroke capital letters numerals 10 mm' },
  { label: 'Title block and border on drawing sheet', query: 'engineering drawing sheet border title block A2 layout' },
];

/** Videos for ONE question: a search for the exact question text first, then the topic videos. */
export function questionVideos(q: { code: string; title: string; statement: string; topic: string }): Video[] {
  const text = q.statement.replace(/\s+/g, ' ').slice(0, 110).replace(/[,.;:]?\s\S*$/, '');
  return [
    { label: `This exact question: ${q.code} ${q.title}`, query: `${text} engineering drawing solution` },
    { label: `${q.code} ${q.title}: step by step`, query: `${q.title} ${q.topic === 'lines' ? 'types of lines Fig 3-2 engineering drawing sheet 1' : q.topic === 'lettering' ? 'engineering drawing lettering' : 'projection of lines and points engineering drawing'} solved` },
    ...(VIDEOS[q.topic] ?? []),
  ];
}

export const ytUrl = (v: Video) => v.id ? `https://www.youtube.com/watch?v=${v.id}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(v.query)}`;
