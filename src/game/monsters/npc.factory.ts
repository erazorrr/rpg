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
  standardNpc(Wolf),
  standardNpc(Ogre),
  standardNpc(OgreMage),
  standardNpc(Skeleton),
  standardNpc(SkeletonArcher),
  standardNpc(SkeletonMage),
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

export function restoreNpc(context: Context, level: Level, data: NpcSave): Npc {
  const registration = registrations.get(data.kind);
  if (!registration) throw new Error(`Unknown NPC: ${data.kind}`);
  return registration.create(context, level, data);
}
