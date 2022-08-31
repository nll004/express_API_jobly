# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js

To run the tests:

    jest -i

### Notes

- Set up static async method for Company that could use query strings to search.
If no query params, defaults will select all companies.
- As the result, I replaced findall method as it was no longer needed.
