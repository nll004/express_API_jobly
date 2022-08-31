# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js

To run the tests:

    jest -i

## Notes

#### Part 1
- Added a few tests for function to ensure it is returning what is intended
- Added doc string documentation for sqlForPartialUpdate function

#### Part 2
- Set up static async method for Company that could use query strings to search.
- If no query params and params = undefined. Defaults values are used to select all companies.
- As the result, I replaced findall method as it was no longer needed.
- Created many unittests to ensure the function works as intended:
    - All options for searching work correctly
    - If extra query fields are included they are ignored by route
    - If min > max employees, error is thrown
    - If no results, error is thrown
- Route testing for integration testing
    - No params => return all companies
    - Extra params don't affect search
    - Partial params return what is intended due to default vals
    - Error if no results found
