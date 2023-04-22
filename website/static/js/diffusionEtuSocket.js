socket.on('connect', () => {
    socket.emit('join', {'room': code + 'etu','code':code});
});

socket.on('disconnect', () => {
    socket.emit('leave', {'room': code + 'etu','code':code});
});

socket.on('demarrage',(data)=>{
    resultat=false;
    page = 2;
    qst = data['qst'];
    type = qst.type;
    reloadPage();
    fillPageQuestion(qst);
})

socket.on('Fin', ()=>{
    resultat=false;
    page=3
    reloadPage()
});
socket.on('stopReponse', ()=>{
    onStoppeRep();
});
socket.on('nextQuestion',(data)=>{
    resultat=false;
    qst = data['question'];
    type = qst.type;
    page = 2;
    reloadPage();
    fillPageQuestion(qst);
})


socket.on('correction',(data)=>{
    if (data['type']=='num'){
        urResult = data['yourRep'];
        Goodresult = data['goodRep'];
        resultGood = data['egal'];
    }else if (data['type']==='qcm'){
        urResult = data['yourRep'];
        liste_goodresult = data['goodReps'];
        resultGood = data['egal'];
    }
    else{
        urResult = data['yourRep'];
        listRepTxt = data['list'];
    }
    nbr_reponse = data['nbr_reponse'];
    reponse_dict = data['reponsedict'];
    resultat = true;
    reloadPage();
})


function envoiReponseQCM(){
    repId =document.getElementById('select').value;
    socket.emit('envoieRepQCM',{'room':code+'etu','code':code,'repId':repId,'qstId':qst.id});
    PageValidee(qst.enonce,qst.reponse[repId.slice(-1)].reponse);
}
function envoiReponseNum(){
    rep = document.getElementById('repNum').value;

    socket.emit('envoieRepNum',{'room':code+'etu','code':code,'rep':rep,'qstId':qst.id});
    PageValidee(qst.enonce,rep);
}

function envoiReponseTxt(){
    rep = document.getElementById('repTxt').value;
    console.log(rep)
    socket.emit('envoieRepTxt',{'room':code+'etu','code':code,'rep':rep,'qstId':qst.id});
    PageValidee(qst.enonce,rep);
}