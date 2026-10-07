import { Route, Routes } from 'react-router-dom';

import { AppHeader } from './components/AppHeader/AppHeader';
import { CatalogPage } from './pages/CatalogPage/CatalogPage';
import { FavoritesPage } from './pages/FavoritesPage/FavoritesPage';
import { RepositoryDetailPage } from './pages/RepositoryDetailPage/RepositoryDetailPage';
import { SharedCollectionPage } from './pages/SharedCollectionPage/SharedCollectionPage';

function App() {
  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route
          path="/repositories/:repoId"
          element={<RepositoryDetailPage />}
        />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/shared/:shareId" element={<SharedCollectionPage />} />
      </Routes>
    </>
  );
}

export default App;
