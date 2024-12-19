from subprocess import check_output

def getGitHash():
    return check_output(['git', 'rev-parse', 'HEAD']).decode('ascii').strip()
