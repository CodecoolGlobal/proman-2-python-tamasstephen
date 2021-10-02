import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import { addNewBoard } from "../model/board.js";
import statusBoardManager from "./statusManager.js";

export let boardsManager = {
  loadBoards: async function () {
    const addBoard = document.querySelector("#create_board")
    addBoard.addEventListener("click", addNewBoard);
    const boards = await dataHandler.getBoards();
    for (let board of boards) {
      const boardBuilder = htmlFactory(htmlTemplates.board);
      const content = boardBuilder(board);
      domManager.addChild("#root", content);
      statusBoardManager(board);
      domManager.addEventListener(
        `.toggle-board-button[data-board-id="${board.id}"]`,
        "click",
        showHideButtonHandler
      );
    }
  },
};

export function showHideButtonHandler(clickEvent) {
  const boardId = clickEvent.target.dataset.boardId;
  document.querySelector(`.status-container[data-board-id="${boardId}"]`).classList.toggle("invisible");
}



