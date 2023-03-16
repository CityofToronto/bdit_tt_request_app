# Steps to internalize Team Gabriel's App

1) Git clone to `/web`

2) Create user `tt_request_app` with 

```bash
sudo createuser tt_request_app 
```

3) Assign a port for backend and one for front end, both in https section using 

```bash
sudo nano /etc/nginx/sites-available/default
```

```
location /tt-request-backend/ {
    proxy_pass http://localhost:8070/;
}

location /traveltime-request/ {
    proxy_pass http://localhost:8071/;
	alias /web/bdit_tt_datarequest_app/frontend/build/static;
}
```

and then reloading it using :

```bash
sudo nginx -s reload
```

4) From the project root directory, CD into folder `backend`.

5) Execute command `python3 -m venv venv/` to create a python virtual environment for the backend.

6) Execute command `source venv/bin/activate` to use the virtual environment as the python interpreter for the backend.

7) Execute command `pip3 install -r requirements.txt` to install the project dependencies listed in requirements.txt.

8) Execute command `pip3 install gunicorn`. Gunicorn is the service to be used to deploy a production version of the API server.

9) Create a pgadmin bot to handle here travel time requests and give usage access to this bot for the schemas `here` and `here_gis`, also change the path of this user to schema `here`, and `public`

10) Edit environment variables in `.env` file but that didnt work so export all environment with e.g.

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

11) Create all sql functions and modify table names when needed. Making sure the bot has usage access to all the function needed.

12) Modify `[model.py](http://model.py)`  and remove the primary key column for both routing streets and routing notes, add primary key to `node_id` and `link_dir` instead.

13) Run `GUNICORN_CMD_ARGS="--bind=0.0.0.0:8070  --timeout 90 --name=data_request_app" gunicorn app:app -D`

13) To the front end!

14) Navigate to `action.js` in `src/` and modify line 7 to define domain as `const domain = "[https://10.160.2.198/tt-request-backend](https://10.160.2.198/tt-request-backend)";`, and uncomment it 😥

15) Add `"homepage": "[http://10.160.2.198/traveltime-request](http://10.160.2.198/traveltime-request)",` in `package.json`

16) Execute command `npm install` to install project dependencies for the frontend listed in `package.json`.

17) Execute command `npm run build` to create an optimized production build of the frontend web application.

18) Execute command `npm install pm2@latest -g` to install [pm2](https://pm2.keymetrics.io/) as the example deployment tool. This command may require root privilege.

19) Execute command `pm2 serve build <port#> -spa` to deploy the production build, where <port#> is the port number assigned to the frontend application. This will also be the port to access the project application with.

`pm2 serve build 8071 -spa`

Things to figure out:

- make it restart if ec2 fails
- [https://askubuntu.com/questions/930589/running-upstart-script-on-17-04/1010398#1010398](https://askubuntu.com/questions/930589/running-upstart-script-on-17-04/1010398#1010398)

500 Error - Internal servor error

restart the backend gunicorn

```bash
su tt_traffic_request_app
```

```bash
-- kill the old process with 
kill PID 
```

```bash
GUNICORN_CMD_ARGS="--bind=0.0.0.0:8070 --timeout 90 --name=data_request_app" /web/bdit_tt_datarequest_app/backend/venv/bin/gunicorn app:app -D
```