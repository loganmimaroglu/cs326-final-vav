# Project Ideas

Team Name: Vav

Application Name: Crop Growth and Yield Predictor

## Team Overview

Logan Mimaroglu ([@gluestix](https://github.com/gluestix)) \
Stephen Lee ([@stephen-lee-cs](https://github.com/stephen-lee-cs)) \
Justin Szymanski ([@justinszy](https://github.com/justinszy))

## Innovative Idea

According to the American Society of Agronomy, [crop yield prediction remains one of the most challenging tasks in agriculture](https://www.mdpi.com/journal/agronomy/special_issues/cropprediction_precisionagriculture#:~:text=Crop%20yield%20prediction%20is%20one,%2C%20environmental%2C%20and%20crop%20parameters.). For a farmer, the benefits of precision agriculutre involve an increase in crop yield and crop quality which translates to an increase in profits. Existing precision argulcutural systems leverage expensive sensing technologies, information systems, and variable rate technologies to maximize crop yield. Our application is a crop growth and yield predictor that leverages weather data, known crop growth factors, nominal crop growth curves, date planted, and acerage to estimate a crop yield curve; allowing the farmer to pick the optimal date for harvest and compare visually different crop growing options by overlaying there crop yield curves on top of each other. Our solution is not a replacement for existing systems, but rather a supplemental tool and one that can be leveraged by smaller farmers who may not be able to bear the cost of existing systems.

## Important Components

There are 2 major componenets. The first are the web interface. This is how the user will select from a number of crops to visualize and input date planted. This is also how the user will visualize the estimated crop growth curves returned by the model. This will be a line graph with time on the x-axis and ((yield (ton) per acre * wholesale crop price per ton) - cost to plant per acre) on the y-axis.

The second is the model. The model will take into account date planted and have stored local weather data, historic crop growth curves for each plant, and a list of known variables for each plant that positively or negatively affect plant growth. Based on this information it will use some method (we will attempt a ML model for each plant) to estimate a crop growth curve. These predicted growth curves will be stored in some kind object and then sent back to the browser to be displayed.
