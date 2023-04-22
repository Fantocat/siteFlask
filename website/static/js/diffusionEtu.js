let page,type,resultat,numExo,qst,nbr_eleve,reponse_dict,urResult,Goodresult,resultGood,liste_goodresult,dicoRepTxt,listRepTxt;
window.onload = function () {
    qst = {}
    page = 1;
    type = "";
    resultat = false;
    reloadPage();
}



function reloadPage() {
    switch (page) {
        case 1:
            createPageAttente();
            break;
        case 2:
            createPageQuestion();
            if (resultat) {
                if (type === "qcm") {
                    createPageResultatQCM();
                    AffichageCorrection();
                }
                if (type === "num") {
                    createPageResultatNum();
                    AffichageCorrection();
                }
                if (type==="txt"){
                    createPageResultatOuverte()
                }
            } else {
                if (type === "qcm") {
                    createPageQCM();
                }
                if (type === "num") {
                    createPageNum();
                }
                if (type === "txt") {
                    createPageTxt();
                }
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
                                                        <h1>En attente du début de la diffusion</h1>
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
                                                        <h1 id="enonce">Enoncé</h1>
                                                        <div class="reponses">
                                                            <select class="custom-select" id="select">
                                                            </select>
                                                        </div>
                                                        <div id="buttonRep" class="contain-btn"><button onclick="envoiReponseQCM()">Valider</button></div>
                                                     </div>`);
}

function onStoppeRep() {
    let div = document.getElementById("buttonRep");
    div.innerHTML = "";
    div.insertAdjacentHTML("beforeend", `<button onclick="">Fin des réponses</button>`);
}

function createPageNum() {
    let div = document.getElementById("pageQuestion");
    div.insertAdjacentHTML("beforeend", `<div class='pageNum'>
                                                        <h1 id="enonce">Enoncé </h1>
                                                        <div class="reponse">
                                                            <p>Entrer votre réponse : </p><input placeholder="votre réponse" id="repNum">
                                                        </div>
                                                        <div class="contain-btn"><button onclick="envoiReponseNum()"">Valider</button></div>
                                                     </div>`);
}

function createPageTxt() {
    let div = document.getElementById("pageQuestion");
    div.insertAdjacentHTML("beforeend", `<div class='pageNum'>
                                                        <h1 id="enonce">Enoncé </h1>
                                                        <div class="reponse">
                                                            <p>Entrer votre réponse : </p><input placeholder="votre réponse" id="repTxt">
                                                        </div>
                                                        <div class="contain-btn"><button onclick="envoiReponseTxt()"">Valider</button></div>
                                                     </div>`);
}

function createPageResultatQCM() {
    let div = document.getElementById("container");
    div.innerHTML = "";
    div.insertAdjacentHTML("beforeend", `<div class='pageResultat'>
                                                        <h1 id="enonce">Enoncé : ${qst.enonce}</h1>
                                                        <h2 id="urRep">Votre reponse :  ${urResult}</h2>
                                                        <p id="resultBoolean"></p>
                                                        <div class="contain-core">
                                                            <div class="reponses" id="reponses">
                                                                <p>Bonne(s) réponse(s) :</p>
                                                            </div>
                                                    
                                                        </div>
                                                     </div>`);

}
function createPageResultatNum() {
    let div = document.getElementById("container");
    div.innerHTML = "";
    div.insertAdjacentHTML("beforeend", `<div class='pageResultat'>
                                                        <h1 id="enonce">Enoncé : ${qst.enonce}</h1>
                                                        <h2 id="urRep">Votre reponse :  ${urResult}</h2>
                                                        <p id="resultBoolean"></p>
                                                        <div class="contain-core">
                                                            <div class="reponses" id="reponses">
                                                            <p>Bonne réponse :</p>
                                                                ${Goodresult.reponse}
                                                            </div>
                                                        
                                                        </div>
                                                     </div>`);

}


function AffichageCorrection(){
    if(resultGood){
        document.getElementById('resultBoolean').innerHTML='Vous avez répondu juste';
    } else {
        document.getElementById('resultBoolean').innerHTML='Vous avez répondu faux';
    }
    if (type==='qcm'){
        liste_goodresult.forEach( (result) =>{
            document.getElementById('reponses').insertAdjacentHTML('beforeend',`
            <span>
            <p>`+result.reponse+`</p><pre></pre>
             </span>
            `)

        })
    }
    }

function getPourcent(result,type){
    if (type === 'qcm') {
        let prct = reponse_dict[result.id]/nbr_reponse;
    }
    else{
        let prct = reponse_dict[result]/nbr_reponse;
    }
    return prct;
}

function setPourcentQCM() {
    let barre1 = document.getElementById("barre1");
    let barre2 = document.getElementById("barre2");
    let barre3 = document.getElementById("barre3");

    barre1.style.width = "20%";
    barre2.style.width = "50%";
    barre2.style.backgroundColor = "#3A5199";
    barre3.style.width = "30%";
}

function setPourcentNum() {
    let barre1 = document.getElementById("barre1");
    let barre2 = document.getElementById("barre2");
    let barre3 = document.getElementById("barre3");
    let barre4 = document.getElementById("barre4");
    let barre5 = document.getElementById("barre5");

    barre1.style.width = "50%";
    barre1.style.backgroundColor = "#3A5199";
    barre2.style.width = "40%";
    barre3.style.width = "25%";
    barre4.style.width = "10%";
    barre5.style.width = "5%";
}



function createPageFin() {
    let div = document.getElementById("container");
    div.innerHTML = "";
    div.insertAdjacentHTML("beforeend", `<div class='pageFin'>
                                                        <h1>fin de la diffusion</h1>
                                                        <p>Tu as eu : 4 sur 7</p>
                                                        <a href="/etu/"><button>Retour à l'accueil</button></a>
                                                    `);
}



function PageValidee(enonce,rep) {
    let div = document.getElementById("pageQuestion");
    div.innerHTML = "";
    div.insertAdjacentHTML("beforeend", `
        <h1>${enonce}</h1>
        <span>
            <p>Votre reponse : ${rep}</p>
        </span>
    `);
}

function fillPageQuestion(qst) {
    if (type == "qcm") {
        for (let i = 0; i < qst.reponse.length; i++) {
            document.getElementById("select").insertAdjacentHTML("beforeend","<option value='"+qst.reponse[i].id+"'>"+qst.reponse[i].reponse+"</option>");
        }
        document.querySelectorAll(".custom-select").forEach((selectElement) => {
            new CustomSelect(selectElement);
    });
    }
    document.getElementById("enonce").innerHTML = qst.enonce;

}



class CustomSelect {
    constructor(originalSelect) {
        this.originalSelect = originalSelect;
        this.customSelect = document.createElement("div");
        this.customSelect.classList.add("select");

        this.originalSelect.querySelectorAll("option").forEach((optionElement) => {
            const itemElement = document.createElement("div");

            itemElement.classList.add("select__item");
            itemElement.textContent = optionElement.textContent;
            this.customSelect.appendChild(itemElement);

            if (optionElement.selected) {
                this._select(itemElement);
            }

            itemElement.addEventListener("click", () => {
                if (
                    this.originalSelect.multiple &&
                    itemElement.classList.contains("select__item--selected")
                ) {
                    this._deselect(itemElement);
                } else {
                    this._select(itemElement);
                }
            });
        });

        this.originalSelect.insertAdjacentElement("afterend", this.customSelect);
        //this.originalSelect.style.display = "none";
    }

    _select(itemElement) {
        const index = Array.from(this.customSelect.children).indexOf(itemElement);

        if (!this.originalSelect.multiple) {
            this.customSelect.querySelectorAll(".select__item").forEach((el) => {
                el.classList.remove("select__item--selected");
            });
        }

        this.originalSelect.querySelectorAll("option")[index].selected = true;
        itemElement.classList.add("select__item--selected");
    }

    _deselect(itemElement) {
        const index = Array.from(this.customSelect.children).indexOf(itemElement);

        this.originalSelect.querySelectorAll("option")[index].selected = false;
        itemElement.classsList.remove("select__item--selected");
    }
}
function createPageResultatOuverte() {
    let div = document.getElementById("container");
    div.innerHTML = "";
    div.insertAdjacentHTML("beforeend", `<div class='pageResultat'>
                                                        <h1 id="enonce">Enoncé : ${qst.enonce}</h1>
                                                        <h2 id="urRep">Votre reponse :  ${urResult}</h2>
                                                        <p id="resultBoolean"></p>
                                                            <div class="reponsesNuage" id="nuageMot">
                                                            </div>                                                        
                                                     </div>`);
    nuageRep();

}

function nuageRep(){
    let nuageMot = document.getElementById('nuageMot')
    console.log(listRepTxt);
    WordCloud(nuageMot, {
      list: listRepTxt,
      fontFamily: "Times, serif",
      rotateRatio: 0,
      shuffle: false,
      gridSize: 30,
      wait: 200,
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