import { colors } from "../../tokens/colors.js";

export function Tag({ children, onRemove, removable = false }) {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: "6px",
				backgroundColor: colors.background,
				color: colors.text,
				padding: "6px 12px",
				borderRadius: "20px",
				fontSize: "14px",
				fontWeight: "500",
				border: `1px solid ${colors.border}`,
				margin: "2px",
			}}
		>
			{children}
			{removable && (
				<button
					onClick={onRemove}
					style={{
						background: "none",
						border: "none",
						color: colors.danger,
						cursor: "pointer",
						fontSize: "16px",
						padding: "0",
						lineHeight: "1",
					}}
				>
					×
				</button>
			)}
		</span>
	);
}
