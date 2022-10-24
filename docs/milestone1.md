# Milestone 1

## Data Interactions

- Crop Data: Since we are localizing for Ahmerst, MA to make this project achievable and are only supporting a set number of crops, we can store a large aggregation of crop growth data to train our predictive algorithm on.
- User Data: User's will be able to login and save crop profiles to their account. Crop profiles will be account specific and contain plant type, acreage, and date planted. Once a crop profile is created, a crop yield curve will be generated using historical crop yield data.

## Wireframes
Our wireframes were designed using whimscal and can be found at [here](https://whimsical.com/website-3DJyuDL2LN7ZT34vvtRyER). The following pages will be created for our application.

### Login Page

The login page which will also be the landing page for unauthenticated users.
![Login Page Wireframe](./img/login.jpg)

If you fail to login you will be presented with an error message.
![Failed Login Page Wireframe](./img/failed_login.jpg)

If you do not have an account and click register.
![Registration Page Wireframe](./img/register.jpg)

If you forgot your password.
![Forgot Password Page Wireframe](./img/forgot.jpg)

If your email is validated when you forgot password, the link you get to reset your password will take you to the following page.
![Reset Password Page Wireframe](./img/reset.jpg)
### Overview

Once you authenticate you will see an overview of the crops you have already added. The x-axis is date and y-axis is estimated profit based on estimated yield.
![Overview Page Wireframe](./img/overview.jpg)

### Single Plant View

If you want to inspect an individual plant the x-axis will remain date but the y-axis will be estimated yield.
![Individual Plant Page Wireframe](./img/individual_plant.jpg)

### Adding a single plant

If you want to add a plant this is the page you will see.
![Add Plant Page Wireframe](./img/add_plant.jpg)

## HTML & CSS Mockup

The login page which will also be the landing page for unauthenticated users.
![Login Page HTML](./img/login_html.png)

If you do not have an account and click register.
![Registration Page HTML](./img/register_html.png)

If you forgot your password.
![Forgot Password Page HTML](./img/forgot_html.png)

If your email is validated when you forgot password, the link you get to reset your password will take you to the following page.
![Reset Password Page HTML](./img/reset_html.png)

The overview dashboard that you will see after you log in.
![Overview Dashboard Page HTML](./img/overview_html.jpg)

The single plant view page, with wheat selected.
![Single Plant View Wheat Page HTML](./img/wheat_html.png)

## Breakdown of Division of Labor

we used a private slack channel to communicate, we also met in person at the library

### Logan Mimaroglu

I was responsible for the creation of the `dashboard.html` and `index.html` files as well as there corresponding JavaScript files, `dashboard.js` and `login.js`. I also created a the CSS styling `mystyle.css`. I worked with the rest of the team to create the Wireframe for the website.

### Stephen Lee

Worked with the rest of the team to create the project Wireframe. Implemented forgotten password flow of `forgot.html`, `password.html`, `reset.html`. Implemented single plant views `carrot.html`, `soybean.html`

### Justin Szymanski

- Worked with the rest of the team to create the project Wireframe.
- Implemented the create account page (`register.html` and `register.js`).
- Implemented the single plant view page for Wheat (`wheat.html` and `wheat.js`).
- Added sidebar connectivity to swap between pages.
