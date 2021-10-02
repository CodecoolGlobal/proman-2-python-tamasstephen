import {dataHandler} from "../data/dataHandler.js";

async function statusManager(board){
    const boardId = board.id;
    const statuses = await dataHandler.getStatusesByBoardId(boardId) ;
}


export default statusManager;
