import { boardsManager } from "./controller/boardsManager.js";
import {addEventOnBin} from "./model/cards.js";

async function init() {
  await boardsManager.loadBoards();
  addEventOnBin();
}

await init();
