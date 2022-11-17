export const processCategories = (categories) => {
    return categories.map((category) => {
        const newCategoryName = category.trim().toLowerCase();
        const newCategorySlug = newCategoryName.replace(/ +/g, "-");
        return {
            where: { 
                slug: newCategorySlug,
            },
            create: { 
                slug: newCategorySlug,
                name: newCategoryName,
            },
        }
    });
};