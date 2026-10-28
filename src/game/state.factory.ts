import {State} from "./state";
import {StateSave} from "./save-data";
import {ArmorState} from "./states/armor.state";
import {BurningState} from "./states/burning.state";
import {DexterityState} from "./states/dexterity.state";
import {FrozenState} from "./states/frozen.state";
import {StrengthState} from "./states/strength.state";
import {WisdomState} from "./states/wisdom.state";

type StateType = {readonly saveId: string};
type StateRegistration = {
  type: StateType;
  create: (data: StateSave) => State;
};

function stat(data: StateSave, key: string): number {
  return Number(data.stats[key] ?? 0);
}

const stateRegistrations: StateRegistration[] = [
  {type: ArmorState, create: data => new ArmorState(data.turns, stat(data, "armor"))},
  {type: BurningState, create: data => new BurningState(data.turns, stat(data, "damagePerTurn"))},
  {type: DexterityState, create: data => new DexterityState(data.turns, stat(data, "dexterityBonus"))},
  {type: FrozenState, create: data => new FrozenState(data.turns)},
  {type: StrengthState, create: data => new StrengthState(data.turns, stat(data, "strengthBonus"))},
  {type: WisdomState, create: data => new WisdomState(data.turns, stat(data, "wisdomBonus"))},
];

const registrations = new Map<string, StateRegistration>();
for (const registration of stateRegistrations) {
  if (registrations.has(registration.type.saveId)) {
    throw new Error(`Duplicate state save ID: ${registration.type.saveId}`);
  }
  registrations.set(registration.type.saveId, registration);
}

export function restoreState(data: StateSave): State {
  const registration = registrations.get(data.kind);
  if (!registration) throw new Error(`Unknown state: ${data.kind}`);
  return registration.create(data);
}
