let listQ, nbType;

window.onload = () => {
    mermaid.initialize({startOnLoad: true});
    const options = {throwOnError: false};
    marked.use(markedKatex(options));
    nbType = 1;
    addTags();
    addSelectTypeLoad();
    document.querySelectorAll(".custom-select").forEach((selectElement) => {
        new CustomSelect(selectElement);
    });
}

let tagsList = []
let listTypeChoice = []

function addType() {
    listType = document.getElementById("listType");
    listType.insertAdjacentHTML("beforeend", `
    <span >
        <p>Nombre de question de type : </p>
        <select class="selectType" onchange="onChoosetag(${nbType})">
            <option value="" disabled selected hidden>Choisir un tag</option>
        </select>
        <p>entre : </p>
        <select class="min">
        </select>
        <p> et : </p>
        <select class="max">
        </select>
    </span>
    `);
    addSelectType();
    nbType++;
}

function removeType() {
    if (nbType > 1) {
        let listType = document.getElementById("listType");
        listType.removeChild(listType.lastElementChild);
        ;
        nbType--;
    }
}

function addTags() {
    Object.keys(tagsDict).forEach(function (tag) {
        tagsList.push(tag);
    });
}

function addSelectType() {
    let select = document.querySelectorAll('.selectType')[nbType];
    select.innerHTML = "";
    select.insertAdjacentHTML("beforeend", '<option value="" disabled selected hidden>Choisir un tag</option>')
    tagsList.forEach(function (tag) {
        select.insertAdjacentHTML("beforeend", `<option value="${tag}">${tag}</option>`);
    });
}

function addSelectTypeLoad() {
    let select = document.querySelectorAll('.selectType')[0];
    select.insertAdjacentHTML("beforeend", '<option value="" disabled selected hidden>Choisir un tag</option>')
    tagsList.forEach(function (tag) {
        select.insertAdjacentHTML("beforeend", `<option value="${tag}">${tag}</option>`);
    });
}

function onChoosetag(num) {
    let select = document.querySelectorAll('.selectType')[num];
    let tag = select.options[select.selectedIndex].value;
    let min = document.querySelectorAll('.min')[num];
    let max = document.querySelectorAll('.max')[num];
    min.innerHTML = "";
    max.innerHTML = "";
    for (let i = 0; i <= tagsDict[tag].length; i++) {
        min.insertAdjacentHTML("beforeend", `<option value="${i}">${i}</option>`);
        max.insertAdjacentHTML("beforeend", `<option value="${i}">${i}</option>`);
    }
}

function createSujet() {
    if (verifDoublon()) return;
    if (verifnbQuestion()) return;
    if (verifnbTotal()) return;
    if (verifnbSujet()) return;
    if (verifnbMin()) return;
    if (verifnbMax()) return;

    let type = [];
    let mins = [];
    let maxs = [];

    document.querySelectorAll('.selectType').forEach((selectElement) => {
        let tag = selectElement.options[selectElement.selectedIndex].value;
        type.push(tag);
    });
    document.querySelectorAll('.min').forEach((selectElement) => {
        let min = parseInt(selectElement.options[selectElement.selectedIndex].value);
        mins.push(min);
    });
    document.querySelectorAll('.max').forEach((selectElement) => {
        let max = parseInt(selectElement.options[selectElement.selectedIndex].value);
        maxs.push(max);
    });
    let nbTotal = document.getElementById("nbTotal").value;
    let nbSujet = document.getElementById("nbSujet").value;
    let ordreQuestion = document.getElementById("ordre").value;
    let nameSubject = document.getElementById("name").value;
    let titreExam = document.getElementById("titreExam").value;

    let numTypes = type.length;
    let limitclock = nbSujet * 5;
    let combinations = [];
    let nbCreer = 0;
    while (nbCreer < nbSujet) {  // générer les sujets
        let maxsTemp = maxs.slice();
        let minsTemp = mins.slice();
        if (limitclock === 0) { // si on a fait trop de tentative pour générer un sujet
            alert("Impossible de générer les sujets avec ces paramètres");
            return;
        }
        let combination = [];
        let count = 0;
        for (let k = 0; k < numTypes; k++) { // générer un tableau pour chaque type de question
            combination.push([]);
        }
        limitSujet = nbTotal * 5;
        while (count < nbTotal) {   // générer un sujet
            limitSujet--;
            if (limitSujet === 0) { // Au cas ou pour sortir de la loop
                alert("Impossible de générer les sujets avec ces paramètres");
                return;
            }
            let limitquestion = nbTotal * 5;
            let min = 0;
            for (let k = 0; k < numTypes; k++) {  // calculer le nombre minimum de questions restantes
                min += (minsTemp[k]);
            }
            if (min !== 0) {
                while (min !== 0) {   // générer les questions minimum de chaque type
                    for (let k = 0; k < numTypes; k++) {
                        if (minsTemp[k] > 0) { // si on a pas encore le nombre minimum de ce type de question
                            let qst = tagsDict[type[k]][Math.floor(Math.random() * tagsDict[type[k]].length)];
                            let doublon = false;
                            for (let l = 0; l < numTypes; l++) {  // vérifier si la question est déjà dans le sujet
                                if (combination[l].includes(qst)) {
                                    doublon = true;
                                    break;
                                }
                            }
                            if (doublon) {  // si la question est déjà dans le sujet
                            } else {  // si la question n'est pas dans le sujet
                                combination[k].push(qst);
                                minsTemp[k]--;
                                maxsTemp[k]--;
                            }
                        }
                    }
                    min = 0;
                    for (let k = 0; k < numTypes; k++) {  // calculer le nombre minimum de questions restantes
                        min += (minsTemp[k]);
                    }
                    limitquestion--;
                    if (limitquestion === 0) { // si on a fait trop de tentative pour générer un sujet
                        alert("Une question avec plusieurs tags bloque la creation du sujet");
                        return;
                    }
                }
            } else {// si on a le nombre minimum de chaque type de question
                let k = Math.floor(Math.random() * numTypes); // choisir un type de question au hasard
                if (maxsTemp[k] > 0) {  // si on peut encore ajouter ce type de question
                    let qst = tagsDict[type[k]][Math.floor(Math.random() * tagsDict[type[k]].length)];
                    let doublon = false;
                    for (let l = 0; l < numTypes; l++) {  // vérifier si la question est déjà dans le sujet
                        if (combination[l].includes(qst)) {
                            doublon = true;
                            break;
                        }
                    }
                    if (doublon) {   // si la question est déjà dans le sujet
                    } else {
                        combination[k].push(qst);
                        maxsTemp[k]--;
                    }
                }
            }
            count = 0;
            for (let k = 0; k < numTypes; k++) {
                count += combination[k].length;
            }
        }
        let sujet = [];  //remettre les ID dans un seul tableau
        for (let k = 0; k < numTypes; k++) {
            for (let l = 0; l < combination[k].length; l++) {
                sujet.push(combination[k][l]);
            }
        }
        let test = true;
        for (let j = 0; j < combinations.length; j++) { // vérifier que le sujet n'est pas déjà dans la liste
            if (combinations[j].sort().join() === sujet.sort().join()) {
                test = false;
                limitclock--;
                break;
            }
        }
        if (test) {
            combinations.push(sujet);
        }
        nbCreer = combinations.length;
    }

    if (ordreQuestion === "false") {  // mélanger les questions si c'est demandé
        for (let i = 0; i < combinations.length; i++) {
            combinations[i].sort(function () {
                return 0.5 - Math.random();
            });
        }
    }
    console.log(combinations);

    printSujets(combinations, nameSubject, titreExam);
}

function verifDoublon() {
    listTypeChoice = [];
    document.querySelectorAll('.selectType').forEach((selectElement) => {
        let tag = selectElement.options[selectElement.selectedIndex].value;
        if (tag !== "") {
            if (listTypeChoice.includes(tag)) {
                alert("Doublon de tag");
                return true;
            }
            listTypeChoice.push(tag);
        }
        if (listTypeChoice.length === 0) {
            alert("Aucun tag choisi");
            return true;
        }
    });
}

function verifnbQuestion() {
    document.querySelectorAll('.selectType').forEach((selectElement) => {
        min = selectElement.parentElement.querySelector('.min').value;
        max = selectElement.parentElement.querySelector('.max').value;
        if (min > max) {
            alert("Le nombre minimum de question est supérieur au nombre maximum");
            return true;
        }
    });
}

function verifnbTotal() {
    let input = document.getElementById("nbTotal").value;
    if (input === "") {
        alert("Veuillez rentrer un nombre de question");
        return true;
    }
    if (isNaN(input)) {
        alert("Veuillez rentrer un nombre de question valide");
        return true;
    }
}

function verifnbSujet() {
    let input = document.getElementById("nbSujet").value;
    if (input === "") {
        alert("Veuillez rentrer un nombre de sujet");
        return true;
    }
    if (isNaN(input)) {
        alert("Veuillez rentrer un nombre de sujet valide");
        return true;
    }
}

function verifnbMin() {
    let mins = 0;
    document.querySelectorAll('.min').forEach((min) => {
        mins += parseInt(min.value);
    });
    if (mins > document.getElementById("nbTotal").value) {
        alert("Le nombre de question minimum est supérieur au nombre total de question");
        return true;
    }
}

function verifnbMax() {
    let maxs = 0;
    document.querySelectorAll('.max').forEach((max) => {
        maxs += parseInt(max.value);
    });
    if (maxs < document.getElementById("nbTotal").value) {
        alert("Le nombre de question maximum est inférieur au nombre total de question");
        return true;
    }
}

function printSujets(combinations, nameSubject, titreExam) {
    let container = document.getElementById("containSubjects");
    container.innerHTML = "";
    for (let i = 0; i < combinations.length; i++) {
        container.insertAdjacentHTML("beforeend", `<div class="sujet" id="${i}">
        </div>
        `);
    }
    if (nameSubject == "true") {
        let sujet = document.querySelectorAll(".sujet");
        sujet.forEach((sujet) => {
            sujet.insertAdjacentHTML("beforeend", `<div class="header">
            <h1>${titreExam}</h1>
            <span><p>Nom :</p><input></span>
            <span><p>Prénom :</p><input></span>
            <span><p>N°Etudiant :</p><input></span>
            </div>
            `);
        });
    } else {
        let sujet = document.querySelectorAll(".sujet");
        sujet.forEach((sujet) => {
            sujet.insertAdjacentHTML("beforeend", `<div class="header">
            <h1>${titreExam}</h1>
            <table>
            <tr><p>Ecrire le numéro d'anonymat</p></tr>
            <tr>
            <td><input type="checkbox">0</td>
            <td><input type="checkbox">0</td>
            <td><input type="checkbox">0</td>
            <td><input type="checkbox">0</td>
            <td><input type="checkbox">0</td>
            <td><input type="checkbox">0</td>
        </tr>
        <tr>
            <td><input type="checkbox">1</td>
            <td><input type="checkbox">1</td>
            <td><input type="checkbox">1</td>
            <td><input type="checkbox">1</td>
            <td><input type="checkbox">1</td>
            <td><input type="checkbox">1</td>
        </tr>
        <tr>
            <td><input type="checkbox">2</td>
            <td><input type="checkbox">2</td>
            <td><input type="checkbox">2</td>
            <td><input type="checkbox">2</td>
            <td><input type="checkbox">2</td>
            <td><input type="checkbox">2</td>
        </tr>
        <tr>
            <td><input type="checkbox">3</td>
            <td><input type="checkbox">3</td>
            <td><input type="checkbox">3</td>
            <td><input type="checkbox">3</td>
            <td><input type="checkbox">3</td>
            <td><input type="checkbox">3</td>
        </tr>
        <tr>
            <td><input type="checkbox">4</td>
            <td><input type="checkbox">4</td>
            <td><input type="checkbox">4</td>
            <td><input type="checkbox">4</td>
            <td><input type="checkbox">4</td>
            <td><input type="checkbox">4</td>
        </tr>
        <tr>
            <td><input type="checkbox">5</td>
            <td><input type="checkbox">5</td>
            <td><input type="checkbox">5</td>
            <td><input type="checkbox">5</td>
            <td><input type="checkbox">5</td>
            <td><input type="checkbox">5</td>
        </tr>
        <tr>
            <td><input type="checkbox">6</td>
            <td><input type="checkbox">6</td>
            <td><input type="checkbox">6</td>
            <td><input type="checkbox">6</td>
            <td><input type="checkbox">6</td>
            <td><input type="checkbox">6</td>
        </tr>
        <tr>
            <td><input type="checkbox">7</td>
            <td><input type="checkbox">7</td>
            <td><input type="checkbox">7</td>
            <td><input type="checkbox">7</td>
            <td><input type="checkbox">7</td>
            <td><input type="checkbox">7</td>
        </tr>
        <tr>
            <td><input type="checkbox">8</td>
            <td><input type="checkbox">8</td>
            <td><input type="checkbox">8</td>
            <td><input type="checkbox">8</td>
            <td><input type="checkbox">8</td>
            <td><input type="checkbox">8</td>
        </tr>
        <tr>
            <td><input type="checkbox">9</td>
            <td><input type="checkbox">9</td>
            <td><input type="checkbox">9</td>
            <td><input type="checkbox">9</td>
            <td><input type="checkbox">9</td>
            <td><input type="checkbox">9</td>
        </tr>
        </table>
        </div>
            `);
        });
    }
    for (let i = 0; i < combinations.length; i++) {
        let sujetDiv = document.getElementById(i);
        combinations[i].forEach((sujet) => {
            if (listQ[sujet].type === "qcm") {
                sujetDiv.insertAdjacentHTML("beforeend", `<div class="question">
            <div class="text">${listQ[sujet].enonce}</div>
            <pre class="mermaid"></pre>
            </div>
            `);
                listQ[sujet].reponse.forEach((reponse) => {
                    sujetDiv.insertAdjacentHTML("beforeend", `<div class="reponse">
                <input type="checkbox">
                <div class="text">${reponse.reponse}</div>
                <pre class="mermaid"></pre>
                </div>
                `);
                });
            } else if (listQ[sujet].type === "num" || listQ[sujet].type == "txt") {
                sujetDiv.insertAdjacentHTML("beforeend", `<div class="question">
            <div class="text">${listQ[sujet].enonce}</div>
            <pre class="mermaid"></pre>
            <div class="divrep"></div>
            </div>
            `);
            }
        });
    }
    makeStyle();
    document.querySelectorAll('code').forEach(el => {
        hljs.highlightBlock(el);
    });
}

function makeStyle() {
    let questions = document.querySelectorAll(".question");
    questions.forEach((question) => {
        affichageMarkedMermaid(question);
    });
    let reponses = document.querySelectorAll(".reponse");
    reponses.forEach((reponse) => {
        affichageMarkedMermaid(reponse);
    });
}

function affichageMarkedMermaid(obj) { //Fonction qui génère le graphique mermaid si existant, et transforme le texte en marked
    let valIn = obj.querySelector(".text").innerHTML;
    let outputMermaid = obj.querySelector(".mermaid");
    let mermaid_str = "";
    if (valIn.includes("``` mermaid")) { //On detecte si le paterne ``` mermaid ... ``` est trouvé, si c'est le cas
        let pos = valIn.indexOf("``` mermaid");
        let pos_end = valIn.indexOf("```", pos + 11);
        mermaid_str = valIn.substring(pos + 11, pos_end);// on récupère le graph écrit à l'intérieur et on le stocke
        valIn = valIn.replace("``` mermaid" + mermaid_str + "```", ''); //On retire le graph du texte
        const code = mermaid_str.trim();
        mermaid.render(outputMermaid.id + 'graph', code, (svg) => { //On applique la fonction mermaid.render pour afficher le graph dans outputMermaid.html
            outputMermaid.innerHTML = svg;
        });
    }

    obj.querySelector(".text").innerHTML = marked.parse(valIn); // On rentre le texte débarassé du graph dans la sortie normale
}