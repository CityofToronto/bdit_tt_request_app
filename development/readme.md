# Running the App

The steps to set up the app will depend on whether you're (re)starting our production build or working on your own development environment. 

## Production
The app is available to users inside the City network at [https://10.160.2.198/traveltime-request/](https://10.160.2.198/traveltime-request/) 

Code is located in `/web` on the EC2 server. 

You'll need `sudo` privileges to get the production build running. 
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

1. From the project root directory, `cd` into folder `backend`.

2. Execute command `python3 -m venv venv/` to create a python virtual environment for the backend.

3. Execute command `source venv/bin/activate` to use the virtual environment as the python interpreter for the backend.

4. Execute command `pip3 install -r requirements.txt` to install the project dependencies listed in requirements.txt.

5. Execute command `pip3 install gunicorn`. Gunicorn is the service to be used to deploy a production version of the API server.

6. ~~Create a pgadmin bot (`tt_request_bot`) to handle here travel time requests and give usage access to this bot for the schemas `here` and `here_gis`, also change the path of this user to schema `here`, and `public`.~~

7. Edit environment variables in `.env` file but that didnt work so export all environment with e.g.

```bash
export SECRET_KEY='redacted'
export DATABASE_URL='redacted'
export LINK_TABLE_NAME=routing_streets_name
export NODE_TABLE_NAME=routing_nodes_intersec_name
export TRAVEL_DATA_TABLE_NAME=ta
export POSTGIS_GEOM_SRID=4326
export TEMP_FILE_LOCATION='tmp'
export KEEP_TEMP_FILE='true'
export DB_DATA_START_DATE='2019-01-01 00:00'
```

8. Run `GUNICORN_CMD_ARGS="--bind=0.0.0.0:8070  --timeout 90 --name=data_request_app" gunicorn app:app -D`

### Front-end

1. `cd frontend`

2. `npm install` to install dependencies for the frontend listed in `package.json`

3. `npm run build` to create an optimized production build

4. `pm2 serve build 8071 -spa` to deploy the production build, where `8071` is the port number assigned to the frontend application. This will also be the port to access the project application with.

### Things to figure out:

- make it restart if EC2 fails
- [https://askubuntu.com/questions/930589/running-upstart-script-on-17-04/1010398#1010398](https://askubuntu.com/questions/930589/running-upstart-script-on-17-04/1010398#1010398)

## Development

### Frontend
* `cd frontend`
* `npm install`
* `npm run`

### Backend
* `cd backend`
* create a `.env` file in `backend/` if you haven't aready. The variables you'll need to set are listed above. 
* `pip3 install -r requirements.txt`
* `flask run`

 ## Testing
 
> The backend has unit tests powered by pytest for most of the non-database non-API related modules and functions. The tests are located in backend/app/tests. When designing the backend, we followed the single responsibility principle and separated database actions, API interfaces and file actions from logic processing. For example, `parse_util.py` includes all the parsing logic for error checking incoming request and parsing request body, as well as parsing database query results into proper response formats. This module is thoroughly tested for correctness. There are also tests for validating data structures and testing database connections. These tests can all be run with command ‘pytest’ in the backend folder. During our CI/CD workflow, pytest is also part of the process. If any test case fails, CI/CD will terminate with error.
