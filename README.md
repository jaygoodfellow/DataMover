# Data Mover

## Prerequisites

* Node 10
* MySQL
* NVM

## Optional
* PM2

## Installation
`nvm use`

`npm install`

## Setup
Create 2 databases, `source` and `destination`
Import SQL files in `data` folder into their respective databases

Rename `.env.example` to `.env`
Update `.env` with database credentials
Default port is 3333, can change in `.env`


## Running
`npm start` - Runs application using pm2

`node ./bin/www` - Runs application without pm2

Open your browser to http://localhost:3333


## Application

This application takes customers from a source database and exports them in batches to a destination database. The 3 primary goals of the project were to
  1. capture all errors on export
  2. rollback any export with errors
  3. log all customer export attempts

This creates a 1:many relationship between Export:Customer but a many:many relationship between Log:Customer. Even though customers are only associated with successful exports, they could have logs for many different exports that failed.


### Dashboard

All tables use DataTables.net for formatting/sorting/searching. They use default params except for no column is sorted on page load. You can edit the DataTables settings in the `public/assets/scripts/app.js` file. There is no editing/removing of individual customers from the interface at this time, any data changes outside of Exports need to be done in the database directly.

### Customers

The Source database comes with 1336 example records. 229 of the customers are not part of existing Export. You can generate more records from the Customers screen using the Generate Sample Customers form (between 1-500 at a time). The AcquisitionDate of new customers is a random day within the last week.

Destination database comes with 1107 customer records. (1336 from Source minus the 229 that have not been exported)

### Exports

There are 6 Exports included in the sample database. All have a status of Completed and 1 had errors that were corrected and then exported again.

The Export Customers button on the Exports screen will only be active if there are customers who are not part of successful or pending exports. Once you complete your first export the button will be disabled until you generate more customers.

### Processing Exports

Exports are generated from the dashboard but are run as a separate process. You can either set up a cron job or go to the page directly from your browser to run any pending jobs. Visit http://localhost:3333/process to check for any exports that need to be run.

**Errors**

If there are errors during an export the entire export will be rolled back. The export will log the errors and be marked as Complete. The destination database will not have any records added to it. There is a hardcoded error ID at the moment, but the app will catch any type of error that the database throws when inserting into Destination.

The app will not stop at the first error, as is common with database transactions. It will continue inserting records and capture all errors that occur. This will allow for the changes to happen in bulk and not require constantly creating new exports while fixing data issues.

**Generate Errors**

If you change a FirstName or LastName to null the export will fail. The destination database does not allow Nulls in FirstName or LastName, but the source database does.

### Error Checking

*Most* common errors are currently dealt with. All inputs check for null or no values. The error page will display raw data but can be edited from the `views/error.ejs` file.

