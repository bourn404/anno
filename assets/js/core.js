import AnnotsController from './annotController.js';
let myAnnotsController = new AnnotsController();
myAnnotsController.init();

window.reloadAnnots = function(){
    myAnnotsController.reloadAnnotations();
}





