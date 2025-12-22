const API_URL = 'https://fakestoreapi.com/products';
const USER_REGEX = /^(?=.*_)(?=.*\d).{3,}$/;
const PASS_REGEX = /^(?=.*[A-Z])(?=.*_)(?=(.*\d){2}).+$/;


const path = window.location.pathname;
const page = path.split("/").pop(); 

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        updateThemeIcon(themeBtn);
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcon(themeBtn);
        });
    }

    const session = getCookie('sessionUser');
    
    if ((page === 'login.html' || page === 'signup.html') && session) {
        window.location.href = 'index.html';
        return;
    }

    if ((page === 'index.html' || page === 'details.html' || page === '') && !session) {
        window.location.href = 'login.html';
        return;
    }


    if (page === 'signup.html') initSignup();
    if (page === 'login.html') initLogin();
    if (page === 'index.html' || page === '') initHome();
    if (page === 'details.html') initDetails();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            setCookie('sessionUser', "", -1);
            window.location.href = 'login.html';
        });
    }
});

function updateThemeIcon(btn) {
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}


function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}


function initSignup() {
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const userIn = document.getElementById('sign-user');
        const passIn = document.getElementById('sign-pass');
        
        let valid = true;

        if (!USER_REGEX.test(userIn.value)) {
            showError(userIn, "Must include _, number, min 3 chars");
            valid = false;
        } else clearError(userIn);

        if (!PASS_REGEX.test(passIn.value)) {
            showError(passIn, "Need 1 Upper, 1 '_', 2 Numbers");
            valid = false;
        } else clearError(passIn);

        if (!valid) return;


        const newUser = {
            fname: document.getElementById('sign-fname').value,
            lname: document.getElementById('sign-lname').value,
            username: userIn.value,
            password: passIn.value
        };

        let usersDB = getCookie('usersDB');
        let users = usersDB ? JSON.parse(usersDB) : [];
        
        if (users.find(u => u.username === newUser.username)) {
            showError(userIn, "Username already exists");
            return;
        }

        users.push(newUser);
        setCookie('usersDB', JSON.stringify(users), 7);
        alert("Signup Successful! Please Login.");
        window.location.href = 'login.html';
    });
}

function initLogin() {
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const userVal = document.getElementById('login-user').value;
        const passVal = document.getElementById('login-pass').value;
        const userField = document.getElementById('login-user');

        let usersDB = getCookie('usersDB');
        let users = usersDB ? JSON.parse(usersDB) : [];

        const foundUser = users.find(u => u.username === userVal && u.password === passVal);

        if (foundUser) {
            setCookie('sessionUser', userVal, 1);
            window.location.href = 'index.html';
        } else {
            const userExists = users.find(u => u.username === userVal);
            
            if (!userExists) {
                showError(userField, "You don't have an account");
                
                setTimeout(() => {
                    window.location.href = 'signup.html';
                }, 1500);
                
            } else {
                showError(userField, "Wrong password");
            }
        }
    });
}

let allProducts = [];
async function initHome() {
    startCarousel();
    
    try {
        const res = await fetch(API_URL);
        allProducts = await res.json();
        renderProducts(allProducts);
        
        const select = document.getElementById('filter-select');
        const categories = [...new Set(allProducts.map(p => p.category))];
        categories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.innerText = c;
            select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
            const cat = e.target.value;
            renderProducts(cat === 'all' ? allProducts : allProducts.filter(p => p.category === cat));
        });

        document.getElementById('search-bar').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            renderProducts(allProducts.filter(p => p.title.toLowerCase().includes(term)));
        });

    } catch (err) { console.error(err); }
}

function renderProducts(list) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    list.forEach(p => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${p.image}" alt="pic">
            <h3>${p.title}</h3>
            <div class="price">${p.price}$</div>
            <div class="rating">Rate: ${'★'.repeat(Math.round(p.rating.rate))}</div>
            <button class="btn-primary" onclick="goToDetails(${p.id})">Buy now</button>
        `;
        grid.appendChild(card);
    });
}

window.goToDetails = function(id) {
    window.location.href = `details.html?id=${id}`;
}


function startCarousel() {
    const container = document.getElementById('carousel-slide');
    const images = [
        "https://res.cloudinary.com/dzgqguqpe/image/upload/v1766444505/iphone_17_qlrbbm.png",
        "https://res.cloudinary.com/dzgqguqpe/image/upload/v1766444495/highlights_design_endframe__flnga0hibmeu_large_a0sayr.jpg",  
        "https://res.cloudinary.com/dzgqguqpe/image/upload/v1766444498/Samsung-Mobile-Galaxy-Z-TriFold-Next-in-Mobile-Evolution_main1_zl2p5w.jpg",
        "https://res.cloudinary.com/dzgqguqpe/image/upload/v1766444496/geforce-rtx-5090-learn-more-og-1200x630_eqibna.jpg",
        "https://res.cloudinary.com/dzgqguqpe/image/upload/v1766444501/geforce-rtx-50-series-laptops-learn-og-1200x630_2x_mfbbnw.jpg",
        "https://res.cloudinary.com/dzgqguqpe/image/upload/v1766444504/AD108M_hqny36.jpg"
    ];
    container.innerHTML = images.map((src, i) => `<img src="${src}" class="${i===0?'active':''}">`).join('');
    let idx = 0;
    setInterval(() => {
        const imgs = container.querySelectorAll('img');
        imgs[idx].classList.remove('active');
        idx = (idx + 1) % imgs.length;
        imgs[idx].classList.add('active');
    }, 5000);
}

async function initDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if(!id) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${id}`);
        const product = await res.json();

        document.getElementById('detail-img').src = product.image;
        document.getElementById('detail-title').innerText = product.title;
        document.getElementById('detail-price').innerText = "Price: " + product.price + "$";
        document.getElementById('detail-rate').innerText = "Rate: " + '★'.repeat(Math.round(product.rating.rate));
        document.getElementById('detail-desc').innerText = product.description;
    } catch(err) {
        console.error("Error fetching detail", err);
    }
}

function showError(input, msg) {
    input.parentElement.querySelector('.error-msg').innerText = msg;
}
function clearError(input) {
    input.parentElement.querySelector('.error-msg').innerText = "";
}