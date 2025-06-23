import { Button, Center, Container, Text } from "@mantine/core";

interface ErrorProps {
  fetchPosts: () => Promise<void>;
  error: string;
}

export function Error({ fetchPosts, error }: ErrorProps) {
  return (
    <Container py="xl">
      <Center>
        <Text color="red">{error}</Text>
        <Button onClick={fetchPosts} ml="md">
          Reintentar
        </Button>
      </Center>
    </Container>
  );
}
