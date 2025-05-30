import './App.css';
import UsersDataTable from './components/UsersDataTable';

const defaultPageSize = 25;

function App() {
  return (
    <div className="container-fluid">
      <div className="App">

          <UsersDataTable />

      </div>
    </div>
  );
}

export default App;
