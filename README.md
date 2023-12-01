# TodoApp

## Overview

"TodoApp" is a task management and organization application built with React for the frontend, Node.js with Express for the backend, and MongoDB for data storage. The frontend utilizes Material-UI's DataGrid component for displaying the task list. User authentication is implemented using Auth0, and a specific "User" role is assigned to users with corresponding permissions.

## Features

- **Task Management:**
  - Create, read, update, and delete tasks.
  - Task list displayed using Material-UI DataGrid.

- **User Authentication:**
  - Implemented with Auth0.
  - Users automatically assigned a "User" role on their first login.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShohamKatzav/react-express-crud.git
   ```
   
2. **Install dependencies:**
    ```bash
    cd react-express-crud
    npm install
    ```
    
3. **Set up Auth0:**

* Create an Auth0 account: Auth0.
* Set up the "User" role with the following permissions: create:todos, delete:todos, read:todos, update:todos.
* Configure the Auth0 settings in your application.

4. **Create a `.env` file:**
Create a `.env` file in the root of your project with the following variables:

<pre><code>    # Auth0 Configuration
    VITE_APP_AUTH0_DOMAIN=*insert*
    VITE_APP_AUTH0_CLIENT_ID=*insert*
    VITE_APP_AUTH0_API_AUDIENCE=*insert*
    VITE_APP_AUTH0_API_ISSUER=*insert*

    # MongoDB Configuration
    DB_URI=*insert*

    # Backend URL
    VITE_APP_BASE_URL=*insert*
</code></pre>


Replace \*insert* with the corresponding values:

* `VITE_APP_AUTH0_DOMAIN`, `VITE_APP_AUTH0_CLIENT_ID`, `VITE_APP_AUTH0_API_AUDIENCE`, `VITE_APP_AUTH0_API_ISSUER`:
    Auth0 variables from the Auth0 custom application you created.
* `DB_URI`: The URI for your MongoDB Atlas.
* `VITE_APP_BASE_URL`: Should refer to the backend URL.

5. **Run the application:**

    ```bash
    npm start
    ```

## Auth0 Configuration

To ensure users are assigned the "User" role upon their first login, the following Auth0 action is implemented:

<pre><code>
    // Auth0 Action
    exports.onExecutePostLogin = async (event, api) => {
        if (event.stats.logins_count !== 1) {
        return;
    }
    const ManagementClient = require('auth0').ManagementClient;

    const management = new ManagementClient({
        domain: event.secrets.domain,
        clientId: event.secrets.clientId,
        clientSecret: event.secrets.clientSecret,
    });

    const params = { id: event.user.user_id };
    const data = { "roles": ["*insert your role id*"] };

    try {
        const res = await management.assignRolestoUser(params, data);
        } catch (e) {
            console.log(e);
            // Handle error
        }
    };
</code></pre>
    
## Usage

1. **Access the application at [http://localhost:3000](http://localhost:3000).**

2. **Home Page:**
   - If the user is not logged in, they will see a message prompting them to log in to view their tasks.
   - After logging in, the user will see their task list and have access to manage their todos.

3. **Navigation:**
   - **About and Contact:**
     - Accessible both before and after login.

   - **Login:**
     - Click on the "Log In" button to log in.

   - **Profile:**
     - After logging in, access the "Profile" page to view Auth0-logged-in user information.

   - **Todo List:**
     - After logging in, access the "Todo List" page to manage todos.

## License
This project is licensed under the MIT License.

## Acknowledgments
I'd would like to express our gratitude to Auth0 for providing a robust authentication solution.

## Deployment

The project is deployed using [Vercel](https://vercel.com/). You can access the live version here: [TodoApp Live](https://your-vercel-project-url.vercel.app/](https://todo-app-topaz-psi.vercel.app/)https://todo-app-topaz-psi.vercel.app/).
