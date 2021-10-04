import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import util from  "../util/util.js"
import {addNewStatus, createStatusBoxes} from "./status.js";
import {showHideButtonHandler} from "../controller/boardsManager.js"


export { addNewBoard, removeBoard }


function addNewBoard(){
  const boardBuilder = htmlFactory(htmlTemplates.board);
  const board = boardBuilder({"title": "", "id": "pending_board"});
  util.wait(10).then(()=>{
    domManager.addChild("#root", board);
    nameNewBoard();
  })
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
   const newBoardButton = document.querySelector('button[class="toggle-board-button"][data-board-id="pending_board"]');
   const newStatusButton = document.querySelector('.add-new-status-button[data-board-id="pending_board"]');
   console.log(newStatusButton);
   if (newName.length < 1 ){
     e.currentTarget.classList.add("error");
     myInput.closest("div").classList.add("error");
   } else {
     myInput.closest("div").classList.remove("error");
     const boardDataResponse = await dataHandler.createNewBoard(newName);
     await setNewBoardData(board, newBoardButton, newStatusButton, boardDataResponse);
     //e.currentTarget.remove(); //TODO: Why we don't need that?
     document.body.removeEventListener("click", clickOutside);
   }
  }
}

async function setNewBoardData(board, buttonBoard, buttonStatus, data){
  const [boardId, boardName] = [data["id"], data["title"]]
  board.textContent = boardName;
  board.dataset.boardId = boardId;
  buttonBoard.dataset.boardId = boardId;
  buttonStatus.dataset.boardId = boardId;
  board.closest(".board-container").querySelector(".status-container").dataset.boardId=boardId;
  domManager.addEventListener(`.toggle-board-button[data-board-id="${boardId}"`, 'click', showHideButtonHandler);
  domManager.addEventListener(`.add-new-status-button[data-board-id="${boardId}"`, 'click', addNewStatus);
  await setStatusBaseContent(board, boardId)
}

async function setStatusBaseContent(board, boardId) {
  const myBoardContainer = board.closest(".board-container")
  const myStatusContainer = myBoardContainer.querySelector('div[class="status-container"]')
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
  myStatusContainer.classList.add("invisible");
}

async function connectStatusWithBoard(statusId, boardId){
  const connectionData = await dataHandler.bindStatusToBoard(statusId, boardId);
  if (connectionData.statusText === "OK"){
    const responseValue = await connectionData.json();
    console.log(responseValue)
  } else {
    console.log("Could not connect board to status")
  }
}

function removeBoard(board){
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