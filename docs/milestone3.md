# Milestone 3

## Database Implementation

We implemented a relational database. We created two tables Users and Crops where User.crops refers to plants in Crops.

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
| id            | integer   | unique id of  a plant           |
| type          | String    | type of crop                    |
| growth_stages | json      | detailed info on crop stage     |
| plant_date    | date      | date of plant                   |
| base_temp     | integer   | temp needed for plant growth    |
| freeze_temp   | integer   | temp were plant stops growing   |
| location      | String    | location of crop                |


## Deployment

Website link https://haybale.herokuapp.com/ <br />
test email: logan@test.com <br />
test password: password <br />

## Breakdown of Division of Labor

we used a private slack channel to communicate, we also met in person at the library

### Logan Mimaroglu

//TODO

### Stephen Lee

Worked with group to plan out Database implementation. Created tables using DataGrip. Hashed passwords with salt.

### Justin Szymanski

//TODO
