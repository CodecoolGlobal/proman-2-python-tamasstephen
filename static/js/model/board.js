import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import util from  "../util/util.js"

export { addNewBoard }


function addNewBoard(){
  const boardBuilder = htmlFactory(htmlTemplates.board);
  const board = boardBuilder({"title": "", "id": "pending_board"});
  domManager.addChild("#root", board);
  nameNewBoard();
}

function nameNewBoard(){
  const headline = document.querySelector('div[data-board-id="pending_board"]');
  headline.innerHTML = `<input type="text" name="board_name" id="name_new_board">`
  const input = document.querySelector("#name_new_board");
  input.addEventListener("keydown", handleInputSaveBoardName);
  input.focus();
  util.wait(100).then(()=> document.body.addEventListener('click', clickOutside) )
}

async function handleInputSaveBoardName(e){
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
     setNewBoardData(board, button, boardDataResponse);
     //e.currentTarget.remove(); //TODO: Why we don't need that?
     document.body.removeEventListener("click", clickOutside);
   }
  }
}

function setNewBoardData(board, button, data){
  const [boardId, boardName] = [data["id"], data["title"]]
  board.textContent = boardName;
  board.dataset.boardId = boardId;
  button.dataset.boardId = boardId;
  board.closest(".board-container").querySelector(".status-container").dataset.boardId=boardId;

}

function removeBoard(board){
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