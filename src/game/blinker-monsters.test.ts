import {Position} from '../io/position';
import {Context} from './context';
import {Level} from './level';
import {OgreMage} from './monsters/ogre-mage';
import {PhaseSpider} from './monsters/phase-spider';
import {RiftWisp} from './monsters/rift-wisp';
import {restoreNpc} from './monsters/npc.factory';
import {Player} from './player';
import {Spell} from './spell';
import {BlinkSpell} from './spells/blink';

class TestPhaseSpider extends PhaseSpider {
  public selfSpell(): Spell | null { return this.getSelfSpell(); }
}

class TestRiftWisp extends RiftWisp {
  public selfSpell(): Spell | null { return this.getSelfSpell(); }
}

class TestOgreMage extends OgreMage {
  public selfSpell(): Spell | null { return this.getSelfSpell(); }
}

describe('blinking monsters', () => {
  afterEach(() => jest.restoreAllMocks());

  function world() {
    const player = {position: new Position(1, 1)} as Player;
    const context = {getPlayer: () => player} as Context;
    const level = {} as Level;
    return {context, level};
  }

  it('uses distinct close-range Blink chances', () => {
    const {context, level} = world();
    const position = new Position(2, 1);
    const spider = new TestPhaseSpider(context, level, position);
    const wisp = new TestRiftWisp(context, level, position);
    const ogre = new TestOgreMage(context, level, position);
    const random = jest.spyOn(Math, 'random');

    random.mockReturnValue(.29);
    expect(spider.selfSpell()).toBeInstanceOf(BlinkSpell);
    random.mockReturnValue(.3);
    expect(spider.selfSpell()).toBeNull();

    random.mockReturnValue(.44);
    expect(wisp.selfSpell()).toBeInstanceOf(BlinkSpell);
    random.mockReturnValue(.45);
    expect(wisp.selfSpell()).toBeNull();

    random.mockReturnValue(.24);
    expect(ogre.selfSpell()).toBeInstanceOf(BlinkSpell);
    random.mockReturnValue(.25);
    expect(ogre.selfSpell()).toBeNull();
  });

  it('gives the wisp a ranged rift attack', () => {
    const {context, level} = world();
    const wisp = new RiftWisp(context, level, new Position(4, 4));

    expect(wisp.getSpellLogic().attack[0].getName()).toBe('Rift Spark');
  });

  it('restores both monsters from stable save IDs', () => {
    const {context, level} = world();
    const spider = new PhaseSpider(context, level, new Position(2, 2));
    const wisp = new RiftWisp(context, level, new Position(3, 3));

    expect(restoreNpc(context, level, spider.toSaveData())).toBeInstanceOf(PhaseSpider);
    expect(restoreNpc(context, level, wisp.toSaveData())).toBeInstanceOf(RiftWisp);
  });
});
