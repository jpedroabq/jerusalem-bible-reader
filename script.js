document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const oldTestamentList = document.getElementById('old-testament-list');
    const newTestamentList = document.getElementById('new-testament-list');
    const bibleText = document.getElementById('bible-text');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const searchInput = document.getElementById('search-book');
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');
    const content = document.getElementById('content');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('.material-symbols-outlined') : null;

    let books = {};
    const root = document.documentElement;
    const computedBaseSize = parseFloat(getComputedStyle(root).getPropertyValue('--base-font-size'))
        || parseFloat(getComputedStyle(document.body).fontSize)
        || 20;
    let currentFontSize = computedBaseSize;
    const MIN_FONT_SIZE = 14;
    const MAX_FONT_SIZE = 28;
    const THEME_STORAGE_KEY = 'bjr-preferred-theme';

    initTheme();

    // Books that belong to New Testament (starting from Matthew)
    const newTestamentBooks = [
        'Evangelho Segundo São Mateus',
        'Evangelho Segundo São Marcos',
        'Evangelho Segundo São Lucas',
        'Evangelho Segundo São João',
        'Atos Dos Apóstolos',
        'Epístola Aos Romanos',
        'Primeira Epístola Aos Coríntios',
        'Segunda Epístola Aos Coríntios',
        'Epístola Aos Gálatas',
        'Epístola Aos Efésios',
        'Epístola Aos Filipenses',
        'Epístola Aos Colossenses',
        'Primeira Epístola Aos Tessalonicenses',
        'Segunda Epístola Aos Tessalonicenses',
        'Primeira Epístola A Timóteo',
        'Segunda Epístola A Timóteo',
        'Epístola A Tito',
        'Epístola A Filemon',
        'Epístola Aos Hebreus',
        'Epístola De São Tiago',
        'Primeira Epístola De São Pedro',
        'Segunda Epístola De São Pedro',
        'Primeira Epistola De Sao João',
        'Segunda Epístola De São João',
        'Terceira Epístola De São João',
        'Epístola De São Judas',
        'Apocalipse'
    ];

    // Font size controls
    increaseFontBtn.addEventListener('click', () => {
        if (currentFontSize < MAX_FONT_SIZE) {
            updateFontSize(currentFontSize + 2);
        }
    });

    decreaseFontBtn.addEventListener('click', () => {
        if (currentFontSize > MIN_FONT_SIZE) {
            updateFontSize(currentFontSize - 2);
        }
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });

    overlay.addEventListener('click', closeSidebar);

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && e.target !== mobileMenuBtn) {
            closeSidebar();
        }
    });

    // Swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    
    sidebar.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    sidebar.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        
        if (Math.abs(touchEndY - touchStartY) < 50) {
            handleSwipe();
        }
    }, { passive: true });

    document.body.addEventListener('touchstart', function(e) {
        if (window.innerWidth <= 768 && !sidebar.classList.contains('open')) {
            touchStartX = e.changedTouches[0].screenX;
        }
    }, { passive: true });

    document.body.addEventListener('touchend', function(e) {
        if (window.innerWidth <= 768 && !sidebar.classList.contains('open')) {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX < 50 && touchEndX - touchStartX > 100) {
                openSidebar();
            }
        }
    }, { passive: true });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            closeSidebar();
        }
    }

    function toggleSidebar() {
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    }

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateFontSize(newSize) {
        currentFontSize = Math.min(Math.max(newSize, MIN_FONT_SIZE), MAX_FONT_SIZE);
        root.style.setProperty('--base-font-size', currentFontSize + 'px');
    }

    function initTheme() {
        if (!themeToggleBtn) {
            return;
        }

        const storedTheme = getStoredTheme();
        if (storedTheme) {
            applyTheme(storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }

        themeToggleBtn.addEventListener('click', () => {
            const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
        });
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.dataset.theme = 'dark';
            themeToggleBtn.setAttribute('aria-pressed', 'true');
            themeToggleBtn.setAttribute('title', 'Alternar para modo claro');
            themeToggleBtn.setAttribute('aria-label', 'Alternar para modo claro');
            if (themeIcon) {
                themeIcon.textContent = 'light_mode';
            }
        } else {
            delete document.body.dataset.theme;
            themeToggleBtn.setAttribute('aria-pressed', 'false');
            themeToggleBtn.setAttribute('title', 'Alternar modo noturno');
            themeToggleBtn.setAttribute('aria-label', 'Alternar modo noturno');
            if (themeIcon) {
                themeIcon.textContent = 'dark_mode';
            }
            theme = 'light';
        }

        storeTheme(theme);
    }

    function storeTheme(theme) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            /* ignore storage errors */
        }
    }

    function getStoredTheme() {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY);
        } catch (error) {
            return null;
        }
    }

    // Search functionality
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const allBooks = [...oldTestamentList.children, ...newTestamentList.children];
        
        allBooks.forEach(li => {
            const bookName = li.textContent.toLowerCase();
            if (bookName.includes(searchTerm)) {
                li.style.display = 'flex';
            } else {
                li.style.display = 'none';
            }
        });
    });

    // Load books from range.md
    fetch('range.md')
        .then(response => response.text())
        .then(text => {
            const lines = text.split('\n');
            for (let i = 2; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('|') && line.endsWith('|')) {
                    const parts = line.split('|').map(p => p.trim());
                    if (parts.length >= 3 && parts[1] && parts[2] && 
                        parts[1] !== '---' && parts[2].includes('-')) {
                        const book = parts[1];
                        const range = parts[2];
                        books[book] = range;
                    }
                }
            }
            populateBookLists();
        })
        .catch(error => {
            bibleText.innerHTML = `
                <div class="welcome-message">
                    <h1>Erro</h1>
                    <p class="intro-text">Não foi possível carregar a lista de livros: ${error.message}</p>
                </div>`;
        });

    function populateBookLists() {
        oldTestamentList.innerHTML = '';
        newTestamentList.innerHTML = '';
        
        for (const book in books) {
            if (book === '---' || book === ':---' || book === 'Introdução') continue;
            
            const li = document.createElement('li');
            li.textContent = book;
            li.setAttribute('data-range', books[book]);
            li.setAttribute('data-book', book);
            
            // Determine which testament
            if (newTestamentBooks.includes(book)) {
                newTestamentList.appendChild(li);
            } else {
                oldTestamentList.appendChild(li);
            }
        }
        
        // Add click listeners
        document.querySelectorAll('.book-list li').forEach(li => {
            li.addEventListener('click', function() {
                const range = this.getAttribute('data-range');
                const bookName = this.getAttribute('data-book');
                
                // Update active state
                document.querySelectorAll('.book-list li').forEach(item => 
                    item.classList.remove('active'));
                this.classList.add('active');
                
                loadBook(range, bookName);
                
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
                content.scrollTop = 0;
            });
        });
    }

    function loadBook(range, bookName) {
        const [start, end] = range.split('-').map(Number);
        
        fetch('biblia.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Arquivo biblia.md não encontrado');
                }
                return response.text();
            })
            .then(text => {
                const lines = text.split('\n');
                const content = lines.slice(start - 1, end).join('\n');
                const formattedHtml = formatBibleText(content, bookName);
                bibleText.innerHTML = formattedHtml;
            })
            .catch(error => {
                bibleText.innerHTML = `
                    <div class="welcome-message">
                        <h1>Erro</h1>
                        <p class="intro-text">Não foi possível carregar o livro: ${error.message}</p>
                    </div>`;
            });
    }

    function formatBibleText(text, bookName) {
        let html = `<h1 class="book-title">${bookName}</h1>`;
        
        const lines = text.split('\n');
        let isInVerseList = false;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line || line.startsWith('<!--')) continue;
            
            // Chapter/Section headers (## Title)
            if (line.startsWith('## ')) {
                if (isInVerseList) {
                    html += '</ol>';
                    isInVerseList = false;
                }
                const title = line.replace(/^##\s*/, '');
                html += `<h2 class="chapter-title">${title}</h2>`;
                continue;
            }
            
            // Check if line contains verse numbers
            // Pattern: starts with "optional text" then "number space text" pattern
            const hasVerses = /\d+\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(line);
            
            if (hasVerses) {
                if (!isInVerseList) {
                    html += '<ol class="verse-list">';
                    isInVerseList = true;
                }
                
                // Extract verses from the line
                // First, check if there's a subtitle before the verses (ends with " - ")
                const subtitleMatch = line.match(/^(.+?)\s+-\s+(\d+\s+.+)$/);
                if (subtitleMatch) {
                    // Close verse list, add subtitle, reopen verse list
                    html += '</ol>';
                    html += `<h3 class="section-title">${subtitleMatch[1]}</h3>`;
                    html += '<ol class="verse-list">';
                    line = subtitleMatch[2]; // Continue with verse part
                }
                
                // Now split the line into individual verses
                // Strategy: Split by pattern "space+digit+space" but keep the digit with next part
                let verses = [];
                let remainingText = line;
                
                // Find all verse numbers and their positions
                const versePattern = /(\d+)\s+/g;
                let matches = [];
                let match;
                
                while ((match = versePattern.exec(remainingText)) !== null) {
                    matches.push({
                        number: match[1],
                        index: match.index,
                        fullMatchLength: match[0].length
                    });
                }
                
                // Extract verse texts
                for (let j = 0; j < matches.length; j++) {
                    const currentMatch = matches[j];
                    const nextMatch = matches[j + 1];
                    
                    // Get text from after current verse number to before next verse number (or end)
                    const startPos = currentMatch.index + currentMatch.fullMatchLength;
                    const endPos = nextMatch ? nextMatch.index : remainingText.length;
                    
                    let verseText = remainingText.substring(startPos, endPos).trim();
                    
                    if (verseText) {
                        verses.push(verseText);
                    }
                }
                
                // Output all verses
                verses.forEach(verseText => {
                    html += `<li class="verse-item">${verseText}</li>`;
                });
                
            } else {
                // Not a verse line
                if (isInVerseList) {
                    html += '</ol>';
                    isInVerseList = false;
                }
                
                // Check if it's a subtitle (ends with " - ")
                if (line.match(/^.+\s+-\s*$/)) {
                    html += `<h3 class="section-title">${line.replace(/\s+-\s*$/, '')}</h3>`;
                } else if (line.length > 0) {
                    // Regular paragraph
                    html += `<p>${line}</p>`;
                }
            }
        }
        
        // Close any open verse list
        if (isInVerseList) {
            html += '</ol>';
        }
        
        return html;
    }

    // Prevent body scroll when sidebar is open
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
});