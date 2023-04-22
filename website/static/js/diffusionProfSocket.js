

socket.on('connect', () => {
    console.log('Connected to server!');
    socket.emit('join', {'room': code + 'prof','code':code});
});

socket.on('disconnect', () => {
    console.log('Disconnected from server!');
    socket.emit('leave', {'room': code + 'prof','code':code});
});

socket.on('demarrage',(data)=>{
    console.log(data)
    reponse_possible = true;
    page = 1;
    let estSeq = data["estSequence"];
    let objet = data["objet"];
    if (estSeq){
        numExo=0;
        let exoid = Object.keys(objet.exos)[numExo];
        qst = objet.exos[exoid];



    }else{
        qst=objet;
    }
    type = qst.type;
    page = 2;
    if (type === 'qcm') {
        reponse_dict = getDictRep(qst);
        }
    else if (type==='num'){
            reponse_dict = {};
        }
    else{
            listRep=[];
            dicoRep={};
        }
    reloadPage();
    fillPageQuestion(qst);

});

socket.on('nextQuestion',(data)=>{
    qst = data['question'];
    type = qst.type;
    page = 2;
    reloadPage();
    fillPageQuestion(qst);
})

socket.on('Fin',(data)=>{
    page = 3;
    reloadPage();
})

socket.on('ajoutEleve',(data)=>{
    nbr_eleve++;
    reloadPage();
    fillPageQuestion(qst);
});
socket.on('perteEleve',(data)=>{
    nbr_eleve--;
    reloadPage();
    fillPageQuestion(qst);
});

socket.on('nouvelleRepQCM',(data)=>{
    let id = data['repId'];
    reponse_dict[id]++;
    nbr_reponse++;
    reloadPage()
    fillPageQuestion(qst);
});

socket.on('nouvelleRepNum',(data)=>{
    let rep = data['rep'];
    if (rep in reponse_dict ){
        reponse_dict[rep]++;
    } else{
        reponse_dict[rep]=1;
    }
    nbr_reponse++;
    reloadPage();
    fillPageQuestion(qst);
});


socket.on('nouvelleRepTxt',(data)=>{
    console.log('!!!')
    let rep=data['yourRep'];
    console.log(rep)
    nbr_reponse++;
    if (rep in dicoRep){
        dicoRep[rep]+=1;
    }
    else{
        dicoRep[rep]=1;
    }

    reloadPage();
})


function stopperReponse(code){
    socket.emit('stopRep',{'code':code});
}


function demarrer(code){
    console.log('!!')
    reponse_dict = {};
    socket.emit('demarrer',{'code':code});
}

function QuestionSuivante(code){
    let qstActuelle = numExo+1;
    numExo ++;
    socket.emit('questionSuivante',{'code':code,'numqst':qstActuelle})
    nbr_reponse =0;
}

function getDictRep(qst){
    let dict = {};
    Object.keys(qst.reponse).forEach( (key) =>{
        dict[key.id] = 0;
    })
    return(dict);
}

function correctionNum(){
    socket.emit('correction',{'code':code,'qstId':qst.id,'reponse':qst.reponse[0],type:'num','reponsedict':reponse_dict,'nbr_reponse':nbr_reponse})
}
function correctionTxt(){
    socket.emit('correction',{'code':code,'qstId':qst.id,'reponse':'',type:'txt','reponsedict':listRep,'nbr_reponse':nbr_reponse})
}
function correction(){
    socket.emit('correction',{'code':code,'qstId':qst.id,'reponse':getListeBonneReponse(qst),type:'qcm','reponsedict':reponse_dict,'nbr_reponse':nbr_reponse})
}

function getListeBonneReponse(qst){
    let liste = [];
    qst.reponse.forEach((rep)=>{
        if (rep.vraie){
            liste.push(rep)
        }
    });
    return liste;
}