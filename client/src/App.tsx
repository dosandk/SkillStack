import { Container, Button } from '@eleks-ui/components';
import { useEleksUITheme } from '@eleks-ui/theme';

function App() {
  const { mode, toggleTheme } = useEleksUITheme();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      Hello App
      <Button onClick={toggleTheme}>
        Switch to {mode === 'dark' ? 'light' : 'dark'}
      </Button>
    </Container>
  );
}

export default App;
