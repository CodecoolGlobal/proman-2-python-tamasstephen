import util from "../util/util.js";
import {dataHandler} from "../data/dataHandler.js";
import {addNewCard, initContainerForDragEvents} from "./cards.js";
import {boardsManager} from "../controller/boardsManager.js";

export {createStatusBoxes, addNewStatus, renameColumn};

async function addNewStatus(e) {
    const boardId = e.target.dataset.boardId;
    const statusWrapper = document.querySelector(`.status-container[data-board-id="${boardId}"]`);
    const newStatus = createStatusBoxes({title: "", id: "pending-id"}, boardId);
    await util.wait(1);
    statusWrapper.appendChild(newStatus);
    newStatus.querySelector(".status-headline").innerHTML = util.createNewInput("status_name", "create-new-status-name");
    //The same ------> we need a callback function
    const myInput = document.querySelector("#create-new-status-name");
    myInput.addEventListener("keydown", handleInputSaveStatus); //the callback is not the same
    myInput.focus();
    //Till here
    util.wait(1).then(() => document.body.addEventListener("click", clickOutsideStatus));
}

// more of a html factory function
function createStatusBoxes(statusData, boardId) {
    const statusBox = document.createElement("div");
    statusBox.classList.add("status-box");
    statusBox.dataset.statusId = statusData.id;
    statusBox.dataset.boardId = boardId;
    statusBox.innerHTML = ` <p class="status-headline" data-board-id="${boardId}" data-status-id="${statusData.id}">${statusData.title}</p>
                           <p class="new-card-link" data-board-id="${boardId}" data-status-id="${statusData.id}">Add new card</p>
                           <div class="status-col" data-status-id="${statusData.id}" data-board-id="${boardId}"></div>`;
    return statusBox;
}

//TODO: refactor combine with the cards
async function handleInputSaveStatus(e) {
    const boardId = document.querySelector('.status-box[data-status-id="pending-id"]').dataset.boardId;
    const myInput = document.querySelector("#create-new-status-name");
    //this is the same
    if (e.key === "Escape") {
        removeStatusBox(myInput, `.status-box[data-status-id="pending-id"]`, clickOutsideStatus);
    }
    //till here
    if (e.key === "Enter") {
        const newName = e.currentTarget.value;
        if (newName.length < 1) {
            e.currentTarget.classList.add("error");
            myInput.closest("div").classList.add("error");
        } else {
            myInput.closest("div").classList.remove("error");
            const cardHolder = myInput.closest("div").querySelector(".status-col");
            const addNewCardBtn = myInput.closest("div").querySelector(".new-card-link");
            addNewCardBtn.addEventListener("click", addNewCard);
            const statusResponse = await dataHandler.createNewStatus(newName); //different datahandler func
            const newStatus = await statusResponse.json();
            await dataHandler.bindStatusToBoard(newStatus.id, boardId); //we don't need that in other funcs
            myInput.closest("p").textContent = newName; //different selector
            setStatusData(newStatus);
            initContainerForDragEvents(cardHolder);
            document.body.removeEventListener("click", clickOutsideStatus); //different callback
        }
    }
}

function removeStatusBox(element, parentString, callBack) {
    const parentDiv = element.closest(parentString);
    parentDiv.remove();
    document.body.removeEventListener("click", callBack);
}

function clickOutsideStatus(e) {
    const clickTarget = document.querySelector("#create-new-status-name");
    if (e.target !== clickTarget) {
        removeStatusBox(clickTarget, ".status-box", clickOutsideStatus);
    }
}

function setStatusData(statusData) {
    const newStatus = document.querySelector('.status-box[data-status-id="pending-id"]');
    const statusHeadline = newStatus.querySelector(".status-headline");
    const statusLink = newStatus.querySelector(".new-card-link");
    const statusCol = newStatus.querySelector(".status-col");
    newStatus.dataset.statusId = statusData.id;
    statusHeadline.dataset.statusId = statusData.id;
    statusLink.dataset.statusId = statusData.id;
    statusCol.dataset.statusId = statusData.id;
}


function renameColumn() {
    const columns = document.querySelectorAll('.status-headline');
    console.log(columns);
    columns.forEach(column => column.addEventListener('click', handleRenameColumn));
}


function handleRenameColumn(event) {
    const column = event.currentTarget;
    console.log(column);
    const columnId = column.attributes[2].value;
    const boardId = column.attributes[1].value;
    column.removeEventListener('click', handleRenameColumn);
    const currentName = column.innerHTML;
    column.innerHTML = `<input value="${currentName}"type="text" name="column_name" id="rename_the_column">`;
    let currentInput = document.getElementById('rename_the_column');
    currentInput.focus();
    currentInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const newColumnName = e.currentTarget.value;
            e.currentTarget.parentNode.textContent = newColumnName;
            console.log(newColumnName);
            if(columnId === '1' || '2' || '3' || '4'){
                await dataHandler.createNewStatus(newColumnName)
            }
            else {
                console.log('false')
            }
        }
    });
}
