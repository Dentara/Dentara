// lib/calendar/lanes.ts
export type Packed = Map<string, { lane: number; lanesCount: number }>;

type RawEvt = {
  id: string;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
};

/**
 * Eyni vaxt zolağında üst-üstə düşən görüşlərə "lane" (sütun) təyin edir.
 * Greedy: hər event üçün ilk boş lane seçilir. lanesCount — maksimum paralel sayıdır.
 */
export function assignLanes(events: RawEvt[], maxColumns = 5): Packed {
  // Saatları dəqiqəyə çevir
  const toMin = (t: string) => {
    const [h, m] = (t || "00:00").split(":").map((x) => parseInt(x || "0", 10));
    return h * 60 + m;
  };
  const evts = events
    .map((e) => ({ ...e, s: toMin(e.start), e: toMin(e.end) }))
    .sort((a, b) => (a.s - b.s) || (a.e - b.e));

  const lanesEnd: number[] = [];         // hər lane üzrə son (dəqiqə)
  const packed: Packed = new Map();
  let globalMax = 0;

  for (const ev of evts) {
    // ilk boş lane-i tap
    let lane = 0;
    while (lane < lanesEnd.length && lanesEnd[lane] > ev.s) lane++;
    lanesEnd[lane] = ev.e;
    globalMax = Math.max(globalMax, lanesEnd.length);
    packed.set(ev.id, { lane, lanesCount: Math.min(globalMax, maxColumns) });
  }
  // Son pass: bütün entry-lərdə eyni lanesCount istifadə et (vizual sabitlik üçün)
  for (const [id, v] of packed) packed.set(id, { lane: v.lane, lanesCount: Math.min(globalMax, maxColumns) });
  return packed;
}
