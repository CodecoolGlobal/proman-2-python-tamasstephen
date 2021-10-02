import {dataHandler} from "../data/dataHandler.js";
import {createStatusBoxes} from "../model/status.js";
import {cardsManager} from "./cardsManager.js";

async function statusBoardManager(board){
    const boardId = board.id;
    const statusesResponse = await dataHandler.getStatusesByBoardId(boardId);
    if (statusesResponse.statusText === "OK") {
        const boardStatuses = await statusesResponse.json()
        const myBoard = document.querySelector(`[data-board-id="${boardId}"]`).closest(".board-container")
        const myStatusContainer = myBoard.querySelector('div[class="status-container"]')
        for (const status of boardStatuses){
            myStatusContainer.appendChild(createStatusBoxes(status, board.id));
        }
        myStatusContainer.classList.add("invisible");
        cardsManager.loadCards(boardId)
    } else {
        console.log("Error in data request")
    }
}

export default statusBoardManager;
