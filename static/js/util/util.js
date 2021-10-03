import {removeBoard} from "../model/board.js";

const util = {
    wait(ms){
        return new Promise((resolve) => { return setTimeout(resolve, ms) });
},

    UserException(name){
       this.name = name;
    },

    checkRequestError(response, errorType){
        if (response.statusText !== "OK"){
            throw new this.UserException(errorType, response.statusText);
        }
        return response
    },

    handleCustomError(callback){
        function fnWrapper(response, errorName){
            try{
                return callback(response)
            } catch(error){
                if (error.name === errorName ){
                    console.log(error);
                }
            }
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
