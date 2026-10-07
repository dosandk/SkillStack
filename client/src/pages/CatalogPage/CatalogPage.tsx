import { Container, Heading } from '@eleks-ui/components';

import { RepositoryList } from '../../components/RepositoryList/RepositoryList';

export function CatalogPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Heading
        variant="page"
        title="Repositories"
        subtitle="Browse available skill repositories"
        divider
      />
      <RepositoryList />
    </Container>
  );
}
