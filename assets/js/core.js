//get the height in px of an element under a particular display condition
    const getHeight = function(elem,disp){
        elem.style.display = disp;
        let elemHeight = elem.scrollHeight + 'px';
        elem.style.display = '';
        return elemHeight;
    };

//dropdown mobile nav menu toggle
    (function() {
        var burger = document.querySelector('.burger');
        var nav = document.querySelector('#'+burger.dataset.target);
    
        burger.addEventListener('click', function(){
        burger.classList.toggle('is-active');
        nav.classList.toggle('is-active');
        });
    })();

//bottom menu visibility toggle
    const bottomMenu = document.getElementById('bottom-menu');

    const toggleBottomMenu = function(state){
        if(state === 1) {
            var height = getHeight(bottomMenu,'block');
            bottomMenu.style.height = 'auto';
            bottomMenu.style.height = height;
        } else {
            bottomMenu.style.height = '0px';
        }
    }

//detect selection
    document.addEventListener("touchend", function(){
        if (event.target.closest('.menu') != null) {
            event.preventDefault()
        }


        let selection = window.getSelection();
        
        setTimeout(function(){
            if(selection.baseOffset != selection.extentOffset) {
                toggleBottomMenu(1);
            } else {
                toggleBottomMenu(0);
            }
        }, 0);

    });

//manual events for menu touch
    document.addEventListener("touchstart", function(){
        if (event.target.closest('.menu') != null) {
            let button = event.target.closest('.activatable');
            button.classList.add('active');
            setTimeout(function(){
                button.classList.remove('active');
            }, 150);
        }
    });


//load annotations
    //insert span tags into content string
        function stringInsert(value, str, index) {
            return str.substr(0, index) + value + str.substr(index);
        }

    //add custom color to underlines
        function styleAnnotations(){
            let annotationElements = document.querySelectorAll('.annot');
            for(element of annotationElements) {
                let parent = getParent(annotations,element.dataset.aid);
                if(parent.type == 1) {
                    element.style.background = "linear-gradient(0deg, "+rgbaToString(parent.rgba)+" 0.1em, white 0.1em, transparent 0.1em)"
                    element.style.lineHeight = 1.5+(0.2*parent.layer) + "em";
                    element.style.paddingBottom = 0.2*(parent.layer-1) + "em";
                }                
            }
        }
    
    //get parent annotation attributes for those that are split
        function getParent(annotations,id){
            return annotations.filter(parent => parent.id == id & parent.type)[0];
        }

    //convert rgba array to string
        function rgbaToString(array){
            return 'rgba('+array[0]+','+array[1]+','+array[2]+','+array[3]+')'
        }

    //generate span opening tag
        function generateOpenTag(id){
            return '<span class="annot" data-aid="'+id+'">';
        }
    
    //add annotations into the page html
        function addAnnotationTags(content,annotations){

            annotations.sort(function (annot1, annot2) {
                // If the first item has a higher number, move it down
                // If the first item has a lower number, move it up
                if (annot1.uri > annot2.uri) return -1;
                if (annot1.uri < annot2.uri) return 1;
                if (annot1.offsetStart < annot2.offsetStart) return 1;
                if (annot1.offsetStart > annot2.offsetStart) return -1;
            
            });

            for(annotation of annotations){ //generate layers
                let pairedAnnots = annotations.filter(annot => annot.id != annotation.id & annot.uri == annotation.uri & annot.offsetStart == annotation.offsetStart & annot.offsetEnd == annotation.offsetEnd);
                let parent = getParent(annotations,annotation.id);
                if(pairedAnnots.length > 0){ //if two or more annotations cover the same text
                    let usedLayers = [];
                    if(typeof(parent.layer) != 'undefined'){
                        usedLayers.push(parent.layer);
                    }
                    for(annot of pairedAnnots){ //get layers that have been used by paired annotations already
                        let childParent = getParent(annotations,annot.id);
                        if(typeof(childParent.layer)!='undefined'){
                            usedLayers.push(childParent.layer);
                        }
                    }
                    let layerIndex = 1;
                    for(annot of pairedAnnots){
                        let childParent = getParent(annotations,annot.id);
                        while(typeof(childParent.layer)==='undefined'){ 
                            if(usedLayers.indexOf(layerIndex)===-1){ //skip layers that have already been used
                                childParent.layer = layerIndex;
                                usedLayers.push(layerIndex);
                            }
                            layerIndex++;
                        }
                    }
                } else if (typeof(parent.layer) === 'undefined') { //assign lonely annotations to layer 1
                    parent.layer = 1;
                }
            }

            for(annotation of annotations){
                let paragraph = content[annotation.uri];
                let pairedAnnots = annotations.filter(annot => annot.id != annotation.id & annot.uri == annotation.uri & annot.offsetStart == annotation.offsetStart & annot.offsetEnd == annotation.offsetEnd);
                let openTag = generateOpenTag(annotation.id);
                let closeTag = '</span>';
                
                if(pairedAnnots.length > 0){ //handle two or more annotations that cover the same text
                    for(annot of pairedAnnots){
                        openTag += generateOpenTag(annot.id);
                        closeTag += '</span>';
                        annotations.splice(annotations.findIndex(origin => origin.id == annot.id & origin.offsetStart == annot.offsetStart & origin.offsetEnd == annot.offsetEnd),1);
                    }
                }
                paragraph.innerHTML = (stringInsert(openTag,paragraph.innerHTML,annotation.offsetStart)); //add the openTag to innerHTML
                paragraph.innerHTML = (stringInsert(closeTag,paragraph.innerHTML,annotation.offsetEnd+openTag.length)); //add the closeTag to innerHTML, accounting for the additional length caused by openTag

            }
        }

    //add new annotation to annotations array
        function addAnnotation(annotations,uri,offsetStart,offsetEnd,id,type,rgba,tags){
            let annotation = 
            {
                "id":id,
                "uri":uri,
                "offsetStart":offsetStart,
                "offsetEnd":offsetEnd,
                "type":type,
                "rgba":rgba,
                "tags":tags
            };
            annotations.push(annotation);
        }

    //split multiparagraph annotations
        function splitMultiParagraph(content,annotations){
            for(annotation of annotations){
                let paragraph = content[annotation.uri];
                if(annotation.offsetEnd>paragraph.innerHTML.length){  //check if the annotation extends past the paragraph where it starts
                    let pCount = 0;
                    let i = annotation.offsetEnd;
                    while(i>0){ //find out how many paragraphs are spanned
                        i = i-content[annotation.uri+pCount].innerHTML.length;
                        pCount++;
                    }
                    let leftover = i+content[annotation.uri+pCount-1].innerHTML.length;
                    for(x = pCount-1; x>=0; x--){ //for each spanned paragraph, create a new annotation.
                        if(x==0) { //last paragraph with leftover
                            addAnnotation(annotations,annotation.uri+pCount-1,0,leftover,annotation.id);
                        } else if(x==pCount-1){ //first paragraph, starts part way through, ends at end of paragraph
                            annotation.offsetEnd = content[annotation.uri].innerHTML.length;
                        } else { //middle paragraph, full coverage
                            addAnnotation(annotations,annotation.uri+x,0,content[annotation.uri+x].innerHTML.length,annotation.id);
                        }
                    }
                }
            }
        }
    
    //split overlapping annotations
        function splitOverlap(content, annotations){
            for(let i = 0; i<content.length-1; i++){
                //check if paragraph has overlapping annotations
                let pAnnotations = annotations.filter(annotation => annotation.uri == i);
                if(pAnnotations.length > 1){
                    //add breakpoints to an array
                        let breakpoints = [];
                        for(annotation of pAnnotations){
                            breakpoints.push(annotation.offsetStart);
                            breakpoints.push(annotation.offsetEnd);
                        }
                        breakpoints.sort((a, b) => a - b);
                    
                    //compare each annotation to the breakpoints to determine if it needs to be split
                        for(annotation of pAnnotations){
                            let startBreakpointIndex = breakpoints.indexOf(annotation.offsetStart);
                            let endBreakpointIndex = breakpoints.indexOf(annotation.offsetEnd);
                            let breakpointOffset = endBreakpointIndex - startBreakpointIndex;
                            if(breakpointOffset>1){
                                for(let i=0; i<breakpointOffset; i++){
                                    if(i==0){
                                        annotation.offsetEnd = breakpoints[startBreakpointIndex+1];
                                    } else {
                                        addAnnotation(annotations,annotation.uri,breakpoints[startBreakpointIndex+i],breakpoints[startBreakpointIndex+i+1],annotation.id);
                                    }
                                }
                            }
                        }
                }
            }
        }

    //load JSON annotation data
        let annotations;
        function loadAnnotations(annots) {
            annotations = JSON.parse(annots.srcElement.response).annotations;
            let content = document.getElementById('annotatable').children;

            splitMultiParagraph(content,annotations);
            splitOverlap(content,annotations);
            //TODO: Teach the annotation tag adder to understand how to work with annotations that don't have color information etc because they match id
            addAnnotationTags(content,annotations);
            styleAnnotations();
        }
    
    //request the JSON annotation file
        function loadJSON(path){
            request = new XMLHttpRequest();
            request.onload = loadAnnotations;
            request.open("get", String(path), true);
            request.send();
        }

    //run the initialization
        loadJSON('/data.json');
