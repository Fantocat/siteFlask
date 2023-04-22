from flask import Blueprint,render_template,current_app,abort,request,redirect,url_for
from flask_login import login_required,current_user
from functools import wraps
from .function import *
import csv

prof = Blueprint('prof',__name__)

def estProf(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()
        if not isinstance(current_user, Prof):
            abort(403)
        return f(*args, **kwargs)
    return decorated_function


@prof.route('/')
@estProf
@login_required
def panel_config():
    qst = getExoListe(current_user)
    seq = getSequenceListe(current_user)
    return render_template('panel_config.html',exos=qst,sequences = seq)

@prof.route('/creer', methods = ['POST', 'GET']) #La route qui nous permet de générer un nouvel excercice
@login_required
@estProf
def creer():
    exoId = newExoId() #On génère un nouvel ID d'exercice qu'on passe dans le template, mais sans l'enregistrer dans le JSON
    return render_template('creer.html',exoId=exoId) #Créer.html permet de générer un nouvel exercice

@prof.route('/redirect_modifier/<exoid>', methods = ['POST', 'GET'])
@login_required
@estProf
def redirect_modifier(exoid):
    if request.method == 'GET':
        registerExo(request.args,exoid,current_user)

        return redirect(url_for('prof.modifier',exoid=exoid))
    return redirect(url_for('prof.panel_config'))


@prof.route('/modifier/<exoid>', methods = ['POST', 'GET']) #route redirigeant vers la page de modificationd d'un exercice
@login_required
@estProf
def modifier(exoid):
    if request.method == 'GET':
        return render_template('modifier.html',exo=getExo(exoid),tags=getTagsExosListe(current_user)) #On renvoit vers la page modifieur, avec en paramètres, l'exercice demandé et les tags
    return redirect(url_for('prof.temp',exoid=exoid))

@prof.route('/temp/<exoid>',methods = ['POST', 'GET'])
@login_required
@estProf
def temp(exoid):

    if request.method == 'POST':
        return render_template('temp.html')
    elif isExoId(exoid):
        registerExo(request.args, exoid,current_user) #On sauvegarde l'exercice (On accède à ce lien uniquement depuis modifieur.html)
    return render_template('temp.html') #Page temporaire, redirigeant vers /index

@prof.route('/supprimerexo/<exoid>', methods = ['POST', 'GET']) #La route permettant de supprimer un exercice
@login_required
@estProf
def supprimer(exoid):
    DeleteExo(exoid) #On supprimer notre exercice
    return(render_template('temp.html')) #On renvoit vers la route temporaire, qui renverra vers l'index

@prof.route('/generateur', methods = ['POST', 'GET']) #La route pour générer la page à imprimer
@login_required
@estProf
def creerPage():
    ListeExoID = request.args['liste_exo_checked'].split(',')
    listeExo = []
    if ListeExoID == ['']:
        return render_template('generateur.html', exosToPrint=listeExo)
    for id in ListeExoID:
        listeExo.append(getExo(id))
    return render_template('generateur.html', exosToPrint=listeExo)

@prof.route('/upload_csv')
@login_required
def upload_csv():
    return render_template('upload_csv.html')
@prof.route('/csv_temp',methods = ['POST', 'GET'])
@login_required
def csv_temp():
    if request.method == 'POST':
        file = request.files['fileInput']
        fichier = file.read().decode('utf-8')
        csvfile = csv.reader(fichier.splitlines(),delimiter=',')
        for i in csvfile:
            t = i[0].split(';')
            lui = Etudiant.query.filter_by(NEtu=t[0]).first()
            if not lui:
                db.session.add(Etudiant(NomEtu=t[1],PrenomEtu=t[2],NEtu=t[0],mdp=t[0]))
                db.session.commit()
    return redirect(url_for('prof.panel_config'))

@prof.route('/print_panel',methods=['GET','POST'])
@login_required
def print_panel():
    qst = getExoListe(current_user)
    tags = getTagsExosListe(current_user)
    return render_template('print_panel.html', listQ=qst, tags=tags)

@prof.route('/sequence_panel/<seqid>',methods = ['POST', 'GET'])
@login_required
def seq_panel(seqid):
    if request.method == 'POST':
        registerSeq(seqid,current_user,request.form)
        return redirect(url_for('prof.panel_config'))

    else :
        qst = getExoListe(current_user)
        seq = getSeq(seqid)
        return render_template('sequence_panel.html',listQ=qst,seq=seq)


''' Fonction :'''

@prof.route('/diffusionEtu')
def diffusionEtu():
    return render_template('diffusionEtudiant.html')

@prof.route('/diffusionProf/<id>')
def diffusionProf(id):
    seq = Sequence.query.filter_by(idS=id).first()
    estSequence = True

    if seq:
        Id = seq.idS

    else :
        qst = Question.query.filter_by(idQ=id).first()
        if qst:
            estSequence = False
            Id = qst.idQ
        else :
            return redirect(url_for('prof.panel_config'))
    code = GenererCode(Id,estSequence)
    diff = Diffusion.query.filter_by(idDiffusion = code).first()
    if diff:
        diffusion = diff
    else :
        diffusion = Diffusion(code,estSequence,Id)
    if diffusion :
        AddToBD([diffusion])
        return render_template('diffusionProf.html',code=code)
    return redirect(url_for('prof.panel_config'))

@prof.route('/creerSeq')
def creerSeq():
    seqId = NewSeqID()
    registerSeq(seqId,current_user,creation=True)
    return redirect(url_for('prof.seq_panel',seqid=seqId))

@prof.route('/supprimer_seq/<seqid>')
def deleteSequence(seqid):
    seq = Sequence.query.filter_by(idS=seqid).first()
    listeADelete = []
    if seq:
        if seq.nameProf == current_user.nameProf:
            liste = listeAddAllSeqRelated(seqid)
            DeleteFromBD(liste)
    return redirect(url_for('prof.panel_config'))

