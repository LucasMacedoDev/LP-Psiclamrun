/**
 * PSICLAMRON - Landing Page Premium
 * JavaScript ES6+ Modular
 * 
 * Funcionalidades:
 * - Scroll suave
 * - Menu responsivo (hambúrguer)
 * - Accordion FAQ
 * - Animações com Intersection Observer
 * - Botão "Voltar ao topo"
 * - Navbar fixa após scroll
 * - Destaque do menu ativo
 * - Microinterações
 */

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Seleciona um elemento do DOM
 * @param {string} selector - Seletor CSS
 * @param {HTMLElement} context - Contexto de busca (default: document)
 * @returns {HTMLElement|null}
 */
const $ = (selector, context = document) => context.querySelector(selector);

/**
 * Seleciona múltiplos elementos do DOM
 * @param {string} selector - Seletor CSS
 * @param {HTMLElement} context - Contexto de busca (default: document)
 * @returns {NodeList}
 */
const $$ = (selector, context = document) => context.querySelectorAll(selector);

/**
 * Adiciona evento com debounce para performance
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function}
 */
const debounce = (func, wait = 100) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Verifica se o usuário prefere movimento reduzido
 * @returns {boolean}
 */
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// MÓDULO: NAVEGAÇÃO
// ============================================

const Navigation = {
    header: null,
    navToggle: null,
    navMenu: null,
    navLinks: null,
    sections: null,

    /**
     * Inicializa o módulo de navegação
     */
    init() {
        this.header = $('.header');
        this.navToggle = $('.nav__toggle');
        this.navMenu = $('.nav__menu');
        this.navLinks = $$('.nav__link[data-section]');
        this.sections = $$('section[id]');

        if (!this.header) return;

        this.bindEvents();
        this.handleScroll();
    },

    /**
     * Vincula os eventos de navegação
     */
    bindEvents() {
        // Toggle do menu mobile
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Fecha menu ao clicar em um link
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Se for link externo, não previne
                if (href.startsWith('http')) return;

                e.preventDefault();
                const target = $(href);

                if (target) {
                    this.closeMenu();
                    this.smoothScroll(target);
                }
            });
        });

        // Fecha menu ao pressionar Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen()) {
                this.closeMenu();
                this.navToggle.focus();
            }
        });

        // Scroll para atualizar navbar e menu ativo
        window.addEventListener('scroll', debounce(() => this.handleScroll(), 50));
    },

    /**
     * Abre/fecha o menu mobile
     */
    toggleMenu() {
        const isOpen = this.isMenuOpen();

        if (isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    },

    /**
     * Abre o menu mobile
     */
    openMenu() {
        this.navMenu.classList.add('nav__menu--open');
        this.navToggle.setAttribute('aria-expanded', 'true');
        this.navToggle.setAttribute('aria-label', 'Fechar menu de navegação');
        document.body.style.overflow = 'hidden';

        // Foca no primeiro link para acessibilidade
        const firstLink = this.navMenu.querySelector('.nav__link');
        if (firstLink) firstLink.focus();

        // Trap focus dentro do menu
        this.trapFocus(this.navMenu);
    },

    /**
     * Fecha o menu mobile
     */
    closeMenu() {
        this.navMenu.classList.remove('nav__menu--open');
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.navToggle.setAttribute('aria-label', 'Abrir menu de navegação');
        document.body.style.overflow = '';
    },

    /**
     * Verifica se o menu está aberto
     * @returns {boolean}
     */
    isMenuOpen() {
        return this.navMenu.classList.contains('nav__menu--open');
    },

    /**
     * Realiza scroll suave até o elemento
     * @param {HTMLElement} target - Elemento alvo
     */
    smoothScroll(target) {
        const headerHeight = this.header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

        if (prefersReducedMotion()) {
            window.scrollTo(0, targetPosition);
        } else {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },

    /**
     * Gerencia o estado da navbar no scroll
     */
    handleScroll() {
        const scrollY = window.pageYOffset;

        // Adiciona/remove classe de scroll na navbar
        if (scrollY > 50) {
            this.header.classList.add('header--scrolled');
        } else {
            this.header.classList.remove('header--scrolled');
        }

        // Atualiza link ativo do menu
        this.updateActiveLink();
    },

    /**
     * Atualiza o link ativo baseado na seção visível
     */
    updateActiveLink() {
        const scrollPosition = window.pageYOffset + this.header.offsetHeight + 100;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('nav__link--active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('nav__link--active');
                    }
                });
            }
        });
    },

    /**
     * Mantém o foco dentro de um elemento (trap focus)
     * @param {HTMLElement} element - Elemento container
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        });
    }
};

// ============================================
// MÓDULO: FAQ ACCORDION
// ============================================

const FAQAccordion = {
    items: null,

    /**
     * Inicializa o accordion
     */
    init() {
        this.items = $$('.faq__item');

        this.items.forEach(item => {
            const question = item.querySelector('.faq__question');
            const answer = item.querySelector('.faq__answer');

            if (!question || !answer) return;

            question.addEventListener('click', () => this.toggleItem(question, answer));

            // Suporte a teclado
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleItem(question, answer);
                }
            });
        });
    },

    /**
     * Abre/fecha um item do accordion
     * @param {HTMLElement} question - Botão da pergunta
     * @param {HTMLElement} answer - Container da resposta
     */
    toggleItem(question, answer) {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';

        // Fecha todos os outros itens (modo accordion)
        this.items.forEach(item => {
            const otherQuestion = item.querySelector('.faq__question');
            const otherAnswer = item.querySelector('.faq__answer');

            if (otherQuestion !== question) {
                otherQuestion.setAttribute('aria-expanded', 'false');
                otherAnswer.hidden = true;
            }
        });

        // Toggle do item atual
        question.setAttribute('aria-expanded', !isExpanded);
        answer.hidden = isExpanded;
    }
};

// ============================================
// MÓDULO: ANIMAÇÕES COM INTERSECTION OBSERVER
// ============================================

const Animations = {
    observer: null,
    animatedElements: null,

    /**
     * Inicializa as animações
     */
    init() {
        this.animatedElements = $$('[data-animate]');

        if (prefersReducedMotion()) {
            // Se o usuário prefere movimento reduzido, mostra tudo imediatamente
            this.animatedElements.forEach(el => el.classList.add('is-visible'));
            return;
        }

        this.createObserver();
    },

    /**
     * Cria o Intersection Observer
     */
    createObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Adiciona delay se especificado
                    const delay = entry.target.dataset.delay || 0;

                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, parseInt(delay));

                    // Para de observar após animar
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);

        this.animatedElements.forEach(el => this.observer.observe(el));
    }
};

// ============================================
// MÓDULO: BOTÃO VOLTAR AO TOPO
// ============================================

const BackToTop = {
    button: null,
    showThreshold: 500,

    /**
     * Inicializa o botão
     */
    init() {
        this.button = $('.back-to-top');

        if (!this.button) return;

        this.button.addEventListener('click', () => this.scrollToTop());
        window.addEventListener('scroll', debounce(() => this.toggleVisibility(), 100));
    },

    /**
     * Controla a visibilidade do botão
     */
    toggleVisibility() {
        const scrollY = window.pageYOffset;

        if (scrollY > this.showThreshold) {
            this.button.classList.add('back-to-top--visible');
        } else {
            this.button.classList.remove('back-to-top--visible');
        }
    },

    /**
     * Rola suavemente para o topo
     */
    scrollToTop() {
        if (prefersReducedMotion()) {
            window.scrollTo(0, 0);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
};

// ============================================
// MÓDULO: MICROINTERAÇÕES
// ============================================

const Microinteractions = {
    /**
     * Inicializa as microinterações
     */
    init() {
        this.addCardTiltEffect();
        this.addButtonRipple();
    },

    /**
     * Adiciona efeito de inclinação nos cards (desktop)
     */
    addCardTiltEffect() {
        if (window.matchMedia('(pointer: coarse)').matches) return; // Não aplica em touch

        const cards = $$('.benefit-card, .audience-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    },

    /**
     * Adiciona efeito ripple nos botões
     */
    addButtonRipple() {
        const buttons = $$('.btn');

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement('span');

                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: rippleEffect 0.6s ease-out;
                    pointer-events: none;
                `;

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Adiciona keyframe dinamicamente
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes rippleEffect {
                    to { transform: scale(2); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// ============================================
// MÓDULO: PERFORMANCE E LAZY LOADING
// ============================================

const Performance = {
    /**
     * Inicializa otimizações de performance
     */
    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
    },

    /**
     * Implementa lazy loading para imagens
     */
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback para navegadores sem suporte
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    },

    /**
     * Pré-carrega recursos críticos
     */
    preloadCriticalResources() {
        const criticalResources = [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: true }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = resource.rel;
            link.href = resource.href;
            if (resource.crossOrigin) link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
};

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa todos os módulos quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    FAQAccordion.init();
    Animations.init();
    BackToTop.init();
    Microinteractions.init();
    Performance.init();

    // Log de inicialização (remover em produção)
    console.log('%c PSICLAMRON ', 'background: #3b8e83; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;', 'Landing Page Premium inicializada com sucesso.');
});

/**
 * Handler para erros globais
 */
window.addEventListener('error', (e) => {
    console.error('Erro na Landing Page:', e.error);
});
