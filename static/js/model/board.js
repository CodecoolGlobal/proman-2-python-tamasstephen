import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates, formBuilder, errorBlock} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import util from "../util/util.js";
import {createStatusBoxes, addNewStatus } from "./status.js";
import {showHideButtonHandler} from "../controller/boardsManager.js";
import {boardsManager} from "../controller/boardsManager.js"; // need to create a new one -> a more suitable one
import {addNewCard, initContainerForDragEvents} from "./cards.js";

export {addNewBoard, removeBoard, renameBoard, createRegistrationWindow, handleLogout, createLoginWindow};


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
        if (newName.length < 1) {
            e.currentTarget.classList.add("error");
            myInput.closest("div").classList.add("error");
        } else {
            await createNewBoard(newName, myInput, board)
        }
    }
}

async function createNewBoard(newName, myInput, board){
    const newBoardButton = document.querySelector('button[class="toggle-board-button"][data-board-id="pending_board"]');
    const newStatusButton = document.querySelector('.add-new-status-button[data-board-id="pending_board"]');
    myInput.closest("div").classList.remove("error");
    const boardDataResponse = await dataHandler.createNewBoard(newName);
    await setNewBoardData(board, newBoardButton, newStatusButton, boardDataResponse);
    board.addEventListener('click', handleRename);
    document.body.removeEventListener("click", clickOutside);
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
    const baseStatuses = await statusResponse.json();
    for (const status of baseStatuses) {
        myStatusContainer.appendChild(createStatusBoxes(status, boardId));
        await connectStatusWithBoard(status.id, boardId);
    }
    setUpBoardListeners(myBoardContainer, myStatusContainer);
}

function setUpBoardListeners(myBoardContainer, myStatusContainer){
    const addNewStatusBtn = myBoardContainer.querySelector(".add-new-status-button");
    const toggleBStatusBtn = myBoardContainer.querySelector(".toggle-board-button");
    const cardHandlers = myStatusContainer.querySelectorAll(".status-col");
    cardHandlers.forEach(handler => initContainerForDragEvents(handler))
    addNewStatusBtn.addEventListener('click', addNewStatus);
    toggleBStatusBtn.addEventListener('click', showHideButtonHandler);
    const cardLinks = myStatusContainer.querySelectorAll(".new-card-link");
    cardLinks.forEach(link => link.addEventListener('click', addNewCard));
    myStatusContainer.classList.add("invisible");
}

async function connectStatusWithBoard(statusId, boardId) {
    const connectionData = await dataHandler.bindStatusToBoard(statusId, boardId);
    await connectionData.json();
}

function removeBoard(board) {
    const parentDiv = board.closest(".board-container");
    parentDiv.remove();
    document.body.removeEventListener("click", clickOutside);
}

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
    handleInputField(boardID, fnc, board);
}

function handleInputField(boardID, fnc, board) {
    document.querySelector('#rename_the_board').addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            let newBoardName = e.currentTarget.value;
            if (newBoardName.length < 1) {
                board.classList.add("error");
            } else {
                e.currentTarget.parentNode.textContent = newBoardName;
                await dataHandler.renameCurrentBoard(newBoardName, boardID);
                board.classList.remove("error");
                document.body.removeEventListener('click', fnc);
                board.addEventListener('click', handleRename);
            }
        }
    });
}

function handleWrapper(currentName, board) {
    function handleRenameClickOutside(e) {
        const inputField = document.querySelector('#rename_the_board');
        if (e.target !== inputField) {
            board.innerHTML = currentName;
            document.body.removeEventListener('click', handleRenameClickOutside);
            board.addEventListener('click', handleRename);
            board.classList.remove("error");
        }
    }
    return handleRenameClickOutside;
}

function createRegistrationWindow(){
    setUpPopupForm("Registration")
}

function createLoginWindow(){
    setUpPopupForm("Login")
}

function setUpPopupForm(useCase){
    const regPopup = formBuilder(useCase);
    document.querySelector("#root").insertAdjacentHTML("beforebegin", regPopup);
    const form = document.querySelector("form");
    const popupOuter = document.querySelector(".popup-wrapper");
    const popupBehaviour = useCase === "Registration"
        ? setUpUserForm(dataHandler.postRegistrationData, getFormErrorMessages("Registration"))
        : setUpUserForm(dataHandler.handleLogin, getFormErrorMessages("Login"));
    form.addEventListener("submit", popupBehaviour);
    popupOuter.addEventListener("click", (e)=> {
        if (e.target === popupOuter){
            document.querySelector(".popup-wrapper").remove();
        }
    })
}

function getFormErrorMessages(useCase){
   return useCase === "Registration"
       ? {firstError: "Both fields must be filled!", secondError: "This username already exists!"}
       : {firstError: "Both fields must be filled!", secondError: "The username or password is incorrect!"};
}


function setUpUserForm(callback, messageObj){
    async function handleForm(e){
        e.preventDefault();
        const [username, password] = [e.currentTarget.username, e.currentTarget.password];
        if(username.value.length < 1 || password.value.length < 1){
            handleFormError(messageObj.firstError)
        } else {
            const validUserResponse = await callback(username.value, password.value);
            const isValidUsername = await validUserResponse.json(); // after refactoring we don't need this line
            if(isValidUsername){
                document.querySelector(".popup-wrapper").remove();
                location.replace("/");
            } else {
                handleFormError(messageObj.secondError)
            }
        }
    }
    return handleForm
}

function handleFormError(errorMsg){
   const existingError = document.querySelector(".error-msg-element");
   existingError ? existingError.remove() : "";
   const errorDiv = errorBlock(errorMsg);
   document.querySelector("form").querySelector("h2").insertAdjacentHTML("afterend", errorDiv)
}

async function handleLogout(){
    await dataHandler.handleLogout();
    location.replace("/");
}
