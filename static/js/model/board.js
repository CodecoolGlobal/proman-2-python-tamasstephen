import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import util from "../util/util.js";
import {createStatusBoxes, addNewStatus} from "./status.js";
import {showHideButtonHandler} from "../controller/boardsManager.js";
import {boardsManager} from "../controller/boardsManager.js";
import {addNewCard} from "./cards.js";

export {addNewBoard, removeBoard, renameBoard};


function addNewBoard() {
    const boardBuilder = htmlFactory(htmlTemplates.board);
    const board = boardBuilder({"title": "", "id": "pending_board"});
    util.wait(10).then(() => {
        domManager.addChild("#root", board);
        nameNewBoard();
    });
}

function nameNewBoard() {
    const headline = document.querySelector('div[data-board-id="pending_board"]');
    headline.innerHTML = `<input type="text" name="board_name" id="name_new_board">`;
    const input = document.querySelector("#name_new_board");
    input.addEventListener("keydown", handleInputSaveBoardName);
    input.focus();
    util.wait(100).then(() => document.body.addEventListener('click', clickOutside));
}

async function handleInputSaveBoardName(e) {
    const board = document.querySelector('div [data-board-id="pending_board"]');
    const myInput = document.querySelector("#name_new_board");
    if (e.key === "Escape") {
        removeBoard(board);
    }
    if (e.key === "Enter") {
        const newName = e.currentTarget.value;
        const newBoardButton = document.querySelector('button[class="toggle-board-button"][data-board-id="pending_board"]');
        const newStatusButton = document.querySelector('.add-new-status-button[data-board-id="pending_board"]');
        if (newName.length < 1) {
            e.currentTarget.classList.add("error");
            myInput.closest("div").classList.add("error");
        } else {
            myInput.closest("div").classList.remove("error");
            const boardDataResponse = await dataHandler.createNewBoard(newName);
            await setNewBoardData(board, newBoardButton, newStatusButton, boardDataResponse);
            document.body.removeEventListener("click", clickOutside);
        }
    }
}

async function setNewBoardData(board, buttonBoard, buttonStatus, data) {
    const [boardId, boardName] = [data["id"], data["title"]];
    board.textContent = boardName;
    board.dataset.boardId = boardId;
    buttonBoard.dataset.boardId = boardId;
    buttonStatus.dataset.boardId = boardId;
    board.closest(".board-container").querySelector(".status-container").dataset.boardId = boardId;
    await setStatusBaseContent(board, boardId);
}

async function setStatusBaseContent(board, boardId) {
    const myBoardContainer = board.closest(".board-container");
    const myStatusContainer = myBoardContainer.querySelector('div[class="status-container"]');
    const statusResponse = await dataHandler.getDefaultStatuses();
    if (statusResponse.statusText === "OK") {
        const baseStatuses = await statusResponse.json();
        for (const status of baseStatuses) {
            myStatusContainer.appendChild(createStatusBoxes(status, boardId));
            await connectStatusWithBoard(status.id, boardId);
        }
    } else {
        console.log("Where is our request?");
    }
    const addNewStatusBtn = myBoardContainer.querySelector(".add-new-status-button");
    const toggleBStatusBtn = myBoardContainer.querySelector(".toggle-board-button");
    addNewStatusBtn.addEventListener('click', addNewStatus);
    toggleBStatusBtn.addEventListener('click', showHideButtonHandler);
    const cardLinks = myStatusContainer.querySelectorAll(".new-card-link");
    cardLinks.forEach(link => link.addEventListener('click', addNewCard));
    myStatusContainer.classList.add("invisible");
}

async function connectStatusWithBoard(statusId, boardId) {
    const connectionData = await dataHandler.bindStatusToBoard(statusId, boardId);
    if (connectionData.statusText === "OK") {
        const responseValue = await connectionData.json();
    } else {
        console.log("Could not connect board to status");
    }
}

function removeBoard(board) {
    const parentDiv = board.closest(".board-container");
    parentDiv.remove();
    document.body.removeEventListener("click", clickOutside);
}

// replace from util
function clickOutside(e) {
    const input = document.querySelector("#name_new_board");
    if (e.target !== input) {
        removeBoard(input);
    }
}


function renameBoard() {
    const boards = document.querySelectorAll('.board');
    boards.forEach(board => board.addEventListener('click', handleRename));
}


function handleRename(event) {
    const board = event.currentTarget;
    board.removeEventListener('click', handleRename);
    const boardID = board.attributes[1].value;
    const currentName = board.innerHTML;
    board.innerHTML = `<input value="${currentName}"type="text" name="board_name" id="rename_the_board">`;
    let currentRenameInput = document.getElementById('rename_the_board');
    currentRenameInput.focus();
    const fnc = handleWrapper(currentName, board);
    util.wait(100).then(() => document.body.addEventListener('click', fnc));
    handleInputField(boardID);
}


function handleInputField(boardID) {
    document.querySelector('#rename_the_board').addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const parentDiv = document.querySelector('.board-container');
            let newBoardName = e.currentTarget.value;
            if (newBoardName.length < 1) {
                parentDiv.classList.add("error");
            } else {
                e.currentTarget.parentNode.textContent = newBoardName;
                await dataHandler.renameCurrentBoard(newBoardName, boardID);
                parentDiv.classList.remove("error");
            }
        }
    });
}

function handleWrapper(currentName, board) {
    function handleRenameClickOutside(e) {
        console.log(e);
        const inputField = document.querySelector('#rename_the_board');
        console.log(board);
        console.log(e.target);
        if (e.target !== inputField) {
            console.log('kiskacsa');
            board.innerHTML = currentName;
            document.body.removeEventListener('click', handleRenameClickOutside);
            board.addEventListener('click', handleRename);
        }
    }

    return handleRenameClickOutside;
}
