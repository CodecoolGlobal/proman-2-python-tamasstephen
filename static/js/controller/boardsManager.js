import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import {addNewBoard, createRegistrationWindow, renameBoard, handleLogout, createLoginWindow, getBoardsByUser, deleteBoard} from "../model/board.js";
import statusBoardManager from "./statusManager.js";
import {addNewStatus} from "../model/status.js";
import {setUpDropTargets} from "../model/cards.js";
import util from "../util/util.js";
import {renameColumn} from "../model/status.js";


export let boardsManager = {
    loadBoards: async function () {
        const addBoard = document.querySelector("#create_board");
        addBoard.addEventListener("click", addNewBoard);
        const boards = await getBoardsByUser();
        for (let board of boards) {
            const boardBuilder = htmlFactory(htmlTemplates.board);
            const content = boardBuilder(board);
            domManager.addChild("#root", content);
            await statusBoardManager(board);
            setUpBoardEvents(board);
        }
        renameColumn();
        renameBoard();
        setUpPageEvents();
    },
};

export function showHideButtonHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    document.querySelector(`.status-container[data-board-id="${boardId}"]`).classList.toggle("invisible");
    document.querySelector(`.add-new-status-button[data-board-id="${boardId}"]`).classList.toggle("invisible");
}


function setUpBoardEvents(board){
    domManager.addEventListener(
        `.toggle-board-button[data-board-id="${board.id}"]`,
        "click",
        showHideButtonHandler
    );
    domManager.addEventListener(
        `.add-new-status-button[data-board-id="${board.id}"`,
        'click',
        addNewStatus);
    domManager.addEventListener(
        `.delete-board[data-board-id="${board.id}"`,
        'click',
        deleteBoard);
}

function setUpPageEvents(){
    const regButton = document.querySelector("#register");
    if(regButton){
        regButton.addEventListener("click", createRegistrationWindow);
        document.querySelector("#login").addEventListener("click", createLoginWindow);
    } else {
        document.querySelector("#logout").addEventListener("click", handleLogout);
        document.querySelector("#create_private_board").addEventListener("click", addNewBoard);
    }
    util.wait(300).then(() => setUpDropTargets());
}
