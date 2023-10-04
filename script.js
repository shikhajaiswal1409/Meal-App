// Check if the favorites list exists in local storage and initialize it if not
if (!localStorage.getItem("favouritesList")) {
    localStorage.setItem("favouritesList", JSON.stringify([]));
}

// Fetch meals from the API and return them
async function fetchMealsFromApi(url, value) {
    try {
        const response = await fetch(`${url}${value}`);
        const meals = await response.json();
        return meals;
    } catch (error) {
        console.error("Error fetching meals:", error);
        return null;
    }
}

// Generate HTML for a meal card
function generateMealCard(element, isFav) {
    return `
        <div id="card" class="card mb-3" style="width: 20rem;">
            <img src="${element.strMealThumb}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${element.strMeal}</h5>
                <div class="d-flex justify-content-between mt-5">
                    <button type="button" class="btn btn-outline-light" onclick="showMealDetails(${element.idMeal})">More Details</button>
                    <button id="main${element.idMeal}" class="btn btn-outline-light${isFav ? ' active' : ''}" onclick="addRemoveToFavList(${element.idMeal})" style="border-radius: 50%"><i class="fa-solid fa-heart"></i></button>
                </div>
            </div>
        </div>
    `;
}

// Show all meals based on search input value
async function showMealList() {
    const inputValue = document.getElementById("my-search").value;
    const arr = JSON.parse(localStorage.getItem("favouritesList"));
    const url = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    const htmlContainer = document.getElementById("main");

    const meals = await fetchMealsFromApi(url, inputValue);

    if (!meals || !meals.meals) {
        htmlContainer.innerHTML = `
            <div class="page-wrap d-flex flex-row align-items-center">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-md-12 text-center">
                            <span class="display-1 d-block">404</span>
                            <div class="mb-4 lead">
                                The meal was not found.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    const html = meals.meals.map(element => {
        const isFav = arr.includes(element.idMeal);
        return generateMealCard(element, isFav);
    }).join('');

    htmlContainer.innerHTML = html;
}

// Show full meal details in the main section
async function showMealDetails(id) {
    const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
    const htmlContainer = document.getElementById("main");

    const data = await fetchMealsFromApi(url, id);

    if (!data || !data.meals || data.meals.length === 0) {
        htmlContainer.innerHTML = "";
        return;
    }

    const meal = data.meals[0];
    const html = `
        <div id="meal-details" class="mb-5">
            <div id="meal-header" class="d-flex justify-content-around flex-wrap">
                <div id="meal-thumbail">
                    <img class="mb-2" src="${meal.strMealThumb}" alt="">
                </div>
                <div id="details">
                    <h3>${meal.strMeal}</h3>
                    <h6>Category : ${meal.strCategory}</h6>
                    <h6>Area : ${meal.strArea}</h6>
                </div>
            </div>
            <div id="meal-instruction" class="mt-3">
                <h5 class="text-center">Instruction :</h5>
                <p>${meal.strInstructions}</p>
            </div>
            <div class="text-center">
                <a href="${meal.strYoutube}" target="_blank" class="btn btn-outline-light mt-3">Watch Video</a>
            </div>
        </div>
    `;

    htmlContainer.innerHTML = html;
}

// Show all favorite meals in the favorites body
async function showFavMealList() {
    const arr = JSON.parse(localStorage.getItem("favouritesList"));
    const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
    const htmlContainer = document.getElementById("favourites-body");

    if (arr.length === 0) {
        htmlContainer.innerHTML = `
            <div class="page-wrap d-flex flex-row align-items-center">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-md-12 text-center">
                            <span class="display-1 d-block">404</span>
                            <div class="mb-4 lead">
                                No meal in your favorites list.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    const html = await Promise.all(arr.map(async (id) => {
        const data = await fetchMealsFromApi(url, id);
        if (data && data.meals && data.meals.length > 0) {
            return generateMealCard(data.meals[0], true);
        }
        return "";
    }));

    htmlContainer.innerHTML = html.join('');
}

// Add or remove meals from the favorites list
function addRemoveToFavList(id) {
    const arr = JSON.parse(localStorage.getItem("favouritesList"));
    const index = arr.indexOf(id);

    if (index !== -1) {
        arr.splice(index, 1);
        alert("Your meal has been removed from your favorites list.");
    } else {
        arr.push(id);
        alert("Your meal has been added to your favorites list.");
    }

    localStorage.setItem("favouritesList", JSON.stringify(arr));
    showMealList();
    showFavMealList();
}
