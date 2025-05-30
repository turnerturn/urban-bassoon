// generate-sample-data.js
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
const creators = ['admin', 'matt', 'susan', 'john', 'oracle', 'system'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate() {
  const start = new Date(2020, 0, 1).getTime();
  const end = new Date().getTime();
  return new Date(start + Math.random() * (end - start)).toString();
}

function randomEmail(first, last) {
  return `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random()*100)}@example.com`;
}

function randomUsername(first, last) {
  return `${first[0].toLowerCase()}${last.toLowerCase()}${Math.floor(Math.random()*1000)}`;
}

function generateUser() {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  return {
    firstName,
    lastName,
    email: randomEmail(firstName, lastName),
    username: randomUsername(firstName, lastName),
    createdDate: randomDate(),
    createdBy: randomItem(creators),
    userId: uuidv4()
  };
}

// --- CONFIGURE PAGINATION HERE ---
console.log('Generating sample data with the following parameters:');
console.log(`Total Count: ${process.argv[2] || 10}`);
console.log(`Limit: ${process.argv[3] || 10}`);
console.log(`Offset: ${process.argv[4] || 0}`);
console.log(`Base URL: ${process.argv[5] || 'https://1a7bdd8d-03f4-4c0a-a329-e90b71fff749.mock.pstmn.io/api/items'}`);

const totalCount = parseInt(process.argv[2], 10) || 10;
const limit = parseInt(process.argv[3], 10) || 10;
const offset = parseInt(process.argv[4], 10) || 0;
const baseUrl = process.argv[5] || 'https://1a7bdd8d-03f4-4c0a-a329-e90b71fff749.mock.pstmn.io/api/items';
const totalPages = Math.ceil(totalCount / limit);
const currentPage = Math.floor(offset / limit) + 1;
//get path variables from arg[4] if provided and then convert "/" to "_", otherwise use default
const sample_data_path_name = baseUrl.split('/').slice(-1)[0].replace(/\//g, '_');
// --- END CONFIGURATION ---

/* usage:
 node /workspaces/codespaces-react/public/data/generate-sample-data.js 500 25 0 https://1a7bdd8d-03f4-4c0a-a329-e90b71fff749.mock.pstmn.io/api/users
 node /workspaces/codespaces-react/public/data/generate-sample-data.js 500 100 100 https://1a7bdd8d-03f4-4c0a-a329-e90b71fff749.mock.pstmn.io/api/users
 node /workspaces/codespaces-react/public/data/generate-sample-data.js 500 100 200 https://1a7bdd8d-03f4-4c0a-a329-e90b71fff749.mock.pstmn.io/api/users
 node /workspaces/codespaces-react/public/data/generate-sample-data.js 500 100 300 https://1a7bdd8d-03f4-4c0a-a329-e90b71fff749.mock.pstmn.io/api/users
 node /workspaces/codespaces-react/public/data/generate-sample-data.js 500 100 400 https://1a7bdd8d-03f4-4c0a-a329-e90b71fff749.mock.pstmn.io/api/users
 */
const items = [];
for (let i = offset; i < Math.min(offset + limit, totalCount); i++) {
  items.push(generateUser());
}

const hasMore = offset + limit < totalCount;

const links = [
  { rel: 'self', href: `${baseUrl}?offset=${offset}&limit=${limit}` }
];
if (hasMore) {
  links.push({ rel: 'next', href: `${baseUrl}?offset=${offset + limit}&limit=${limit}` });
}

const result = {
  items,
  count: totalCount,
  hasMore,
  limit,
  offset,
  links
};

const outputFileName = `/workspaces/codespaces-react/public/data/sample-data-${sample_data_path_name}-${currentPage}.json`;
if (fs.existsSync(outputFileName)) {
  console.log(`File ${outputFileName} already exists. Overwriting...`);
}
fs.writeFileSync(outputFileName, JSON.stringify(result, null, 2));
console.log(`Sample data written to ${outputFileName}`);
