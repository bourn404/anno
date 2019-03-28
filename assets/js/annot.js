export default class Annot {
    loadJSON(path){
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

    loadContent(path){
        return fetch(path)
        .then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            } else {
                return response.text();
            }
        }).catch(function(error) {
            console.log(error);
        });
    }

}