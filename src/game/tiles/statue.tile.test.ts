import {restoreTile} from './tile.factory';
import {StatueTile} from './statue.tile';

describe('StatueTile', () => {
  it('provides stable bump text and preserves its inscription', () => {
    const statue = new StatueTile('nameless-warden', 'green-bronze');
    statue.setExplored(true);
    statue.setBloody(true);
    expect(statue.getBumpMessages()).toEqual([
      'A green-patinated bronze statue depicts an armored warden bearing the later-carved flame of Cyranth.',
      'Order script reads: "Lantern Site Seven. The dark yields to flame."',
    ]);
    const restored = restoreTile(statue.toSaveData()) as StatueTile;
    expect(restored.inscriptionId).toBe('nameless-warden');
    expect(restored.variantId).toBe('green-bronze');
    expect(restored.isExplored()).toBe(true);
    expect(restored.getIsBloody()).toBe(true);
  });

  it('rejects unknown inscription IDs', () => {
    expect(() => restoreTile({kind: 'statue', explored: true, bloody: false, inscriptionId: 'unknown'})).toThrow();
  });

  it('restores old statues without a variant as weathered stone', () => {
    const restored = restoreTile({
      kind: 'statue', explored: false, bloody: false, inscriptionId: 'forgotten-king',
    }) as StatueTile;

    expect(restored.variantId).toBe('weathered-stone');
  });

  it('rejects unknown statue variants', () => {
    expect(() => restoreTile({
      kind: 'statue', explored: true, bloody: false,
      inscriptionId: 'forgotten-king', statueVariantId: 'unknown',
    })).toThrow();
  });
});
