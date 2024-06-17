"use strict";

window.onload = function () {
   document.addEventListener('click', documentActions);

   function documentActions(e) {
      const targetElement = e.target;
      if (window.innerWidth > 767.98 && isMobile.any()) {
         if (targetElement.classList.contains('menu__arrow') || targetElement.closest('.menu__arrow')) {
            targetElement.closest('.menu__item').classList.toggle('_hover');
         }
         if (!targetElement.closest('.menu__item') && document.querySelectorAll('.menu__item._hover').length > 0) {
            let arr = document.querySelectorAll('.menu__item._hover');
            for (let i = 0; i < arr.length; i++) {
               const element = arr[i];
               element.classList.remove('_hover');
            }
         }
      }
   }
}

let bodys = document.querySelectorAll('[data-more]');
for (let i = 0; i < bodys.length; i++) { 
   initShowMores(bodys[i]);
}

function initShowMores(box) {
   let showMores = box.querySelectorAll('[data-more-item]');
   let show = box.querySelector('[data-show]');
   let hide = box.querySelector('[data-hide]');

   if (showMores.length < 9) {
      hide.hidden = true;  
      show.hidden = true;  
   }
   for (let i = 0; i < showMores.length; i++) {
      if (i > 8) {
         showMores[i].classList.add('hide');
      }
   }
   if (show) {
      show.addEventListener('click', function (e) {
         let hides = box.querySelectorAll('.hide');
         for (let i = 0; i < hides.length; i++) {
            hides[i].classList.remove('hide');
         }
         this.classList.add('.show');
         this.hidden = true;
         hide.hidden = false;  
      });
   }

   if (hide) {
      hide.hidden = true;  
      hide.addEventListener('click', function (e) {
         for (let i = 0; i < showMores.length; i++) {
            if (i > 8) {
               showMores[i].classList.add('hide');
            }
         }
         this.hidden = true;
         show.hidden = false;
         this.classList.add('.hide');
      });
   }

}

/**
 * @typedef {Object} dNode
 * @property {HTMLElement} parent
 * @property {HTMLElement} element
 * @property {HTMLElement} to
 * @property {string} breakpoint
 * @property {string} order
 * @property {number} index
 */
/**
 * @typedef {Object} dMediaQuery
 * @property {string} query
 * @property {number} breakpoint
 */
/**
 * @param {'min' | 'max'} type
 */
function useDynamicAdapt(type = 'max') {
   const className = '_dynamic_adapt_'
   const attrName = 'data-da'

   /** @type {dNode[]} */
   const dNodes = getDNodes()

   /** @type {dMediaQuery[]} */
   const dMediaQueries = getDMediaQueries(dNodes)

   dMediaQueries.forEach((dMediaQuery) => {
      const matchMedia = window.matchMedia(dMediaQuery.query)
      // массив объектов с подходящим брейкпоинтом
      const filteredDNodes = dNodes.filter(({ breakpoint }) => breakpoint === dMediaQuery.breakpoint)
      const mediaHandler = getMediaHandler(matchMedia, filteredDNodes)
      matchMedia.addEventListener('change', mediaHandler)

      mediaHandler()
   })

   function getDNodes() {
      const result = []
      const elements = [...document.querySelectorAll(`[${attrName}]`)]

      elements.forEach((element) => {
         const attr = element.getAttribute(attrName)
         const [toSelector, breakpoint, order] = attr.split(',').map((val) => val.trim())

         const to = document.querySelector(toSelector)

         if (to) {
            result.push({
               parent: element.parentElement,
               element,
               to,
               breakpoint: breakpoint ?? '767',
               order: order !== undefined ? (isNumber(order) ? Number(order) : order) : 'last',
               index: -1,
            })
         }
      })

      return sortDNodes(result)
   }

   /**
    * @param {dNode} items
    * @returns {dMediaQuery[]}
    */
   function getDMediaQueries(items) {
      const uniqItems = [...new Set(items.map(({ breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`))]

      return uniqItems.map((item) => {
         const [query, breakpoint] = item.split(',')

         return { query, breakpoint }
      })
   }

   /**
    * @param {MediaQueryList} matchMedia
    * @param {dNodes} items
    */
   function getMediaHandler(matchMedia, items) {
      return function mediaHandler() {
         if (matchMedia.matches) {
         items.forEach((item) => {
            moveTo(item)
         })

         items.reverse()
         } else {
         items.forEach((item) => {
            if (item.element.classList.contains(className)) {
               moveBack(item)
            }
         })

         items.reverse()
         }
      }
   }

   /**
    * @param {dNode} dNode
    */
   function moveTo(dNode) {
      const { to, element, order } = dNode
      dNode.index = getIndexInParent(dNode.element, dNode.element.parentElement)
      element.classList.add(className)

      if (order === 'last' || order >= to.children.length) {
         to.append(element)

         return
      }

      if (order === 'first') {
         to.prepend(element)

         return
      }

      to.children[order].before(element)
   }

   /**
    * @param {dNode} dNode
    */
   function moveBack(dNode) {
      const { parent, element, index } = dNode
      element.classList.remove(className)

      if (index >= 0 && parent.children[index]) {
         parent.children[index].before(element)
      } else {
         parent.append(element)
      }
   }

   /**
    * @param {HTMLElement} element
    * @param {HTMLElement} parent
    */
   function getIndexInParent(element, parent) {
      return [...parent.children].indexOf(element)
   }

   /**
    * Функция сортировки массива по breakpoint и order
    * по возрастанию для type = min
    * по убыванию для type = max
    *
    * @param {dNode[]} items
    */
   function sortDNodes(items) {
      const isMin = type === 'min' ? 1 : 0

      return [...items].sort((a, b) => {
         if (a.breakpoint === b.breakpoint) {
         if (a.order === b.order) {
            return 0
         }

         if (a.order === 'first' || b.order === 'last') {
           return -1 * isMin
         }

         if (a.order === 'last' || b.order === 'first') {
           return 1 * isMin
         }

         return 0
      }

       return (a.breakpoint - b.breakpoint) * isMin
      })
   }

   function isNumber(value) {
      return !isNaN(value)
   }
}
useDynamicAdapt();
// ЛИПКИЙ HEADER
let header = document.querySelector('.header');
let mainBlock = document.querySelector('.main').clientHeight;
document.onscroll = function () {
   let scroll = window.scrollY;

   if (scroll + 100 > mainBlock) {
      header.classList.add('_fixed');
   } else {
      header.classList.remove('_fixed');
   }
   
   if (scroll + 50 > mainBlock) {
      header.classList.add('_hide-anim');
   } else {
      header.classList.remove('_hide-anim');
   }

   if (scroll > mainBlock) {
      header.classList.add('_anim');
   } else {
      header.classList.remove('_anim');
   }
}

// МЕНЮ БУРГЕР
let menu = document.querySelector('.icon-menu');
let menuBody = document.querySelector('.menu__body');
menu.addEventListener('click', function () {
   document.body.classList.toggle('_lock');
   menu.classList.toggle('_active');
   menuBody.classList.toggle('_active');
});

// ЯКОРЬ (ПЛАВНАЯ ПРОКРУТКА ДО НУЖНОГО БЛОКА)
let menuLinks = document.querySelectorAll('[data-goto]');
if (menuLinks.length > 0) {
   for (let menuLink of menuLinks) {
      menuLink.addEventListener('click', onMenuLinkClick);
   }

   function onMenuLinkClick(e) {
      let menuLink = e.target;

      if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) {
         let gotoBlock = document.querySelector(menuLink.dataset.goto);
         let gotoBlockValue = gotoBlock.getBoundingClientRect().top + pageYOffset - document.querySelector('header').offsetHeight;

         if (menu.classList.contains('_active')) {
            document.body.classList.remove('_lock');
            menu.classList.remove('_active');
            menuBody.classList.remove('_active');
         }

         window.scrollTo({
            top: gotoBlockValue,
            behavior: 'smooth'
         });
         e.preventDefault();
      }
   }
}


// ТАБЫ
const tabs = document.querySelectorAll('[data-tabs]');
if (tabs.length > 0) {
   tabs.forEach((tabsBlock, index) => {
      tabsBlock.classList.add('_tab-init');
      tabsBlock.setAttribute('data-tabs-index', index);
      tabsBlock.addEventListener("click", setTabsAction);
      initTabs(tabsBlock);
   });

   // Получение слойлеров с медиа запросами
   let mdQueriesArray = dataMediaQueries(tabs, "tabs");
   if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach(mdQueriesItem => {
         // Событие
         mdQueriesItem.matchMedia.addEventListener("change", function () {
            setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
         });
         setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
   }
}
// Установка позиций заголовков
function setTitlePosition(tabsMediaArray, matchMedia) {
   tabsMediaArray.forEach(tabsMediaItem => {
      tabsMediaItem = tabsMediaItem.item;
      let tabsTitles = tabsMediaItem.querySelector('[data-tabs-titles]');
      let tabsTitleItems = tabsMediaItem.querySelectorAll('[data-tabs-title]');
      let tabsContent = tabsMediaItem.querySelector('[data-tabs-body]');
      let tabsContentItems = tabsMediaItem.querySelectorAll('[data-tabs-item]');
      tabsTitleItems = Array.from(tabsTitleItems).filter(item => item.closest('[data-tabs]') === tabsMediaItem);
      tabsContentItems = Array.from(tabsContentItems).filter(item => item.closest('[data-tabs]') === tabsMediaItem);
      tabsContentItems.forEach((tabsContentItem, index) => {
         if (matchMedia.matches) {
            tabsContent.append(tabsTitleItems[index]);
            tabsContent.append(tabsContentItem);
            tabsMediaItem.classList.add('_tab-spoller');
         } else {
            tabsTitles.append(tabsTitleItems[index]);
            tabsMediaItem.classList.remove('_tab-spoller');
         }
      });
   });
}
// Работа с контентом
function initTabs(tabsBlock) {
   let tabsTitles = tabsBlock.querySelectorAll('[data-tabs-titles]>*');
   let tabsContent = tabsBlock.querySelectorAll('[data-tabs-body]>*');
   const tabsBlockIndex = tabsBlock.dataset.tabsIndex;

   if (tabsContent.length) {
      tabsContent = Array.from(tabsContent).filter(item => item.closest('[data-tabs]') === tabsBlock);
      tabsTitles = Array.from(tabsTitles).filter(item => item.closest('[data-tabs]') === tabsBlock);
      tabsContent.forEach((tabsContentItem, index) => {
         tabsTitles[index].setAttribute('data-tabs-title', '');
         tabsContentItem.setAttribute('data-tabs-item', '');

         tabsContentItem.hidden = !tabsTitles[index].classList.contains('_tab-active');
      });
   }
}
function setTabsStatus(tabsBlock) {
   let tabsTitles = tabsBlock.querySelectorAll('[data-tabs-title]');
   let tabsContent = tabsBlock.querySelectorAll('[data-tabs-item]');
   const tabsBlockIndex = tabsBlock.dataset.tabsIndex;
   function isTabsAnamate(tabsBlock) {
      if (tabsBlock.hasAttribute('data-tabs-animate')) {
         return tabsBlock.dataset.tabsAnimate > 0 ? Number(tabsBlock.dataset.tabsAnimate) : 500;
      }
   }
   const tabsBlockAnimate = isTabsAnamate(tabsBlock);
   if (tabsContent.length > 0) {
      tabsContent = Array.from(tabsContent).filter(item => item.closest('[data-tabs]') === tabsBlock);
      tabsTitles = Array.from(tabsTitles).filter(item => item.closest('[data-tabs]') === tabsBlock);
      tabsContent.forEach((tabsContentItem, index) => {
         if (tabsTitles[index].classList.contains('_tab-active')) {
            if (tabsBlockAnimate) {
               _slideDown(tabsContentItem, tabsBlockAnimate);
            } else {
               tabsContentItem.hidden = false;
            }
         } else {
            if (tabsBlockAnimate) {
               _slideUp(tabsContentItem, tabsBlockAnimate);
            } else {
               tabsContentItem.hidden = true;
            }
         }
      });
   }
}
function setTabsAction(e) {
   const el = e.target;
   if (el.closest('[data-tabs-title]')) {
      const tabTitle = el.closest('[data-tabs-title]');
      const tabsBlock = tabTitle.closest('[data-tabs]');
      if (!tabTitle.classList.contains('_tab-active') && !tabsBlock.querySelector('._slide')) {
         let tabActiveTitle = tabsBlock.querySelectorAll('[data-tabs-title]._tab-active');
         tabActiveTitle.length ? tabActiveTitle = Array.from(tabActiveTitle).filter(item => item.closest('[data-tabs]') === tabsBlock) : null;
         tabActiveTitle.length ? tabActiveTitle[0].classList.remove('_tab-active') : null;
         tabTitle.classList.add('_tab-active');
         setTabsStatus(tabsBlock);
      }
      e.preventDefault();
   }
}

// Вспомогательные модули плавного расскрытия и закрытия объекта ===========================================
let _slideUp = (target, duration = 500, h = 0) => { 
   if (!target.classList.contains('_slide') && !target.classList.contains('_showmore')) {
      target.classList.add('_slide');
      target.style.transitionProperty = 'height, margin, padding';
      target.style.transitionDuration = duration + 'ms';
      target.style.height = target.offsetHeight + 'px';
      target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = 0;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      window.setTimeout(() => { 
         target.hidden = true;
         target.style.removeProperty('height');
         target.style.removeProperty('padding-top');
         target.style.removeProperty('padding-bottom');
         target.style.removeProperty('margin-top');
         target.style.removeProperty('margin-bottom');
         target.style.removeProperty('overflow');
         target.style.removeProperty('transition-duration');
         target.style.removeProperty('transition-property');
         target.classList.remove('_slide');
      }, duration);
   } else {
      target.classList.add('_slide');
      target.style.transitionProperty = 'height';
      target.style.transitionDuration = duration + 'ms';
      target.style.height = h + 'px';
      target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = h + 'px';
      window.setTimeout(() => { 
         target.classList.remove('_slide');
      }, duration);
   }
}
let _slideDown = (target, duration = 500, h = 0) => { 
   if (!target.classList.contains('_slide') && !target.classList.contains('_showmore')) {
      target.classList.add('_slide');
      if (target.hidden) {
         target.hidden = false;
      }
      let height = target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = 0;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      target.offsetHeight;
      target.style.transitionProperty = 'height, margin, padding';
      target.style.transitionDuration = duration + 'ms';
      target.style.height = height + 'px';
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      window.setTimeout(() => { 
         target.style.removeProperty('height');
         target.style.removeProperty('overflow');
         target.style.removeProperty('transition-duration');
         target.style.removeProperty('transition-property');
         target.classList.remove('_slide');
      }, duration);
   } else {
      target.classList.add('_slide');
      let height = target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = h + 'px';
      target.style.transitionProperty = 'height';
      target.style.transitionDuration = duration + 'ms';
      target.style.height = h + 'px';
      window.setTimeout(() => { 
         target.classList.remove('_slide');
      }, duration);
   }
}
let _slideToggle = (target, duration = 500, h = 0) => { 
   if (target.hidden) {
      return _slideDown(target, duration, h);
   } else {
      return _slideUp(target, duration, h);
   }
}
let _slideRemove = (target, duration = 500, h = 0) => {
   target.style.removeProperty('height');
   target.style.removeProperty('overflow');
   target.style.removeProperty('transition-duration');
   target.style.removeProperty('transition-property');
}
// Обработа медиа запросов из атрибутов 
function dataMediaQueries(array, dataSetValue) {
	// Получение объектов с медиа запросами
	const media = Array.from(array).filter(function (item, index, self) {
		if (item.dataset[dataSetValue]) {
			return item.dataset[dataSetValue].split(",")[0];
		}
	});
	// Инициализация объектов с медиа запросами
	if (media.length) {
		const breakpointsArray = [];
		media.forEach(item => {
			const params = item.dataset[dataSetValue];
			const breakpoint = {};
			const paramsArray = params.split(",");
			breakpoint.value = paramsArray[0];
			breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
			breakpoint.item = item;
			breakpointsArray.push(breakpoint);
		});
		// Получаем уникальные брейкпоинты
		let mdQueries = breakpointsArray.map(function (item) {
			return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
		});
		mdQueries = uniqArray(mdQueries);
		const mdQueriesArray = [];

		if (mdQueries.length) {
			// Работаем с каждым брейкпоинтом
			mdQueries.forEach(breakpoint => {
				const paramsArray = breakpoint.split(",");
				const mediaBreakpoint = paramsArray[1];
				const mediaType = paramsArray[2];
				const matchMedia = window.matchMedia(paramsArray[0]);
				// Объекты с нужными условиями
				const itemsArray = breakpointsArray.filter(function (item) {
					if (item.value === mediaBreakpoint && item.type === mediaType) {
						return true;
					}
				});
				mdQueriesArray.push({
					itemsArray,
					matchMedia
				})
			});
			return mdQueriesArray;
		}
	}
}
// Уникализация массива
function uniqArray(array) {
	return array.filter(function (item, index, self) {
		return self.indexOf(item) === index;
	});
}
// ПРОВЕРКА НА ТАЧСКРИН
const isMobile = {
   Android: function () {
      return navigator.userAgent.match(/Android/i);
   },
   BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
   },
   iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
   },
   Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
   },
   Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
   },
   any: function () {
      return (
         isMobile.Android() ||
         isMobile.BlackBerry() ||
         isMobile.iOS() ||
         isMobile.Opera() ||
         isMobile.Windows()
      );
   }
};
// СПОЙЛЕРЫ
const spollersArray = document.querySelectorAll('[data-spollers]');
if (spollersArray.length > 0) {
   // Получение обычных спойлеров
   const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
      return !item.dataset.spollers.split(",")[0];
   });

   // Инициализация обычных спойлеров
   if (spollersRegular.length > 0) {
      initSpollers(spollersRegular);
   }

   // Получение спойлеров с медиа запросами
   const spollersMedia = Array.from(spollersArray).filter(function (item, index, self) {
      return item.dataset.spollers.split(",")[0];
   });

   // Инициализация спойлеров с медиа запросами
   if (spollersMedia.length > 0) {
      const breakpointsArray = [];
      spollersMedia.forEach(item => {
         const params = item.dataset.spollers;
         const breakpoint = {};
         const paramsArray = params.split(",");
         breakpoint.value = paramsArray[0];
         breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
         breakpoint.item = item;
         breakpointsArray.push(breakpoint);
      });

      // Получаем уникальные брейкпоинты
      let mediaQeries = breakpointsArray.map(function (item) {
         return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
      });
      mediaQeries = mediaQeries.filter(function (item, index, self) {
         return self.indexOf(item) === index;
      });

      // Работаем с каждым брейкпоинтом
      mediaQeries.forEach(breakpoint => {
         const paramsArray = breakpoint.split(",");
         const mediaBreakpoint = paramsArray[1];
         const mediaType = paramsArray[2];
         const matchMedia = window.matchMedia(paramsArray[0]);

         // Объекты с нужными условиями
         const spollersArray = breakpointsArray.filter(function (item) {
            if (item.value === mediaBreakpoint && item.type === mediaType) {
               return true;
            }
         });
         // Событие
         matchMedia.addListener(function () {
            initSpollers(spollersArray, matchMedia);
         });
         initSpollers(spollersArray, matchMedia);
      });
   }
   // Инициализация
   function initSpollers(spollersArray, matchMedia = false) { 
      spollersArray.forEach(spollersBlock => {
         spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
         if (matchMedia.matches || !matchMedia) {
            spollersBlock.classList.add('_init');
            initSpollerBody(spollersBlock);
            spollersBlock.addEventListener('click', setSpollerAction);
         } else {
            spollersBlock.classList.remove('_init');
            initSpollerBody(spollersBlock, false);
            spollersBlock.removeEventListener('click', setSpollerAction);
         }
      });
   }
   // Работа с контентом
   function initSpollerBody(spollersBlock, hideSpollerBody = true) { 
      const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
      if (spollerTitles.length > 0) {
         spollerTitles.forEach(spollerTitle => {
            if (hideSpollerBody) {
               spollerTitle.removeAttribute('tabindex');
               if (!spollerTitle.classList.contains('_active')) {
                  spollerTitle.nextElementSibling.hidden = true;
               }
            } else {
               spollerTitle.setAttribute('tabindex', '-1');
               spollerTitle.nextElementSibling.hidden = false;
            }
         });
      }
   }
   function setSpollerAction(e) { 
      const el = e.target;
      if (el.hasAttribute('data-spoller') || el.closest('[data-spoller]')) { 
         const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]');
         const spollersBlock = spollerTitle.closest('[data-spollers]');
         const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
         const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;
         if (!spollersBlock.querySelectorAll('._slide').length) {
            if (oneSpoller && !spollerTitle.classList.contains('_active')) { 
               hideSpollersBody(spollersBlock);
            }
            spollerTitle.classList.toggle('_active');
            _slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
         }
         e.preventDefault();
      }
   }
   function hideSpollersBody(spollersBlock) {
      const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._active');
      const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;
      if (spollerActiveTitle) {
         spollerActiveTitle.classList.remove('_active');
         _slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
      }
   }
   // Закрытие при клике вне спойлера
	const spollersClose = document.querySelectorAll('[data-spoller-close]');
	if (spollersClose.length) {
		document.addEventListener("click", function (e) {
			const el = e.target;
			if (!el.closest('[data-spollers]')) {
				spollersClose.forEach(spollerClose => {
					const spollersBlock = spollerClose.closest('[data-spollers]');
					const spollerSpeed = spollersBlock.dataset.spollersSpeed ? parseInt(spollersBlock.dataset.spollersSpeed) : 500;
					spollerClose.classList.remove('_active');
					_slideUp(spollerClose.nextElementSibling, spollerSpeed);
				});
			}
		});
	}
}
