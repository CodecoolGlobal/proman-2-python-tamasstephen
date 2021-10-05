import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import util from "../util/util.js";

export {addNewCard}

async function addNewCard(e){
   const parent = e.currentTarget.nextElementSibling;
   const cardBuilder = htmlFactory(htmlTemplates.card);
   const newCard = cardBuilder({id: "new-card-name"});
   util.wait(1 ).then(() => { insertNewCardToParent(parent, newCard) });
}

function insertNewCardToParent(parent, newCard){
   parent.insertAdjacentHTML('afterbegin', newCard);
   document.querySelector('.card[data-card-id="new-card-name"]').innerHTML = util.
   createNewInput("card_name", "create-new-card-name");
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

async function setUpNewCard(myInput){
   const card = myInput.closest(".card")
   card.classList.remove("error");
   const newName = myInput.value
   const boardId = myInput.closest(".status-col").dataset.boardId;
   console.log(boardId);
   const statusId = myInput.closest(".status-col").dataset.statusId;
   const statusResponse = await dataHandler.createNewCard(newName, boardId, statusId, 1); //different datahandler func
   util.checkRequestError(statusResponse);
   const newStatus = await statusResponse.json();
   setCardHtmlData(newStatus, card, newName);
   await setNewCardOrder(card)
   document.body.removeEventListener("click", clickOutsideCard);
}

async function setNewCardOrder(card){
   const cards = card.closest(".status-col").querySelectorAll(".card");
   const cardIds = Array.from(cards).map((card, index) => {return {id: card.dataset.cardId, order: index+1}});
   const cardOrderResponse = await dataHandler.setCardOrder(cardIds);
   console.log(await cardOrderResponse.json());
}

function setCardHtmlData(newCardData, card, name){
   card.dataset.cardId = newCardData.id
   card.textContent = name;
}