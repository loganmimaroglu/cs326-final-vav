# Milestone 2

## Project API Planning

For our project we've created three RESTful API's through the use of Express.js. 

The first API serves as our endpoint for user login and authentication. When a user attempts to log in with their entered email address and password, this information will be received in the form of a POST request and checked against existing users in the database. Each user is assigned an index i, and upon successful login the user will be redirected to .../users/i.

The second API serves as our endpoint for providing chart information to the user. When a user attempts to view a specific plant p's chart, they will make a request to the server for .../users/i/crop?=p and in turn will receive the chart data for that plant. This data will be received in the form of a POST request containing a stringified JSON object.

The third API serves as our endpoint for user customization, such as adding/removing specific plants views to/from their profile. Adding plant views will be received in the form of POST requests, and upon receiving the request a new crop will be created and stored in the backend database as a JSON object. Removing plant views will be received in the form of DELETE requests, and upon receiving this request the plant's JSON object will be removed from the database. This API will also handle new user creation: requests will be received from ...users/new and a new user will be subsequently stored in the database. Users are stored as JSON objects containing their email address, password, and crop data.

Below is a flow chart demonstrating these three API endpoints:

![API Flowchart](./img/API_flowchart.png)

## Front-end Implementation

Creation of a new user ![New user page](./img/create.jpg)

Reading data to form a graph ![Graph data](./img/read.jpg)

Updating data by adding another plant ![add plant](./img/update.jpg)

Deleting data by removing a plant ![remove plant](./img/delete.jpg)

## Deployment

Website link https://haybale.herokuapp.com/

## Breakdown of Division of Labor

we used a private slack channel to communicate, we also met in person at the library

### Logan Mimaroglu
TODO
### Stephen Lee
TODO
### Justin Szymanski
Added functionality for adding/removing plant views, assisted in linking pages together, completed Project API Planning section of writeup.
