import { Center, Container, Loader } from "@mantine/core";

export function Loading() {
  return (
    <Container py="xl">
      <Center>
        <Loader size="xl" />
      </Center>
    </Container>
  );
}
