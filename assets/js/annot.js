export default class Annot {
    loadJSON(path){
        //?? I would like to try and simulate a delay... idk how
        return fetch(path)
        .then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            } else {
                return response.json();
            }
        }).catch(function(error) {
            console.log(error);
        });
    }


}