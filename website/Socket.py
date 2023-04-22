from flask_socketio import socketio,join_room,leave_room
from flask import request
from flask_login import current_user
from .models import *
from app import socketio
from .function import *
@socketio.on('join')
def on_join(data):
    room = data['room']
    if room.endswith('etu'):
        SID = SID_Diffusion_user.query.filter_by(Netu=current_user.NEtu,idDiffusion=data['code'],sid=request.sid).first()
        if not SID:
            SID = SID_Diffusion_user(Netu=current_user.NEtu,idDiffusion=data['code'],sid=request.sid)
            AddToBD([SID])
        socketio.emit('ajoutEleve',{'eleve':''},room=data['code']+'prof')
    join_room(room)

@socketio.on('leave')
def on_leave(data):
    room = data['room']
    print(room,current_user,'LEAVING')
    if room.endswith('etu'):
        SID = SID_Diffusion_user.query.filter_by(Netu=current_user.NEtu,idDiffusion=data['code'],sid=request.sid).first()
        if SID:
            DeleteFromBD([SID])
        socketio.emit('perteEleve',{'eleve':''},room=data['code']+'prof')
    if room.endswith('prof'):
        diff = Diffusion.query.filter_by(idDiffusion = data['code']).first()
        if diff:
            diff.isLive = False
        AddToBD([diff])
    leave_room(room)

@socketio.on('demarrer')
def demarrer(data):
    print('!!')
    code = data['code']
    diffusion = Diffusion.query.filter_by(idDiffusion=code).first()
    if diffusion :
        if not diffusion.isLive:
            diffusion.isLive = True
            AddToBD([diffusion])
            if diffusion.estSequence:
                objet = Sequence.query.filter_by(idS=diffusion.idS).first()
                if objet:
                    socketio.emit('demarrage',{'estSequence':True,'objet':getSeq(objet.idS)},room=code+'prof')
                    qst = getQstFromSeq(objet.idS,0)
                    socketio.emit('demarrage',{'qst':qst},room=code+'etu')
            else:
                objet = Question.query.filter_by(idQ=diffusion.idQ).first()
                if objet:
                    socketio.emit('demarrage', {'estSequence': False, 'objet': getExo(objet.idQ)}, room=code + 'prof')
                    qst = getSafeQST(objet.idQ)
                    socketio.emit('demarrage', {'qst': qst}, room=code + 'etu')
        else:
            print('Impossible de diffuser, diffusion déjà active')

@socketio.on('questionSuivante')
def questionSuivante(data):
    code = data['code']
    numqst = data['numqst']
    roomProf = code+'prof'
    roomEleve = code+'etu'
    diff = Diffusion.query.filter_by(idDiffusion=code).first()
    if diff.isLive :
        if diff.estSequence:
            id = diff.idS
            if numqst < getNumberQSTSeq(id) and getNumberQSTSeq(id) != -1:
                qstSafe = getQstFromSeq(id,numqst)

                if qstSafe:
                    qst = getExo(qstSafe['id'])
                    socketio.emit('nextQuestion',{'question':qst},room=roomProf)
                    socketio.emit('nextQuestion',{'question':qstSafe},room=roomEleve)
            else:
                diff.isLive = False
                socketio.emit('Fin',room=roomProf)
                socketio.emit('Fin',room=roomEleve)
                #delete la room, et peut les objet SID_diffusion_user associés
                AddToBD([diff])


        else:
            diff.isLive = False
            socketio.emit('Fin', room=roomProf)
            socketio.emit('Fin', room=roomEleve)
            # delete la room, et peut les objet SID_diffusion_user associés
            AddToBD([diff])

@socketio.on('envoieRepQCM')
def envoie_repQCM(data):
    enregistrerRepEleve(data)
    socketio.emit('nouvelleRepQCM',{'code':data['code'],'qstid':data['qstId'],'repId':data['repId']},room=data['code']+'prof')

@socketio.on('envoieRepNum')
def envoie_repNum(data):
    if isfloat(data['rep']):
        rep = round(float(data['rep']),2)
        enregistrerRepEleve(data)
        socketio.emit('nouvelleRepNum',{'code':data['code'],'qstid':data['qstId'],'rep':rep},room=data['code']+'prof')
    else:
        socketio.emit('errorFloatNum',to=request.sid)

@socketio.on('envoieRepTxt')
def envoie_repTxt(data):
    print(data)
    enregistrerRepEleve(data)
    print(data['rep'])
    textecorrige = correction_mot(data['rep'])
    print(textecorrige)
    socketio.emit('nouvelleRepTxt',{'code':data['code'],'qstid':data['qstId'],'yourRep':textecorrige},room=data['code']+'prof')

@socketio.on('correction')
def test(data):
    code = data['code']
    print(data['type'])
    if socketio.server.manager.rooms['/'].get(code+'etu'):
        for i in socketio.server.manager.rooms['/'].get(code+'etu'):
            SID_Diff = SID_Diffusion_user.query.filter_by(sid=i).first()
            if SID_Diff:
                Netu = SID_Diff.Netu
                rep = ReponseEleve.query.filter_by(NEtu=Netu,idQ=data['qstId'],idDiffusion=code).first()
                if rep:
                    if data['type'] == 'num':
                        print('pas le bon 1')
                        ReponsedeEleve = rep.valueR
                        bonneReponse = data['reponse']
                        valVraie = bonneReponse['reponse'] == ReponsedeEleve
                        socketio.emit('correction', {'yourRep':ReponsedeEleve,'goodRep':bonneReponse,'egal':valVraie,'type':'num','reponsedict':data['reponsedict'],'nbr_reponse':data['nbr_reponse']},to=i,)
                    elif data['type']=='qcm':
                        print('pas le bon')
                        repEtu = ReponseE_ReponseQCM.query.filter_by(idRE = rep.idRE,idDiffusion=code).first()
                        if repEtu:
                            repId = repEtu.idRQCM
                            rqcm = ReponseQCM.query.filter_by(idRQCM=repId).first()
                            if rqcm:
                                ReponsedeEleve = rqcm.reponse
                                valVraie = False
                                for rep in data['reponse']:
                                    if rep['reponse'] == ReponsedeEleve:
                                        valVraie = True
                                socketio.emit('correction',
                                              {'yourRep': ReponsedeEleve, 'goodReps': data['reponse'], 'egal': valVraie,
                                               'type': 'qcm','reponsedict':data['reponsedict'],'nbr_reponse':data['nbr_reponse']}, to=i)
                    else:
                        print('le bon')
                        ReponsedeEleve = rep.valueR
                        print(rep.valueR)
                        socketio.emit('correction', {'yourRep':ReponsedeEleve,'type':'txt','list':data['reponsedict'],'nbr_reponse':data['nbr_reponse']},to=i,)



@socketio.on('stopRep')
def stopRep(data):
    socketio.emit('stopReponse',room=data['code']+'etu')