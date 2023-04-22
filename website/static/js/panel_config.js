window.onload = function () {
    resetPage();
};
function resetPage() {
        document.getElementById('questions').innerHTML = `
            <a href="/prof/creer" class="aTab">
                <img src="/static/img/plus.svg" class="plus">
                <p class="text">Nouvelle question</p>
            </a>`;
        document.getElementById('sequences').innerHTML = `
        <a href="/prof/creerSeq" class="aTab">
                <img src="/static/img/plus.svg" class="plus">
                <p class="text">Nouvelle séquence</p>
            </a>`;
        document.getElementById('tags').innerText = "";
        for (let i = 0; i < Object.keys(exos).length; i++) {
            let key = Object.keys(exos)[i];
            let exo = exos[key];
            addQuest(exo.title, exo.id);
        }
        for (let i = 0; i < Object.keys(sequences).length; i++) {
            let key = Object.keys(sequences)[i];
            let seq = sequences[key];
            addSequence(seq.titre, seq.idS);
        }
    }
function addQuest(title, exoid) {
        let modifier = "/prof/modifier/"+exoid;
        let supprimer = "/prof/supprimerexo/"+exoid;
        document.getElementById('questions').insertAdjacentHTML("beforeend", `
            <div class="tab">
                <p class="text">${title}</p>
                <div class="icons">
                    <a href="${modifier}">
                        <img class="pencil" src="/static/img/pencil.svg">
                    </a>
                    <a href="">
                        <img class="eye" src="/static/img/eye.svg">
                    </a>
                    <a class="start" href="">Start</a>
                    <a href="${supprimer}">
                        <img class="trashcan" src="/static/img/trash-can.svg">
                    </a>
                </div>
            </div>`);
    } // FINIR CA

    function addSequence(title, exoid){
    let modifier = "/prof/sequence_panel/"+exoid;
    let supprimer = "/prof/supprimer_seq/"+exoid;
    document.getElementById('sequences').insertAdjacentHTML("beforeend", `
            <div class="tab">
                <p class="text">${title}</p>
                <div class="icons">
                    <a href="${modifier}">
                        <img class="pencil" src="/static/img/pencil.svg">
                    </a>
                    <a href="">
                        <img class="eye" src="/static/img/eye.svg">
                    </a>
                    <a class="start" href="/prof/diffusionProf/${exoid}">Start</a>
                    <a href="${supprimer}">
                        <img class="trashcan" src="/static/img/trash-can.svg">
                    </a>
                </div>
            </div>`);
    }

    function sortedPerTag() {
        document.getElementById('questions').innerHTML = `
        <a href="/prof/creer" class="aTab">
            <img src="/static/img/plus.svg" class="plus">
            <p class="text">Nouvelle question</p>
        </a>`;
        let tags = document.getElementById('tags').value;
        tags+=';'
        let tag_list = rec(tags);
        liste_exo = [];
        let exo;
        Object.keys(exos).forEach(exoID => {
            exo = exos[exoID];
            if (!liste_exo.includes(exo)) {
                if (checkTags(exo.tags, tag_list)) {
                    liste_exo.push(exo);
                }
            }
        })
        liste_exo.forEach(exo => {
            addQuest(exo.title, exo.id);
        });
        if (liste_exo.length == 0){
            alert("Il n'y a pas d'exercices avec ce tag");
            for (let i = 0; i < Object.keys(exos).length; i++) {
                let key = Object.keys(exos)[i];
                let exo = exos[key];
                addQuest(exo.title, exo.id);
            }
        }

}
function rec(str,type="and",pos=0){
    let liste = [type,["and"]];
    let mot = "";
    let i = pos-1;
    while(i<str.length-1){
        i++;
        let check = str[i]
        switch(true){
            case (check===',' && mot !==""):
                liste[liste.length-1].push(mot);
                mot ="";
                break;
            case (check==='(' && str.slice(i).includes("^") && str.slice(i).includes(")")):
                let suite = rec(str,"or",i+1);
                liste[liste.length-1].push(suite);
                i=suite[1];
                break;
            case (check===')' && str.slice(0,i).includes("^") && str.slice(0,i).includes("(")):
                if (mot!==""){
                    liste[liste.length-1].push(mot);
                    mot ="";
                }
                return(liste);
                break;
            case(check==='^' && str.slice(i).includes(")") && str.slice(0,i).includes("(")):
                if (mot!==""){
                    liste[liste.length-1].push(mot);
                    mot ="";
                }
                liste.push(['and']);
                break;
            case (check===";" && i!=str.length):
                if (mot!==""){
                    liste[liste.length-1].push(mot);
                    mot ="";
                }
                break;
            default:
                mot+=str[i];
        }
    }
    return(liste);
}

function checkTags(str_tag, liste_test){
    let val = liste_test[0]==="and";
    if (liste_test[0]==="and") {
        for (let i=1;i<liste_test.length;i++){
            if (Array.isArray(liste_test[i])){
                val = val && checkTags(str_tag,liste_test[i]);
            }
            else {
                if (!liste_test[i].startsWith('!')){
                    val = val && (str_tag.includes(liste_test[i]));
                }
                else{
                    val = val && !(str_tag.includes(liste_test[i].slice(1)));
                }
            }
        }
    }
    else if (liste_test[0]==="or") {
        for (let i=1;i<liste_test.length;i++){
            if (Array.isArray(liste_test[i])){
                val = val || checkTags(str_tag,liste_test[i]);
            }
            else {
                if (!liste_test[i].startsWith('!')){
                    val = val || (str_tag.includes(liste_test[i]));
                }
                else{
                    val = val || !(str_tag.includes(liste_test[i].slice(1)));
                }
            }
        }
    }
    return val;
}
