function OnInput() {
    this.style.height = 0;
    this.style.height = (this.scrollHeight) + "px";
}

let titre, desc, enonce, reponseTot, tags, nbRep;
window.onload = () => {
    titre = json.title;
    type = json.type;
    desc = json.desc;
    enonce = json.enonce;
    reponseTot = json.reponse;
    tags = Object.keys(tagsjson);
    qstTags = json.tags
    if(type !== "txt"){
        nbRep = json.reponse.length;
    }
    mermaid.initialize({startOnLoad: true});
    const options = {throwOnError: false};
    marked.use(markedKatex(options));

    if (enonce !== null){
        document.getElementById('exoIn').value = enonce;
    }
    setTimeout(() => {
        actualisation(document.getElementById('exoIn'));
        creationPage();
        document.addEventListener('input', function (event) { //Chaque fois qu'un input sera fait dans une textarea, on actualisera le contenu marked/mermaid
            actualisation(event.target);

        });
    }, 10);
    const tx = document.getElementsByTagName("textarea");
    for (let i = 0; i < tx.length; i++) {
        tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
        tx[i].addEventListener("input", OnInput, false);

    }


}

function actualisation(target) { // La fonction permettant d'actualiser le marked/mermaid
    let docIn = target;
    let output = '';
    let outputMermaid = '';
    if (docIn.id == 'exoIn') { //Si on a affaire a exoIn (énoncé) alors on set output et ouputMermaid a des valeurs précises
        output = document.getElementById('exoOut');
        outputMermaid = document.getElementById('mermaidOut');
    } else { //Sinon, cela veut dire qu'on a affaire à une reponse donc on récupère le numéro dans l'id, et on adapte output et outputMermaid en conséquence
        let i = docIn.id.split('rep')[1];
        output = document.getElementById('repo' + i);
        outputMermaid = document.getElementById('repmo' + i);
    }
    outputMermaid.innerHTML = ""; //On vide outputMermaid pour qu'il n'affiche pas le syntax error
    let valIn = docIn.value;
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

    output.innerHTML = marked.parse(valIn); // On rentre le texte débarassé du graph dans la sortie normale
    document.querySelectorAll('code').forEach(el => {
        hljs.highlightBlock(el); //On utilise la librairie highlight pour colorer les morceaux de codes
    });

}

function addRep() { //Cette fonction ajoute une nouvelle réponse possible à l'exercice
    addInput();
    autoAjust();
    nbRep += 1;
}
function autoAjust() { //Cette fonction permet de faire un autoAjustement de la taille des textarea
    const tx = document.getElementsByTagName("textarea");
    for (let i = 0; i < tx.length; i++) {
        tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
        tx[i].addEventListener("input", OnInput, false);
    }
}

function addInput() { //La fonction crée les balises html permettant de créer une nouvelle réponse
    var reponse = ("rep" + nbRep);
    var valrep = ("rval" + nbRep);
    var repo = ("repo" + nbRep);
    var repmo = ("repmo" + nbRep);
    var divrep = ("divrep" + nbRep);
    var trash = ("trash" + nbRep);
    document.getElementById('reponse').insertAdjacentHTML('beforeend', `
            <textarea placeholder="Écrire la réponse" name="${reponse}" id="${reponse}"></textarea>
                <input type="checkbox" name="${valrep}" id="${valrep}">
                <div id="${divrep}"><pre id="${repo}"></pre><pre id="${repmo}"></pre></div>
                <img id="${trash}" src="/static/img/trash-can.svg" onclick="deleteLigne(${nbRep})">
            `
    );

}

function addTagSelect() { //Cette fonction permet d'ajouter un nouveau tag depuis le champ de selection
    var tag = document.getElementById('tagsSelect').value;
    if (document.getElementById('listI').value.includes(tag)) {
    } else {
        if (document.getElementById('listI').value === "") { //Si la liste des tags est vide on ajoute juste, le tag, sinon on rajoute une ","
            document.getElementById('listI').value += tag;
            document.getElementById('listP').insertAdjacentText('beforeend', tag);
        } else {
            document.getElementById('listI').value += ',' + tag;
            document.getElementById('listP').insertAdjacentText('beforeend', ',' + tag);
        }
    }
}

function addTagInput() { //Cette fonction permet d'ajouter un nouveau tag depuis le champ de texte
    var tag = document.getElementById('newTag').value;
    if (document.getElementById('listI').value.includes(tag)) {
    } else {
        if (document.getElementById('listI').value == "") { //Si la liste des tags est vide on ajoute juste, le tag, sinon on rajoute une ","
            document.getElementById('listI').value += tag;
            document.getElementById('listP').insertAdjacentText('beforeend', tag);
        } else {
            document.getElementById('listI').value += ',' + tag;
            document.getElementById('listP').insertAdjacentText('beforeend', ',' + tag);
        }
        if (tags.includes(tag) == false) {
            tags.push(tag);
            document.getElementById('tagsSelect').insertAdjacentHTML('beforeend', `<option value="${tag}">${tag}</option>`); //On ajoute le tag a la liste des tags
        }
        document.getElementById('newTag').value = "";
    }
}

function removeTagSelect() { //Cette fonction permet de retirer un tag depuis le champ de selection
    var tag = document.getElementById('tagsSelect').value;
    var tagsI = document.getElementById('listI').value;
    var tagsP = document.getElementById('listP').innerText;
    if (document.getElementById('listI').value.includes(tag)) {
        if(tagsI.includes(',')) {
            document.getElementById('listI').value = tagsI.replace(',' + tag, '');
            document.getElementById('listP').innerText = tagsP.replace(',' + tag, '');
        } else {
            document.getElementById('listI').value = tagsI.replace(tag, '');
            document.getElementById('listP').innerText = tagsP.replace(tag, '');
        }
    }
}

function creationRep() {
    for (var i = 0; i < reponseTot.length; i++) {
        var numerotation = ("Réponse " + i);
        var reponse = ("rep" + i);
        var valrep = ("rval" + i);
        var repo = ("repo" + i);
        var repmo = ("repmo" + i); //CHANGER LES RV ET LE CHECKED
        var divrep = ("divrep" + i);
        var trash = ("trash" + i);
        var checked = "";
        if (reponseTot[i].vraie) {
            checked = 'checked'
        }
        document.getElementById('reponse').insertAdjacentHTML('beforeend', `
                <textarea placeholder="Écrire la réponse" name="${reponse}" id="${reponse}">${reponseTot[i].reponse}</textarea>
                <input type="checkbox" name="${valrep}" id="${valrep}" ${checked}>
                <div id="${divrep}"><pre id="${repo}"></pre><pre id="${repmo}"></pre></div>
                <img id="${trash}" src="/static/img/trash-can.svg" onclick="deleteLigne(${i})">
            `);
        ;
    }
    autoAjust()
}

function creationPage() {
    creaTag();
    if (type === 'qcm') {
        document.getElementById('question').insertAdjacentHTML('beforeend', `
            <div class="contain_responses" id="reponse">
            </div>
            <button type="button" class="add_response" onclick="addRep()">Ajouter une réponse</button>
            `)
        if (reponseTot.length === 0) {
            addRep();
        } else {
            creationRep();
        }
    } else if (type === 'num') {
        document.getElementById('question').insertAdjacentHTML('beforeend', `
            <div class="contain_response">
                <p>Réponse : </p>
                <input type="text" name="reponseNum" class="input-response" value='${reponseTot[0].reponse}'></input>
            </div>
        `)
    }else if (type === 'txt') {
        document.getElementById('question').insertAdjacentHTML('beforeend', `
            <div class="contain_response">
                <p>Il n'y a pas besoin de donner de réponse pour ce type de question</p>
            </div>
        `)
    }
    document.getElementById('listI').value = qstTags;
    document.getElementById('listP').insertAdjacentText('beforeend',qstTags)

}

function creaTag() {
    tags.forEach(element => {
        document.getElementById("tagsSelect").insertAdjacentHTML('beforeend', `
            <option value="${element}">${element}</option>
        `)
    });
}

function deleteLigne(id) {
    nbRep--;
    if (nbRep == 0) {
        alert('Vous devez avoir au moins une réponse');
    } else {
        if (id != nbRep) {
            for (var i = id; i < nbRep; i++) {
                var rep = document.getElementById('rep' + (i + 1)).value;
                var val = document.getElementById('rval' + (i + 1)).checked;
                var divrep = document.getElementById('divrep' + (i + 1));
                var trash = document.getElementById('trash' + (i + 1));
                document.getElementById('rep' + i).value = rep;
                document.getElementById('rval' + i).checked = val;
            }
            document.getElementById('rep' + nbRep).remove();
            document.getElementById('rval' + nbRep).remove();
            document.getElementById('divrep' + nbRep).remove();
            document.getElementById('trash' + nbRep).remove();
        } else {
            document.getElementById('rep' + id).remove();
            document.getElementById('rval' + id).remove();
            document.getElementById('divrep' + id).remove();
            document.getElementById('trash' + id).remove();
        }
    }

}