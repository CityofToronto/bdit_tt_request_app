import os

env = os.path.join(os.getcwd(), '.env')
if os.path.exists(env):
    load_dotenv(env)