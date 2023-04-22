window.onload = function () {
    listQTemp = [];
    listQTempSearch = listQTemp;
    listSTemp = [];
    createPage();
}

function createPage() {
    if (seq === {}) {
        document.getElementById('inputName').value = seq.titre;
    }
    listSTemp.length = Object.keys(listS).length;
    let keyTest = [];
    for (let i = 0; i < Object.keys(listS).length; i++) {
        let key = Object.keys(listS)[i];
        let exo = listS[key];
        listSTemp[exo.ordre] = exo;
        keyTest.push(exo.id);
    }
    for (let i = 0; i < Object.keys(listQ).length; i++) {
        let key = Object.keys(listQ)[i];
        let exo = listQ[key];
        if (!keyTest.includes(exo.id)) {
            listQTemp.push(exo)
        }
    }
    printTableau();
}


function printTableau() {
    let divQuestion = document.getElementById('question');
    divQuestion.innerHTML = "";
    listQTempSearch.forEach(function (question) {
        divQuestion.innerHTML += `<div class="ligne">
                                    <p>${question.title}</p>
                                    <img src="/static/img/right.svg" onclick="addQuestion('${question.id}')">
                                    </div>`
    });
    let divSequence = document.getElementById('sequence');
    divSequence.innerHTML = "";
    listSTemp.forEach(function (sequence) {
        divSequence.innerHTML += `<div class="ligne">
                                    <p>${sequence.title}</p>
                                    <span>
                                        <img src="/static/img/left.svg" onclick="removeSequence('${sequence.id}')">
                                        <img src="/static/img/top.svg" onclick="upSequence('${sequence.id}')">
                                        <img src="/static/img/bot.svg" onclick="downSequence('${sequence.id}')">
                                    </span>
                                  </div>`
    });
    let inputSequence = document.getElementById('inputSequence');
    inputSequence.innerHTML = "";
    for (let i = 0; i < listSTemp.length; i++) {
        let question = "question" + i;
        inputSequence.innerHTML += `<input type="hidden" name="${question}" value="${listSTemp[i].id}">`
    }
}

function addQuestion(quest) {
    let qst = listQ[quest];
    let place = indexOfDict(listQTemp,qst.id)
    listSTemp.push(listQTemp[place]);
    listQTemp.splice(place, 1);
    printTableau();
}

function removeSequence(quest) {
    let qst = listQ[quest];
    let place = indexOfDict(listSTemp,qst.id)
    listQTemp.push(listSTemp[place]);
    listSTemp.splice(place, 1);
    printTableau();
}

function upSequence(quest) {
    let qst = listQ[quest];
    let place = indexOfDict(listSTemp,qst.id)
    if (place > 0) {
        let temp = listSTemp[place - 1];
        listSTemp[place - 1] = listSTemp[place];
        listSTemp[place] = temp;
    }
    printTableau();
}

function downSequence(quest) {
    let qst = listQ[quest];
    let place = indexOfDict(listSTemp,qst.id)
    if (place < listSTemp.length - 1) {
        let temp = listSTemp[place + 1];
        listSTemp[place + 1] = listSTemp[place];
        listSTemp[place] = temp;
    }
    printTableau();
}

function changeName() {
    document.getElementById('name').value = document.getElementById('inputName').value;
}

function indexOfDict(dict, id) {
    for (var i = 0; i < Object.keys(dict).length; i++) {
        var key = Object.keys(dict)[i]
        if (dict[key].id === id) {
            return i;
        }
    }
    return -1
}

function sortedPerTag() {
    listQTempSearch = [];
    document.getElementById('question').innerHTML = "";
    let tags = document.getElementById('tags').value;
    tags += ';'
    let tag_list = rec(tags);
    liste_exo = [];
    let exo;
    Object.keys(listQ).forEach(exoID => {
        exo = listQ[exoID];
        if (!liste_exo.includes(exo)) {
            if (checkTags(exo.tags, tag_list)) {
                liste_exo.push(exo);
            }
        }
    })
    liste_exo.forEach(exo => {
        listQTempSearch.push(exo);
    });
    if (listQTempSearch.length == 0) {
        alert("Il n'y a pas d'exercices avec ce tag");
        listQTempSearch = listQTemp;
    }
    if (tags == "") {
        listQTempSearch = listQTemp;
    }

    printTableau();
}

function checkTags(str_tag, liste_test) {
    let val = liste_test[0] === "and";
    if (liste_test[0] === "and") {
        for (let i = 1; i < liste_test.length; i++) {
            if (Array.isArray(liste_test[i])) {
                val = val && checkTags(str_tag, liste_test[i]);
            } else {
                if (!liste_test[i].startsWith('!')) {
                    val = val && (str_tag.includes(liste_test[i]));
                } else {
                    val = val && !(str_tag.includes(liste_test[i].slice(1)));
                }
            }
        }
    } else if (liste_test[0] === "or") {
        for (let i = 1; i < liste_test.length; i++) {
            if (Array.isArray(liste_test[i])) {
                val = val || checkTags(str_tag, liste_test[i]);
            } else {
                if (!liste_test[i].startsWith('!')) {
                    val = val || (str_tag.includes(liste_test[i]));
                } else {
                    val = val || !(str_tag.includes(liste_test[i].slice(1)));
                }
            }
        }
    }
    return val;
}

function rec(str, type = "and", pos = 0) {
    let liste = [type, ["and"]];
    let mot = "";
    let i = pos - 1;
    while (i < str.length - 1) {
        i++;
        let check = str[i]
        switch (true) {
            case (check === ',' && mot !== ""):
                liste[liste.length - 1].push(mot);
                mot = "";
                break;
            case (check === '(' && str.slice(i).includes("^") && str.slice(i).includes(")")):
                let suite = rec(str, "or", i + 1);
                liste[liste.length - 1].push(suite);
                i = suite[1];
                break;
            case (check === ')' && str.slice(0, i).includes("^") && str.slice(0, i).includes("(")):
                if (mot !== "") {
                    liste[liste.length - 1].push(mot);
                    mot = "";
                }
                return (liste);
                break;
            case(check === '^' && str.slice(i).includes(")") && str.slice(0, i).includes("(")):
                if (mot !== "") {
                    liste[liste.length - 1].push(mot);
                    mot = "";
                }
                liste.push(['and']);
                break;
            case (check === ";" && i != str.length):
                if (mot !== "") {
                    liste[liste.length - 1].push(mot);
                    mot = "";
                }
                break;
            default:
                mot += str[i];
        }
    }
    return (liste);
}