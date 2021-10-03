import util from "../util/util.js";
import {dataHandler} from "../data/dataHandler.js";

export { createStatusBoxes, addNewStatus }


function addNewStatus(e){
    const boardId = e.target.dataset.boardId;
    const statusWrapper = document.querySelector(`.status-container[data-board-id="${boardId}"]`);
    const newStatus = createStatusBoxes({title: "", id: "pending-id"}, boardId);
    const clickOutside = util.clickOutsideWrapper("#create-new-status-name");
    statusWrapper.appendChild(newStatus);
    newStatus.querySelector(".status-headline").innerHTML = util.createNewInput("status_name", "create-new-status-name");
    const myInput = document.querySelector("#create-new-status-name");
    myInput.addEventListener("keydown", handleInputSaveStatus);
    myInput.focus()
    util.wait(1).then(()=> document.body.addEventListener("click", clickOutsideStatus));
}



// more of a html factory function
function createStatusBoxes(statusData, boardId){
    const statusBox = document.createElement("div");
    statusBox.classList.add("status-box");
    statusBox.dataset.statusId = statusData.id;
    statusBox.dataset.boardId = boardId;
    statusBox.innerHTML =` <p class="status-headline" data-board-id="${boardId}" data-status-id="${statusData.id}">${statusData.title}</p>
                           <div class="status-col" data-status-id="${statusData.id}" data-board-id="${boardId}"></div>`
    return statusBox
}

    async function handleInputSaveStatus(e){
        const statusBox = document.querySelector('.status-box[data-status-id="pending-id"]');
        const myInput = document.querySelector("#create-new-status-name");
        if (e.key === "Escape"){
            removeStatusBox(myInput, `.status-box[data-status-id="pending-id"]`, clickOutsideStatus);
        }
        if(e.key === "Enter"){
            const newName = e.currentTarget.value;
            if (newName.length < 1 ){
                e.currentTarget.classList.add("error");
                myInput.closest("div").classList.add("error");
            } else {
                myInput.closest("div").classList.remove("error");
                console.log(myInput);
                //TODO: 1. create new status
                const statusResponse = await dataHandler.createNewStatus(newName);
                console.log(await statusResponse.json());
                //TODO: 2. bind new status to board
                //TODO: 3. remove click outside event listener
                //TODO: 4. fill headline with new name p - innerHTML newName

                //const boardDataResponse = await dataHandler.createNewBoard(newName); -> we have to create a new status
                //await setElementCallback(statusBox, boardDataResponse);
                //document.body.removeEventListener("click", util.clickOutside);
            }
        }
    }



function removeStatusBox(element, parentString, callBack){
    const parentDiv = element.closest(parentString);
    parentDiv.remove();
    document.body.removeEventListener("click", callBack);
}

function clickOutsideStatus(e) {
    const clickTarget = document.querySelector("#create-new-status-name");
    if (e.target !== clickTarget) {
        removeStatusBox(clickTarget, ".status-box", clickOutsideStatus);
    }
}
