// Set class for dock bay card given status and state
export function dockCardClass(status: string, fsm_state: string){
    if(!status || !fsm_state){
        return "";
    }
    // truck in bay
    if(status === "occupied"){
        // being loaded (leveler out)
        if(fsm_state === "LevelerEngaged_ReadyToLoad"){
            return("loading_DockCard");
        }
        // not being loaded
        else{
            return("active_DockCard");
        }
    }
    // inactive - nested widget default css
    else{
        return ("");
    }
    // truck in bay, being loaded
}