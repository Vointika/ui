import { useForm } from "@tanstack/react-form";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../test/test-utils";
import { FieldGroup } from "../ui/field";
import { AppField } from "./AppField";
import { AppFormActions } from "./AppFormActions";
import { AppFormCard } from "./AppFormCard";

const Harness = ({
	onSubmit,
	errorMessage,
	type,
}: {
	onSubmit: (name: string) => void;
	errorMessage?: string | null;
	type?: "email";
}) => {
	const form = useForm({
		defaultValues: { name: "" },
		onSubmit: ({ value }) => onSubmit(value.name),
	});

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={<AppFormActions isPending={false} submitLabel="Save" />}
		>
			<FieldGroup>
				<form.Field name="name">
					{(field) => <AppField field={field} label="Name" type={type} />}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};

describe("AppFormCard", () => {
	it("submits through a bare form.handleSubmit reference", async () => {
		const onSubmit = vi.fn();
		renderWithProviders(<Harness onSubmit={onSubmit} />);

		await userEvent.type(screen.getByLabelText("Name"), "Cascade hike");
		await userEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("Cascade hike"));
	});

	it("does not reload the page — the submit event is prevented", async () => {
		const onSubmit = vi.fn();
		renderWithProviders(<Harness onSubmit={onSubmit} />);

		const submitted = vi.fn();
		document.addEventListener("submit", (e) => submitted(e.defaultPrevented));

		await userEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => expect(submitted).toHaveBeenCalledWith(true));
	});

	it("shows a server error above the fields, not in a toast", () => {
		renderWithProviders(
			<Harness onSubmit={vi.fn()} errorMessage="Handle is already taken." />,
		);

		expect(screen.getByText("Handle is already taken.")).toBeInTheDocument();
	});

	it("leaves validation to the form's own rules: the browser's check never blocks the submit", async () => {
		const onSubmit = vi.fn();
		renderWithProviders(<Harness onSubmit={onSubmit} type="email" />);

		await userEvent.type(screen.getByLabelText("Name"), "not-an-email");
		await userEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("not-an-email"));
	});
});
