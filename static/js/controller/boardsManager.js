import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import { cardsManager } from "./cardsManager.js";

export let boardsManager = {
  loadBoards: async function () {
    const addBoard = document.querySelector("#create_board")
    addBoard.addEventListener("click", addNewBoard);
    const boards = await dataHandler.getBoards();
    for (let board of boards) {
      const boardBuilder = htmlFactory(htmlTemplates.board);
      const content = boardBuilder(board);
      domManager.addChild("#root", content);
      domManager.addEventListener(
        `.toggle-board-button[data-board-id="${board.id}"]`,
        "click",
        showHideButtonHandler
      );
    }
  },
};

function showHideButtonHandler(clickEvent) {
  const boardId = clickEvent.target.dataset.boardId;
  cardsManager.loadCards(boardId);
}

function addNewBoard(){
  const boardBuilder = htmlFactory(htmlTemplates.board);
  const board = boardBuilder({"title": "", "id": "pending_board"});
  domManager.addChild("#root", board);
  nameNewBoard();
}

//TODO: in the eventListener the .closest does not work, ask why
function nameNewBoard(){
  const headline = document.querySelector('div[data-board-id="pending_board"]');
  headline.innerHTML = `<input type="text" name="board_name" id="name_new_board">`
  const input = document.querySelector("#name_new_board");
  input.addEventListener("keypress", handleInputSaveName)
}

function handleInputSaveName(e){
  if(e.key === "Enter"){
   const newName = e.currentTarget.value;
   const board = document.querySelector('div [data-board-id="pending_board"]')
   const button = document.querySelector('button[class="toggle-board-button"][data-board-id="pending_board"]')
   // const input = document.querySelector("#name_new_board");
   // console.log(input.closest("div")); // TODO: ask why it does not work if I save the current target
   if (newName.length < 1 ){
     console.log("hey!");
   } else {
     board.textContent = newName;
     board.dataset.boardId = "dummy";
     button.dataset.boardId = "dummy";
     e.currentTarget.remove();
   }
  }
}


