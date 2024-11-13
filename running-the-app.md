# Running the App

The steps to set up the app will depend on whether you're (re)starting our production build or working on your own development environment. 

In either case though you'll need to create/modify `backend/.env` to look something like

```bash
DB_HOST='wouldntyouliketoknow'
DB_NAME='bigdata'
DB_USER='tt_request_bot'
DB_USER_PASSWORD='wouldntyouliketoknow'
```

## Production
The app is available to users inside the City network at [https://trans-bdit.intra.prod-toronto.ca/traveltime-request/](https://trans-bdit.intra.prod-toronto.ca/traveltime-request/) 

Production code is located in `/data/web` on the EC2 server. 

### Steps

1. switch to user `tt_request_app` with `su tt_request_app`; you'll be asked for a password
2. pull any updates from the `deploy` branch

3) Ports should already be assigned for back-end (8070) and for front-end (8071)

```bash
sudo nano /etc/nginx/sites-available/default
```

```
location /tt-request-backend/ {
    proxy_pass http://localhost:8070/;
}

location /traveltime-request/ {
    proxy_pass http://localhost:8071/;
    alias /web/bdit_tt_request_app/frontend/build/static;
}
```

and then reload it using :

```bash
sudo nginx -s reload
```

### Back-end

There is a dev deployment available at [https://trans-bdit.intra.prod-toronto.ca/dev-traveltime-request/](https://trans-bdit.intra.prod-toronto.ca/dev-traveltime-request/). It listens to ports 8073 for the frontend and 8072 for the backend. 

1. From the project root directory, `cd` into folder `backend`.

2. If necessary, execute command `python3 -m venv venv/` to create a python virtual environment for the backend.

3. Execute command `source venv/bin/activate` to use the virtual environment as the python interpreter for the backend.

4. Execute command `pip3 install -r requirements.txt` to install the project dependencies listed in requirements.txt.

6. ~~Create a pgadmin bot (`tt_request_bot`) to handle here travel time requests and give usage access to this bot for the schemas `here` and `here_gis`, also change the path of this user to schema `here`, and `public`.~~

7. If necessary, edit the environment variables in `backend/.env`.

9. Gunicorn is the service to be used to deploy a production version of the API server. Run `gunicorn --bind=0.0.0.0:8070 --timeout 10 --name=tt_request_app --workers=2 --threads=5 app:app -D`

### Front-end

1. `cd frontend`

2. `npm install` to install dependencies for the frontend listed in `package.json`

3. `npm run build` to create an optimized production build

4. `pm2 serve dist 8071 -spa` to deploy the production build, where `8071` is the port number assigned to the frontend application. This will also be the port to access the project application with.

### Things to figure out:

- make it restart if EC2 fails
- [https://askubuntu.com/questions/930589/running-upstart-script-on-17-04/1010398#1010398](https://askubuntu.com/questions/930589/running-upstart-script-on-17-04/1010398#1010398)

## Development

### Frontend
* `cd frontend`
* `npm install`
* then concurrently:
    * `npm start`; this will start a little server for the frontend
    * `npm run build-dev`; this will build the source code and watch files for changes

### Backend
* `cd backend`
* create a `.env` file in `backend/` if you haven't aready. The variables you'll need to set are listed above. 
* `pip3 install -r requirements.txt`
* `flask run -p 8072`

This should deploy your build to https://trans-bdit.intra.prod-toronto.ca/dev-traveltime-request/
