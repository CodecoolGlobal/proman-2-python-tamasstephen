export { createStatusBoxes }


function createStatusBoxes(statusData, boardId){
    const statusBox = document.createElement("div");
    statusBox.classList.add("status-box");
    statusBox.dataset.statusId = statusData.id;
    statusBox.dataset.boardId = boardId;
    statusBox.innerHTML =` <p class="status-headline">${statusData.title}</p>
                           <div class="status-col" data-status-id="${statusData.id}" data-board-id="${boardId}"></div>`
    return statusBox
}

