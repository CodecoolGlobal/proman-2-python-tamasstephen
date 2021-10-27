import { boardsManager } from "./controller/boardsManager.js";
import {addEventOnBin, setUpDropTargets} from "./model/cards.js";
import util from "./util/util.js";

async function init() {
  await boardsManager.loadBoards();
  util.wait(300).then(() => addEventOnBin());
  const evtSource = new EventSource('/api/fire-server-event');
  evtSource.addEventListener('omg', (e)=>{
    console.log(e)
  })
}

await init();
