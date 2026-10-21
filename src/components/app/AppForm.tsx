import type { ReactNode } from "react";
import { AppAlert } from "./AppAlert";

export interface AppFormProps {
	onSubmit: () => void | Promise<void>;
	errorMessage?: string | null;
	notice?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
}

export const AppForm = ({
	onSubmit,
	errorMessage,
	notice,
	actions,
	children,
}: AppFormProps) => (
	<form
		noValidate
		onSubmit={(e) => {
			e.preventDefault();
			onSubmit();
		}}
		className="space-y-4"
	>
		{notice}
		{errorMessage && <AppAlert description={errorMessage} />}
		{children}
		{actions}
	</form>
);
