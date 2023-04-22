let page,type,resultat,numExo,qst,nbr_eleve,reponse_possible,reponse_dict,listRep,dicoRep,nbTotal,nbr_reponse;
window.onload = function () {
    listRep = [];
    dicoRep = {};
    reponse_possible = false;
    page = 1;
    type = "";
    numExo=0;
    resultat = false;
    nbr_eleve=0;
    nbr_reponse =0;
    nbTotal = 0;
    reloadPage();
    setTimeout(() => {
        document.querySelectorAll(".custom-select").forEach((selectElement) => {
            new CustomSelect(selectElement);
        });
    }, 10);
}



function reloadPage() {
    switch (page) {
        case 1:
            createPageAttente();
            break;
        case 2:
            createPageQuestion();
            if (type === "qcm") {
                createPageQCM();
            }
            else if (type === "num") {
                createPageNum();
            }
            else if (type === "txt") {
                createPageResultatOuverte();
            }
            break;
        case 3:
            createPageFin();
            break;
    }
}

function createPageAttente() {
    let div = document.getElementById("container");
    div.innerHTML = "";
    div.insertAdjacentHTML("beforeend", `<div class="pageAttente">
                                                        <h1>Code de la diffusion : ${code}</h1>
                                                        <h2>Titre de la question ou sequence</h2>
                                                        <h2>Nombre de participants : ${nbr_eleve}</h2>
                                                        <button onclick="demarrer('${code}')">Démarrer</button>
                                                     </div>`);
}

function createPageQuestion() {
    let div = document.getElementById("container");
    div.innerHTML = "";
    div.insertAdjacentHTML("beforeend", "<div class='pageQuestion' id='pageQuestion'></div>");
}

function createPageQCM() {
    let div = document.getElementById("pageQuestion");
    div.insertAdjacentHTML("beforeend", `<div class='pageQCM'>
                                                        <h1>Code de la diffusion : ${code}</h1>
                                                        <div class="enonce">
                                                            <input type="checkbox">
                                                            <p id="enonce"></p>
                                                            <pre id="mermaidEnonce"></pre>  
                                                        </div>
                                                        <div class="reponses" id="reponses">
                                                            <input type="checkbox">
                                                            <div class="donnees"><p>réponses : ${nbr_reponse}</p><p>connectés : ${nbr_eleve}</p></div>
                                                        </div>
                                                        <div class="contain-btn">
                                                        <button>Afficher réponses</button>
                                                        <button onclick="stopperReponse('${code}')">Stoppe réponses</button>
                                                        <button onclick="correction()">Afficher correction</button>
                                                        <button onclick="QuestionSuivante('${code}')">Question Suivante</button>                                                        
                                                        </div>
                                                     </div>`);
}

function createPageNum() {
    let div = document.getElementById("pageQuestion");
    div.insertAdjacentHTML("beforeend", `<div class='pageNum'>
                                                        <h1>Code de la diffusion : ${code}</h1>
                                                        <div class="enonce">
                                                            <input type="checkbox">
                                                            <p id="enonce">${qst.enonce}</p>
                                                            <pre></pre>  
                                                        </div>
                                                        <div class="bas">
                                                            <div class="reponses">
                                                                <input type="checkbox">
                                                                <span>
                                                                    <p>Reponse 1</p><pre></pre>
                                                                    <div class="barre" id="barre1"><p>40%</p></div>
                                                                </span>
                                                                <span>
                                                                    <p>Reponse 2</p><pre></pre>
                                                                    <div class="barre" id="barre2"><p>25%</p></div>
                                                                </span>
                                                                <span>
                                                                    <p>Reponse 3</p><pre></pre>
                                                                    <div class="barre" id="barre3"><p>15%</p></div>
                                                                </span>
                                                                <span>
                                                                    <p>Reponse 4</p><pre></pre>
                                                                    <div class="barre" id="barre4"><p>12.5%</p></div>
                                                                </span>
                                                                <span>
                                                                    <p>Reponse 5</p><pre></pre>
                                                                    <div class="barre" id="barre5"><p>7.5%</p></div>
                                                                </span>
                                                            </div>
                                                            <div class="contain-btn">
                                                                <button>Afficher réponses</button>
                                                                <button onclick="stopperReponse('${code}')">Stoppe réponses</button>
                                                                <button onclick="correctionTxt()">Afficher correction</button>
                                                                <button onclick="QuestionSuivante('${code}')">Question Suivante</button>       
                                                                <div class="donnees"><p>réponses : ${nbr_reponse}</p><p>connectés : ${nbr_eleve}</p></div>                                                 
                                                            </div>
                                                        </div>
                                                     </div>`);
}


function createPageFin() {
    let div = document.getElementById("container");
    div.innerHTML = "";
    div.insertAdjacentHTML("beforeend", `<div class='pageFin'>
                                                        <h1>Fin de la diffusion</h1>
                                                        <a href="/prof/statistiqueSequence"><button>Panel Statistique</button></a>
                                                        <a href="/prof/"><button>Panel Configuration</button></a>
                                                    `);
}


function fillPageQuestion(qst) {
    if (type === "qcm") {
        document.getElementById("enonce").innerHTML = qst.enonce;
        for (let i = 0; i < qst.reponse.length; i++) {
            reponse = qst.reponse[i].reponse;
            document.getElementById("reponses").insertAdjacentHTML("beforeend", `
                                                            <span>
                                                                <p>${reponse}</p><pre></pre></span>
                                                            `);
        }

    } else if (type === "num") {
        document.getElementById("enonce").innerHTML = qst.enonce;
    }
}

function createPageResultatOuverte() {
    let div = document.getElementById("container");
    div.innerHTML = "";
    div.insertAdjacentHTML("beforeend", `<div class='pageResultat'>
                                                        <h1 id="enonce">Enoncé : ${qst.enonce}</h1>
                                                            <div class="reponsesNuage" id="nuageMot">

                                                            </div>

                                                        </div>
                                                     <div class="contain-btn">
                                                                <button>Afficher réponses</button>
                                                                <button onclick="stopperReponse('${code}')">Stoppe réponses</button>
                                                                <button onclick="correctionTxt()">Afficher correction</button>
                                                                <button onclick="QuestionSuivante('${code}')">Question Suivante</button>       
                                                                <div class="donnees"><p>réponses : ${nbr_reponse}</p><p>connectés : ${nbr_eleve}</p></div>                                                 
                                                            </div>`);
    nuageRep();

}
function nuageRep(){
    nbTotal=0;
    for (let i = 0; i < Object.keys(dicoRep).length; i++) {
        let key = Object.keys(dicoRep)[i];
        nbTotal += dicoRep[key];
    }
    listRep = [];
    for (let i = 0; i < Object.keys(dicoRep).length; i++) {
        let key = Object.keys(dicoRep)[i];
        let nb = (dicoRep[key]/nbTotal);
        listRep.push([key, nb]);
    }
    let nuageMot = document.getElementById('nuageMot')
    console.log(listRep,dicoRep)
    WordCloud(nuageMot, {
      list: listRep,
      fontFamily: "Times, serif",
      rotateRatio: 0,
      shuffle: false,
      gridSize: 30,
      color: function(word,weight) {
        var r = Math.round(120 - (weight * 250));
        var g = Math.round(140 - (weight * 250));
        var b = Math.round(160 + (weight * 300));
        var color = "rgb(" + r + "," + g + "," + b + ")";
        return color;
      },
        weightFactor: function (size) {
        return size * 200;
    }

});
}