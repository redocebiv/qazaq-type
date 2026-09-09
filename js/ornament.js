/**
 * Procedural Kazakh ornament.
 *
 * The motif is qoshqar muiiz — ram's horns — the most common element in Kazakh
 * felt and textile ornament: a central stem with a pair of horns curling
 * outward and rolling back in on themselves. Defined once as an SVG symbol and
 * reused everywhere, so the decorative layer costs no image requests.
 */

/** One horn, curling out and back. Mirrored to make the pair. */
const HORN = 'M50 58 C50 38 62 24 76 23 C88 22 94 33 89 43 C85 51 74 53 69 46';
const STEM = 'M50 92 L50 58';

export function ornamentDefs() {
  return `
<svg class="ornament-defs" aria-hidden="true" focusable="false">
  <defs>
    <symbol id="horn" viewBox="0 0 100 100">
      <path d="${STEM}" />
      <path d="${HORN}" />
      <path d="${HORN}" transform="translate(100 0) scale(-1 1)" />
      <circle cx="50" cy="94" r="3.5" />
    </symbol>
  </defs>
</svg>`;
}

/** A horizontal band of alternating motifs, used to separate sections. */
export function divider(count = 5) {
  const motifs = Array.from({ length: count }, (_, i) => {
    const flip = i % 2 === 1 ? ' class="divider-motif flipped"' : ' class="divider-motif"';
    return `<svg${flip} viewBox="0 0 100 100" width="34" height="34"><use href="#horn"/></svg>`;
  }).join('');
  return `<div class="divider" aria-hidden="true">${motifs}</div>`;
}

/** A faint band of motifs pinned to the bottom of the viewport. */
export function watermark() {
  const motifs = Array.from(
    { length: 9 },
    (_, i) => `<use href="#horn" x="${i * 100}" y="0" width="100" height="100"/>`,
  ).join('');
  return `
<svg class="watermark" viewBox="0 0 900 100" preserveAspectRatio="xMidYMax slice"
     aria-hidden="true" focusable="false">${motifs}</svg>`;
}
