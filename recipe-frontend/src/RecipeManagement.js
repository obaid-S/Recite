import React, { useState, useEffect } from "react";
import RecipeCard from "./RecipeCard";
import RecipeEditPopup from "./RecipeEditPopup";

function RecipeManagement() {
	const [allRecipes, setAllRecipes] = useState([]);
	const [loadingAllRecipes, setLoadingAllRecipes] = useState(false);
	const [editingRecipe, setEditingRecipe] = useState(null);
	const [editForm, setEditForm] = useState(null);
	const sortedRecipes = [...allRecipes].sort((a, b) =>
		a.name.localeCompare(b.name)
	);

	const loadAllRecipes = async () => {
		setLoadingAllRecipes(true);
		try {
			const response = await fetch("http://localhost:5000/recipes");
			const data = await response.json();
			setAllRecipes(data);
		} catch (err) {
			console.error("Error loading recipes:", err);
		} finally {
			setLoadingAllRecipes(false);
		}
	};

	useEffect(() => {
		loadAllRecipes();
	}, []);

	const deleteRecipe = async (recipeId, recipeName) => {
		console.log("=== DELETE DEBUG INFO ===");
		console.log("Recipe ID:", recipeId);
		console.log("Recipe ID type:", typeof recipeId);
		console.log("Recipe Name:", recipeName);
		console.log("========================");

		if (!window.confirm(`Are you sure you want to delete "${recipeName}"?`)) {
			console.log("Delete cancelled by user");
			return;
		}

		try {
			const url = `http://localhost:5000/delete-recipe/${recipeId}`;
			console.log("DELETE URL:", url);

			const response = await fetch(url, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			console.log("Response status:", response.status);
			console.log("Response ok:", response.ok);

			if (response.ok) {
				setAllRecipes((prev) => {
					const filtered = prev.filter((recipe) => recipe.id !== recipeId);
					console.log("Recipes before delete:", prev.length);
					console.log("Recipes after delete:", filtered.length);
					return filtered;
				});
				alert("Recipe deleted successfully!");
			} else {
				const errorText = await response.text();
				console.error("DELETE FAILED:");
				console.error("Status:", response.status);
				console.error("Response body:", errorText);

				let errorMessage;
				try {
					const errorJson = JSON.parse(errorText);
					errorMessage =
						errorJson.error || errorJson.message || "Unknown error";
				} catch (e) {
					errorMessage = errorText || "Unknown error";
				}

				alert(`Failed to delete recipe: ${errorMessage}`);
			}
		} catch (err) {
			console.error("Network error:", err);
			alert(`Network error: ${err.message}`);
		}
	};

	const startEditingRecipe = (recipe) => {
		console.log("Starting edit for recipe:", recipe);
		console.log("Recipe ID:", recipe.id, "Type:", typeof recipe.id);

		let details;
		try {
			details =
				typeof recipe.details === "string"
					? JSON.parse(recipe.details)
					: recipe.details;
		} catch (err) {
			console.error("Error parsing recipe details:", err);
			details = { ingredients: [], instructions: [], nutrition: {} };
		}

		const editFormData = {
			id: recipe.id,
			name: recipe.name,
			ingredients: recipe.ingredients,
			details: details,
		};

		console.log("Setting editForm to:", editFormData);
		setEditForm(editFormData);
		setEditingRecipe(recipe.id);
	};

	const cancelEditing = () => {
		setEditingRecipe(null);
		setEditForm(null);
	};

	const saveEditedRecipe = async () => {
		console.log("Saving recipe with editForm:", editForm);

		if (!editForm || !editForm.id) {
			console.error("No editForm or editForm.id found:", editForm);
			alert("Error: No recipe ID found for editing");
			return;
		}

		try {
			const response = await fetch("http://localhost:5000/save-recipe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: editForm.id,
					name: editForm.name,
					ingredients: editForm.ingredients,
					details: editForm.details,
				}),
			});

			const data = await response.json();
			console.log("Server response:", data);

			if (data.success) {
				setAllRecipes((prev) =>
					prev.map((recipe) =>
						recipe.id === editForm.id
							? {
									...recipe,
									...editForm,
									details: JSON.stringify(editForm.details),
							  }
							: recipe
					)
				);
				setEditingRecipe(null);
				setEditForm(null);
				alert("Recipe updated successfully!");
			} else {
				console.error("Save failed:", data);
				alert(
					`Failed to update recipe: ${
						data.error || data.message || "Unknown error"
					}`
				);
			}
		} catch (err) {
			console.error("Error updating recipe:", err);
			alert("Error updating recipe");
		}
	};

	return (
		<div
			style={{
				border: "2px solid #ddd",
				padding: "20px",
				marginBottom: "20px",
				borderRadius: "8px",
			}}
		>
			<h2>📋 Recipe Management</h2>

			{loadingAllRecipes ? (
				<p>Loading recipes...</p>
			) : (
				<div>
					<p>Total recipes: {allRecipes.length}</p>

					{sortedRecipes.map((recipe) => (
						<div key={recipe.id}>
							<RecipeCard
								recipe={recipe}
								onEdit={() => {
									console.log("Edit clicked for:", recipe.name);
									startEditingRecipe(recipe);
								}}
								onDelete={() => deleteRecipe(recipe.id, recipe.name)}
							/>
						</div>
					))}
				</div>
			)}

			{editingRecipe !== null && editForm && (
				<RecipeEditPopup
					editForm={editForm}
					setEditForm={setEditForm}
					onSave={saveEditedRecipe}
					onCancel={cancelEditing}
					isOpen={true}
				/>
			)}
		</div>
	);
}

export default RecipeManagement;
