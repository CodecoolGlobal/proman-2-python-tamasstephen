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

//TODO: in the eventListener the .closest only works if we grab the element with the
//TODO: -query selector, if we target the e.currentTarget it does nothing (we get null)
function nameNewBoard(){
  const headline = document.querySelector('div[data-board-id="pending_board"]');
  headline.innerHTML = `<input type="text" name="board_name" id="name_new_board">`
  const input = document.querySelector("#name_new_board");
  input.addEventListener("keydown", handleInputSaveName);
  input.focus();
  wait(100).then(()=> document.body.addEventListener('click', clickOutside) )
}

async function handleInputSaveName(e){
  const board = document.querySelector('div [data-board-id="pending_board"]');
  const myInput = document.querySelector("#name_new_board");
  if (e.key === "Escape"){
    removeBoard(board);
  }
  if(e.key === "Enter"){
   const newName = e.currentTarget.value;
   const button = document.querySelector('button[class="toggle-board-button"][data-board-id="pending_board"]')
   if (newName.length < 1 ){
     e.currentTarget.classList.add("error");
     myInput.closest("div").classList.add("error");
   } else {
     myInput.closest("div").classList.remove("error");
     const boardDataResponse = await dataHandler.createNewBoard(newName);
     const [boardId, boardName] = [boardDataResponse["id"], boardDataResponse["title"]]
     board.textContent = boardName;
     board.dataset.boardId = boardId;
     button.dataset.boardId = boardId;
     //e.currentTarget.remove(); //TODO: Why we don't need that?
     document.body.removeEventListener("click", clickOutside);
   }
  }
}

function removeBoard(board){
  const parentDiv = board.closest(".board-container");
  parentDiv.remove();
  document.body.removeEventListener("click", clickOutside);
}

function clickOutside(e) {
  const input = document.querySelector("#name_new_board");
  if (e.target !== input) {
    const boardContainer = input.closest(".board-container");
    boardContainer.remove();
    document.body.removeEventListener("click", clickOutside);
  }
}


//util
function wait(ms){
  return new Promise((resolve) => { return setTimeout(resolve, ms) });
}
