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
        //console.dir(selection);
        
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
                console.log(i);
                let paragraph = content[annotations[i].uri];
                let color = 'rgba('+annotations[i].rgba[0]+','+annotations[i].rgba[1]+','+annotations[i].rgba[2]+','+annotations[i].rgba[3]+')';
                let openTag = '<span class="underline" data-ucolor="'+color+'">';
                let closeTag = '</span>';
                paragraph.innerHTML = (stringInsert(openTag,paragraph.innerHTML,annotations[i].offsetStart)); //add the openTag to innerHTML
                paragraph.innerHTML = (stringInsert(closeTag,paragraph.innerHTML,annotations[i].offsetEnd+openTag.length)); //add the closeTag to innerHTML, accounting for the additional length caused by openTag
            }
        }

    //split multiparagraph annotations
        function splitMultiParagraph(content,annotations){
            
        }
    

    //load JSON annotation data
        let annotations;
        function loadAnnotations(annots) {
            annotations = JSON.parse(annots.srcElement.response).annotations;
            let content = document.getElementById('annotatable').children;


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
