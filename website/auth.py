from flask import Blueprint,request,render_template,redirect,url_for
from flask_login import login_required,login_user,logout_user
from .models import *
auth = Blueprint('auth',__name__)

@auth.route('/',methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html',error="")
    username = request.form['username']  # On récupère le username indiqué par l'utilisateur
    userProf = Prof.query.filter_by(nameProf=username).first()
    if userProf:
        if userProf.verifyPWD(request.form['password']):
            login_user(userProf)
            return redirect(url_for('prof.panel_config'))
    else:
        userEtu = Etudiant.query.filter_by(NEtu=username).first()
        if userEtu:
            if userEtu.verifyPWD(request.form['password']):
                login_user(userEtu)
                return redirect(url_for('etu.student_panel'))
    return render_template('login.html', error="Identifiant ou mot de passe incorrect")

@auth.route('/register',methods=['GET','POST'])
def register():
    if request.method=='GET':
        return render_template('register.html',error="")
    username = request.form['username']
    if Prof.query.filter_by(nameProf=username).first() or Etudiant.query.filter_by(NEtu=username).first():
        return render_template('register.html',error="")
    user = Prof(nameProf=username,mdp=request.form['password'])
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return redirect(url_for('prof.panel_config'))

@auth.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
