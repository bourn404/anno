import AnnotsView from './annotView.js';
import Annot from './annot.js';


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
        for(let annotation of annotations) {
            let paragraph = content[annotation.uri];
            //check if the annotation extends past the paragraph where it starts
                if(annotation.offsetEnd>paragraph.innerHTML.length){  
                    //find out how many paragraphs are spanned
                        let pCount = 0;
                        let i = annotation.offsetEnd;
                        while(i>0){ 
                            i = i-content[annotation.uri+pCount].innerHTML.length;
                            pCount++;
                        }

                    //calculate how many characters are leftover in the last paragraph
                        let leftover = i+content[annotation.uri+pCount-1].innerHTML.length;
                    
                    //for each spanned paragraph, create a new annotation.
                        for(let x = pCount-1; x>=0; x--){ 
                            if(x===0) {
                                //last paragraph with leftover
                                    addAnnotation(annotations,annotation.uri+pCount-1,0,leftover,annotation.id);
                            } else if(x===pCount-1){ 
                                //first paragraph, starts part way through, ends at end of paragraph
                                    annotation.offsetEnd = content[annotation.uri].innerHTML.length;
                            } else { 
                                //middle paragraph, full coverage
                                    addAnnotation(annotations,annotation.uri+x,0,content[annotation.uri+x].innerHTML.length,annotation.id);
                            }
                        }
                }
        }
    }

//split overlapping annotations
    function splitOverlap(content, annotations){
        //increment through each paragraph and process overlapping annotations
            for(let i = 0; i<content.length-1; i++){
                //check if paragraph has overlapping annotations
                    let pAnnotations = annotations.filter(annotation => annotation.uri == i);
                    if(pAnnotations.length > 1){
                        //add annotation breakpoints to an array
                            let breakpoints = [];
                            for(let annotation of pAnnotations){
                                breakpoints.push(annotation.offsetStart);
                                breakpoints.push(annotation.offsetEnd);
                            }
                            breakpoints.sort((a, b) => a - b);
                            breakpoints = breakpoints.filter(function(item, index){
                                return breakpoints.indexOf(item) >= index;
                            });
                        
                        //compare each annotation to the breakpoints to determine if it needs to be split
                            for(let annotation of pAnnotations){
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


// Quake controller
export default class AnnotsController {
    constructor(parent) {
        this.parent = parent;
        // sometimes the DOM won't exist/be ready when the Class gets instantiated, so we will set this later in the init()
        this.parentElement = null;
        // this is how our controller will know about the model and view...we add them right into the class as members.
        this.annots = new Annot();
        this.annotsView = new AnnotsView();
        let annotsView = this.annotsView;
        
        //prevent deselection when tapping menu
            document.addEventListener("touchend", function(){
                if (event.target.closest('.menu') != null) {
                    event.preventDefault()
                }
            });

        //detect selection
            document.addEventListener("selectionchange", function(){
                let selection = window.getSelection();
                
                setTimeout(function(){
                    if(selection.baseOffset != selection.extentOffset) {
                        annotsView.toggleBottomMenu(1);
                    } else {
                        annotsView.toggleBottomMenu(0);
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
    }
    async init() {
      // use this as a place to grab the element identified by this.parent, do the initial call of this.intiPos(), and display some quakes by calling this.getQuakesByRadius()
      console.log('got here!');
      this.parentElement = document.querySelector(this.parent);
      //?? is this syntax correct?  does this await work?

      let rawData = await this.annots.loadJSON('data.json');
      this.loadAnnotations(rawData);
    }
  
    async loadAnnotations(annots) {
        console.dir(annots);
        annotations = annots.annotations;
        let content = document.getElementById('annotatable').children;

        splitMultiParagraph(content,annotations);
        splitOverlap(content,annotations);
        this.annotsView.renderAnnotations(content,annotations);
        this.annotsView.styleAnnotations(annotations);
    }
  }