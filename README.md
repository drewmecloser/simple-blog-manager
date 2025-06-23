Simple Blog Post Manager - CodeGrade Challenge
This project is a simple web application designed to manage blog posts. It features a frontend built with vanilla JavaScript, HTML, and CSS, interacting with a mock REST API powered by json-server.

Features Implemented
View All Posts: Displays a list of all blog post titles.

View Post Details: Clicking a post title shows its full details (title, author, date, image, content).

Add New Post: Allows users to create and add new blog posts, which are persisted to the backend API.

Update Post: Provides functionality to edit the title and content of existing posts, with changes persisted to the backend.

Delete Post: Enables users to remove posts, with deletions persisted to the backend.

Initial Load: Details of the first post are displayed automatically when the page loads.

Technologies Used
HTML: Structure of the web page.

CSS: Styling of the application.

JavaScript: Core logic for DOM manipulation, event handling, and API interactions.

json-server: Used to create a mock REST API for blog post data.

live-server: For serving the frontend application during development.

Setup and Running the Application
To run this project locally, follow these steps:

Clone the Repository (or create the project structure):
If you haven't already, ensure you have the project files set up as described in the challenge. Your project root should contain index.html, a src folder with index.js, a css folder with styles.css, and a db.json file.

Install Global Dependencies:
You need json-server and live-server installed globally. If you don't have them, run:

npm install -g json-server@0.17.4 live-server

Prepare db.json:
Ensure your db.json file is populated with some sample data, like this:

{
  "posts": [
    {
      "id": 1,
      "title": "Getting Started with React",
      "author": "Sarah Johnson",
      "date": "2024-01-15",
      "image": "https://via.placeholder.com/400x200?text=React",
      "content": "React is a powerful JavaScript library..."
    },
    {
      "id": 2,
      "title": "The Future of Web Development",
      "author": "Michael Chen",
      "date": "2024-02-20",
      "image": "https://via.placeholder.com/400x200?text=Web+Dev",
      "content": "Explore exciting trends..."
    }
    ,
    {
      "id": 3,
      "title": "Design Systems That Scale",
      "author": "Emily Rodriguez",
      "date": "2024-03-01",
      "image": "https://via.placeholder.com/400x200?text=Design+Systems",
      "content": "Learn how to create robust design systems..."
    },
    {
      "id": 4,
      "title": "TypeScript Best Practices",
      "author": "David Lee",
      "date": "2024-04-10",
      "image": "https://via.placeholder.com/400x200?text=TypeScript",
      "content": "Discover best practices for writing clean code..."
    }
  ]
}

(You can add more posts or modify existing ones.)

Start the Backend API:
Open your terminal, navigate to your project's root directory (where db.json is located), and run:

json-server db.json

This will start the mock API, typically accessible at http://localhost:3000. Keep this terminal window open.

Start the Frontend Server:
Open a separate terminal window, navigate to the same project's root directory, and run:

live-server

This will open the index.html file in your default web browser, usually at http://127.0.0.1:5500.

You should now see the blog post manager running in your browser, ready for interaction.