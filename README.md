<br />
<br />

<img src="https://user-images.githubusercontent.com/97474840/196573601-19e57d9f-0498-48a6-b8ce-3a44f3f036c0.png" width="500" alt="Lab49 quickbits" />

<br />

## Lab49 `quickbits`: Pagination showcase
This project is a quickbits showcase of various pagination techniques, including cursor based pagination and offset based pagination. [This article](https://dev.to/appwrite/this-is-why-you-should-use-cursor-pagination-4nh5) has an excellent rundown of the two types.

Pagination (and sorting and filtering) often needs to be handled server side, because users in the finance industry are typically working with very large data sets. If you have hundreds of thousands, or millions, of rows of data available to explore, it's not practical to send all of that data to a client application all at once. Not only will the data set itself be a large amount of data to send over the wire, not all UIs can work effeciently with that data. AG Grid is very sophisticated and can handle large data sets on the client, but AG Grid also provides tools to interact with an API to query paginated data.

In this demo, we're using the AG Grid [Server-Side Row Model](https://ag-grid.com/react-data-grid/server-side-model/) to do just that.

<img width="1607" alt="image" src="https://user-images.githubusercontent.com/63244584/207623331-26d9f0da-a618-4366-b1c6-ad085a15a5d9.png">

### [View the live demo!](https://quickbits-pagination-showcase.vercel.app/)

## Developers guide

### Prerequisite

##### To run this project, you will need to complete the following steps.

1. Install postgres DB
2. Creata a database and run the following query to create test data.
3. Create one file in the project root called `.env.local`.
4. Add the following line to that file and replace the strings `db_username`, `db_password`, `port_number` and `db_name` with your local database configuration.
        
        DATABASE_URL = postgresql://db_username:db_password@localhost:port_number/db_name


This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

Clone this repository, `npm install`, `npm run dev`, and you're ready to get going:

```bash
git clone git@github.com:lab49/quickbits-recoil-atom-family.git
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to get started!

