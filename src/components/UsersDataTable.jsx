import '../App.css';

import OracleRestDataTable from './OracleRestDataTable';

const usersDataTableColumns = [
  { name: 'First Name', selector: row => row.firstName, sortable: true, sortField: 'firstName', dataType: 'string' },
  { name: 'Last Name', selector: row => row.lastName, sortable: true, sortField: 'lastName', dataType: 'string' },
  { name: 'Email', selector: row => row.email, sortable: true, sortField: 'email', dataType: 'string' },
  { name: 'Username', selector: row => row.username, sortable: true, sortField: 'username', dataType: 'string' },
  { name: 'Created Date', selector: row => row.createdDate, sortable: true, sortField: 'createdDate', dataType: 'date' },
  { name: 'Created By', selector: row => row.createdBy, sortable: true, sortField: 'createdBy', dataType: 'string' },
  { name: 'User ID', selector: row => row.userId, sortable: true, sortField: 'userId', dataType: 'string' },
];

const defaultPageSize = 25;

function UsersDataTable() {
  return (
    <div className="container-fluid">
      <OracleRestDataTable dataTableTitle="Users" url="https://1a7bdd8d-03f4-4c0a-a329-e90b71fff749.mock.pstmn.io/api/users" columns={usersDataTableColumns} />
    </div>
  );
}

export default UsersDataTable;
