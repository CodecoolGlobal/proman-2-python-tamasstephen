import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import util from "../util/util.js";

export {addNewCard, setUpDropTargets, initContainerForDragEvents}

async function addNewCard(e){
   const parent = e.currentTarget.nextElementSibling;
   const cardBuilder = htmlFactory(htmlTemplates.card);
   const newCard = cardBuilder({id: "new-card-name"});
   util.wait(1 ).then(() => { insertNewCardToParent(parent, newCard) });
}

function insertNewCardToParent(parent, newCard){
   parent.insertAdjacentHTML('afterbegin', newCard);
   const card = document.querySelector('.card[data-card-id="new-card-name"]');
   card.innerHTML = util.createNewInput("card_name", "create-new-card-name");
   const myInput = document.querySelector("#create-new-card-name");
   myInput.focus();
   myInput.addEventListener("keydown", handleInputSaveCard);
   document.body.addEventListener("click", clickOutsideCard);
}

// implement by the status and board cases
async function handleInputSaveCard(e){
   const myInput = e.currentTarget
   if (e.key === "Escape"){
      util.removeNewElementInProgress(myInput, `.card`, clickOutsideCard);
   }
   if(e.key === "Enter"){
      const newName = e.currentTarget.value;
      if (newName.length < 1 ){
         e.currentTarget.classList.add("error");
         myInput.closest("div").classList.add("error");
      } else {
         await setUpNewCard(myInput);
      }
   }
}

function clickOutsideCard(e) {
   const clickTarget = document.querySelector("#create-new-card-name");
   if (e.target !== clickTarget) {
      util.removeNewElementInProgress(clickTarget, ".card", clickOutsideCard);
   }
}

// Refactor
async function setUpNewCard(myInput){
   const card = myInput.closest(".card")
   card.classList.remove("error");
   const newName = myInput.value;
   const boardId = myInput.closest(".status-col").dataset.boardId;
   const statusId = myInput.closest(".status-col").dataset.statusId;
   const statusResponse = await dataHandler.createNewCard(newName, boardId, statusId, 1); //different datahandler func
   util.checkRequestError(statusResponse);
   const newStatus = await statusResponse.json();
   setCardHtmlData(newStatus, card, newName);
   await setNewCardOrder(card);
   document.body.removeEventListener("click", clickOutsideCard);
   initCardForDragEvents(card);
}

async function setNewCardOrder(card){
   const cardIds = getNewCardOrder(card);
   await dataHandler.setCardOrder(cardIds);
}

function getNewCardOrder(card){
   const cards = card.closest(".status-col").querySelectorAll(".card");
   const cardIdsInOrder = Array.from(cards).map((card, index) =>
                          {return {id: card.dataset.cardId, order: index+1}});
   return cardIdsInOrder;
}

function setCardHtmlData(newCardData, card, name){
   card.dataset.cardId = newCardData.id;
   card.textContent = name;
}

function setUpDropTargets(){
   console.log(document.body);
   const cards = document.querySelectorAll(".card");
   const cardHolders = document.querySelectorAll(".status-col");
   cards.forEach(card => {
      initCardForDragEvents(card);
   })
   cardHolders.forEach( holder => {
      initContainerForDragEvents(holder);
   })
}

function initCardForDragEvents(card){
   card.addEventListener("dragstart", handleDragStart);
   card.addEventListener("dragend", handleDragEnd);
   card.addEventListener("drop", handleDrop);
   card.addEventListener("dragover", handleDragOver);
}

function initContainerForDragEvents(holder){
   holder.addEventListener("dragover", handleDragOverContainer);
   holder.addEventListener("drop", handleDropContainer);
}

function handleDragStart(e){
   console.log(e);
   e.currentTarget.classList.add("dragged");
   const parent = e.currentTarget.closest(".status-col");
   saveDropDataToDataTransfer(e.dataTransfer, parent);
}

function saveDropDataToDataTransfer(transferObj, sourceElement){
   const statusId = sourceElement.dataset.statusId;
   const boardId = sourceElement.dataset.boardId;
   transferObj.setData("type/statusId", statusId);
   transferObj.setData("type/boardId", boardId);
}

function handleDragEnd(e){
  e.currentTarget.classList.remove("dragged");
}

async function handleDrop(e) {
   e.preventDefault();
   const grabbedCard = document.querySelector(".dragged");
   const parent = e.currentTarget.closest(".status-col");
   const dataToDigest = getUpdateData(parent, e.dataTransfer, grabbedCard);
   parent.insertBefore(grabbedCard, e.currentTarget);
   await updateCardDropChanges(dataToDigest, isOldStatus(dataToDigest));
}

async function handleDropContainer(e){
   if(!e.currentTarget.firstChild){
      e.preventDefault();
      const grabbedCard = document.querySelector(".dragged");
      console.log(grabbedCard)
      e.currentTarget.appendChild(grabbedCard);
      const dataToDigest = getUpdateData(e.currentTarget, e.dataTransfer, grabbedCard);
      await updateCardDropChanges(dataToDigest, isOldStatus(dataToDigest));
   }

}

function getUpdateData(element, dataTrans, card){
   const dataToConsume = {
      statusId: dataTrans.getData("type/statusId"),
      boardId: dataTrans.getData("type/boardId"),
      cardId: card.dataset.cardId,
      newStatusId: element.dataset.statusId,
      newBoardId: element.dataset.boardId,
   }
   return dataToConsume
}

function isOldStatus(newData){
   return newData.statusId === newData.newStatusId && newData.boardId === newData.newBoardId
}

async function updateCardDropChanges(newData, isOldStatus){
   const card = document.querySelector(`[data-card-id="${newData.cardId}"]`)
   if(isOldStatus){
      await setNewCardOrder(card)
   } else {
      await dataHandler.updateCardStatus(newData.newBoardId, newData.newStatusId, newData.cardId);
      await setNewCardOrder(card);
      const oldStatusCol = document.querySelector(`.status-col[data-status-id="${newData.statusId}"][data-board-id="${newData.boardId}"]`);
      const oldColFirstCard = oldStatusCol.firstChild
      if (oldColFirstCard) {
         await setNewCardOrder(oldColFirstCard);
      }
   }
}

function handleDragOver(e){
   e.preventDefault();
}

function handleDragOverContainer(e){
  if(!e.currentTarget.firstChild){
     e.preventDefault();
  }
}

