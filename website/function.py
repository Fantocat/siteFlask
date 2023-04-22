from random import randint
from .models import *
from flask_login import current_user
from .import db,orthographe
from datetime import datetime
def newExoId(): #Fonction pour générer un nouvel exoid
    liste_char = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    val = liste_char[randint(0,len(liste_char)-1)]+liste_char[randint(0,len(liste_char)-1)]+liste_char[randint(0,len(liste_char)-1)]+liste_char[randint(0,len(liste_char)-1)]+liste_char[randint(0,len(liste_char)-1)]+liste_char[randint(0,len(liste_char)-1)]+liste_char[randint(0,len(liste_char)-1)]+liste_char[randint(0,len(liste_char)-1)]
    while Question.query.get(val):
        val = liste_char[randint(0, len(liste_char)-1)] + liste_char[randint(0, len(liste_char)-1)] + liste_char[
            randint(0, len(liste_char)-1)] + liste_char[randint(0, len(liste_char)-1)] + liste_char[
                  randint(0, len(liste_char)-1)] + liste_char[randint(0, len(liste_char)-1)] + liste_char[
                  randint(0, len(liste_char)-1)] + liste_char[randint(0, len(liste_char)-1)]
    return(val)

def getExoListe(user):
    liste_exos ={}
    for qst in user.questions:
        liste_exos[str(qst.idQ)]=getExo(qst.idQ)
    return liste_exos
def nbReponse(obj): #Fonction permettant de récuprérer le nombre de réponse possible à un exercice
    taille = 0
    for key in obj.keys():
        if 'rep' in key: #Si il y a le mot clé 'rep' dans une des valeurs du formulaire, on incrémente la taille de 1
            taille += 1
    return taille

def getlisteRepQCM(qstid):
    reps = ReponseQCM.query.filter_by(idQ=qstid)
    liste = []
    for rep in reps:
        liste.append({'id':rep.idRQCM,'reponse':rep.reponse,'vraie':rep.Vraie,'idQCM':rep.idQ})
    return liste
def getExo(qstid):
    qst = Question.query.filter_by(idQ=qstid).first()
    dico = {}
    if qst:
        dico = {'title':qst.titre,'desc':qst.description,'enonce':qst.Enonce,'id':qstid,'type':qst.Qtype,'tags':qst.listeTags}
        if qst.Qtype == 'qcm':
            dico['reponse'] = getlisteRepQCM(qstid)
        elif qst.Qtype == 'num':
            rep = ReponseNum.query.filter_by(idQ=qstid).first()

            dico['reponse']=[{'id':rep.idRN,'reponse':rep.reponse,'idQCM':rep.idQ}]
        elif qst.Qtype == 'txt':
            dico['reponse'] = []
    return(dico)
def getTagsExosListe(user):
    TagListe = Tag.query.all()
    ExoListe = user.questions
    TagsExos = {}
    for tag in TagListe:
        if tag.idTag != '':
            TagsExos[tag.idTag]=[]
            for exo in ExoListe:
                if tag.idTag in exo.listeTags:
                    TagsExos[tag.idTag].append(exo.idQ)
    return TagsExos
def isExoId(id):
    if Question.query.filter_by(idQ=id).first():
        return True
    return False
def getProfId(user):
    return user.nameProf





def registerExo(obj,exoid,user):
    liste_Repid = []
    listeSupprimerRep = []
    listeActualiser = [] #On va remplir cette liste avec tous les objets a actualiser dans la BD
    if 'type' in obj.keys(): #Si on a l'attribut type dans notre form, alors on vient de créer un exercice :
        if obj.get('type') == 'qcm': #Si on a une question de type QCM alors on récupère sa taille
            size = nbReponse(obj)+1
            type = 'qcm'
        elif obj.get('type') == 'num':
            type = 'num'
            size = 0
            repnum = ReponseNum(idRN = str(exoid)+'RepNum',reponse='0',idQ=exoid)
        elif obj.get('type') == 'txt':
            type = 'txt'
            size = 0
        title = obj.get('name')
        desc = obj.get('description')
        exo = Question(idQ=exoid,titre=title,description=desc,nameProf=getProfId(user),listeTags='',nbRep=size,Qtype=type)
        listeActualiser.append(exo)
        if type == 'num':
            listeActualiser.append(repnum)

    else : # on vient d'un exercice que l'on va sauvegarder
        exo = Question.query.filter_by(idQ=exoid).first()
        if obj.get('exoIn'):
            exo.Enonce = obj.get('exoIn')
        if obj.get('tags'):
            exo.listeTags = obj.get('tags')
        type = exo.Qtype
        if type == 'qcm':
            nbrep = nbReponse(obj)
            exo.nbRep = nbrep
            for i in range(nbrep):
                rep = ReponseQCM.query.filter_by(idRQCM=str(exoid)+"QCM"+str(i)).first()
                if not(rep):
                    rep = ReponseQCM(idRQCM=str(exoid)+"QCM"+str(i), reponse=obj.get("rep"+str(i)),idQ=exoid)
                if obj.get("rep" + str(i)):
                    rep.reponse = obj.get("rep" + str(i))
                if obj.get('rval' + str(i)):
                    rep.Vraie = True
                else :
                    rep.Vraie = False
                liste_Repid.append(rep.idRQCM)
                listeActualiser.append(rep)
        elif type == 'num':
            repNum = ReponseNum.query.filter_by(idRN=str(exoid)+'RepNum').first()
            if repNum:
                if obj.get('reponseNum'):
                    repNum.reponse = obj.get('reponseNum')
            else :
                repNum = ReponseNum(idRn = str(exoid)+'RepNum',reponse=obj.get('reponseNum'),idQ=exoid)
            listeActualiser.append(repNum)
        listeActualiser.append(exo)

    tagListeTest = exo.listeTags.split(',')
    for tag in tagListeTest:
        if not(Tag.query.get(tag)):
            listeActualiser.append(Tag(idTag=tag))
    listeSupprimerRep = SupprimerRepSuperflux(exoid,liste_Repid)
    DeleteFromBD(listeSupprimerRep)
    AddToBD(listeActualiser)

def SupprimerRepSuperflux(idQ,liste):
    rep = ReponseQCM.query.filter_by(idQ=idQ)
    listeS = []
    for r in rep:
        if r.idRQCM not in liste:
            listeS.append(r)
    return listeS

def DeleteExo(exoid):
    exo = Question.query.filter_by(idQ=exoid).first()
    if exo: #Si exo n'existe pas il sera de type None -> if None renvoie faux
        db.session.delete(exo)
        if exo.Qtype == "qcm":
            rep = ReponseQCM.query.filter_by(idQ=exoid)
            if rep:
                for r in rep:
                    db.session.delete(r)
        elif exo.Qtype == 'num':
            rep = ReponseNum.query.filter_by(idQ=exoid).first()
            if rep :
                db.session.delete(rep)

        db.session.commit()
    else:
        print("l'exercice d'id :"+exoid+"n'existe pas ou n'a pas pu etre delete")
def DeleteFromBD(liste):
    for object in liste:
        db.session.delete(object)
    db.session.commit()
def AddToBD(liste):
    for object in liste:
        db.session.add(object)
    db.session.commit()

def getSequenceListe(user):
    liste_seq = {}
    for seq in user.sequences:
        liste_seq[str(seq.idS)] = getSeq(seq.idS)
    return liste_seq

def getExoSeq(idS):
    liste_relation = Sequence_Question.query.filter_by(idS=idS)
    dictExo = {}
    if liste_relation:
        for rs in liste_relation:
            idQ=rs.idQ
            ordre = rs.ordre
            exo = getExo(idQ)
            exo['ordre'] = ordre
            dictExo[idQ] = exo
    return dictExo
def getSeq(id):
    seq = Sequence.query.filter_by(idS=id).first()
    SeqDict = {}
    if seq :
        SeqDict = {
            'idS':seq.idS,
            'titre':seq.titre,
            'nameProf':seq.nameProf,
            'exos':getExoSeq(id)
        }
    return SeqDict

def NewSeqID():
    liste_char = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
                  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D',
                  'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
                  'Y', 'Z']
    val = liste_char[randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
        randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
              randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
              randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)]
    while Sequence.query.get(val):
        val = liste_char[randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
            randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
                  randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
                  randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)]
    return (val)


def registerSeq(id,user,obj=None,creation=False):
    listeToRegister = []
    listeQID = []
    if creation:
        seq = Sequence(idS = id,titre = "", nameProf=getProfId(user))
        listeToRegister.append(seq)
    else:
        seq = Sequence.query.filter_by(idS=id,nameProf=getProfId(user)).first()
        if seq :
            if obj.get('sequenceName'):
                seq.titre = obj.get('sequenceName')
            liste_qst = getAllQstSeq(obj)
            for i in range(len(liste_qst)):
                SeqQst = Sequence_Question.query.filter_by(idS=id,idQ=liste_qst[i]).first()
                if SeqQst:
                    if SeqQst.ordre != i:
                        SeqQst.ordre = i
                else:
                    SeqQst = Sequence_Question(idS = id, idQ=liste_qst[i],ordre=i)
                listeToRegister.append(SeqQst)
                listeQID.append(SeqQst.idQ)
            listeToRegister.append(seq)
    DeleteFromBD(SupprimerRS(id,listeQID))
    AddToBD(listeToRegister)
def SupprimerRS(idS,liste):
    rep = Sequence_Question.query.filter_by(idS=idS)
    listeRS = []
    for r in rep:
        if r.idQ not in liste:
            listeRS.append(r)
    return listeRS
def NumberQSTSeq(obj):
    e = 0
    for i in obj.keys():
        if 'question' in i:
            e+=1
    return(e)
def getAllQstSeq(obj):
    liste = [-1]*(NumberQSTSeq(obj))

    for i in obj.keys():

        if 'question' in i:

            e = i.replace("question","")

            liste[int(e)]=obj.get(i)

    return(liste)

def GenererCode(id,estSeq):
    if estSeq:
        diff = Diffusion.query.filter_by(idS = id).first()
    else:
        diff = Diffusion.query.filter_by(idQ = id).first()

    if diff:

        return diff.idDiffusion
    else :
        liste_char = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
                      'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B',
                      'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
                      'V', 'W', 'X', 'Y', 'Z']
        val = liste_char[randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
            randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
                  randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
                  randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)]
        while Diffusion.query.filter_by(idDiffusion=val).first():
            val = liste_char[randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + \
                  liste_char[
                      randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
                      randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
                      randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)]
        return (val)

def getQstAllFromSeq(seqId): #Fonction renvoyant la question a la position "place" de la sequence
    sequence_qst_RS = Sequence_Question.query.filter_by(idS = seqId)
    liste = []

    if sequence_qst_RS :
        taille = sequence_qst_RS.count()
        liste = [None]*taille
        for seqQ_rs in sequence_qst_RS:
            idQ = seqQ_rs.idQ
            ordre = seqQ_rs.ordres
            liste[ordre] =getSafeQST(idQ)
    return liste

def getQstFromSeq(seqId,place):
    sequence_qst_RS = Sequence_Question.query.filter_by(idS=seqId,ordre=place).first()
    if sequence_qst_RS:
        return getSafeQST(sequence_qst_RS.idQ)

def getNumberQSTSeq(seqId):
    sequence_qst_RS = Sequence_Question.query.filter_by(idS = seqId)
    if sequence_qst_RS:
        return sequence_qst_RS.count()
    return -1

def getSafeQST(qstId):
    qst = Question.query.filter_by(idQ=qstId).first()
    liste = []
    if qst:
        dico = {'title': qst.titre, 'desc': qst.description, 'enonce': qst.Enonce, 'id': qstId, 'type': qst.Qtype,
            'tags': qst.listeTags}
        if qst.Qtype == 'qcm':
            reps = ReponseQCM.query.filter_by(idQ=qstId)

            for rep in reps:
                liste.append({'id': rep.idRQCM, 'reponse': rep.reponse, 'idQCM': rep.idQ})
        elif qst.Qtype == 'num':
            rep = ReponseNum.query.filter_by(idQ=qstId).first()
            liste = [{'id':rep.idRN,'idQCM':rep.idQ}]
        else:
            liste = []
        dico['reponse'] = liste
        return dico


def isfloat(num):
    try:
        float(num)
        return True
    except ValueError:
        return False


def listeAddAllSeqRelated(seqid):
    liste = []

    seq = Sequence.query.filter_by(idS=seqid).first()

    if seq:
        SeqQst = Sequence_Question.query.filter_by(idS=seqid)
        diffusions = Diffusion.query.filter_by(idS=seqid)
        repsEleve = ReponseEleve.query.filter_by(idS=seqid)
        for sq in SeqQst:

            liste.append(sq)
        for diff in diffusions:
            reponsesDiffQCM = ReponseE_ReponseQCM.query.filter_by(idDiffusion=diff.idDiffusion)
            for rep in reponsesDiffQCM:

                liste.append(rep)
            liste.append(diff)
        for repE in repsEleve:
            liste.append(repE)
        liste.append(seq)
    return liste


def enregistrerRepEleve(data):

    qstId = data['qstId']
    liste = []
    qst = Question.query.filter_by(idQ=qstId).first()
    if qst:
        Netu = current_user.NEtu
        code = data['code']
        if qst.Qtype == 'qcm':
            repid = data['repId']
            repE = ReponseEleve.query.filter_by(NEtu = Netu,idDiffusion=code,idQ=qstId,types='qcm').first()
            if repE:
                DeleteFromBD([repE])
            repE = ReponseEleve(NEtu = Netu,idDiffusion=code,idQ=qstId,types='qcm',dateR=datetime.now(),idRE=NewRepEID())
            repE_Rqcm = ReponseE_ReponseQCM.query.filter_by(idRE=repE.idRE, idRQCM=repid, idDiffusion=code).first()
            liste.append(repE)
            if not repE_Rqcm:
                repE_Rqcm = ReponseE_ReponseQCM(idRE=repE.idRE,idRQCM=repid,idDiffusion=code)
                liste.append(repE_Rqcm)

            AddToBD(liste)
        elif qst.Qtype == 'num':
            repE = ReponseEleve.query.filter_by(NEtu=Netu, idDiffusion=code, idQ=qstId, types='num').first()
            if repE:
                DeleteFromBD([repE])
            repE = ReponseEleve(NEtu=Netu, idDiffusion=code, idQ=qstId, types='num',valueR=data['rep'],dateR=datetime.now(),idRE=NewRepEID())
            AddToBD([repE])
        else:

            repE = ReponseEleve.query.filter_by(NEtu=Netu, idDiffusion=code, idQ=qstId, types='txt').first()
            if repE:
                DeleteFromBD([repE])
            rep = data['rep'].lower()
            textecorrige = correction_mot(rep)
            repE = ReponseEleve(NEtu=Netu, idDiffusion=code, idQ=qstId, types='txt', valueR=textecorrige,
                                dateR=datetime.now(), idRE=NewRepEID())
            AddToBD([repE])





def NewRepEID():
    liste_char = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
                  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D',
                  'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
                  'Y', 'Z']
    val = liste_char[randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
        randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
              randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
              randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)]
    while ReponseEleve.query.get(val):
        val = liste_char[randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
            randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
                  randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)] + liste_char[
                  randint(0, len(liste_char) - 1)] + liste_char[randint(0, len(liste_char) - 1)]
    return (val)

def correction_mot(text):
    print("ccaca")
    texte_corrige = ""
    mots = text.split()  # découpage du texte en mots
    mal_orthographie = orthographe.unknown(mots)  # on vérifie si les mots sont corrects
    print(mal_orthographie)
    if len(mal_orthographie) > 0:  # si le texte a au moins une faute
        suggestions = {}  # dictionnaire qui contiendra les suggestions
        for mot in mal_orthographie:  # pour chaque mot mal orthographié
            if "'" in mot:  # si le mot contient une apostrophe
                print(mot, " contient une apostrophe")
                apostrophe_index = mot.find("'")  # on récupère l'index de l'apostrophe
                correction_de_special(suggestions, apostrophe_index,
                                      mot)  # on appelle la fonction qui va corriger le mot

            elif "-" in mot:  # si le mot contient un tiret
                print(mot, " contient un tiret")
                tiret_index = mot.find("-")  # on récupère l'index du tiret
                correction_de_special(suggestions, tiret_index,
                                      mot)  # on appelle la fonction qui va corriger le mot

            elif "’" in mot:  # si le mot contient une apostrophe typographique
                print(mot, " contient une apostrophe typographique")
                apostrophe_typographique_index = mot.find("’")  # on récupère l'index de l'apostrophe typographique
                correction_de_special(suggestions, apostrophe_typographique_index,
                                      mot)  # on appelle la fonction qui va corriger le mot

            else:  # si le mot ne contient ni apostrophe, ni tiret
                suggestions[mot] = orthographe.correction(mot)  # on ajoute la suggestion au dictionnaire
                if suggestions[mot] is None:  # si la suggestion est nulle
                    suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion
        texte_corrige = corriger_texte(text, suggestions)  # on corrige le texte
    if texte_corrige == "":
        return text
    else:
        return texte_corrige
            #return render_template("choix_text.html", texte_modif=texte_corrige, texte_initial=text) #On renvoi sur une page pour soit choisir le texte corrigé soit sont texte envoyer, de plus on peut modifier n'importe quel texte et l'envoyer



def correction_de_special(suggestions, index,
                          mot):  # fonction qui va corriger les mots qui contiennent des caractères spéciaux
    if index == len(mot) - 1:  # si le special est à la fin du mot
        suggestions[mot] = orthographe.correction(mot[:index])  # on corrige le mot sans le special
        if suggestions[mot] is None:  # si la suggestion est nulle
            suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion
    elif index == 0:  # si le special est au début du mot
        suggestions[mot] = orthographe.correction(mot[index + 1:])  # on corrige le mot sans le special
        if suggestions[mot] is None:  # si la suggestion est nulle
            suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion

    elif 1 < index < len(mot) - 1:  # si le special est au milieu du mot
        if mot[:index] in orthographe and mot[index + 1:] in orthographe and mot[:index] + mot[index + 1:] not in orthographe and mot.count("-") < 0:  # si les deux parties du mot sont correctes et que le mot sans le special ne l'est pas
            suggestions[mot] = mot[:index] + " " + mot[index:]  # on ajoute un espace entre les deux parties du mot
            if suggestions[mot] is None:  # si la suggestion est nulle
                suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion

        else:  # si les deux parties du mot ne sont pas correctes
            suggestions[mot] = orthographe.correction(mot[:index] + mot[index:])  # on corrige le mot sans le special
            if suggestions[mot] is None:  # si la suggestion est nulle
                suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion

    elif mot[index + 1:] in orthographe:  # si la partie du mot après le special est correcte
        pass  # on ne fait rien
    else:  # si la partie du mot après le special n'est pas correcte
        suggestions[mot] = mot[:index + 1] + orthographe.correction(mot[index:])  # on corrige la partie du mot après le special
        if suggestions[mot] is None:  # si la suggestion est nulle
            suggestions[mot] = mot  # on ajoute le mot lui-même comme suggestion


def corriger_texte(texte, suggestions):  # fonction qui va corriger le texte
    mots = texte.split()  # on découpe le texte en mots
    for i in range(len(mots)):  # pour chaque mot
        if mots[i] in suggestions:  # si le mot est dans le dictionnaire des suggestions
            mots[i] = suggestions[mots[i]]  # on remplace le mot par sa suggestion
    return " ".join(mots)  # on retourne le texte corrigé


