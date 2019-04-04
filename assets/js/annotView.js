//dropdown mobile nav menu toggle
    (function() {
        var burger = document.querySelector('.burger');
        var nav = document.querySelector('#'+burger.dataset.target);

        burger.addEventListener('click', function(){
        burger.classList.toggle('is-active');
        nav.classList.toggle('is-active');
        });
    })();

//get the height in px of an element under a particular display condition
    function getHeight(elem,disp){
        elem.style.display = disp;
        let elemHeight = elem.scrollHeight + 'px';
        elem.style.display = '';
        return elemHeight;
    };

//splice one string into another at specified index
    function stringInsert(value, str, index) {
        return str.substr(0, index) + value + str.substr(index);
    }

//convert rgba array to string
    function rgbaToString(array){
        return 'rgba('+array[0]+','+array[1]+','+array[2]+','+array[3]+')'
    }

//default annotation colors
    let defaultColors = [
        [238,74,96],
        [244,146,40],
        [235,204,55],
        [160,201,37],
        [15,205,213],
        [37,150,255],
        [157,83,254],
        [248,91,234],
        [205,125,90],
        [174,184,193]
    ]

//return parent annotation for additional attributes
    function getParent(annotations,id){
        return annotations.filter(parent => parent.id == id & parent.type != null)[0];
    }

//generate annotation opening tag
    function generateOpenTag(id,isParent) {
        return '<span class="annot" data-aid="'+id+'" data-parent="'+isParent+'">';
    }

    function generateIconHTML(id,top){
        return '<span class="edit-icon" data-id="'+id+'" data-action="edit" style="top:'+top+'"><i class="far fa-edit"></i></span>'
    }

//sort annotations for rendering from bottom to top of page
    function annotationSort(annotations) {
        return annotations.sort(function (annot1, annot2) {
            //sort by paragraph (uri)
                if (annot1.uri > annot2.uri) return -1;
                if (annot1.uri < annot2.uri) return 1;
            //then sort by location in paragraph (offset)
                if (annot1.offsetStart < annot2.offsetStart) return 1;
                if (annot1.offsetStart > annot2.offsetStart) return -1;
        });
    }

//assign layers for stacked underline annotations
    function assignLayers(annotations) {
        for (let annotation of annotations) {
            annotation.layer = null;
        }
        for(let annotation of annotations){
            let parent = getParent(annotations,annotation.id);
            //only stack type 1 (underline) annotations.  If an annotation type gets changed, we'll have to rerender.
                if(parent.type === 1) {
                    //get stacked annotations
                        let pairedAnnots = annotations.filter(annot => annot.id != annotation.id & annot.uri == annotation.uri & annot.offsetStart == annotation.offsetStart & annot.offsetEnd == annotation.offsetEnd);

                    //generate layers for stacked annotations
                        if(pairedAnnots.length > 0){ 
                            let usedLayers = [];
                            //check for any layers which are already assigned tp parent annotations
                                if(parent.layer != null){
                                    usedLayers.push(parent.layer);
                                }
                                for(let annot of pairedAnnots){ 
                                    let childParent = getParent(annotations,annot.id);
                                        if(childParent.layer!=null){
                                            usedLayers.push(childParent.layer);
                                        }
                                }

                            let layerIndex = 1;
                            for(let annot of pairedAnnots){
                                let childParent = getParent(annotations,annot.id);
                                //increment through the layerIndex until we find one that hasn't been used yet
                                    while(childParent.layer==null && childParent.type === 1){
                                        if(usedLayers.indexOf(layerIndex)===-1){ 
                                            childParent.layer = layerIndex;
                                            usedLayers.push(layerIndex);
                                        }
                                        layerIndex++;
                                    }
                            }
                        } else if (parent.layer == null) {
                            //assign lonely annotations to layer 1
                                parent.layer = 1;
                        }
                }  
        }
    }

//make the selection visible
    function makeSelectionVisible(menuHeight){
        let selectionY = window.getSelection().getRangeAt(0).getClientRects()[0].y
        let menuY = window.innerHeight - parseInt(menuHeight,10) - 30; //30 gives it a buffer for partially covered selections
        let idealScrollPos =  menuY/2;  //halfway between the top of the viewport and the top of the menu
        if(menuY < selectionY) {
            //selection is not visible
            window.scrollBy({
                top: selectionY-idealScrollPos, 
                left: 0, 
                behavior: 'smooth'
              });
        }
    }

//clear the selection
    function clearSelection(){
        let sel = window.getSelection();
            if (sel.removeAllRanges) {
                sel.removeAllRanges();
            } else if (sel.empty) {
                sel.empty();
            }
    }

//generate color options
    function colorOptionsHTML(){
        let html = '';
        defaultColors.forEach(function(color){
            html += '<div data-action="mark-color" class="column is-one-fifth activatable"><div data-color="'+color.toString()+'" class="color-option"></div></div>';
        })
        return html;
    }

//show menu for action
    function renderActionMenu(action){
        const menu = document.getElementById('action-menu');
        const menuContent = menu.querySelector('.content');
        switch(action) {
            case "mark":
                menuContent.innerHTML = `
                    <div id="mark-type" class="column is-12 is-paddingless columns is-mobile btn-wrapper">
                        <p data-action="mark-type" class="column activatable"><span class="type-option"><span data-type="2" class="highlight">Highlight</span></span></p>
                        <p data-action="mark-type" class="column activatable"><span class="type-option"><span data-type="1" class="underline">Underline</span></span></p>
                    </div>
                    <div id="mark-color" class="column is-12 is-paddingless columns is-mobile is-multiline btn-wrapper">
                        ${colorOptionsHTML()}
                    </div>
                `;
                let colorOptions = menu.querySelectorAll('.color-option')
                colorOptions.forEach(function(option){
                    
                    let color = 'rgb('+option.dataset.color+')'
                    option.style.backgroundColor = color;
                });
                colorOptions.forEach(function(option) { 
                      
                    }
                  );
                break;
            case "note":
                menuContent.innerHTML = '<p class="column">Note Menu<br/><br/><br/></p>';
                break;
            case "tag":
                menuContent.innerHTML = '<p class="column">Tag Menu<br/><br/><br/><br/><br/><br/></p>';
                break;
            default:
                // code block
            }
    }

export default class AnnotsView {
    constructor() {
        
    }


    //toggle bottom menu
        toggleBottomMenu = function(state,menuID){
            let menu = document.getElementById(menuID);
            if(state === 1) {
                var height = getHeight(menu,'block');
                menu.style.height = 'auto';
                menu.style.height = height;
                makeSelectionVisible(height);
            } else {
                menu.style.height = '0px';
                let bottomBtns = document.querySelectorAll(".tab")
                bottomBtns.forEach(function(btn){
                    btn.classList.remove('active');
                })
            }            
        }

        toggleActionMenu = function(state,action){
            let menu = document.getElementById('action-menu');
            let bottomMenu = document.getElementById('bottom-menu');
            let currentAction = '';
            let height;
            let currentState = 1;
            let menuContent = menu.querySelector('.content');
            let transitionSpeed = 350;
            if(menu.dataset.action != null) {
                currentAction = menu.dataset.action;
            }
            if(menu.style.height == '0px' || menu.style.height == '') {
                currentState = 0;
            }

            let showMenu = function(height, transition){
                if(transition){
                    menu.style.transition = 'height '+transitionSpeed+'ms ease-in-out';
                } else {
                    menu.style.transition = 'none';
                }
                menu.style.height = '0px';
                menu.style.height = height;
                makeSelectionVisible(height);
            }
            let hideMenu = function(transition){
                //prevent content from collapsing on menu hide transition
                    menuContent.style.height = menuContent.scrollHeight + 'px';
                if(transition){
                    menu.style.transition = 'height '+transitionSpeed+'ms ease-in-out';
                } else {
                    menu.style.transition = 'none';
                }
                menu.style.height = '0px';
                menu.style.paddingBottom = '0px';
            }
            let calcHeight = function(){
                menuContent.style.height = 'auto';
                menu.style.paddingBottom = bottomMenu.style.height;
                return parseInt(getHeight(menu,'block'),10) + 'px'; //parseInt(menu.style.paddingBottom,10) + //I might be able to get rid of the parse int if this second part isn't necessary.
            }        

            if(state === 1 && currentState === 0) {
                renderActionMenu(action);
                showMenu(calcHeight(),true);
            } else if(state === 1 && currentState === 1 && action != currentAction) {
                hideMenu(true);
                setTimeout(function(){
                    renderActionMenu(action);
                    showMenu(calcHeight(),true);
                },340);
                
                //
            } else if(state === 0 && currentState === 1) {
                hideMenu(true);
            }
            menu.dataset.action = action;
        }

    //route button clicks
        btnClick = function(button,siblings) {
            let action = button.dataset.action;
            let toggleActionMenu = this.toggleActionMenu
            if(siblings != null){
                siblings =[].slice.call(siblings);
                if(button.classList.contains('activatable')){
                    siblings.forEach(function(btn){
                        btn.classList.remove('active');
                    })
                }
                button.classList.add('active');
            }

            console.dir(action);

            let toggleBottomMenu = this.toggleBottomMenu

            switch(action) {
                case "mark":
                    toggleActionMenu(1,action);
                    break;
                case "note":
                    toggleActionMenu(1,action);
                    break;
                case "tag":
                    toggleActionMenu(1,action);
                    break;
                case "copy":
                    toggleActionMenu(0,action);
                    document.execCommand("copy");
                    toggleBottomMenu(0,'bottom-menu');
                    clearSelection();
                    break;
                case "delete":
                    toggleActionMenu(0,action);
                    toggleBottomMenu(0,'bottom-menu');
                    clearSelection();
                    break;
                case "edit":
                    toggleActionMenu(0,action);
                    toggleBottomMenu(0,'bottom-menu');
                    break;
                default:
                  // code block
            }
        }

    //add css style attributes to all annotation span elements
        styleAnnotations(annotations){
            let annotationElements = document.querySelectorAll('.annot');
            for(let element of annotationElements) {
                //get parent for parent-level attributes
                    let parent = getParent(annotations,element.dataset.aid);
                if(parent.type === 1) {
                    //styles for underline (type 1)
                        element.style.background = "linear-gradient(0deg, "+rgbaToString(parent.rgba)+" 0.15em, white 0.15em, transparent 0.15em)"
                        element.style.lineHeight = 1+(0.45*parent.layer) + "em";
                        element.style.paddingBottom = 0.3*(parent.layer-1) + "em";
                } else if (parent.type === 2){
                    //styles for highlight (type 2)
                        //console.dir(parent.rgba);
                        let color = parent.rgba.slice();
                        color.pop();
                        color.push(0.3); //opacity setting
                        element.style.backgroundColor = rgbaToString(color);
                }        
            }
        }
    //add annotations into the page html
        renderAnnotations(content,annotations){
            //sort annotations into proper rendering order
            //annotations are rendered in reverse order so that offset start is always accurate even midway through the rendering process
                annotations = annotationSort(annotations);

            //assign layers for stacked underline annotations
                assignLayers(annotations);

            //add annotations to a rendering queue so we can keep track of what has and hasn't been rendered
                let annotsToRender = annotations.slice();;
            //process the rendering queue
                for(let annotation of annotsToRender){
                    let paragraph = content[annotation.uri];
                    let pairedAnnots = annotsToRender.filter(annot => annot.id != annotation.id & annot.uri == annotation.uri & annot.offsetStart == annotation.offsetStart & annot.offsetEnd == annotation.offsetEnd);
                    let closeTag = '</span>';
                    let isParent = false;
                    if(annotation.type != null){
                        isParent = true;
                    }
                    let openTag = generateOpenTag(annotation.id,isParent);
                    //create nested spans for overlapping annotations
                        if(pairedAnnots.length > 0){ 
                            for(let annot of pairedAnnots){
                                if(annot.type != null) {
                                    isParent = true;
                                } else {
                                    isParent = false;
                                }
                                openTag += generateOpenTag(annot.id,isParent);
                                closeTag += '</span>';
                                //delete nested span from the rendering queue 
                                    annotsToRender.splice(annotsToRender.findIndex(origin => origin.id == annot.id & origin.offsetStart == annot.offsetStart & origin.offsetEnd == annot.offsetEnd),1);
                            }
                        }
                    
                    //add the openTag to innerHTML
                        paragraph.innerHTML = (stringInsert(openTag,paragraph.innerHTML,annotation.offsetStart));
                    
                    //add the closeTag to innerHTML, accounting for the additional length caused by openTag
                        paragraph.innerHTML = (stringInsert(closeTag,paragraph.innerHTML,annotation.offsetEnd+openTag.length)); 
                }
        }
    
    //render individual annotation icons 
        renderAnnotIcons(contentElement){
            let parentAnnotElements = document.querySelectorAll("[data-parent='true']");
            console.log(parentAnnotElements);
            console.dir(parentAnnotElements);
            let locations = [];
            for(let element of parentAnnotElements){
                let id = element.dataset.aid;
                let top = element.offsetTop;
                locations.push([id,top]);
            }
            console.dir(locations);
            //TODO: combine locations with matching heights
            for(let item of locations){
                let id = item[0];
                let top = item[1]+'px';
                console.log(top);
                let iconNode = document.createRange().createContextualFragment(generateIconHTML(id,top));
                console.dir(iconNode);
                contentElement.appendChild(iconNode);
            }
        }
}












