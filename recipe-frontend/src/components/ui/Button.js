import { colors, shadows } from "../../tokens/colors.js";

export function Button({
	children,
	variant = "primary",
	size = "md",
	onClick,
	type = "button",
	disabled = false,
	className = "",
	...props
}) {
	const baseStyles = {
		border: "none",
		borderRadius: "8px",
		cursor: disabled ? "not-allowed" : "pointer",
		fontWeight: "500",
		transition: "all 0.2s ease",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
		opacity: disabled ? 0.6 : 1,
	};

	const variants = {
		primary: {
			backgroundColor: colors.primary,
			color: "white",
			boxShadow: shadows.sm,
		},
		secondary: {
			backgroundColor: colors.secondary,
			color: "white",
			boxShadow: shadows.sm,
		},
		success: {
			backgroundColor: colors.success,
			color: "white",
			boxShadow: shadows.sm,
		},
		danger: {
			backgroundColor: colors.danger,
			color: "white",
			boxShadow: shadows.sm,
		},
		outline: {
			backgroundColor: "transparent",
			color: colors.primary,
			border: `2px solid ${colors.primary}`,
		},
		ghost: {
			backgroundColor: "transparent",
			color: colors.text,
		},
	};

	const sizes = {
		sm: { padding: "6px 12px", fontSize: "14px" },
		md: { padding: "10px 16px", fontSize: "16px" },
		lg: { padding: "12px 24px", fontSize: "18px" },
	};

	const buttonStyles = {
		...baseStyles,
		...variants[variant],
		...sizes[size],
	};

	return (
		<button
			style={buttonStyles}
			onClick={onClick}
			type={type}
			disabled={disabled}
			className={className}
			{...props}
		>
			{children}
		</button>
	);
}
