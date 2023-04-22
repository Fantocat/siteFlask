from flask import Blueprint,request,render_template,redirect,url_for,current_app,abort
from flask_login import login_required,login_user,logout_user,current_user
from werkzeug.security import generate_password_hash
from . import db
from functools import wraps
from .models import *
etu = Blueprint('etu',__name__)

def estEtudiant(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        '''if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()
        if not isinstance(current_user, Etudiant):
            abort(403)'''
        return f(*args, **kwargs)
    return decorated_function
@etu.route('student_panel',methods=['GET','POST'])
@estEtudiant
def student_panel():
    #Check si code valide
    return render_template('student_panel.html')

@etu.route('/',methods=['GET','POST'])
@estEtudiant
def student_panel2():
    return render_template('student_panel.html')
@estEtudiant
@etu.route('diffusion-etu/<code>',methods=['GET','POST'])
def diffusion_etu(code):
    #gere la diffusion de la sequence

    return render_template('diffusionEtudiant.html',code = code)
@estEtudiant
@etu.route('temp_diffusionEtu',methods=['GET','POST'])
def temp_etu():
    print(request.method)
    if request.method == 'POST':
        code = request.form.get('code')
        print(code)
        diffusion = Diffusion.query.filter_by(idDiffusion = code).first()
        print(diffusion)
        if diffusion:
            if True:#diffusion.isLive
                return redirect(url_for('etu.diffusion_etu',code=code))
            else:
                return redirect(url_for('etu.student_panel'))
    return redirect((url_for('etu.student_panel')))