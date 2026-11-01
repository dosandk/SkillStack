import { Container, Heading } from '@eleks-ui/components';
import { Navigate, Route, Routes } from 'react-router-dom';

import { RepositoryDetails } from './components/RepositoryDetails/RepositoryDetails';
import { RepositoryList } from './components/RepositoryList/RepositoryList';

function App() {
  return (
    <Container sx={{ py: 4 }}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Heading
                variant="page"
                title="Repositories"
                subtitle="Browse available skill repositories"
                divider
              />
              <RepositoryList />
            </>
          }
        />
        <Route path="/repositories/:id" element={<RepositoryDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Container>
  );
}

export default App;
