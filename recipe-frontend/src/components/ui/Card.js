import { colors, shadows } from "../../tokens/colors.js";

export function Card({ children, className = "", ...props }) {
	return (
		<div
			style={{
				backgroundColor: colors.surface,
				border: `1px solid ${colors.border}`,
				borderRadius: "12px",
				padding: "24px",
				boxShadow: shadows.md,
				transition: "all 0.2s ease",
			}}
			className={className}
			{...props}
		>
			{children}
		</div>
	);
}
