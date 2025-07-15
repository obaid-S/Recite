import { colors } from "../../tokens/colors.js";

export function Input({
	label,
	placeholder,
	value,
	onChange,
	type = "text",
	required = false,
	disabled = false,
	error = "",
	className = "",
	...props
}) {
	const inputStyles = {
		width: "100%",
		padding: "12px 16px",
		fontSize: "16px",
		border: `2px solid ${error ? colors.danger : colors.border}`,
		borderRadius: "8px",
		backgroundColor: disabled ? colors.background : colors.surface,
		color: colors.text,
		transition: "all 0.2s ease",
		outline: "none",
		":focus": {
			borderColor: colors.primary,
			boxShadow: `0 0 0 3px ${colors.primary}20`,
		},
	};

	return (
		<div style={{ marginBottom: "16px" }}>
			{label && (
				<label
					style={{
						display: "block",
						marginBottom: "6px",
						fontWeight: "500",
						color: colors.text,
						fontSize: "14px",
					}}
				>
					{label} {required && <span style={{ color: colors.danger }}>*</span>}
				</label>
			)}
			<input
				style={inputStyles}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				type={type}
				required={required}
				disabled={disabled}
				className={className}
				{...props}
			/>
			{error && (
				<p
					style={{
						color: colors.danger,
						fontSize: "14px",
						marginTop: "4px",
						margin: "4px 0 0 0",
					}}
				>
					{error}
				</p>
			)}
		</div>
	);
}
