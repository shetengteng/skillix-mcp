        // Language switcher
        function setLanguage(lang) {
            document.body.setAttribute('data-lang', lang);
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === lang);
            });
            document.title = lang === 'zh' 
                ? 'Skillix - 混合技能，智能赋能' 
                : 'Skillix - Mix Skills, Empower AI';
            localStorage.setItem('skillix-lang', lang);
        }

        function initLanguage() {
            const savedLang = localStorage.getItem('skillix-lang');
            if (savedLang) {
                setLanguage(savedLang);
            } else {
                const browserLang = navigator.language.toLowerCase();
                setLanguage(browserLang.startsWith('zh') ? 'zh' : 'en');
            }
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setLanguage(btn.getAttribute('data-lang-btn'));
            });
        });

        initLanguage();

        // Theme toggle
        function setTheme(theme) {
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('skillix-theme', theme);
        }

        function initTheme() {
            const savedTheme = localStorage.getItem('skillix-theme');
            if (savedTheme) {
                setTheme(savedTheme);
            } else {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setTheme(prefersDark ? 'dark' : 'light');
            }
        }

        document.getElementById('themeToggle').addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('skillix-theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });

        initTheme();

        // Copy to clipboard
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = event.target.closest('.cta-copy');
                const lang = document.body.getAttribute('data-lang');
                const originalHTML = btn.innerHTML;
                btn.innerHTML = lang === 'zh' ? '已复制!' : 'Copied!';
                setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
            });
        }

        // Scroll animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        // Create particles
        function createParticles() {
            const container = document.getElementById('particles');
            const particleCount = 20;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 8 + 's';
                particle.style.animationDuration = (6 + Math.random() * 4) + 's';
                container.appendChild(particle);
            }
        }
        createParticles();

        // Mouse tracking for tool cards
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        });

        // Parallax effect for gradient orbs
        document.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            
            document.querySelectorAll('.bg-gradient').forEach((orb, i) => {
                const factor = i === 0 ? 1 : -1;
                orb.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px)`;
            });
        });

        // Page loader
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('pageLoader').classList.add('loaded');
            }, 500);
        });

        // Scroll progress indicator
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            document.getElementById('scrollProgress').style.width = scrollPercent + '%';
        });

        // Hide scroll indicator after scrolling
        let scrollIndicator = document.querySelector('.scroll-indicator');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        }, { passive: true });

        // Example tab switching
        function switchExampleTab(tabId) {
            document.querySelectorAll('.example-tab').forEach(tab => {
                tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
            });
            document.querySelectorAll('.example-panel').forEach(panel => {
                panel.classList.toggle('active', panel.getAttribute('data-panel') === tabId);
            });
        }

        function showExampleTab(tabId) {
            switchExampleTab(tabId);
            setTimeout(() => {
                const section = document.getElementById('examples');
                if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        // Navigate to example from feature card
        function navigateToExample(exampleId) {
            // Switch to the corresponding tab
            switchExampleTab(exampleId);
            
            // Scroll to the examples section
            setTimeout(() => {
                const section = document.getElementById('examples');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }

        // Add keyboard support for feature cards
        document.querySelectorAll('.feature-card.clickable').forEach(card => {
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const exampleId = card.getAttribute('data-example');
                    if (exampleId) {
                        navigateToExample(exampleId);
                    }
                }
            });
        });
