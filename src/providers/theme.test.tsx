import { act, render } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./theme";

let toggle: () => void;
let setTheme: (t: "light" | "dark") => void;

const Consumer = () => {
	const ctx = useTheme();
	toggle = ctx.toggle;
	setTheme = ctx.setTheme;
	return <span data-testid="theme">{ctx.theme}</span>;
};

const mount = () =>
	render(
		<StrictMode>
			<ThemeProvider>
				<Consumer />
			</ThemeProvider>
		</StrictMode>,
	);

describe("ThemeProvider", () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.classList.remove("light", "dark");
	});

	it("persists a toggle, and the write survives StrictMode's double render", async () => {
		const { getByTestId } = mount();
		await act(async () => toggle());

		expect(getByTestId("theme").textContent).toBe("dark");
		expect(localStorage.getItem("theme")).toBe("dark");
	});

	it("reads the stored choice on mount", async () => {
		localStorage.setItem("theme", "dark");
		const { getByTestId } = mount();
		expect(getByTestId("theme").textContent).toBe("dark");
	});

	it("writes nothing until a choice is made", () => {
		mount();
		expect(localStorage.getItem("theme")).toBeNull();
	});

	it("setTheme persists too", async () => {
		mount();
		await act(async () => setTheme("dark"));
		expect(localStorage.getItem("theme")).toBe("dark");
	});

	it("keeps the dark the page's script chose from the system preference, under StrictMode, with nothing stored", () => {
		document.documentElement.classList.add("dark");
		const { getByTestId } = mount();

		expect(getByTestId("theme").textContent).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.classList.contains("light")).toBe(false);
	});
});
