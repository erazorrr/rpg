import { Item } from "./item";
import {Weapon} from "./items/weapons/weapon";

export class Equipment {
  public weapon?: Weapon;
  public chest?: Item;
  public gauntlets?: Item;
  public boots?: Item;
  public ring0?: Item;
  public ring1?: Item;
  public amulet?: Item;
}
