import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import {addNewBoard, createRegistrationWindow, renameBoard, handleLogout} from "../model/board.js";
import statusBoardManager from "./statusManager.js";
import {addNewStatus} from "../model/status.js";
import {setUpDropTargets} from "../model/cards.js";
import util from "../util/util.js";

export let boardsManager = {
    loadBoards: async function () {
        const addBoard = document.querySelector("#create_board");
        addBoard.addEventListener("click", addNewBoard);
        const boards = await dataHandler.getBoards();
        for (let board of boards) {
            const boardBuilder = htmlFactory(htmlTemplates.board);
            const content = boardBuilder(board);
            domManager.addChild("#root", content);
            await statusBoardManager(board);
            domManager.addEventListener(
                `.toggle-board-button[data-board-id="${board.id}"]`,
                "click",
                showHideButtonHandler
            );
            domManager.addEventListener(
                `.add-new-status-button[data-board-id="${board.id}"`,
                'click',
                addNewStatus);
        }
        renameBoard();
        const regButton = document.querySelector("#register");
        if(regButton){
            regButton.addEventListener("click", createRegistrationWindow);
        } else {
            document.querySelector("#logout").addEventListener("click", handleLogout);
        }
        util.wait(300).then(() => setUpDropTargets());
    },
};

export function showHideButtonHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    document.querySelector(`.status-container[data-board-id="${boardId}"]`).classList.toggle("invisible");
    document.querySelector(`.add-new-status-button[data-board-id="${boardId}"]`).classList.toggle("invisible");
}



