import {Renderer} from "./renderer";

export interface Renderable {
  render(renderer: Renderer): void;
}
