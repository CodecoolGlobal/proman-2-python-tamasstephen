import {removeBoard} from "../model/board.js";

const util = {
    wait(ms){
        return new Promise((resolve) => { return setTimeout(resolve, ms) });
},

    checkRequestError(response){
        if (response.statusText !== "OK"){
            throw new Error(`Request error: ${response.statusText}`);
        }
    },


    createNewInput(name="board_name", id="name_new_board"){
        return `<input type="text" name="${name}" id="${id}">`
    },

    removeNewElementInProgress(element, parentString, callBack){
        const parentDiv = element.closest(parentString);
        parentDiv.remove();
        document.body.removeEventListener("click", callBack);
}
}

export default util
