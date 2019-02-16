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
            let underlines = document.querySelectorAll('.underline');
            for(underline of underlines) {
                underline.style.textDecorationColor = underline.dataset.ucolor;
            }
        }
    
    //add annotations into the page html
        function addAnnotationTags(content,annotations){
            for(let i=annotations.length-1; i>=0; i--){
                let paragraph = content[annotations[i].uri];
                let color = 'rgba('+annotations[i].rgba[0]+','+annotations[i].rgba[1]+','+annotations[i].rgba[2]+','+annotations[i].rgba[3]+')';
                let openTag = '<span class="underline" data-ucolor="'+color+'">';
                let closeTag = '</span>';
                paragraph.innerHTML = (stringInsert(openTag,paragraph.innerHTML,annotations[i].offsetStart)); //add the openTag to innerHTML
                paragraph.innerHTML = (stringInsert(closeTag,paragraph.innerHTML,annotations[i].offsetEnd+openTag.length)); //add the closeTag to innerHTML, accounting for the additional length caused by openTag
            }
        }

    //add new annotation
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
                    //TODO: find out how many paragraphs are spanned
                    //annotation.offsetEnd = 5555555;
                    //console.dir(annotation);
                        let pCount = 0;
                        let i = annotation.offsetEnd;
                        while(i>0){
                            i = i-content[annotation.uri+pCount].innerHTML.length;
                            pCount++;
                        }
                        let leftover = i+content[annotation.uri+pCount-1].innerHTML.length;
                        for(x = pCount-1; x>=0; x--){
                            if(x==0) { //last paragraph with leftover
                                addAnnotation(annotations,annotation.uri+pCount-1,0,leftover,annotation.id,annotation.type,annotation.rgba);
                            } else if(x==pCount-1){ //first paragraph, starts part way through
                                annotation.offsetEnd = content[annotation.uri].innerHTML.length;
                            } else { //middle paragraph, full coverage
                                addAnnotation(annotations,annotation.uri+x,0,content[annotation.uri+x].innerHTML.length,annotation.id,annotation.type,annotation.rgba);
                            }
                        }
                        //TODO: For as many paragraphs as we span, create a new annotation.  Modify original annotation so that it ends at paragraph end.  if(lastparagraph){offsetEnd=leftover}else{offsetStart=0, offsetEnd=paragraph.length}
                    //TODO: create annotation entries for each paragraph that have matching ids
                }
            }
        }
    

    //load JSON annotation data
        let annotations;
        function loadAnnotations(annots) {
            annotations = JSON.parse(annots.srcElement.response).annotations;
            let content = document.getElementById('annotatable').children;

            console.dir(annotations);
            splitMultiParagraph(content,annotations);
            //console.dir(annotations);
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
