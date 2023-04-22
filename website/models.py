from . import db
from flask_login import UserMixin
from sqlalchemy import or_
from werkzeug.security import generate_password_hash, check_password_hash


class Prof(db.Model,UserMixin):
    nameProf = db.Column(db.String, primary_key=True)
    mdp = db.Column(db.String,nullable=False)
    questions = db.relationship("Question")
    sequences = db.relationship("Sequence")
    def __init__(self,nameProf,mdp):
        self.nameProf=nameProf
        self.mdp = generate_password_hash(mdp)
    def verifyPWD(self,pwd):
        return check_password_hash(self.mdp,pwd)
    def get_id(self):
        return self.nameProf

class Etudiant(db.Model,UserMixin):
    NEtu = db.Column(db.String, primary_key=True)
    NomEtu = db.Column(db.String)
    PrenomEtu = db.Column(db.String)
    mdp = db.Column(db.String, nullable=False)
    Reponses = db.relationship("ReponseEleve")
    def __init__(self,NEtu,NomEtu,PrenomEtu,mdp):
        self.NEtu=NEtu
        self.NomEtu = NomEtu
        self.PrenomEtu = PrenomEtu
        self.mdp = generate_password_hash(mdp)
    def verifyPWD(self,pwd):
        return check_password_hash(self.mdp,pwd)
    def get_id(self):
        return self.NEtu


class Question(db.Model):
    idQ = db.Column(db.String, primary_key=True)
    titre = db.Column(db.String)
    description = db.Column(db.String)
    listeTags = db.Column(db.String)
    Qtype = db.Column(db.String)
    nameProf = db.Column(db.String, db.ForeignKey('prof.nameProf'), nullable=False)
    Enonce = db.Column(db.String)
    nbRep = db.Column(db.Integer)

    def __init__(self,idQ,titre,description,listeTags,Qtype,nameProf,nbRep):
        self.idQ =idQ
        self.titre = titre
        self.description = description
        self.listeTags=listeTags
        self.Qtype = Qtype
        self.nameProf = nameProf
        self.nbRep = nbRep
        if self.Qtype == "Num":
            self.Reponses = db.relationship("ReponseNum")
        elif self.Qtype == "QCM":
            self.Reponses = db.relationship("ReponseQCM")



class Sequence(db.Model):
    idS = db.Column(db.String, primary_key=True)
    titre = db.Column(db.String)
    identifiant = db.Column(db.String)
    nameProf = db.Column(db.String, db.ForeignKey('prof.nameProf'), nullable=False)



class ReponseEleve(db.Model):
    idRE = db.Column(db.String, primary_key=True)
    dateR = db.Column(db.Date)
    types = db.Column(db.String)
    valueR = db.Column(db.String)
    NEtu = db.Column(db.Integer, db.ForeignKey('etudiant.NEtu'), nullable=False)
    idS = db.Column(db.String, db.ForeignKey('sequence.idS'))
    idQ = db.Column(db.String, db.ForeignKey('question.idQ'))
    idDiffusion = db.Column(db.String,db.ForeignKey('diffusion.idDiffusion'),nullable=True)
    __table_args__ = (
        db.CheckConstraint(or_(idS != None, idQ != None)),
    )


class ReponseNum(db.Model):
    idRN = db.Column(db.String, primary_key=True)
    reponse = db.Column(db.String)
    idQ = db.Column(db.String, db.ForeignKey('question.idQ'), nullable=False)

class ReponseTxt(db.Model):
    idRT = db.Column(db.String, primary_key=True)
    idQ = db.Column(db.String, db.ForeignKey('question.idQ'), nullable=False)

class ReponseQCM(db.Model): #id écrit sous la forme : exoid+"QCM"+numRep
    idRQCM = db.Column(db.String, primary_key=True)
    reponse = db.Column(db.String)
    Vraie = db.Column(db.Boolean)
    idQ = db.Column(db.String, db.ForeignKey('question.idQ'), nullable=False)


class Sequence_Question(db.Model):
    idS = db.Column(db.String, db.ForeignKey('sequence.idS'), primary_key=True)
    idQ = db.Column(db.String, db.ForeignKey('question.idQ'), primary_key=True)
    ordre = db.Column(db.Integer)


class ReponseE_ReponseQCM(db.Model):
    idRE = db.Column(db.String, db.ForeignKey('reponse_eleve.idRE'), primary_key=True)
    idRQCM = db.Column(db.String, db.ForeignKey('reponse_qcm.idRQCM'), primary_key=True)
    idDiffusion = db.Column(db.String,db.ForeignKey('diffusion.idDiffusion'),primary_key=True)




class Tag(db.Model):
    idTag = db.Column(db.String, primary_key=True)


class Diffusion(db.Model):
    idDiffusion = db.Column(db.String,primary_key=True)
    estSequence = db.Column(db.String)
    isLive = db.Column(db.Boolean)
    idS = db.Column(db.String, db.ForeignKey('sequence.idS'))
    idQ = db.Column(db.String, db.ForeignKey('question.idQ'))
    def __init__(self, idDiffusion,estSequence,id):
        self.idDiffusion = idDiffusion
        self.estSequence = estSequence
        if self.estSequence:
            self.idS = id
        else:
            self.idQ = id
        self.isLive = False

class SID_Diffusion_user(db.Model):
    Netu = db.Column(db.String, db.ForeignKey('etudiant.NEtu'), primary_key=True)
    idDiffusion = db.Column(db.String, db.ForeignKey('diffusion.idDiffusion'), primary_key=True)
    sid = db.Column(db.String,primary_key=True)