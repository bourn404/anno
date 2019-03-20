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

//return parent annotation for additional attributes
    function getParent(annotations,id){
        return annotations.filter(parent => parent.id == id & typeof(parent.type) != 'undefined')[0];
    }

//generate annotation opening tag
    function generateOpenTag(id) {
        return '<span class="annot" data-aid="'+id+'">';
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
                                if(typeof(parent.layer) != 'undefined'){
                                    usedLayers.push(parent.layer);
                                }
                                for(let annot of pairedAnnots){ 
                                    let childParent = getParent(annotations,annot.id);
                                        if(typeof(childParent.layer)!='undefined'){
                                            usedLayers.push(childParent.layer);
                                        }
                                }

                            let layerIndex = 1;
                            for(let annot of pairedAnnots){
                                let childParent = getParent(annotations,annot.id);
                                //increment through the layerIndex until we find one that hasn't been used yet
                                    while(typeof(childParent.layer)==='undefined' && childParent.type === 1){
                                        if(usedLayers.indexOf(layerIndex)===-1){ 
                                            childParent.layer = layerIndex;
                                            usedLayers.push(layerIndex);
                                        }
                                        layerIndex++;
                                    }
                            }
                        } else if (typeof(parent.layer) === 'undefined') {
                            //assign lonely annotations to layer 1
                                parent.layer = 1;
                        }
                }  
        }
    }
    const bottomMenu = document.getElementById('bottom-menu');
export default class AnnotsView {
    constructor() {
        
    }
    //toggle bottom menu
        toggleBottomMenu = function(state){
            if(state === 1) {
                var height = getHeight(bottomMenu,'block');
                bottomMenu.style.height = 'auto';
                bottomMenu.style.height = height;
            } else {
                bottomMenu.style.height = '0px';
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
                        element.style.lineHeight = 1.5+(0.3*parent.layer) + "em";
                        element.style.paddingBottom = 0.3*(parent.layer-1) + "em";
                } else if (parent.type === 2){
                    //styles for highlight (type 2)
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
                    let openTag = generateOpenTag(annotation.id);
                    let closeTag = '</span>';
                    
                    //create nested spans for overlapping annotations
                        if(pairedAnnots.length > 0){ 
                            for(let annot of pairedAnnots){
                                openTag += generateOpenTag(annot.id);
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
}












