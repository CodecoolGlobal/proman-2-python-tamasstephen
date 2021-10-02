import {dataHandler} from "../data/dataHandler.js";

async function statusManager(board){
    const boardId = board.id;
    const statusesResponse = await dataHandler.getStatusesByBoardId(boardId);
    if (statusesResponse.statusText === "OK") {
        const boardStatuses = await statusesResponse.json()
        const myBoard = document.querySelector(`[data-board-id="${boardId}"]`).closest(".board-container")
        const myStatusContainer = myBoard.querySelector('div[class="status-container"]')
        for (const status of boardStatuses){
            myStatusContainer.appendChild(createStatusBoxes(status));
            myStatusContainer.classList.add("invisible");
        }
    } else {
        console.log("Error in data request")
    }
}

function createStatusBoxes(statusData){
    const statusBox = document.createElement("div");
    statusBox.classList.add("status-box");
    statusBox.dataset.statusId = statusData.id
    statusBox.innerHTML =` <p class="status-headline">${statusData.title}</p>
                           <div class="status-col" data-status-id="${statusData.id}"></div>`
    return statusBox
}

export default statusManager;
