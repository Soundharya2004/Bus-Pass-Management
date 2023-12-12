const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); 

const app = express();
const port = 3000;


const connection = mysql.createConnection({
  host: 'YOUR_HOST',
  user: 'YOUR USER_NAME',
  password: 'YOUR PASSWORD',
  database: 'YOUR_DB NAME'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 

app.post('/signup', (req, res) => {
    const { name, user_id, email, password } = req.body;
  
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Error creating user');
        return;
      }
  
      const insertUserQuery = 'INSERT INTO users (name, user_id, email, password) VALUES (?, ?, ?, ?)';
      connection.query(insertUserQuery, [name, user_id, email, hashedPassword], (err, results) => {
        if (err) {
          console.error('Error inserting data for signup:', err);
          res.status(500).send('Error creating user');
          return;
        }
  
        
        const insertSessionQuery = 'INSERT INTO session (user_id, name) VALUES (?, ?)';
        connection.query(insertSessionQuery, [user_id, name], (err) => {
          if (err) {
            console.error('Error inserting data into session table:', err);
            res.status(500).send('Error creating session');
            return;
          }
  
          console.log('User registered successfully:', results);
          res.redirect('/dashboard');
        });
      });
    });
  });
  
  


  app.post('/login', (req, res) => {
    const {name , user_id, password } = req.body;

    const selectQuery = 'SELECT * FROM users WHERE user_id = ?';

    connection.query(selectQuery, [user_id], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('Error logging in');
            return;
        }

        if (results.length === 0) {
            console.log('User not found');
            res.status(401).send('Invalid credentials');
            return;
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, passwordMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                res.status(500).send('Error comparing passwords');
                return;
            }

            if (!passwordMatch) {
                console.error('Invalid password');
                res.status(401).send('Invalid credentials');
                return;
            }

            const insertSessionQuery = 'INSERT INTO session (user_id, name) VALUES (?, ?)';
            connection.query(insertSessionQuery, [user_id, name], (err) => {
              if (err) {
                console.error('Error inserting data into session table:', err);
                res.status(500).send('Error creating session');
                return;
              }

                console.log('Login successful');
                res.redirect('/dashboard');
            });
        });
    });
});


  

app.get('/dashboard', (req, res) => {
  req.session = req.session || {};
  const sessionId = req.session.session_id || 1;

  const selectSessionQuery = 'SELECT name, user_id FROM session WHERE session_id = ?';
  connection.query(selectSessionQuery, [sessionId], (err, userResults) => {
      if (err) {
          console.error('Error querying session table:', err);
          res.status(500).send('Error retrieving user data');
          return;
      }

      if (userResults.length === 0) {
          res.status(404).send('User not found');
          return;
      }

      const { name, user_id } = userResults[0];

      const selectPassQuery = 'SELECT pass_id, location, duration FROM pass WHERE user_id = ? ';
      connection.query(selectPassQuery, [user_id], (err, passResults) => {
          if (err) {
              console.error('Error querying pass table:', err);
              res.status(500).send('Error retrieving pass data');
              return;
          }

          if (passResults.length === 0) {
              res.send(`
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Dashboard</title>
                      
                      <style>
                      @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap");
              
                      * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: "Poppins", sans-serif;
                      }
              
                      body {
                        background-color: #f4f4f4;
                      }
                      #navbar {
                        overflow: hidden;
                    }
            
                    #navbar a {
                        float: right;
                        display: block;
                        color: black;
                        text-align: center;
                        padding: 14px 16px;
                        text-decoration: none;
                    }
                      #dashboard-container {
                        margin-top:50px;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #fff;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        margin-top: 50px;
                      }
              
                      h1, h2 {
                        color: #333;
                      }
              
                      ul {
                        list-style-type: none;
                        padding: 0;
                      }
              
                      li {
                        margin-bottom: 10px;
                      }
              
                      table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                      }
              
                      table, th, td {
                        border: 1px solid #ddd;
                      }
              
                      th, td {
                        padding: 12px;
                        text-align: left;
                      }
              
                      th {
                        background-color: #f2f2f2;
                      }
              
                      .buttons {
                        margin-top: 20px;
                      }
              
                      .buttons a {
                        background-color: #4796ff;
                        color: #fff;
                        font-size: 16px;
                        outline: none;
                        border-radius: 5px;
                        border: none;
                        padding: 8px 15px;
                        margin-right: 10px;
                        text-decoration: none;
                      }
              
                      a {
                        color: #4796ff;
                        text-decoration: none;
                        margin-top: 15px;
                        display: inline-block;
                      }
                      .logout{
                        float : right;
                        margin-right:10px;
                      }
                      </style>
                  </head>
                  <body>
                  <div id="navbar">
                  <a href="http://127.0.0.1:5501/support.html">Support</a>
                  <a href= "/logout">Logout</a>
              </div>

                      <h1>Welcome, ${name} (User ID: ${user_id})!</h1>
                      <h2>Your Passes:</h2>
                      <p>No passes found.</p>
                      <div class="buttons">
                          <a href="http://127.0.0.1:5501/createpass.html">Add</a>
                          <a href="http://127.0.0.1:5501/renew-pass.html">Renew</a>
                      </div>
                      
                  </body>
                  </html>
              `);
              return;
          }

          res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard</title>
        <style>
            @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap");

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: "Poppins", sans-serif;
            }

            body {
              background-color: #f8f8f8;
            }
            #navbar {
              overflow: hidden;
          }
  
          #navbar a {
              float: right;
              display: block;
              color: black;
              text-align: center;
              padding: 14px 16px;
              text-decoration: none;
          }
            #dashboard-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              margin-top: 50px;
            }

            h1, h2 {
              color: #333;
            }

            ul {
              list-style-type: none;
              padding: 0;
            }

            li {
              margin-bottom: 10px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            table, th, td {
              border: 1px solid #ddd;
            }

            th, td {
              padding: 12px;
              text-align: left;
            }

            th {
              background-color: #f2f2f2;
            }

            .buttons {
              margin-top: 20px;
            }

            .buttons a {
              background-color: #4796ff;
              color: #fff;
              font-size: 16px;
              outline: none;
              border-radius: 5px;
              border: none;
              padding: 8px 15px;
              margin-right: 10px;
              text-decoration: none;
            }

            a {
              color: #4796ff;
              text-decoration: none;
              margin-top: 15px;
              display: inline-block;
            }

            
        </style>
    </head>
    <body>
    <div id="navbar">
              <a href="http://127.0.0.1:5501/support.html">Support</a>
              <a href= "/logout">Logout</a>
          </div>
        <h1 class="greeting">Welcome, ${name} (User ID: ${user_id})!</h1>
        <div id="dashboard-container">
            
            
            <!-- Display pass data -->
            <h2>Your Passes:</h2>
            <table>
                <thead>
                    <tr>
                        <th>Pass ID</th>
                        <th>Location</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${passResults.map((pass) => `
                        <tr>
                            <td>${pass.pass_id}</td>
                            <td>${pass.location}</td>
                            <td>${new Date(pass.duration).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Buttons for Add and Renew -->
            <div class="buttons">
                <a href="http://127.0.0.1:5501/createpass.html">Add</a>
                <a href="http://127.0.0.1:5501/renew-pass.html">Renew</a>
            </div>
            
            
        </div>

    </body>
    </html>
          `);
      });
  });
});




app.get('/logout', (req, res) => {
   
    const truncateSessionQuery = 'TRUNCATE TABLE session';
    connection.query(truncateSessionQuery, (err) => {
        if (err) {
            console.error('Error truncating session table:', err);
            return res.status(500).send('Error logging out');
        }

        
        return res.redirect('http://127.0.0.1:5501/home.html');
    });
});

app.post('/createpass', (req, res) => {
    const { pass_id, user_id, location, duration} = req.body;
  

    const insertUserQuery = 'INSERT INTO pass ( pass_id, user_id, location, duration) VALUES (?, ?, ?, ?)';
    connection.query(insertUserQuery, [ pass_id, user_id, location, duration], (err, results) => {
    if (err) {
          console.error('Error inserting the pass:', err);
          res.status(500).send('Error creating pass');
          return;
        }
  
        console.log("Pass created successfully:" , results);
        res.redirect('/dashboard');
       
    });
});


app.post('/renew', (req, res) => {
    const { pass_id, duration } = req.body;
  
    // Validate input parameters
    if (!pass_id || !duration) {
      return res.status(400).json({ error: 'Pass ID and new duration are required' });
    }
  
    // Update the pass duration
    const updatePassQuery = 'UPDATE pass SET duration = ? WHERE pass_id = ?';
    connection.query(updatePassQuery, [duration, pass_id], (err, result) => {
      if (err) {
        console.error('Error updating pass:', err);
        return res.status(500).json({ error: 'Failed to renew pass' });
      }
  
      if (result.affectedRows === 0) {
        // No rows were affected, indicating that the pass with the given ID was not found
        return res.status(404).json({ error: 'Pass not found' });
      }
  
      res.redirect('/dashboard');
    });
  });
  



app.post('/admin-login', (req, res) => {
  const { user_id, password } = req.body;

  
  const selectAdminQuery = 'SELECT * FROM admin WHERE user_id = ?';

  connection.query(selectAdminQuery, [user_id], (err, results) => {
      if (err) {
          console.error('Error querying admin database:', err);
          res.status(500).send('Error logging in');
          return;
      }

      if (results.length === 0) {
          console.log('Admin not found');
          res.status(401).send('Invalid credentials');
          return;
      }

      const admin = results[0];


      if (password !== admin.password) {
          console.error('Invalid password');
          res.status(401).send('Invalid credentials');
          return;
      }

     
      res.redirect('/admin-dashboard');
  });
});

app.get('/admin-dashboard', (req, res) => {
  const selectPassQuery = 'SELECT * FROM pass';

  connection.query(selectPassQuery, (err, passResults) => {
    if (err) {
      console.error('Error querying pass table:', err);
      res.status(500).send('Error retrieving pass data');
      return;
    }

    
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard</title>
        <style>
            @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap");
    
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: "Poppins", sans-serif;
            }
    
            body {
              background-color: #f4f4f4;
            }
            #navbar {
              overflow: hidden;
          }
  
          #navbar a {
              float: right;
              display: block;
              color: black;
              text-align: center;
              padding: 14px 16px;
              text-decoration: none;
          }
            
            #dashboard-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              margin-top: 50px;
            }
    
            h1, h2 {
              color: #333;
            }
    
            ul {
              list-style-type: none;
              padding: 0;
            }
    
            li {
              margin-bottom: 10px;
            }
    
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
    
            table, th, td {
              border: 1px solid #ddd;
            }
    
            th, td {
              padding: 12px;
              text-align: left;
            }
    
            th {
              background-color: #f2f2f2;
            }
    
            .buttons {
              margin-top: 20px;
            }
    
            .buttons a {
              background-color: #4796ff;
              color: #fff;
              font-size: 16px;
              outline: none;
              border-radius: 5px;
              border: none;
              padding: 8px 15px;
              margin-right: 10px;
              text-decoration: none;
            }
    
            a {
              color: #4796ff;
              text-decoration: none;
              margin-top: 15px;
              display: inline-block;
            }
            nav{
              float:right;
              gap:10px;
              margin-right:15px;
            }
        </style>
    </head>
    <body>
    <div id="navbar">
              <a href="/issue">Issues</a>
              <a href= "/logout">Logout</a>
          </div>
        <div id="dashboard-container">
            
            
            <!-- Display pass data -->
            <h2>Your Passes:</h2>
            <table>
                <thead>
                    <tr>
                        <th>Pass ID</th>
                        <th>User ID</th>
                        <th>Location</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${passResults.map((pass) => `
                        <tr>
                            <td>${pass.pass_id}</td>
                            <td>${pass.user_id}</td>
                            <td>${pass.location}</td>
                            <td>${pass.duration}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            </div>
            
    </body>
    </html>
    
    `);
  });
});

app.post('/support', (req, res) => {
  const { name, user_id, description } = req.body;

  const insertIssueQuery = 'INSERT INTO issue (name, user_id, description) VALUES (?, ?, ?)';

  connection.query(insertIssueQuery, [name, user_id, description], (err, result) => {
      if (err) {
          console.error('Error inserting issue into the database:', err);
          res.status(500).send('Error submitting support request');
          return;
      }

      console.log('Support request submitted successfully');
      res.redirect('/dashboard');
  });
});

app.get('/issue', (req, res) => {
  const selectIssueQuery = 'SELECT * FROM issue';

  connection.query(selectIssueQuery, (err, issueResults) => {
    if (err) {
      console.error('Error querying issue table:', err);
      res.status(500).send('Error retrieving issue data');
      return;
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Issues</title>
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap");

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: "Poppins", sans-serif;
          }

          body {
            background-color: #f4f4f4;
          }

          #navbar {
            overflow: hidden;
          }

          #navbar a {
            float: right;
            display: block;
            color: black;
            text-align: center;
            padding: 14px 16px;
            text-decoration: none;
          }

          .issue-container {
            max-width: 800px;
            margin: 20px auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
          }

          .issue-header {
            margin-bottom: 20px;
          }

          .issue-item {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
          }

          .issue-sender {
            font-weight: bold;
            margin-bottom: 10px;
          }

          .issue-content {
            line-height: 1.5;
          }

          .delete-btn {
            background-color: #ff3333;
            color: #fff;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
          }

          .delete-btn:hover {
            background-color: #cc0000;
          }
        </style>
      </head>

      <body>
        <div id="navbar">
          <a href="/admin-dashboard">Dashboard</a>
        </div>
        <div class="issue-container">
          <h2 class="issue-header">Support Issues:</h2>
          ${issueResults.map((issue, index) => `
            <div class="issue-item">
              <p class="issue-sender">${index + 1}. Sender: ${issue.name} (User ID: ${issue.user_id})</p>
              <p class="issue-content">${issue.description}</p>
            </div>
          `).join('')}
          <button class="delete-btn" onclick="deleteAllIssues()">Clear All</button>
        </div>

        <script>
          function deleteAllIssues() {
            fetch('/delete', {
              method: 'GET',
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to delete issues');
              }
              return response.json();
            })
            .then(data => {
              console.log('Issues deleted successfully:', data);
              window.location.reload();
            })
            .catch(error => {
              console.error('Error deleting issues:', error);
            });
          }
        </script>
      </body>
      </html>
    `);
  });
});
// Add a route for deleting all records from the 'issues' table
app.get('/delete', (req, res) => {
  const deleteIssuesQuery = 'TRUNCATE TABLE issue';

  connection.query(deleteIssuesQuery, (err, result) => {
    if (err) {
      console.error('Error deleting issues:', err);
      res.status(500).send('Error deleting issues');
      return;
    }

    // Log the result for debugging purposes
    console.log('Deleted issues:', result);

    // Redirect to the '/issues' page to refresh the content
    res.redirect('/issue');
  });
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
