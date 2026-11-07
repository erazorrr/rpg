import {Position} from "../../io/position";
import {Context} from "../context";
import {Level} from "../level";
import {Npc} from "../npc";
import {NpcSave} from "../save-data";
import {GoblinHunter} from "./goblin-hunter";
import {GoblinMage} from "./goblin-mage";
import {Goblin} from "./goblin";
import {OgreMage} from "./ogre-mage";
import {Ogre} from "./ogre";
import {SkeletonArcher} from "./skeleton-archer";
import {SkeletonMage} from "./skeleton-mage";
import {Skeleton} from "./skeleton";
import {TreasureGoblin} from "./treasure-goblin";
import {Wolf} from "./wolf";
import {EmberGuardian} from './ember-guardian';
import {AshenSkeleton} from './ashen-skeleton';
import {SteamBeetle} from './steam-beetle';
import {PhaseSpider} from './phase-spider';
import {RiftWisp} from './rift-wisp';
import {CaveLeech} from './cave-leech';
import {BloodBat} from './blood-bat';
import {Vampire} from './vampire';
import {CaveAsp} from './cave-asp';
import {FlameCinderling} from './flame-cinderling';
import {RimeCinderling} from './rime-cinderling';
import {GoblinSkirmisher} from './goblin-skirmisher';
import {KoboldTunnelGuard} from './kobold-tunnel-guard';
import {KoboldHookBearer} from './kobold-hook-bearer';
import {KoboldSalvekeeper} from './kobold-salvekeeper';
import {GnomeArcher} from './gnome-archer';
import {GnomeWarlock} from './gnome-warlock';
import {BoundFamiliar} from './bound-familiar';
import {WarmthFountain} from './warmth-fountain';
import {RimeProjector} from './rime-projector';
import {EmberTurret} from './ember-turret';

type NpcType = {readonly saveId: string};
type NpcRegistration = {
  type: NpcType;
  create: (context: Context, level: Level, data: NpcSave) => Npc;
};
type StandardNpcConstructor = NpcType & (new (context: Context, level: Level, position: Position) => Npc);

function standardNpc(Constructor: StandardNpcConstructor): NpcRegistration {
  return {
    type: Constructor,
    create: (context, level, data) => new Constructor(
      context,
      level,
      new Position(data.position.x, data.position.y),
    ),
  };
}

const npcRegistrations: NpcRegistration[] = [
  standardNpc(Goblin),
  standardNpc(GoblinHunter),
  standardNpc(GoblinMage),
  standardNpc(GoblinSkirmisher),
  standardNpc(Wolf),
  standardNpc(Ogre),
  standardNpc(OgreMage),
  standardNpc(Skeleton),
  standardNpc(SkeletonArcher),
  standardNpc(SkeletonMage),
  standardNpc(EmberGuardian),
  standardNpc(AshenSkeleton),
  standardNpc(SteamBeetle),
  standardNpc(PhaseSpider),
  standardNpc(RiftWisp),
  standardNpc(CaveLeech),
  standardNpc(BloodBat),
  standardNpc(Vampire),
  standardNpc(CaveAsp),
  standardNpc(FlameCinderling),
  standardNpc(RimeCinderling),
  standardNpc(KoboldTunnelGuard),
  standardNpc(KoboldHookBearer),
  {
    type: KoboldSalvekeeper,
    create: (context, level, data) => {
      if (!data.healer) throw new Error('Missing salvekeeper save data');
      const npc = new KoboldSalvekeeper(context, level, new Position(data.position.x, data.position.y));
      npc.restoreSalves(data.healer.charges);
      return npc;
    },
  },
  standardNpc(GnomeArcher),
  {
    type: GnomeWarlock,
    create: (context, level, data) => {
      if (!data.warlock) throw new Error('Missing warlock save data');
      const npc = new GnomeWarlock(
        context,
        level,
        new Position(data.position.x, data.position.y),
        data.warlock.id,
      );
      npc.restoreSummonsRemaining(data.warlock.summonsRemaining);
      return npc;
    },
  },
  {
    type: BoundFamiliar,
    create: (context, level, data) => {
      if (!data.familiar) throw new Error('Missing familiar save data');
      return new BoundFamiliar(
        context,
        level,
        new Position(data.position.x, data.position.y),
        data.familiar.ownerId,
      );
    },
  },
  standardNpc(WarmthFountain),
  {
    type: RimeProjector,
    create: (context, level, data) => {
      if (!data.mechanism) throw new Error('Missing Rime projector save data');
      const npc = new RimeProjector(context, level, new Position(data.position.x, data.position.y));
      npc.restoreCycle(data.mechanism.cycle);
      return npc;
    },
  },
  {
    type: EmberTurret,
    create: (context, level, data) => {
      if (!data.mechanism) throw new Error('Missing Ember turret save data');
      const npc = new EmberTurret(context, level, new Position(data.position.x, data.position.y));
      npc.restoreCycle(data.mechanism.cycle);
      return npc;
    },
  },
  {
    type: TreasureGoblin,
    create: (context, level, data) => {
      if (!data.treasure) throw new Error("Missing treasure goblin save data");
      const npc = new TreasureGoblin(
        context,
        level,
        new Position(data.position.x, data.position.y),
        data.treasure.cost,
      );
      npc.restoreTimer(data.treasure.timer, data.treasure.started);
      return npc;
    },
  },
];

const registrations = new Map<string, NpcRegistration>();
for (const registration of npcRegistrations) {
  if (registrations.has(registration.type.saveId)) {
    throw new Error(`Duplicate NPC save ID: ${registration.type.saveId}`);
  }
  registrations.set(registration.type.saveId, registration);
}

export const knownNpcSaveIds = new Set(registrations.keys());

export function restoreNpc(context: Context, level: Level, data: NpcSave): Npc {
  const registration = registrations.get(data.kind);
  if (!registration) throw new Error(`Unknown NPC: ${data.kind}`);
  return registration.create(context, level, data);
}
