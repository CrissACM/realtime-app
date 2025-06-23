import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import PostForm from "../../src/components/PostForm";
import type { PostStatus } from "../../src/types/post";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("PostForm", () => {
  const defaultProps = {
    onSubmit: vi.fn(() => Promise.resolve()),
    onCancel: vi.fn(),
    isSubmitting: false,
  };

  it("renders all form fields", () => {
    render(
      <MantineProvider>
        <PostForm {...defaultProps} />
      </MantineProvider>,
    );

    // screen.debug(undefined, 30000);
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contenido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Autor/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/selecciona un estado/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Crear Post/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cancelar/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors on submit with empty fields", async () => {
    render(
      <MantineProvider>
        <PostForm {...defaultProps} />
      </MantineProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Crear Post/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/El titulo no puede estar vacío/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/El contenido no puede estar vacío/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/El autor no puede estar vacío/i),
      ).toBeInTheDocument();
    });
  });

  it("calls onSubmit with correct data", async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    render(
      <MantineProvider>
        <PostForm {...defaultProps} onSubmit={onSubmit} />
      </MantineProvider>,
    );

    fireEvent.change(screen.getByLabelText(/Título/i), {
      target: { value: "Mi título" },
    });
    fireEvent.change(screen.getByLabelText(/Contenido/i), {
      target: { value: "Contenido de prueba largo" },
    });
    fireEvent.change(screen.getByLabelText(/Autor/i), {
      target: { value: "Autor" },
    });

    fireEvent.mouseDown(screen.getByPlaceholderText(/selecciona un estado/i));
    fireEvent.click(screen.getByText(/Publicado \(Published\)/i));

    fireEvent.click(screen.getByRole("button", { name: /Crear Post/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Mi título",
        content: "Contenido de prueba largo",
        author: "Autor",
        status: "published",
      });
    });
  });

  it("renders initialData when provided", () => {
    const initialData = {
      id: "1",
      title: "Título inicial",
      content: "Contenido inicial de prueba",
      author: "Autor inicial",
      status: "archived" as PostStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    render(
      <MantineProvider>
        <PostForm {...defaultProps} initialData={initialData} />
      </MantineProvider>,
    );
    expect(screen.getByDisplayValue(initialData.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(initialData.content)).toBeInTheDocument();
    expect(screen.getByDisplayValue(initialData.author)).toBeInTheDocument();
    expect(screen.getByText(/Archivado \(archived\)/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Actualizar Post/i }),
    ).toBeInTheDocument();
  });

  it("calls onCancel when Cancelar button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <MantineProvider>
        <PostForm {...defaultProps} onCancel={onCancel} />
      </MantineProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("disables buttons when isSubmitting is true", () => {
    render(
      <MantineProvider>
        <PostForm {...defaultProps} isSubmitting={true} />
      </MantineProvider>,
    );
    expect(screen.getByRole("button", { name: /Cancelar/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Crear Post/i })).toHaveAttribute(
      "data-loading",
    );
  });
});
