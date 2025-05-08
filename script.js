var show_time = false
var sideMenu = document.getElementById("sideMenu")
var smart = document.getElementById("smart")
function menu_togg(){
    if(show_time == false){
        show_time = true
        sideMenu.style.display = "block"
        smart.style.overflow = "hidden"
        // SHOW 
    } else {
        show_time = false
        sideMenu.style.display = "none"
        smart.style.overflow = "auto"
        // HIDE
    }
}