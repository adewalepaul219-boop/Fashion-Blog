/* =========================================================
   LUCA ATELIER
   VANILLA JAVASCRIPT
========================================================= */


/* =========================================================
   1. CONFIGURATION
========================================================= */

const WHATSAPP_NUMBER = "2349115812449";
const CART_STORAGE_KEY = "lucaAtelierCart";


/* =========================================================
   2. HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => [
    ...document.querySelectorAll(selector)
];


function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatCurrency(amount) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(amount);
}


/* =========================================================
   3. CART STATE
========================================================= */

let cart = [];

try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    cart = savedCart
        ? JSON.parse(savedCart)
        : [];

    if (!Array.isArray(cart)) {
        cart = [];
    }
} catch (error) {
    cart = [];
}


function saveCart() {
    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );
}


function getCartTotal() {
    return cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );
}


function getCartCount() {
    return cart.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );
}


/* =========================================================
   4. MOBILE NAVIGATION
========================================================= */

const menuToggle = $("#menuToggle");
const navMenu = $("#navMenu");


function closeMobileMenu() {
    if (!navMenu || !menuToggle) {
        return;
    }

    navMenu.classList.remove("open");

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );
}


menuToggle?.addEventListener("click", () => {

    const isOpen =
        navMenu.classList.toggle("open");

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

});


$$(".nav-menu a").forEach((link) => {

    link.addEventListener(
        "click",
        closeMobileMenu
    );

});


/* =========================================================
   5. SEARCH
========================================================= */

const searchOpen = $("#searchOpen");
const searchClose = $("#searchClose");
const searchOverlay = $("#searchOverlay");
const searchInput = $("#searchInput");
const searchResults = $("#searchResults");


function openSearch() {

    searchOverlay?.classList.add("open");

    searchOverlay?.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add("no-scroll");

    setTimeout(() => {
        searchInput?.focus();
    }, 250);
}


function closeSearch() {

    searchOverlay?.classList.remove("open");

    searchOverlay?.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove("no-scroll");

    if (searchInput) {
        searchInput.value = "";
    }

    if (searchResults) {
        searchResults.innerHTML = "";
    }

    showAllProducts();
}


searchOpen?.addEventListener(
    "click",
    openSearch
);


searchClose?.addEventListener(
    "click",
    closeSearch
);


searchOverlay?.addEventListener(
    "click",
    (event) => {

        if (event.target === searchOverlay) {
            closeSearch();
        }

    }
);


searchInput?.addEventListener(
    "input",
    () => {

        const term =
            searchInput.value
                .toLowerCase()
                .trim();

        const products =
            $$(".product-card");

        const articles =
            $$(".journal-card");

        let productMatches = 0;
        let articleMatches = 0;


        products.forEach((product) => {

            const searchableText = (
                product.dataset.search ||
                product.dataset.name ||
                ""
            ).toLowerCase();

            const matches =
                !term ||
                searchableText.includes(term);

            product.classList.toggle(
                "hidden",
                !matches
            );

            if (matches && term) {
                productMatches++;
            }

        });


        articles.forEach((article) => {

            const text =
                article.textContent.toLowerCase();

            const matches =
                !term ||
                text.includes(term);

            article.style.display =
                matches
                    ? ""
                    : "none";

            if (matches && term) {
                articleMatches++;
            }

        });


        if (!searchResults) {
            return;
        }


        if (!term) {

            searchResults.innerHTML = "";

            return;
        }


        searchResults.innerHTML = `
            ${productMatches} product
            ${productMatches === 1 ? "" : "s"}
            found ·
            ${articleMatches} journal
            ${articleMatches === 1 ? "" : "s"}
            found
        `;

    }
);


function showAllProducts() {

    $$(".product-card").forEach(
        (product) => {
            product.classList.remove("hidden");
        }
    );

    $$(".journal-card").forEach(
        (article) => {
            article.style.display = "";
        }
    );

}


/* =========================================================
   6. CATEGORY FILTERS
========================================================= */

const filters = $$(".filter");


filters.forEach((filter) => {

    filter.addEventListener(
        "click",
        () => {

            filters.forEach((button) => {
                button.classList.remove("active");
            });

            filter.classList.add("active");

            const category =
                filter.dataset.filter;

            $$(".product-card").forEach(
                (product) => {

                    const shouldShow =
                        category === "all" ||
                        product.dataset.category === category;

                    product.classList.toggle(
                        "hidden",
                        !shouldShow
                    );

                }
            );

        }
    );

});


/* =========================================================
   7. ADD PRODUCTS TO CART
========================================================= */

$$(".add-cart").forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const name =
                button.dataset.name;

            const price =
                Number(button.dataset.price);

            const image =
                button.dataset.image;

            const id =
                name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");


            const existing =
                cart.find(
                    (item) => item.id === id
                );


            if (existing) {

                existing.quantity += 1;

            } else {

                cart.push({
                    id,
                    name,
                    price,
                    image,
                    quantity: 1
                });

            }


            saveCart();

            renderCart();

            openCart();

        }
    );

});


/* =========================================================
   8. CART RENDERING
========================================================= */

const cartItems = $("#cartItems");
const cartCount = $("#cartCount");
const cartTotal = $("#cartTotal");


function renderCart() {

    if (cartCount) {
        cartCount.textContent =
            getCartCount();
    }

    if (cartTotal) {
        cartTotal.textContent =
            formatCurrency(
                getCartTotal()
            );
    }


    if (!cartItems) {
        return;
    }


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">

                <div class="empty-symbol">
                    L
                </div>

                <p>
                    Your LUCA bag is currently empty.
                </p>

                <button
                    type="button"
                    id="continueShopping"
                >
                    CONTINUE SHOPPING
                </button>

            </div>
        `;


        $("#continueShopping")
            ?.addEventListener(
                "click",
                closeCart
            );

        return;
    }


    cartItems.innerHTML =
        cart.map((item) => {

            return `
                <div
                    class="cart-item"
                    data-id="${escapeHTML(item.id)}"
                >

                    <img
                        src="${escapeHTML(item.image)}"
                        alt="${escapeHTML(item.name)}"
                    >

                    <div>

                        <h4>
                            ${escapeHTML(item.name)}
                        </h4>

                        <p class="item-price">
                            ${formatCurrency(item.price)}
                        </p>

                        <div class="quantity">

                            <button
                                class="quantity-minus"
                                type="button"
                                data-id="${escapeHTML(item.id)}"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                class="quantity-plus"
                                type="button"
                                data-id="${escapeHTML(item.id)}"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <button
                        class="remove-item"
                        type="button"
                        data-id="${escapeHTML(item.id)}"
                        aria-label="Remove ${escapeHTML(item.name)}"
                    >
                        ×
                    </button>

                </div>
            `;

        }).join("");


    attachCartEvents();
}


/* =========================================================
   9. CART CONTROLS
========================================================= */

function attachCartEvents() {

    $$(".quantity-minus")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    changeQuantity(
                        button.dataset.id,
                        -1
                    );

                }
            );

        });


    $$(".quantity-plus")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    changeQuantity(
                        button.dataset.id,
                        1
                    );

                }
            );

        });


    $$(".remove-item")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    removeFromCart(
                        button.dataset.id
                    );

                }
            );

        });

}


function changeQuantity(id, amount) {

    const item =
        cart.find(
            (product) => product.id === id
        );

    if (!item) {
        return;
    }


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                (product) =>
                    product.id !== id
            );

    }


    saveCart();

    renderCart();
}


function removeFromCart(id) {

    cart =
        cart.filter(
            (item) =>
                item.id !== id
        );

    saveCart();

    renderCart();
}


/* =========================================================
   10. CART DRAWER
========================================================= */

const cartOpen = $("#cartOpen");
const cartClose = $("#cartClose");
const cartDrawer = $("#cartDrawer");
const cartBackdrop = $("#cartBackdrop");


function openCart() {

    cartDrawer?.classList.add("open");

    cartBackdrop?.classList.add("open");

    cartDrawer?.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "no-scroll"
    );
}


function closeCart() {

    cartDrawer?.classList.remove("open");

    cartBackdrop?.classList.remove("open");

    cartDrawer?.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "no-scroll"
    );
}


cartOpen?.addEventListener(
    "click",
    openCart
);


cartClose?.addEventListener(
    "click",
    closeCart
);


cartBackdrop?.addEventListener(
    "click",
    closeCart
);


/* =========================================================
   11. CLEAR CART
========================================================= */

const clearCartButton =
    $("#clearCart");


clearCartButton?.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {
            return;
        }


        const confirmed =
            window.confirm(
                "Remove all products from your LUCA bag?"
            );


        if (!confirmed) {
            return;
        }


        cart = [];

        saveCart();

        renderCart();

    }
);


/* =========================================================
   12. WHATSAPP
========================================================= */

function createWhatsAppURL(message) {

    return (
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message)
    );

}


function openWhatsApp(message) {

    window.location.href =
        createWhatsAppURL(message);

}


const contactWhatsApp =
    $("#contactWhatsApp");


contactWhatsApp?.addEventListener(
    "click",
    () => {

        const message =
            "Hello LUCA ATELIER! I would like to make an enquiry about your collection.";

        openWhatsApp(message);

    }
);


/* =========================================================
   13. WHATSAPP CHECKOUT
========================================================= */

const whatsappOrder =
    $("#whatsappOrder");


whatsappOrder?.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            window.alert(
                "Your LUCA bag is empty."
            );

            return;
        }


        let message =
            "Hello LUCA ATELIER! I would like to place an order.\n\n";


        message +=
            "ORDER DETAILS\n";
        message +=
            "-------------------------\n\n";


        cart.forEach((item, index) => {

            const subtotal =
                item.price *
                item.quantity;


            message +=
                `${index + 1}. ${item.name}\n`;

            message +=
                `Quantity: ${item.quantity}\n`;

            message +=
                `Price: ${formatCurrency(item.price)}\n`;

            message +=
                `Subtotal: ${formatCurrency(subtotal)}\n\n`;

        });


        message +=
            "-------------------------\n";

        message +=
            `TOTAL: ${formatCurrency(getCartTotal())}\n\n`;

        message +=
            "Please confirm availability, size and delivery details. Thank you.";


        openWhatsApp(message);

    }
);


/* =========================================================
   14. NEWSLETTER
========================================================= */

const newsletterForm =
    $("#newsletterForm");

const emailInput =
    $("#email");

const newsletterMessage =
    $("#newsletterMessage");


newsletterForm?.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const email =
            emailInput.value.trim();


        if (!email) {

            newsletterMessage.textContent =
                "Please enter your email address.";

            return;
        }


        newsletterMessage.textContent =
            "Welcome to the LUCA Letter.";


        newsletterForm.reset();

    }
);


/* =========================================================
   15. KEYBOARD CONTROLS
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeSearch();

            closeCart();

            closeMobileMenu();

        }

    }
);


/* =========================================================
   16. SCROLL REVEAL
========================================================= */

const revealElements =
    $$(".reveal");


if ("IntersectionObserver" in window) {

    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(
                        "visible"
                    );

                    observerInstance.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(
        (element) => {
            observer.observe(element);
        }
    );

} else {

    revealElements.forEach(
        (element) => {
            element.classList.add("visible");
        }
    );

}


/* =========================================================
   17. INITIALIZE
========================================================= */

renderCart();