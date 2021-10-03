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

    clickOutsideWrapper(targetElement, callback){
        function clickOutside(e) {
        const clickTarget = document.querySelector(targetElement);
        if (e.target !== clickTarget) {
            callback(clickTarget);
        }
    }
    return clickOutside;
    },
}

export default util
