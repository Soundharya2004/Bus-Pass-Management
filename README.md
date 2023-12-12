# Bus Pass Management System

The Bus Pass Management System is a web-based application developed to streamline the process of managing bus passes hassle-free. It allows users to create and renew passes, provides a user dashboard to view passes, and includes a user support feature for addressing queries 24/7. Additionally, there is an admin panel with exclusive access to view all passes and resolve user-reported issues.

## Prerequisites

Before you execute, ensure you have the following dependencies installed on your system:

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)

## Installation

1. **Clone the repository:**

   ```
   git clone https://github.com/Soundharya2004/Bus-Pass-Management.git

   ```
2. **Setting up the database**
   
   Open the mysql workbench or in the command prompt and construct the required tables for the execution . Refer `db.schema` file for the table details and the schema.

   After setting up the databases , make sure all the tables have been created and along with the parameters.

3. **Setting up the server**

      In your terminal go to the server folder by running this command
      ```
         cd server
      ```

      And after changing the directory , change the following codes in the `server.js` with your local database credentials .
      ```
         const connection = mysql.createConnection({
              host: 'YOUR_HOST',
              user: 'YOUR USER_NAME',
              password: 'YOUR PASSWORD',
              database: 'YOUR_DB NAME'
         });
      
      ```

4. **Package Installation**

      Now run this commands in the server directory to install the required packages for the execution .
      ```
         npm install
      ```
      or
      ```
         npm install mysql2 body-parser express bcrypt
      ```

