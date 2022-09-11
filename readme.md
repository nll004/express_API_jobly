# Jobly - Cummulative Project
Springboard Software Engineering Bootcamp - Cohort Jan 2022
Project completion date 9/2/22

## Assignment
Given a working API, I was tasked with adding test and documentation for some existing functions then asked to introduce several new features and endpoints.

## Programs Used

- Node.js
- Express.js
- PG database driver
- Json web token library
- Json schema validation tool
- Bcrypt library
- Jest testing library

### Project Notes

#### Part 1 and 2
- Added tests and docstring documentation for the sqlPartialUpdate function
- Added static class method to Company class that uses search values passed to it to insert in a SQL query.
- Created many unittests to ensure the function works as intended:
- Added JSON schemas to help validate data sent to API
- Created route testing to ensure correct JSON data was being retrieved

#### Part 3
- Added requireAdmin middleware to improve authorization on certain routes
    - Using JWTs to verify that requests are generated by admin before allowing access
- Added logic to user patch route so that only the user and/or admin can alter their info and password
- Fixed tests and added tests to ensure all routes and model changes work as intended

#### Part 4
- Added new Job class with static class methods to create, search, update and delete jobs using SQL database driver and queries.
    - Added testing for all methods
- Added API routes to create, update, search and delete jobs
    - Added JSON schemas to validate data sent to routes.
    - Added integration tests for all routes.
- Changed get company by handle route to respond with company info and all jobs for that company

#### Part 5
- Added applyToJob method to User model
    - Added unittests for new method
- Added a POST new route for applying to jobs
    - Added integration tests
