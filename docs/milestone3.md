# Milestone 3

## Database Implementation

We implemented a relational database. We created three tables Users, Crops and Weather.

Users table
| Column   | Data Type | Description                       |
|----------|-----------|-----------------------------------|
| id       | integer   | unique id of a user               |
| email    | String    | email of user                     |
| hash     | String    | hash password + salt              |
| crops    | String    | array of plants, refrencing crops |

Crops table
| Column        | Data Type | Description                     |
|---------------|-----------|---------------------------------|
| id            | integer   | id of plant, refrenced by users |
| type          | String    | type of crop                    |
| growth_stages | json      | detailed info on crop stage     |
| plant_date    | date      | date of plant                   |
| base_temp     | integer   | temp needed for plant growth    |
| freeze_temp   | integer   | temp were plant stops growing   |
| location      | String    | location of crop                |

Weather table
| Column   | Data Type | Description                                                        |
|----------|-----------|--------------------------------------------------------------------|
| station  | String    | weather station from which the measurement was taken               |
| name     | String    | name of the weather station (usually a human-readable location)    |
| date     | date      | date in zulu time                                                  |
| tmax     | integer   | max tempature for the day                                          |
| tmin     | integer   | min tempature for the day                                          |

## Deployment

Website link https://haybale.herokuapp.com/ <br />
test email: logan@test.com <br />
test password: password <br />

## Breakdown of Division of Labor

we used a private slack channel to communicate, we also met in person at the library

### Logan Mimaroglu

Met in person to brainstorm and design database implementation. Designed and implemented crop growth projection model. Tied front end to this new model. Santized and imported weather data from NOAA into our PostgreSQL database.

### Stephen Lee

Met in person to brainstorm and design database implementation. Created tables using DataGrip and connected them to Heroku. Implemented hashed passwords using salt and authenticated the passwords.

### Justin Szymanski

Met in person to brainstorm and design database implementation. Connected the Heroku database to the codebase and integrated it with existing functions. Modified database functions to be asynchronous using Pool.
